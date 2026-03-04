"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
    ChevronDown,
    Plus,
    GripVertical,
    Trash2,
    Wand2,
    Sparkles,
    Image as ImageIcon,
    Star,
    X,
    TrendingUp,
    Clock,
    Users,
    CheckCircle,
    BarChart2,
    Database,
    Zap,
    Shield,
    Globe,
    Award,
    RefreshCcw,
    ExternalLink,
    Calendar,
    Briefcase,
    Layout,
    Layers,
    Rocket,
    CheckCircle2
} from "lucide-react"

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { createWork, updateWork, deleteWork, updateWorkOrder } from "@/app/lib/actions/work"
import { GenericDataTable } from "../shared/generic-data-table"
import { MultiSelectCombobox } from "./multi-select-combobox"

// ─── Types ───────────────────────────────────────────────────────────────────

export type WorkMedia = { id: string, type: string, url: string, featured: boolean, order: number }
export type WorkStat = { icon: string, value: string, textEL: string, textEN: string }
export type WorkCustomer = { id: string, NAME: string, CODE: string, logo?: string | null }
export type WorkService = { id: string, nameEL: string, nameEN?: string | null, slug: string }
export type Work = {
    id: string
    slug: string
    titleEL: string
    titleEN?: string | null
    challengeEL?: string | null
    challengeEN?: string | null
    completionDate?: string | null
    servicesUsed?: string[] | null
    stepsEL?: string[] | null
    stepsEN?: string[] | null
    stats?: WorkStat[] | null
    customerId?: string | null
    customer?: WorkCustomer | null
    order: number
    published: boolean
    media: WorkMedia[]
}

const ICON_MAP: Record<string, React.ElementType> = {
    TrendingUp, Clock, Users, CheckCircle, BarChart2, Database, Zap, Shield, Globe, Award
}

const MediaSortableItem = ({ item, isFeatured, onSetFeatured, onDelete }: { item: WorkMedia, isFeatured: boolean, onSetFeatured: () => void, onDelete: (id: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id || item.url })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 border rounded-[24px] bg-white dark:bg-zinc-900 mb-3 group hover:shadow-lg transition-all border-zinc-200 dark:border-zinc-800">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl">
                <GripVertical className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-inner bg-zinc-50 border border-zinc-100 p-1">
                {item.type === "IMAGE" ? (
                    <img src={item.url} alt="media" className="w-full h-full object-cover rounded-xl" />
                ) : (
                    <video src={item.url} className="w-full h-full object-cover rounded-xl" muted />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-zinc-400 truncate tracking-tighter">{item.url.split('/').pop()}</p>
                <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-black text-zinc-400 border-zinc-200">{item.type}</Badge>
                    {isFeatured && <Badge className="bg-amber-500 text-white border-none text-[10px] font-black uppercase tracking-widest px-3 shadow-lg shadow-amber-500/20"><Star className="w-3 h-3 mr-1 fill-white" /> Featured Work</Badge>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {!isFeatured && (
                    <Button size="sm" variant="ghost" onClick={onSetFeatured} className="h-9 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-amber-500">Set Main</Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => onDelete(item.id || item.url)} className="text-zinc-300 hover:text-red-500 h-9 w-9 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export function DataTableWorks({ data: initialData, allCustomers, allServices }: { data: Work[], allCustomers: WorkCustomer[], allServices: WorkService[] }) {
    const [data, setData] = React.useState<Work[]>(initialData || [])
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => { setIsMounted(true) }, [])

    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [editingWork, setEditingWork] = React.useState<Work | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)
    const [isGenerating, setIsGenerating] = React.useState(false)

    const [formData, setFormData] = React.useState({
        slug: "", titleEL: "", titleEN: "", challengeEL: "", challengeEN: "", completionDate: "", customerId: "",
        servicesUsed: [] as string[], stepsEL: [] as string[], stepsEN: [] as string[],
        stats: [] as WorkStat[], published: false, media: [] as WorkMedia[]
    })

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleReorder = async (newData: Work[]) => {
        setData(newData)
        try {
            await updateWorkOrder(newData.map(d => d.id))
            toast.success("Operational sequence updated")
        } catch {
            setData(initialData)
            toast.error("Sequence sync failed")
        }
    }

    const openEdit = (work?: Work) => {
        if (work) {
            setEditingWork(work)
            setFormData({
                slug: work.slug, titleEL: work.titleEL, titleEN: work.titleEN || "", challengeEL: work.challengeEL || "", challengeEN: work.challengeEN || "",
                completionDate: work.completionDate || "", customerId: work.customerId || "", servicesUsed: (work.servicesUsed as string[]) || [],
                stepsEL: (work.stepsEL as string[]) || [], stepsEN: (work.stepsEN as string[]) || [],
                stats: (work.stats as WorkStat[])?.length > 0 ? work.stats as WorkStat[] : [
                    { icon: "TrendingUp", value: "", textEL: "", textEN: "" },
                    { icon: "Clock", value: "", textEL: "", textEN: "" },
                    { icon: "Users", value: "", textEL: "", textEN: "" },
                    { icon: "CheckCircle", value: "", textEL: "", textEN: "" },
                ],
                published: work.published, media: work.media || []
            })
        } else {
            setEditingWork(null)
            setFormData({
                slug: "", titleEL: "", titleEN: "", challengeEL: "", challengeEN: "", completionDate: "", customerId: "",
                servicesUsed: [], stepsEL: [], stepsEN: [], stats: [], published: false, media: []
            })
        }
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const payload = { ...formData, customerId: formData.customerId || null }
            if (editingWork) {
                const res = await updateWork(editingWork.id, payload)
                setData(data.map(d => d.id === res.id ? res as any : d))
                toast.success("Case study updated")
            } else {
                const res = await createWork(payload)
                setData([...data, res as any])
                toast.success("Case study initialized")
            }
            setIsDialogOpen(false)
        } catch (err: any) { toast.error(err.message) }
        finally { setIsSaving(false) }
    }

    const handleGenerate = async () => {
        if (!formData.titleEL) return toast.error("Provide a Greek title first")
        setIsGenerating(true)
        const tid = toast.loading("AI Engine is mapping the success story...")
        try {
            const customer = allCustomers.find(c => c.id === formData.customerId)
            const services = allServices.filter(s => formData.servicesUsed.includes(s.id))
            const res = await fetch("/api/admin/works/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ titleEL: formData.titleEL, customerName: customer?.NAME, servicesUsed: services.map(s => s.nameEL) })
            })
            const d = await res.json()
            if (!res.ok) throw new Error(d.error)
            setFormData(prev => ({
                ...prev,
                titleEN: d.titleEN || prev.titleEN, challengeEL: d.challengeEL || prev.challengeEL, challengeEN: d.challengeEN || prev.challengeEN,
                stepsEL: d.stepsEL?.length === 5 ? d.stepsEL : prev.stepsEL, stepsEN: d.stepsEN?.length === 5 ? d.stepsEN : prev.stepsEN,
                stats: d.stats?.length === 4 ? d.stats : prev.stats,
                slug: d.slug || prev.slug || formData.titleEL.toLowerCase().replace(/[^a-z0-9α-ωάέήίόύώ]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
            }))
            toast.success("Intelligence Draft Generated", { id: tid })
        } catch (err: any) { toast.error(err.message, { id: tid }) }
        finally { setIsGenerating(false) }
    }

    const handleMediaUpload = async (files: FileList | null, workId?: string) => {
        if (!files || files.length === 0) return
        const tid = toast.loading(`Uploading ${files.length} evidence assets...`)
        try {
            let currentMedia = workId ? data.find(w => w.id === workId)?.media || [] : [...formData.media]
            for (let i = 0; i < files.length; i++) {
                const fd = new FormData(); fd.append("file", files[i]);
                const res = await fetch("/api/admin/works/upload", { method: "POST", body: fd })
                const d = await res.json()
                if (!res.ok) throw new Error(d.error)
                currentMedia.push({ id: `new_${Date.now()}_${i}`, url: d.url, type: d.type, featured: false, order: currentMedia.length })
            }
            if (workId) {
                const updated = await updateWork(workId, { ...data.find(w => w.id === workId)!, media: currentMedia })
                setData(data.map(item => item.id === updated.id ? updated as any : item))
            } else {
                setFormData(prev => ({ ...prev, media: currentMedia }))
            }
            toast.success("Visual library expanded", { id: tid })
        } catch (err: any) { toast.error(err.message, { id: tid }) }
    }

    const columns: ColumnDef<Work>[] = [
        { id: "drag", header: "", cell: () => <GripVertical className="h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />, size: 40 },
        {
            id: "hero",
            header: "Impact",
            cell: ({ row }) => {
                const hero = row.original.media.find(m => m.featured) || row.original.media[0]
                return (
                    <div className="w-16 h-10 rounded-lg overflow-hidden border bg-zinc-50 shadow-sm flex items-center justify-center p-1">
                        {hero ? (
                            hero.type === 'IMAGE' ? <img src={hero.url} className="w-full h-full object-cover rounded" /> : <video src={hero.url} className="w-full h-full object-cover rounded" muted />
                        ) : <ImageIcon className="w-4 h-4 text-zinc-300" />}
                    </div>
                )
            },
            size: 80
        },
        {
            accessorKey: "titleEL",
            header: "Case Study",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{row.original.titleEL}</span>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono italic">Client: {row.original.customer?.NAME || 'Independent Project'}</span>
                </div>
            )
        },
        {
            accessorKey: "published",
            header: "Status",
            cell: ({ row }) => row.original.published ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">Public Portfolio</Badge>
            ) : (
                <Badge variant="outline" className="text-zinc-300 border-zinc-200 text-[10px] font-black uppercase tracking-widest px-3 py-1">Internal Draft</Badge>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="h-9 bg-zinc-800 text-white border-none font-bold hover:bg-zinc-700 rounded-xl">
                            Actions <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuItem onClick={() => openEdit(row.original)}><Layout className="w-4 h-4 mr-2" /> Modify Study</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/works/${row.original.slug}`, '_blank')}><ExternalLink className="w-4 h-4 mr-2" /> Preview Link</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500" onClick={async () => {
                            if (confirm("Decommission this case study?")) {
                                await deleteWork(row.original.id);
                                setData(data.filter(d => d.id !== row.original.id));
                            }
                        }}><Trash2 className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    const renderExpandedRow = (work: Work) => (
        <div className="py-10 px-8 bg-[#f8fafc] dark:bg-zinc-950/50 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-inner">
            <Tabs defaultValue="highlights">
                <TabsList className="mb-8 bg-white dark:bg-zinc-900 p-1.5 h-12 rounded-[24px] border shadow-sm w-fit gap-2">
                    <TabsTrigger value="highlights" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl h-9 transition-all">Outcome Matrix</TabsTrigger>
                    <TabsTrigger value="media" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl h-9 transition-all">Visual Evidence Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="highlights" className="animate-in fade-in duration-500 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {work.stats?.map((stat, i) => {
                            const Icon = ICON_MAP[stat.icon] || TrendingUp
                            return (
                                <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Icon className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100 mb-1">{stat.value}</span>
                                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{stat.textEL}</span>
                                </div>
                            )
                        })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-3"><Rocket className="w-4 h-4" /> Strategic Challenge</h4>
                            <p className="text-sm leading-[1.8] font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-8 rounded-[32px] border shadow-sm italic">
                                "{work.challengeEL || "Challenge briefing not yet defined."}"
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-3"><Layers className="w-4 h-4" /> Ecosystem Components</h4>
                            <div className="flex flex-wrap gap-2">
                                {work.servicesUsed?.map(sid => {
                                    const s = allServices.find(x => x.id === sid);
                                    return s ? <Badge key={sid} variant="secondary" className="bg-zinc-100 text-zinc-700 border-none rounded-xl py-2 px-4 text-xs font-bold">{s.nameEL}</Badge> : null;
                                })}
                            </div>
                            <div className="pt-6 border-t border-zinc-100 flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {work.media.slice(0, 3).map((m, i) => <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden bg-zinc-100 shadow-md"><img src={m.url} className="w-full h-full object-cover" /></div>)}
                                </div>
                                <span className="text-[10px] font-black uppercase text-zinc-400">Captured in {work.media.length} perspectives</span>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="media" className="animate-in fade-in duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-200 tracking-tighter">Production Assets Library</h3>
                        <Label className="cursor-pointer bg-emerald-600 shadow-xl shadow-emerald-500/20 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Evidence
                            <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={e => handleMediaUpload(e.target.files, work.id)} />
                        </Label>
                    </div>
                    <div className="grid grid-cols-1 gap-1 max-w-4xl">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => {
                            const { active, over } = e;
                            if (active.id !== over?.id) {
                                const oldIdx = work.media.findIndex(i => (i.id || i.url) === active.id)
                                const newIdx = work.media.findIndex(i => (i.id || i.url) === over?.id)
                                const newMediaList = arrayMove(work.media, oldIdx, newIdx)
                                updateWork(work.id, { ...work, media: newMediaList }).then(res => setData(data.map(w => w.id === res.id ? res as any : w)));
                            }
                        }}>
                            <SortableContext items={work.media.map(m => m.id || m.url)} strategy={verticalListSortingStrategy}>
                                {work.media.map(m => (
                                    <MediaSortableItem
                                        key={m.id || m.url} item={m} isFeatured={m.featured}
                                        onDelete={async (id) => {
                                            if (confirm("Purge asset?")) {
                                                const upd = await updateWork(work.id, { ...work, media: work.media.filter(x => (x.id || x.url) !== id) });
                                                setData(data.map(w => w.id === upd.id ? upd as any : w));
                                            }
                                        }}
                                        onSetFeatured={async () => {
                                            const upd = await updateWork(work.id, { ...work, media: work.media.map(x => ({ ...x, featured: x.url === m.url })) });
                                            setData(data.map(w => w.id === upd.id ? upd as any : w));
                                            toast.success("Identity visual updated");
                                        }}
                                    />
                                ))}
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
                columns={columns} data={data} searchPlaceholder="Locate success story..." searchColumn="titleEL"
                onAddClick={() => openEdit()} addButtonLabel="Document Success"
                isSortable={true} rowIdKey="id" onReorder={handleReorder}
                renderExpandedRow={renderExpandedRow}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-6xl p-0 overflow-hidden rounded-xl">
                    <DialogHeader className="bg-zinc-800 p-10">
                        <div className="flex justify-between items-center">
                            <div>
                                <DialogTitle className="text-3xl font-black text-white tracking-tighter mb-2">{editingWork ? 'Update Success Narrative' : 'Initialize Outcome Study'}</DialogTitle>
                                <DialogDescription className="text-zinc-400 font-medium">Engineer high-impact case studies with automated performance metrics.</DialogDescription>
                            </div>
                            <Button size="lg" onClick={handleGenerate} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] px-10 rounded-2xl h-14 shadow-xl shadow-indigo-600/20">
                                {isGenerating ? <RefreshCcw className="w-5 h-5 animate-spin mr-3" /> : <Sparkles className="w-5 h-5 mr-3" />} Forge with AI
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="p-10 bg-[#f8fafc] dark:bg-zinc-950 max-h-[70vh] overflow-y-auto scrollbar-hide">
                        <Tabs defaultValue="base">
                            <TabsList className="bg-zinc-200/50 dark:bg-zinc-800/50 p-1.5 h-12 rounded-[24px] mb-10 w-fit gap-2 border">
                                <TabsTrigger value="base" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl">Strategy Core</TabsTrigger>
                                <TabsTrigger value="impact" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl">Execution Steps</TabsTrigger>
                                <TabsTrigger value="metrics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl">Outcome Data</TabsTrigger>
                                <TabsTrigger value="media" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl">Evidence Vault</TabsTrigger>
                            </TabsList>

                            <TabsContent value="base" className="animate-in fade-in duration-300 space-y-8">
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Primary Identifier (Greek)</Label>
                                        <Input className="h-14 rounded-2xl text-lg font-bold border-zinc-200 shadow-sm" placeholder="Περιγραφή έργου..." value={formData.titleEL} onChange={e => setFormData({ ...formData, titleEL: e.target.value })} />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Global Identifier (English)</Label>
                                        <Input className="h-14 rounded-2xl border-zinc-200 shadow-sm" placeholder="Project name in English..." value={formData.titleEN} onChange={e => setFormData({ ...formData, titleEN: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Deployment Slug</Label>
                                        <Input className="h-12 rounded-xl font-mono text-xs text-indigo-600 border-zinc-200" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Strategic Partner (Customer)</Label>
                                        <Select value={formData.customerId} onValueChange={v => setFormData({ ...formData, customerId: v })}>
                                            <SelectTrigger className="h-12 rounded-xl border-zinc-200 font-bold">
                                                <SelectValue placeholder="Link Corporate Entity" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                {allCustomers.map(c => <SelectItem key={c.id} value={c.id} className="h-11">{c.NAME}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Services used (from Service model)</Label>
                                    <MultiSelectCombobox
                                        options={allServices.map(s => ({ value: s.id, label: s.nameEL }))}
                                        selectedValues={formData.servicesUsed}
                                        onSelect={(values) => setFormData(prev => ({ ...prev, servicesUsed: values }))}
                                        placeholder="Select one or more services..."
                                        searchPlaceholder="Search services..."
                                        className="rounded-xl border border-border"
                                    />
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Strategic Challenge Protocol</Label>
                                        <Textarea className="min-h-[160px] rounded-[32px] border-zinc-200 shadow-sm p-8 text-sm leading-relaxed" placeholder="Outline the complex problems solved..." value={formData.challengeEL} onChange={e => setFormData({ ...formData, challengeEL: e.target.value })} />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="impact" className="animate-in fade-in duration-300 space-y-4">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Procedural Benchmarks</h4>
                                    <Button variant="outline" size="sm" className="rounded-xl border-dashed h-9 px-6 font-bold text-[10px] uppercase" onClick={() => setFormData(prev => ({ ...prev, stepsEL: [...prev.stepsEL, ""] }))}><Plus className="w-3 h-3 mr-2" /> Insert Milestone</Button>
                                </div>
                                <div className="space-y-3">
                                    {formData.stepsEL.map((s, i) => (
                                        <div key={i} className="flex gap-4 items-center group bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 shadow-sm hover:border-indigo-100 transition-all">
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[10px] font-black">{i + 1}</div>
                                            <Input className="flex-1 border-none bg-transparent shadow-none font-bold" placeholder="Define strategic milestone..." value={s} onChange={e => {
                                                const arr = [...formData.stepsEL]; arr[i] = e.target.value; setFormData({ ...formData, stepsEL: arr });
                                            }} />
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all" onClick={() => setFormData(prev => ({ ...prev, stepsEL: prev.stepsEL.filter((_, idx) => idx !== i) }))}><X className="w-4 h-4" /></Button>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="metrics" className="animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-8">
                                    {formData.stats.map((stat, i) => (
                                        <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border shadow-sm space-y-6">
                                            <div className="flex justify-between items-center">
                                                <Select value={stat.icon} onValueChange={v => { const arr = [...formData.stats]; arr[i].icon = v; setFormData({ ...formData, stats: arr }); }}>
                                                    <SelectTrigger className="w-[180px] h-10 rounded-xl border-zinc-100 text-[10px] font-black uppercase">
                                                        <div className="flex items-center gap-2">{React.createElement(ICON_MAP[stat.icon] || TrendingUp, { className: "w-4 h-4" })} <SelectValue /></div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.keys(ICON_MAP).map(k => <SelectItem key={k} value={k} className="h-10 text-xs font-bold uppercase">{k}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-200 hover:text-red-500" onClick={() => setFormData(prev => ({ ...prev, stats: prev.stats.filter((_, idx) => idx !== i) }))}><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-zinc-400">KPI Value</Label>
                                                    <Input className="h-12 rounded-xl font-black text-lg text-indigo-600" value={stat.value} onChange={e => { const arr = [...formData.stats]; arr[i].value = e.target.value; setFormData({ ...formData, stats: arr }); }} placeholder="e.g. +45%" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-zinc-400">Performance Label</Label>
                                                    <Input className="h-12 rounded-xl font-bold" value={stat.textEL} onChange={e => { const arr = [...formData.stats]; arr[i].textEL = e.target.value; setFormData({ ...formData, stats: arr }); }} placeholder="ROI Growth" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full mt-8 h-16 rounded-[24px] border-dashed border-2 hover:bg-zinc-50 font-black text-[10px] uppercase tracking-widest text-zinc-400" onClick={() => setFormData(prev => ({ ...prev, stats: [...prev.stats, { icon: "TrendingUp", value: "", textEL: "", textEN: "" }] }))}><Plus className="w-4 h-4 mr-2" /> Add Data Point</Button>
                            </TabsContent>

                            <TabsContent value="media" className="animate-in fade-in duration-300">
                                <div className="bg-white dark:bg-zinc-900 p-10 rounded-[40px] border shadow-sm text-center">
                                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner"><ImageIcon className="w-10 h-10 text-indigo-500" /></div>
                                    <h4 className="text-xl font-black text-zinc-800 dark:text-zinc-100 mb-2">Populate Media Library</h4>
                                    <p className="text-xs text-zinc-400 font-medium mb-8">Attach visual evidence and set featured impact visuals.</p>
                                    <Label className="inline-flex h-14 items-center justify-center rounded-[20px] bg-zinc-800 px-10 text-[10px] font-black uppercase text-white cursor-pointer hover:bg-zinc-900 shadow-2xl transition-all active:scale-95">
                                        Bulk Resource Upload
                                        <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={e => handleMediaUpload(e.target.files)} />
                                    </Label>

                                    <div className="mt-12 grid grid-cols-4 gap-4">
                                        {formData.media.map((m, i) => (
                                            <div key={i} className={`relative aspect-square rounded-[24px] overflow-hidden border-2 shadow-sm ${m.featured ? 'border-amber-400 ring-4 ring-amber-400/10' : 'border-zinc-100'}`}>
                                                <img src={m.url} className="w-full h-full object-cover" />
                                                <button onClick={() => setFormData(prev => ({ ...prev, media: prev.media.map((x, idx) => ({ ...x, featured: idx === i })) }))} className={`absolute top-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-all ${m.featured ? 'bg-amber-400 text-white' : 'bg-white/90 text-zinc-400 hover:text-amber-400'}`}><Star className="w-4 h-4 fill-current" /></button>
                                                <button onClick={() => setFormData(prev => ({ ...prev, media: prev.media.filter((_, idx) => idx !== i) }))} className="absolute bottom-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-red-500 transition-all"><X className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="mt-12 pt-8 border-t flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200">Broadcast Visibility</h4>
                                <p className="text-[10px] text-zinc-400 font-medium">Define if this case study is available to global stakeholders.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-[10px] font-black uppercase tracking-tighter ${formData.published ? 'text-emerald-500' : 'text-zinc-300'}`}>{formData.published ? 'Public Release' : 'Confidential Draft'}</span>
                                <Switch checked={formData.published} onCheckedChange={v => setFormData({ ...formData, published: v })} className="data-[state=checked]:bg-emerald-500 shadow-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="p-10 border-t bg-white dark:bg-zinc-950 flex justify-end gap-4 rounded-b-[40px]">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-black text-xs uppercase tracking-[0.2em] text-zinc-400">Abort Operation</Button>
                        <Button disabled={isSaving} onClick={handleSave} className="bg-zinc-800 text-white font-black text-xs uppercase tracking-[0.2em] h-14 px-12 rounded-[20px] shadow-2xl hover:bg-zinc-900 transition-all active:scale-95">
                            {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Commit Case Study"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
