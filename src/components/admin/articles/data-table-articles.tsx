"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
    ChevronDown,
    ChevronRight,
    GripVertical,
    Trash2,
    ImageIcon,
    RefreshCcw,
    Plus,
    Sparkles,
    Wand2,
    Layout,
    FileText,
    Search,
    Globe,
    ExternalLink
} from "lucide-react"

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { createArticle, updateArticle, deleteArticle, updateArticleOrder, createArticleCategory } from "@/app/lib/actions/article"
import { GenericDataTable } from "../shared/generic-data-table"

export type ArticleMedia = { id: string, type: string, url: string, order: number }
export type ArticleCategory = { id: string, nameEL: string, nameEN: string }
export type Article = {
    id: string
    titleEL: string
    titleEN: string | null
    slug: string
    shortDescriptionEL: string | null
    shortDescriptionEN: string | null
    descriptionEL: string | null
    descriptionEN: string | null
    metaTitleEL: string | null
    metaTitleEN: string | null
    metaDescriptionEL: string | null
    metaDescriptionEN: string | null
    keywordsEL: string | null
    keywordsEN: string | null
    featureImage: string | null
    published: boolean
    order: number
    categories: ArticleCategory[]
    media: ArticleMedia[]
}

const MediaSortableItem = ({ item, isCover, onSetCover, onDelete }: { item: ArticleMedia, isCover: boolean, onSetCover: () => void, onDelete: (id: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id || item.url })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-3 border rounded-2xl bg-white dark:bg-zinc-900 mb-2 group hover:shadow-md transition-all">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <GripVertical className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-inner bg-zinc-100 border">
                {item.type === "IMAGE" ? (
                    <img src={item.url} alt="media" className="w-full h-full object-cover" />
                ) : (
                    <video src={item.url} className="w-full h-full object-cover" muted />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-zinc-500 truncate">{item.url.split('/').pop()}</p>
                <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-zinc-400">{item.type}</Badge>
                    {isCover && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-black uppercase">Cover Image</Badge>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {!isCover && (
                    <Button size="sm" variant="ghost" onClick={onSetCover} className="h-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-600">Set Cover</Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => onDelete(item.id || item.url)} className="text-zinc-400 hover:text-red-500 h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export function DataTableArticles({ data: initialData, allCategories: initialCategories }: { data: Article[], allCategories: ArticleCategory[] }) {
    const [data, setData] = React.useState<Article[]>(initialData || [])
    const [allCategories, setAllCategories] = React.useState<ArticleCategory[]>(initialCategories || [])
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [editingArticle, setEditingArticle] = React.useState<Article | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)
    const [isGenerating, setIsGenerating] = React.useState(false)

    const [formData, setFormData] = React.useState({
        titleEL: "", titleEN: "", slug: "", shortDescriptionEL: "", shortDescriptionEN: "",
        descriptionEL: "", descriptionEN: "", featureImage: "", published: true,
        metaTitleEL: "", metaTitleEN: "", metaDescriptionEL: "", metaDescriptionEN: "", keywordsEL: "", keywordsEN: "",
        categories: [] as ArticleCategory[], media: [] as ArticleMedia[]
    })

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleReorder = async (newData: Article[]) => {
        setData(newData)
        try {
            await updateArticleOrder(newData.map(d => d.id))
            toast.success("Order synchronized")
        } catch (err) {
            toast.error("Order sync failed")
            setData(initialData)
        }
    }

    const openEdit = (article?: Article) => {
        if (article) {
            setEditingArticle(article)
            setFormData({
                titleEL: article.titleEL, titleEN: article.titleEN || "", slug: article.slug,
                shortDescriptionEL: article.shortDescriptionEL || "", shortDescriptionEN: article.shortDescriptionEN || "",
                descriptionEL: article.descriptionEL || "", descriptionEN: article.descriptionEN || "",
                metaTitleEL: article.metaTitleEL || "", metaTitleEN: article.metaTitleEN || "",
                metaDescriptionEL: article.metaDescriptionEL || "", metaDescriptionEN: article.metaDescriptionEN || "",
                keywordsEL: article.keywordsEL || "", keywordsEN: article.keywordsEN || "",
                featureImage: article.featureImage || "", published: article.published,
                categories: article.categories || [], media: article.media || []
            })
        } else {
            setEditingArticle(null)
            setFormData({
                titleEL: "", titleEN: "", slug: "", shortDescriptionEL: "", shortDescriptionEN: "",
                descriptionEL: "", descriptionEN: "", featureImage: "", published: true,
                metaTitleEL: "", metaTitleEN: "", metaDescriptionEL: "", metaDescriptionEN: "", keywordsEL: "", keywordsEN: "",
                categories: [], media: []
            })
        }
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            if (editingArticle) {
                const res = await updateArticle(editingArticle.id, formData)
                setData(data.map(d => d.id === res.id ? res as any : d))
                toast.success("Article updated")
            } else {
                const res = await createArticle(formData)
                setData([...data, res as any])
                toast.success("Article created")
            }
            setIsDialogOpen(false)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const translateField = async (sourceText: string, targetField: string) => {
        if (!sourceText) return;
        toast.loading("Translating...", { id: targetField })
        try {
            const res = await fetch("/api/admin/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: sourceText, targetLang: "en" })
            })
            const d = await res.json()
            if (!res.ok) throw new Error(d.error)
            setFormData(prev => ({ ...prev, [targetField]: d.text }))
            toast.success("Translation applied", { id: targetField })
        } catch (err: any) {
            toast.error(err.message, { id: targetField })
        }
    }

    const handleGenerateArticle = async () => {
        if (!formData.titleEL) return toast.error("Enter a Greek Title first!")
        setIsGenerating(true)
        const tid = toast.loading("DeepSeek is crafting your SEO post...")
        try {
            const res = await fetch("/api/admin/articles/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: formData.titleEL })
            })
            const d = await res.json()
            if (!res.ok) throw new Error(d.error)

            const mappedCategories: ArticleCategory[] = [];
            let currentCats = [...allCategories];

            if (d.categories && Array.isArray(d.categories)) {
                for (const cat of d.categories) {
                    const existing = currentCats.find(c => c.nameEL.toLowerCase() === cat.nameEL.toLowerCase());
                    if (existing) mappedCategories.push(existing);
                    else {
                        try {
                            const newCat = await createArticleCategory({
                                nameEL: cat.nameEL, nameEN: cat.nameEN || "", slug: cat.nameEL.toLowerCase().replace(/ /g, '-')
                            }) as any;
                            currentCats.push(newCat);
                            mappedCategories.push(newCat);
                        } catch (e) { console.error(e) }
                    }
                }
            }
            setAllCategories(currentCats);
            setFormData(prev => ({
                ...prev,
                titleEN: d.titleEN || prev.titleEN,
                shortDescriptionEL: d.shortDescriptionEL || prev.shortDescriptionEL,
                shortDescriptionEN: d.shortDescriptionEN || prev.shortDescriptionEN,
                descriptionEL: d.descriptionEL || prev.descriptionEL,
                descriptionEN: d.descriptionEN || prev.descriptionEN,
                metaTitleEL: d.metaTitleEL || prev.metaTitleEL,
                metaTitleEN: d.metaTitleEN || prev.metaTitleEN,
                metaDescriptionEL: d.metaDescriptionEL || prev.metaDescriptionEL,
                metaDescriptionEN: d.metaDescriptionEN || prev.metaDescriptionEN,
                keywordsEL: d.keywordsEL || prev.keywordsEL,
                keywordsEN: d.keywordsEN || prev.keywordsEN,
                categories: mappedCategories,
                slug: d.slug || prev.slug || formData.titleEL.toLowerCase().replace(/[^a-z0-9α-ωάέήίόύώ]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
            }))
            toast.success("Article Draft Generated", { id: tid })
        } catch (error: any) { toast.error(error.message, { id: tid }); } finally { setIsGenerating(false); }
    }

    const handleMediaUpload = async (files: FileList | null, article: Article) => {
        if (!files || files.length === 0) return
        const tid = toast.loading(`Uploading resources...`)
        try {
            let currentMedia = [...article.media];
            for (let i = 0; i < files.length; i++) {
                const fData = new FormData(); fData.append("file", files[i]);
                const res = await fetch("/api/admin/articles/upload", { method: "POST", body: fData });
                const d = await res.json();
                if (!res.ok) throw new Error(d.error);
                currentMedia.push({ id: `new_${Date.now()}_${i}`, url: d.url, type: d.type, order: currentMedia.length });
            }
            const updated = await updateArticle(article.id, { ...article, media: currentMedia });
            setData(data.map(item => item.id === updated.id ? updated as any : item));
            toast.success("Library updated", { id: tid });
        } catch (error: any) { toast.error(error.message, { id: tid }); }
    }

    const columns: ColumnDef<Article>[] = [
        { id: "drag", header: "", cell: () => <GripVertical className="h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />, size: 40 },
        {
            accessorKey: "featureImage",
            header: "Preview",
            cell: ({ row }) => (
                <div className="w-16 h-10 rounded-lg overflow-hidden border bg-zinc-100 shadow-sm">
                    {row.original.featureImage ? <img src={row.original.featureImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-400 font-bold uppercase">No Img</div>}
                </div>
            )
        },
        {
            accessorKey: "titleEL",
            header: "Post Title",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{row.original.titleEL}</span>
                    <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[150px]">/{row.original.slug}</span>
                </div>
            )
        },
        {
            accessorKey: "published",
            header: "Status",
            cell: ({ row }) => row.original.published ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0.5">Published</Badge>
            ) : (
                <Badge variant="outline" className="text-zinc-400 border-zinc-200 text-[10px] font-black uppercase px-2 py-0.5">Draft Mode</Badge>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="h-8 bg-zinc-800 text-white border-none font-bold hover:bg-zinc-700">
                            Actions <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(row.original)}><Layout className="w-4 h-4 mr-2" /> Modify Article</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/blog/${row.original.slug}`, '_blank')}><ExternalLink className="w-4 h-4 mr-2" /> View Post</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500" onClick={async () => {
                            if (confirm("Permanently delete this article?")) {
                                await deleteArticle(row.original.id);
                                setData(data.filter(d => d.id !== row.original.id));
                                toast.success("Article removed");
                            }
                        }}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    const renderExpandedRow = (article: Article) => (
        <div className="py-8 px-6 bg-[#f8fafc] dark:bg-zinc-950/50 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-inner">
            <Tabs defaultValue="overview">
                <TabsList className="mb-8 bg-white dark:bg-zinc-900 p-1.5 h-12 rounded-2xl border shadow-sm flex items-center gap-2">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-xl h-9 transition-all">Overview</TabsTrigger>
                    <TabsTrigger value="media" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-xl h-9 transition-all">Digital Asset Library</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h5 className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4"><FileText className="w-3 h-3" /> Short Snippet (Greek)</h5>
                            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-6 rounded-[24px] border shadow-sm italic">
                                "{article.shortDescriptionEL || "No meta description available yet."}"
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[24px] border shadow-sm">
                                <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Categories</h5>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {article.categories.map(c => <Badge key={c.id} variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-md py-0 px-2 text-[10px] font-bold">{c.nameEL}</Badge>)}
                                    {article.categories.length === 0 && <span className="text-xs text-zinc-300">Uncategorized</span>}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[24px] border shadow-sm">
                                <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">SEO Health</h5>
                                <div className="mt-3 flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${article.metaTitleEL && article.metaDescriptionEL ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{article.metaTitleEL && article.metaDescriptionEL ? 'Optimized' : 'Needs attention'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="media" className="animate-in fade-in duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-200">Media Library</h3>
                            <p className="text-xs text-zinc-400 font-medium tracking-tight">Manage images and videos associated with this post. Drag to reorder.</p>
                        </div>
                        <Label className="cursor-pointer bg-emerald-600 shadow-xl shadow-emerald-600/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Assets
                            <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={(e) => handleMediaUpload(e.target.files, article)} />
                        </Label>
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-w-3xl">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
                            const { active, over } = e;
                            if (active.id !== over?.id) {
                                const oldIndex = article.media.findIndex(i => (i.id || i.url) === active.id)
                                const newIndex = article.media.findIndex(i => (i.id || i.url) === over?.id)
                                const newMediaList = arrayMove(article.media, oldIndex, newIndex)
                                updateArticle(article.id, { ...article, media: newMediaList }).then(updated => {
                                    setData(data.map(item => item.id === updated.id ? updated as any : item));
                                });
                            }
                        }}>
                            <SortableContext items={article.media.map(m => m.id || m.url)} strategy={verticalListSortingStrategy}>
                                {article.media.map(m => (
                                    <MediaSortableItem
                                        key={m.id || m.url} item={m} isCover={article.featureImage === m.url}
                                        onDelete={async (id) => {
                                            if (confirm("Remove this asset?")) {
                                                const updated = await updateArticle(article.id, { ...article, media: article.media.filter(x => (x.id || x.url) !== id) });
                                                setData(data.map(item => item.id === updated.id ? updated as any : item));
                                            }
                                        }}
                                        onSetCover={async () => {
                                            const updated = await updateArticle(article.id, { ...article, featureImage: m.url });
                                            setData(data.map(item => item.id === updated.id ? updated as any : item));
                                            toast.success("Main cover image updated");
                                        }}
                                    />
                                ))}
                                {article.media.length === 0 && (
                                    <div className="p-12 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center text-zinc-400 gap-3">
                                        <ImageIcon className="w-12 h-12 opacity-10" />
                                        <p className="text-sm font-bold opacity-50">No media assets found in library.</p>
                                    </div>
                                )}
                            </SortableContext>
                        </DndContext>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )

    if (!isMounted) return null

    return (
        <div className="space-y-4">
            <GenericDataTable
                columns={columns} data={data}
                searchPlaceholder="Search by title..." searchColumn="titleEL"
                onAddClick={() => openEdit()} addButtonLabel="New Article"
                isSortable={true} rowIdKey="id" onReorder={handleReorder}
                renderExpandedRow={renderExpandedRow}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-6xl p-0 overflow-hidden rounded-xl">
                    <DialogHeader className="bg-zinc-800 p-10">
                        <div className="flex justify-between items-center">
                            <div>
                                <DialogTitle className="text-3xl font-black text-white tracking-tighter mb-2">{editingArticle ? 'Edit Article' : 'Create New Article'}</DialogTitle>
                                <DialogDescription className="text-zinc-400 font-medium">Draft and optimize high-conversion blog posts with AI assistance.</DialogDescription>
                            </div>
                            <Button size="lg" onClick={handleGenerateArticle} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] px-8 rounded-2xl h-14 shadow-xl shadow-indigo-600/20">
                                {isGenerating ? <RefreshCcw className="w-5 h-5 animate-spin mr-3" /> : <Sparkles className="w-5 h-5 mr-3" />} Smart Autocomplete
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="p-10 bg-[#f8fafc] dark:bg-zinc-950">
                        <Tabs defaultValue="basic">
                            <TabsList className="bg-zinc-200/50 dark:bg-zinc-800/50 p-1.5 h-12 rounded-[20px] mb-8 w-fit border shadow-sm">
                                <TabsTrigger value="basic" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 font-black text-[10px] uppercase tracking-widest px-8 rounded-xl h-9 transition-all">Basic Configuration</TabsTrigger>
                                <TabsTrigger value="content" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 font-black text-[10px] uppercase tracking-widest px-8 rounded-xl h-9 transition-all">Full Story Content</TabsTrigger>
                                <TabsTrigger value="seo" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 font-black text-[10px] uppercase tracking-widest px-8 rounded-xl h-9 transition-all">SEO & Performance</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-8 animate-in fade-in duration-500">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Headline (Greek)</Label>
                                        <Input className="h-14 rounded-2xl text-lg font-bold border-zinc-200 shadow-sm" placeholder="Πως να αναβαθμίσετε την ιστοσελίδα σας..." value={formData.titleEL} onChange={e => setFormData({ ...formData, titleEL: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex justify-between">
                                            Headline (English)
                                            <button onClick={() => translateField(formData.titleEL, "titleEN")} className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">Auto-translate</button>
                                        </Label>
                                        <div className="relative">
                                            <Input className="h-14 rounded-2xl border-zinc-200 shadow-sm" placeholder="How to upgrade your website..." value={formData.titleEN} onChange={e => setFormData({ ...formData, titleEN: e.target.value })} />
                                            <Wand2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Static URL Slug</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 font-mono text-xs">/blog/</span>
                                        <Input className="h-12 rounded-2xl pl-[54px] font-mono border-zinc-200 shadow-sm text-indigo-600" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Introduction Snippet (Greek)</Label>
                                    <Textarea className="min-h-[120px] rounded-[24px] border-zinc-200 shadow-sm p-6 text-sm leading-relaxed" placeholder="Μια σύντομη περίληψη για τα social media και την αρχική σελίδα..." value={formData.shortDescriptionEL} onChange={e => setFormData({ ...formData, shortDescriptionEL: e.target.value })} />
                                </div>
                            </TabsContent>

                            <TabsContent value="content" className="space-y-8 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Full Post (Greek)</Label>
                                        <Textarea className="min-h-[400px] rounded-[32px] border-zinc-200 shadow-sm p-8 text-sm leading-relaxed scrollbar-hide" placeholder="Γράψτε το περιεχόμενο σας εδώ..." value={formData.descriptionEL} onChange={e => setFormData({ ...formData, descriptionEL: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex justify-between">
                                            Full Post (English)
                                            <button onClick={() => translateField(formData.descriptionEL, "descriptionEN")} className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">Apply AI Translation</button>
                                        </Label>
                                        <Textarea className="min-h-[400px] rounded-[32px] border-zinc-200 shadow-sm p-8 text-sm leading-relaxed" placeholder="Write your content here..." value={formData.descriptionEN} onChange={e => setFormData({ ...formData, descriptionEN: e.target.value })} />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="seo" className="space-y-8 animate-in fade-in duration-500">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">SEO Meta Title (EL)</Label>
                                        <Input className="h-12 rounded-xl border-zinc-200" value={formData.metaTitleEL} onChange={e => setFormData({ ...formData, metaTitleEL: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">SEO Meta Title (EN)</Label>
                                        <Input className="h-12 rounded-xl border-zinc-200" value={formData.metaTitleEN} onChange={e => setFormData({ ...formData, metaTitleEN: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">SEO Meta Description (EL)</Label>
                                    <Textarea className="min-h-[100px] rounded-2xl border-zinc-200" value={formData.metaDescriptionEL} onChange={e => setFormData({ ...formData, metaDescriptionEL: e.target.value })} />
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border shadow-sm flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-black text-sm text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Visibility Status</h4>
                                        <p className="text-xs text-zinc-400 font-medium">Control if this article is visible to public visitors.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Label className={`text-xs font-black uppercase tracking-tighter transition-colors ${formData.published ? 'text-emerald-500' : 'text-zinc-400'}`}>{formData.published ? 'Public' : 'Hidden'}</Label>
                                        <Switch checked={formData.published} onCheckedChange={v => setFormData({ ...formData, published: v })} className="data-[state=checked]:bg-emerald-500" />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="p-10 border-t bg-white dark:bg-zinc-950 flex justify-end gap-4 rounded-b-[40px]">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-black text-xs uppercase tracking-[0.2em] text-zinc-400">Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-zinc-800 text-white font-black text-xs uppercase tracking-[0.2em] h-14 px-12 rounded-[20px] shadow-2xl hover:bg-zinc-900 transition-all active:scale-95">
                            {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Publish Post"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
