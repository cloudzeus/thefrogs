"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Pencil, Trash2, Languages, Star, Upload } from "lucide-react";
import { GenericDataTable } from "@/components/admin/shared/generic-data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createReview, updateReview, deleteReview, updateReviewOrder } from "@/app/lib/actions/review";

type ReviewRow = {
    id: string; name: string; email: string | null; date: Date;
    titleEL: string | null; titleEN: string | null; contentEL: string;
    contentEN: string | null; avatar: string | null; order: number;
};

const emptyForm = { name: "", email: "", date: new Date().toISOString().split("T")[0], titleEL: "", titleEN: "", contentEL: "", contentEN: "", avatar: "" };

async function translate(text: string, from: string, to: string) {
    if (!text.trim()) return "";
    const res = await fetch("/api/admin/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, from, to }) });
    const data = await res.json(); return data.translation || "";
}

export function DataTableReviews({ data: initialData }: { data: ReviewRow[] }) {
    const [data, setData] = React.useState(initialData);
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<ReviewRow | null>(null);
    const [form, setForm] = React.useState(emptyForm);
    const [loading, setLoading] = React.useState(false);
    const [translating, setTranslating] = React.useState(false);
    const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
    const avatarRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => { setData(initialData); }, [initialData]);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
    const openEdit = (row: ReviewRow) => {
        setEditing(row);
        setForm({ name: row.name, email: row.email || "", date: new Date(row.date).toISOString().split("T")[0], titleEL: row.titleEL || "", titleEN: row.titleEN || "", contentEL: row.contentEL, contentEN: row.contentEN || "", avatar: row.avatar || "" });
        setOpen(true);
    };

    const handleTranslate = async (from: "EL" | "EN") => {
        setTranslating(true);
        const to = from === "EL" ? "EN" : "EL";
        try {
            const [title, content] = await Promise.all([
                translate(from === "EL" ? form.titleEL : form.titleEN, from, to),
                translate(from === "EL" ? form.contentEL : form.contentEN, from, to),
            ]);
            if (to === "EN") setForm(f => ({ ...f, titleEN: title, contentEN: content }));
            else setForm(f => ({ ...f, titleEL: title, contentEL: content }));
            toast.success("Translation complete");
        } catch { toast.error("Translation failed"); }
        setTranslating(false);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploadingAvatar(true);
        const fd = new FormData(); fd.append("file", file);
        try {
            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
            if (!res.ok) { toast.error("Avatar upload failed"); return; }
            const { url } = await res.json();
            setForm(f => ({ ...f, avatar: url }));
            toast.success("Avatar uploaded");
        } catch { toast.error("Upload failed"); }
        setUploadingAvatar(false);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = { ...form, date: form.date ? new Date(form.date) : new Date() };
            if (editing) {
                const updated = await updateReview(editing.id, payload);
                setData(d => d.map(r => r.id === editing.id ? { ...r, ...updated } : r));
                toast.success("Review updated");
            } else {
                const created = await createReview({ ...payload, contentEL: payload.contentEL, order: data.length });
                setData(d => [created, ...d]);
                toast.success("Review created");
            }
            setOpen(false);
        } catch (e: any) { toast.error(e.message); }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this review?")) return;
        await deleteReview(id); setData(d => d.filter(r => r.id !== id)); toast.success("Review deleted");
    };

    const handleReorder = async (newData: ReviewRow[]) => { setData(newData); await updateReviewOrder(newData.map(r => r.id)); };

    const columns: ColumnDef<ReviewRow>[] = [
        { id: "drag", header: "", cell: () => <div className="cursor-grab text-center select-none text-muted-foreground">⠿</div>, size: 40, enableHiding: false },
        {
            accessorKey: "name", header: "Reviewer",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    {row.original.avatar ? (
                        <img src={row.original.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-border" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-500">{row.original.name?.[0]?.toUpperCase()}</div>
                    )}
                    <div>
                        <div className="font-medium text-sm">{row.original.name}</div>
                        <div className="text-xs text-muted-foreground">{row.original.email || "—"}</div>
                    </div>
                </div>
            ),
        },
        { accessorKey: "titleEL", header: "Title (GR)", cell: ({ row }) => <span className="text-sm">{row.original.titleEL || "—"}</span> },
        { accessorKey: "contentEL", header: "Content", cell: ({ row }) => <span className="text-xs text-muted-foreground line-clamp-2">{row.original.contentEL}</span> },
        { accessorKey: "date", header: "Date", cell: ({ row }) => <span className="text-xs text-muted-foreground">{new Date(row.original.date).toLocaleDateString("el-GR")}</span> },
        {
            id: "actions", header: "", enableHiding: false,
            cell: ({ row }) => (
                <div className="flex items-center gap-1 justify-end">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={e => { e.stopPropagation(); openEdit(row.original); }}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={e => { e.stopPropagation(); handleDelete(row.original.id); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <GenericDataTable columns={columns} data={data} searchColumn="name" searchPlaceholder="Search reviews..." onAddClick={openAdd} addButtonLabel="Add Review" isSortable onReorder={handleReorder} />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black flex items-center justify-between">
                            {editing ? "Edit Review" : "New Review"}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs" disabled={translating} onClick={() => handleTranslate("EL")}><Languages className="w-3.5 h-3.5" />GR→EN</Button>
                                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs" disabled={translating} onClick={() => handleTranslate("EN")}><Languages className="w-3.5 h-3.5" />EN→GR</Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {/* Reviewer Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5"><Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-xl" /></div>
                        <div className="space-y-1.5"><Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="rounded-xl" /></div>
                        <div className="space-y-1.5"><Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="rounded-xl" /></div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Avatar</Label>
                            <div className="flex gap-2 items-center">
                                {form.avatar && <img src={form.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-border" />}
                                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs flex-1" onClick={() => avatarRef.current?.click()} disabled={uploadingAvatar}>
                                    <Upload className="w-3.5 h-3.5" />{uploadingAvatar ? "Uploading..." : "Upload Avatar"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="el">
                        <TabsList className="rounded-xl mb-4">
                            <TabsTrigger value="el">🇬🇷 Greek</TabsTrigger>
                            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                        </TabsList>
                        <TabsContent value="el" className="space-y-4">
                            <div className="space-y-1.5"><Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Title</Label><Input value={form.titleEL} onChange={e => setForm({ ...form, titleEL: e.target.value })} className="rounded-xl" /></div>
                            <div className="space-y-1.5"><Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Content</Label><Textarea value={form.contentEL} onChange={e => setForm({ ...form, contentEL: e.target.value })} className="rounded-xl min-h-[140px]" /></div>
                        </TabsContent>
                        <TabsContent value="en" className="space-y-4">
                            <div className="space-y-1.5"><Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Title</Label><Input value={form.titleEN} onChange={e => setForm({ ...form, titleEN: e.target.value })} className="rounded-xl" /></div>
                            <div className="space-y-1.5"><Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Content</Label><Textarea value={form.contentEN} onChange={e => setForm({ ...form, contentEN: e.target.value })} className="rounded-xl min-h-[140px]" /></div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSave} disabled={loading} className="rounded-xl">{loading ? "Saving..." : "Save"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
