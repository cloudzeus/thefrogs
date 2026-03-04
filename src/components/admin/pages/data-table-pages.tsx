"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
    Pencil, Trash2, Languages, Sparkles, Globe, Eye, EyeOff, Loader2,
    Upload, LibraryBig, Image as ImageIcon
} from "lucide-react";
import { GenericDataTable } from "@/components/admin/shared/generic-data-table";
import { Button } from "@/components/ui/button";
import {
    WideDialog, WideDialogContent, WideDialogHeader, WideDialogTitle,
    WideDialogBody, WideDialogFooter,
} from "@/components/ui/wide-dialog";
import { MediaPickerDialog } from "@/components/admin/shared/media-picker-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { upsertPageMeta, deletePageMeta } from "@/app/lib/actions/page-meta";

type PageMetaRow = {
    id: string;
    slug: string;
    published: boolean;
    heroImage: string | null;
    heroVideo: string | null;
    titleEL: string;
    titleEN: string | null;
    subtitleEL: string | null;
    subtitleEN: string | null;
    textEL: string | null;
    textEN: string | null;
    metaTitleEL: string | null;
    metaTitleEN: string | null;
    metaDescriptionEL: string | null;
    metaDescriptionEN: string | null;
    keywords: string | null;
};

const PAGE_SLUGS = ["home", "rooms", "gallery", "athens", "directory", "contact"];

const emptyForm = {
    slug: "",
    published: true,
    heroImage: "",
    heroVideo: "",
    titleEL: "",
    titleEN: "",
    subtitleEL: "",
    subtitleEN: "",
    textEL: "",
    textEN: "",
    metaTitleEL: "",
    metaTitleEN: "",
    metaDescriptionEL: "",
    metaDescriptionEN: "",
    keywords: "",
};

async function translateText(text: string, from: string, to: string) {
    if (!text.trim()) return "";
    const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
    });
    const data = await res.json();
    return data.translation || "";
}

export function DataTablePages({ data: initialData }: { data: PageMetaRow[] }) {
    const [data, setData] = React.useState(initialData);
    const [open, setOpen] = React.useState(false);
    const [galleryOpen, setGalleryOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<PageMetaRow | null>(null);
    const [form, setForm] = React.useState(emptyForm);
    const [loading, setLoading] = React.useState(false);
    const [translating, setTranslating] = React.useState(false);
    const [generatingSeo, setGeneratingSeo] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const fileRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => { setData(initialData); }, [initialData]);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
    const openEdit = (row: PageMetaRow) => {
        setEditing(row);
        setForm({
            slug: row.slug,
            published: row.published,
            heroImage: row.heroImage || "",
            heroVideo: row.heroVideo || "",
            titleEL: row.titleEL,
            titleEN: row.titleEN || "",
            subtitleEL: row.subtitleEL || "",
            subtitleEN: row.subtitleEN || "",
            textEL: row.textEL || "",
            textEN: row.textEN || "",
            metaTitleEL: row.metaTitleEL || "",
            metaTitleEN: row.metaTitleEN || "",
            metaDescriptionEL: row.metaDescriptionEL || "",
            metaDescriptionEN: row.metaDescriptionEN || "",
            keywords: row.keywords || "",
        });
        setOpen(true);
    };

    const handleTranslate = async (from: "EL" | "EN") => {
        setTranslating(true);
        const to = from === "EL" ? "EN" : "EL";
        try {
            const [title, subtitle, text] = await Promise.all([
                translateText(from === "EL" ? form.titleEL : form.titleEN, from, to),
                translateText(from === "EL" ? form.subtitleEL : form.subtitleEN, from, to),
                translateText(from === "EL" ? form.textEL : form.textEN, from, to),
            ]);
            if (to === "EN") setForm(f => ({ ...f, titleEN: title, subtitleEN: subtitle, textEN: text }));
            else setForm(f => ({ ...f, titleEL: title, subtitleEL: subtitle, textEL: text }));
            toast.success("Translation complete");
        } catch { toast.error("Translation failed"); }
        setTranslating(false);
    };

    const handleGenerateSeo = async () => {
        if (!form.titleEL && !form.titleEN) {
            toast.error("Add at least a title before generating SEO");
            return;
        }
        setGeneratingSeo(true);
        try {
            const res = await fetch("/api/admin/generate-seo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: form.slug,
                    titleEN: form.titleEN,
                    titleEL: form.titleEL,
                    subtitleEN: form.subtitleEN,
                    subtitleEL: form.subtitleEL,
                    textEN: form.textEN,
                    textEL: form.textEL,
                }),
            });
            if (!res.ok) throw new Error("SEO generation failed");
            const seo = await res.json();
            setForm(f => ({
                ...f,
                metaTitleEN: seo.metaTitleEN || f.metaTitleEN,
                metaTitleEL: seo.metaTitleEL || f.metaTitleEL,
                metaDescriptionEN: seo.metaDescriptionEN || f.metaDescriptionEN,
                metaDescriptionEL: seo.metaDescriptionEL || f.metaDescriptionEL,
                keywords: seo.keywords || f.keywords,
            }));
            toast.success("SEO generated by DeepSeek ✨");
        } catch (e: any) {
            toast.error(e.message || "SEO generation failed");
        }
        setGeneratingSeo(false);
    };

    const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        try {
            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
            if (!res.ok) throw new Error("Upload failed");
            const { url, type } = await res.json();
            if (type === "VIDEO") {
                setForm(f => ({ ...f, heroVideo: url }));
                toast.success("Hero video uploaded & converted to MP4! ✨");
            } else {
                setForm(f => ({ ...f, heroImage: url }));
                toast.success("Hero image uploaded");
            }
        } catch { toast.error("Upload failed"); }
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleSave = async () => {
        if (!form.slug.trim()) { toast.error("Slug is required"); return; }
        if (!form.titleEL.trim()) { toast.error("Greek title is required"); return; }
        setLoading(true);
        try {
            const updated = await upsertPageMeta({
                slug: form.slug,
                published: form.published,
                heroImage: form.heroImage || undefined,
                heroVideo: form.heroVideo || undefined,
                titleEL: form.titleEL,
                titleEN: form.titleEN || undefined,
                subtitleEL: form.subtitleEL || undefined,
                subtitleEN: form.subtitleEN || undefined,
                textEL: form.textEL || undefined,
                textEN: form.textEN || undefined,
                metaTitleEL: form.metaTitleEL || undefined,
                metaTitleEN: form.metaTitleEN || undefined,
                metaDescriptionEL: form.metaDescriptionEL || undefined,
                metaDescriptionEN: form.metaDescriptionEN || undefined,
                keywords: form.keywords || undefined,
            });
            const exists = data.find(d => d.slug === form.slug);
            if (exists) {
                setData(d => d.map(r => r.slug === form.slug ? { ...r, ...updated } : r));
                toast.success("Page updated");
            } else {
                setData(d => [...d, updated as PageMetaRow]);
                toast.success("Page created");
            }
            setOpen(false);
        } catch (e: any) { toast.error(e.message); }
        setLoading(false);
    };

    const handleDelete = async (id: string, slug: string) => {
        if (!confirm(`Delete metadata for "${slug}"?`)) return;
        await deletePageMeta(id);
        setData(d => d.filter(r => r.id !== id));
        toast.success("Deleted");
    };

    const columns: ColumnDef<PageMetaRow>[] = [
        {
            id: "hero", header: "", size: 56, enableHiding: false,
            cell: ({ row }) => {
                if (row.original.heroVideo) {
                    return <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-border flex items-center justify-center relative overflow-hidden">
                        <video src={row.original.heroVideo} className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none" />
                        <span className="text-[8px] font-bold text-white z-10">MP4</span>
                    </div>;
                }
                if (row.original.heroImage) {
                    return <img src={row.original.heroImage} alt="" className="w-10 h-10 rounded-lg object-cover border border-border" />;
                }
                return (
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                );
            }
        },
        {
            accessorKey: "slug", header: "Page",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-mono text-sm font-semibold">/{row.original.slug}</span>
                </div>
            ),
        },
        {
            id: "title", header: "Title",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.original.titleEN || row.original.titleEL}</span>
                    {row.original.subtitleEN && <span className="text-xs text-muted-foreground">{row.original.subtitleEN}</span>}
                </div>
            ),
        },
        {
            id: "seo", header: "SEO",
            cell: ({ row }) => {
                const hasTitle = row.original.metaTitleEN || row.original.metaTitleEL;
                const hasDesc = row.original.metaDescriptionEN || row.original.metaDescriptionEL;
                const hasKw = row.original.keywords;
                const count = [hasTitle, hasDesc, hasKw].filter(Boolean).length;
                return (
                    <Badge variant={count === 3 ? "default" : "outline"} className={`text-xs gap-1 ${count === 3 ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : ""}`}>
                        {count}/3 fields
                    </Badge>
                );
            },
        },
        {
            accessorKey: "published", header: "Status",
            cell: ({ row }) => row.original.published
                ? <Badge className="text-xs gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-200"><Eye className="w-3 h-3" />Active</Badge>
                : <Badge variant="outline" className="text-xs gap-1 text-muted-foreground"><EyeOff className="w-3 h-3" />Hidden</Badge>,
        },
        {
            id: "actions", header: "", enableHiding: false,
            cell: ({ row }) => (
                <div className="flex items-center gap-1 justify-end">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={e => { e.stopPropagation(); openEdit(row.original); }}>
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={e => { e.stopPropagation(); handleDelete(row.original.id, row.original.slug); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <GenericDataTable
                columns={columns}
                data={data}
                searchColumn="slug"
                searchPlaceholder="Search pages..."
                onAddClick={openAdd}
                addButtonLabel="Add Page"
            />

            <MediaPickerDialog
                open={galleryOpen}
                onOpenChange={setGalleryOpen}
                onSelect={(items) => {
                    if (items[0]) {
                        if (items[0].type === "VIDEO") setForm(f => ({ ...f, heroVideo: items[0].url }));
                        else setForm(f => ({ ...f, heroImage: items[0].url }));
                    }
                }}
                multiple={false}
                filter="ALL"
                title="Select hero image or video"
            />

            <WideDialog open={open} onOpenChange={setOpen}>
                <WideDialogContent size="2xl">
                    <WideDialogHeader>
                        <div className="flex items-center justify-between pr-8">
                            <div>
                                <WideDialogTitle>
                                    {editing ? `Edit — /${editing.slug}` : "New Page"}
                                </WideDialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">Hero content, bilingual text, and SEO metadata</p>
                            </div>
                            <div className="flex gap-2 flex-wrap justify-end">
                                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs" disabled={translating} onClick={() => handleTranslate("EL")}>
                                    {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}GR→EN
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs" disabled={translating} onClick={() => handleTranslate("EN")}>
                                    {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}EN→GR
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs text-violet-600 border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950" disabled={generatingSeo} onClick={handleGenerateSeo}>
                                    {generatingSeo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                    {generatingSeo ? "Generating…" : "AI SEO"}
                                </Button>
                            </div>
                        </div>
                    </WideDialogHeader>

                    <WideDialogBody>
                        <Tabs defaultValue="el">
                            <TabsList className="rounded-xl mb-6">
                                <TabsTrigger value="el">🇬🇷 Greek</TabsTrigger>
                                <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                                <TabsTrigger value="hero">🖼 Hero & Settings</TabsTrigger>
                                <TabsTrigger value="seo">🔍 SEO</TabsTrigger>
                            </TabsList>

                            {/* Greek Tab */}
                            <TabsContent value="el" className="space-y-4 focus-visible:outline-none">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Title (GR) *</Label>
                                    <Input value={form.titleEL} onChange={e => setForm(f => ({ ...f, titleEL: e.target.value }))} className="rounded-xl" placeholder="π.χ. Δωμάτια" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Subtitle (GR)</Label>
                                    <Input value={form.subtitleEL} onChange={e => setForm(f => ({ ...f, subtitleEL: e.target.value }))} className="rounded-xl" placeholder="Σύντομη πρόταση" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Body Text (GR)</Label>
                                    <Textarea value={form.textEL} onChange={e => setForm(f => ({ ...f, textEL: e.target.value }))} className="rounded-xl min-h-[200px]" placeholder="Κύριο κείμενο σελίδας…" />
                                </div>
                            </TabsContent>

                            {/* English Tab */}
                            <TabsContent value="en" className="space-y-4 focus-visible:outline-none">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Title (EN)</Label>
                                    <Input value={form.titleEN} onChange={e => setForm(f => ({ ...f, titleEN: e.target.value }))} className="rounded-xl" placeholder="e.g. Rooms" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Subtitle (EN)</Label>
                                    <Input value={form.subtitleEN} onChange={e => setForm(f => ({ ...f, subtitleEN: e.target.value }))} className="rounded-xl" placeholder="Short tagline" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Body Text (EN)</Label>
                                    <Textarea value={form.textEN} onChange={e => setForm(f => ({ ...f, textEN: e.target.value }))} className="rounded-xl min-h-[200px]" placeholder="Main page content…" />
                                </div>
                            </TabsContent>

                            {/* Hero & Settings Tab */}
                            <TabsContent value="hero" className="space-y-5 focus-visible:outline-none">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Page Slug *</Label>
                                        <div className="flex gap-2">
                                            <select
                                                value={form.slug}
                                                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                                className="flex-1 h-9 px-3 rounded-xl border border-input bg-background text-sm"
                                                disabled={!!editing}
                                            >
                                                <option value="">Select page…</option>
                                                {PAGE_SLUGS.map(s => <option key={s} value={s}>/{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-end pb-1">
                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-border w-full">
                                            <Switch checked={form.published} onCheckedChange={v => setForm(f => ({ ...f, published: v }))} />
                                            <div>
                                                <p className="text-sm font-semibold">Active</p>
                                                <p className="text-xs text-muted-foreground">Page is live</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Hero Media (Image & Video)</Label>
                                        <div className="flex gap-2">
                                            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleHeroUpload} />
                                            <Button variant="outline" size="sm" onClick={() => setGalleryOpen(true)} className="rounded-xl gap-2">
                                                <LibraryBig className="w-3.5 h-3.5" /> Gallery
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-xl gap-2">
                                                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                                {uploading ? "Uploading…" : "Upload"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold">Hero Background Video (MP4)</Label>
                                            {form.heroVideo ? (
                                                <div className="relative group w-full aspect-video rounded-xl overflow-hidden border border-border bg-black">
                                                    <video src={form.heroVideo} controls className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => setForm(f => ({ ...f, heroVideo: "" }))}
                                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >×</button>
                                                </div>
                                            ) : (
                                                <div
                                                    className="border-2 border-dashed border-border rounded-xl aspect-video flex flex-col items-center justify-center text-center text-muted-foreground text-sm cursor-pointer hover:border-primary/40 transition-colors"
                                                    onClick={() => fileRef.current?.click()}
                                                >
                                                    <Upload className="w-6 h-6 mb-2 opacity-30" />
                                                    <p>No video<br /><span className="text-xs opacity-70">Optional · Will convert .mov to .mp4 automatically</span></p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold">Hero Fallback Image (WebP)</Label>
                                            {form.heroImage ? (
                                                <div className="relative group w-full aspect-video rounded-xl overflow-hidden border border-border bg-muted">
                                                    <img src={form.heroImage} alt="Hero preview" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => setForm(f => ({ ...f, heroImage: "" }))}
                                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >×</button>
                                                </div>
                                            ) : (
                                                <div
                                                    className="border-2 border-dashed border-border rounded-xl aspect-video flex flex-col items-center justify-center text-center text-muted-foreground text-sm cursor-pointer hover:border-primary/40 transition-colors"
                                                    onClick={() => fileRef.current?.click()}
                                                >
                                                    <ImageIcon className="w-6 h-6 mb-2 opacity-30" />
                                                    <p>No image<br /><span className="text-xs opacity-70">Used on mobile or if video fails</span></p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* SEO Tab */}
                            <TabsContent value="seo" className="space-y-5 focus-visible:outline-none">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">Fill manually or click <strong>AI SEO</strong> to generate with DeepSeek.</p>
                                    <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs text-violet-600 border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950" disabled={generatingSeo} onClick={handleGenerateSeo}>
                                        {generatingSeo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                        {generatingSeo ? "Generating…" : "Generate with AI"}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                            Meta Title (EN) <span className={`normal-case font-normal ${form.metaTitleEN.length > 60 ? "text-red-500" : "text-muted-foreground/60"}`}>{form.metaTitleEN.length}/60</span>
                                        </Label>
                                        <Input value={form.metaTitleEN} onChange={e => setForm(f => ({ ...f, metaTitleEN: e.target.value }))} className="rounded-xl" maxLength={70} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                            Meta Title (GR) <span className={`normal-case font-normal ${form.metaTitleEL.length > 60 ? "text-red-500" : "text-muted-foreground/60"}`}>{form.metaTitleEL.length}/60</span>
                                        </Label>
                                        <Input value={form.metaTitleEL} onChange={e => setForm(f => ({ ...f, metaTitleEL: e.target.value }))} className="rounded-xl" maxLength={70} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                            Meta Description (EN) <span className={`normal-case font-normal ${form.metaDescriptionEN.length > 155 ? "text-red-500" : "text-muted-foreground/60"}`}>{form.metaDescriptionEN.length}/155</span>
                                        </Label>
                                        <Textarea value={form.metaDescriptionEN} onChange={e => setForm(f => ({ ...f, metaDescriptionEN: e.target.value }))} className="rounded-xl min-h-[100px]" maxLength={160} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                            Meta Description (GR) <span className={`normal-case font-normal ${form.metaDescriptionEL.length > 155 ? "text-red-500" : "text-muted-foreground/60"}`}>{form.metaDescriptionEL.length}/155</span>
                                        </Label>
                                        <Textarea value={form.metaDescriptionEL} onChange={e => setForm(f => ({ ...f, metaDescriptionEL: e.target.value }))} className="rounded-xl min-h-[100px]" maxLength={160} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Keywords (comma-separated)</Label>
                                    <Input value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))} className="rounded-xl" placeholder="Athens hotel, boutique guesthouse, Plaka accommodation…" />
                                </div>

                                {/* Preview */}
                                {(form.metaTitleEN || form.metaDescriptionEN) && (
                                    <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Google Preview (EN)</p>
                                        <p className="text-blue-600 text-base font-medium leading-tight">{form.metaTitleEN || "(no title)"}</p>
                                        <p className="text-green-700 text-xs">thefrogsguesthouse.gr/{form.slug}</p>
                                        <p className="text-sm text-muted-foreground">{form.metaDescriptionEN || "(no description)"}</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </WideDialogBody>

                    <WideDialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSave} disabled={loading} className="rounded-xl px-8">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {loading ? "Saving…" : editing ? "Save Changes" : "Create Page"}
                        </Button>
                    </WideDialogFooter>
                </WideDialogContent>
            </WideDialog>
        </>
    );
}
