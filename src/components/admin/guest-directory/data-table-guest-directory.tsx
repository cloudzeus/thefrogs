"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Pencil, Trash2, Languages } from "lucide-react";
import { GenericDataTable } from "@/components/admin/shared/generic-data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createGuestDirectory, updateGuestDirectory, deleteGuestDirectory, updateGuestDirectoryOrder } from "@/app/lib/actions/guest-directory";

type GDRow = { id: string; titleEL: string; titleEN: string | null; descriptionEL: string | null; descriptionEN: string | null; order: number };

const emptyForm = { titleEL: "", titleEN: "", descriptionEL: "", descriptionEN: "" };

async function translate(text: string, from: string, to: string) {
    const res = await fetch("/api/admin/translate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
    });
    const data = await res.json();
    return data.translation || "";
}

export function DataTableGuestDirectory({ data: initialData }: { data: GDRow[] }) {
    const [data, setData] = React.useState(initialData);
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<GDRow | null>(null);
    const [form, setForm] = React.useState(emptyForm);
    const [loading, setLoading] = React.useState(false);
    const [translating, setTranslating] = React.useState(false);

    React.useEffect(() => { setData(initialData); }, [initialData]);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
    const openEdit = (row: GDRow) => {
        setEditing(row);
        setForm({ titleEL: row.titleEL, titleEN: row.titleEN || "", descriptionEL: row.descriptionEL || "", descriptionEN: row.descriptionEN || "" });
        setOpen(true);
    };

    const handleTranslate = async (from: "EL" | "EN") => {
        setTranslating(true);
        try {
            const to = from === "EL" ? "EN" : "EL";
            const [title, desc] = await Promise.all([
                translate(from === "EL" ? form.titleEL : form.titleEN, from, to),
                translate(from === "EL" ? form.descriptionEL : form.descriptionEN, from, to),
            ]);
            if (to === "EN") setForm(f => ({ ...f, titleEN: title, descriptionEN: desc }));
            else setForm(f => ({ ...f, titleEL: title, descriptionEL: desc }));
            toast.success("Translation complete");
        } catch { toast.error("Translation failed"); }
        setTranslating(false);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (editing) {
                const updated = await updateGuestDirectory(editing.id, form);
                setData(d => d.map(r => r.id === editing.id ? { ...r, ...updated } : r));
                toast.success("Item updated");
            } else {
                const created = await createGuestDirectory({ ...form, order: data.length });
                setData(d => [created, ...d]);
                toast.success("Item created");
            }
            setOpen(false);
        } catch (e: any) { toast.error(e.message); }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this item?")) return;
        await deleteGuestDirectory(id);
        setData(d => d.filter(r => r.id !== id));
        toast.success("Item deleted");
    };

    const handleReorder = async (newData: GDRow[]) => {
        setData(newData);
        await updateGuestDirectoryOrder(newData.map(r => r.id));
    };

    const columns: ColumnDef<GDRow>[] = [
        { id: "drag", header: "", cell: () => <div className="cursor-grab text-muted-foreground text-center select-none">⠿</div>, size: 40, enableHiding: false },
        { accessorKey: "titleEL", header: "Title (GR)", cell: ({ row }) => <span className="font-medium text-sm">{row.original.titleEL}</span> },
        { accessorKey: "titleEN", header: "Title (EN)", cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.titleEN || "—"}</span> },
        {
            accessorKey: "descriptionEL",
            header: "Description",
            cell: ({ row }) => <span className="text-xs text-muted-foreground line-clamp-2">{row.original.descriptionEL || "—"}</span>,
        },
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
            <GenericDataTable columns={columns} data={data} searchColumn="titleEL" searchPlaceholder="Search..." onAddClick={openAdd} addButtonLabel="Add Entry" isSortable onReorder={handleReorder} />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="rounded-3xl max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black flex items-center justify-between">
                            {editing ? "Edit Entry" : "New Entry"}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl gap-2 text-xs" disabled={translating} onClick={() => handleTranslate("EL")}>
                                    <Languages className="w-3.5 h-3.5" /> GR → EN
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-xl gap-2 text-xs" disabled={translating} onClick={() => handleTranslate("EN")}>
                                    <Languages className="w-3.5 h-3.5" /> EN → GR
                                </Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="el">
                        <TabsList className="rounded-xl mb-4">
                            <TabsTrigger value="el">🇬🇷 Greek</TabsTrigger>
                            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                        </TabsList>
                        <TabsContent value="el" className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Title (Greek)</Label>
                                <Input value={form.titleEL} onChange={e => setForm({ ...form, titleEL: e.target.value })} className="rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Description (Greek)</Label>
                                <Textarea value={form.descriptionEL} onChange={e => setForm({ ...form, descriptionEL: e.target.value })} className="min-h-[160px] rounded-xl" />
                            </div>
                        </TabsContent>
                        <TabsContent value="en" className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Title (English)</Label>
                                <Input value={form.titleEN} onChange={e => setForm({ ...form, titleEN: e.target.value })} className="rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Description (English)</Label>
                                <Textarea value={form.descriptionEN} onChange={e => setForm({ ...form, descriptionEN: e.target.value })} className="min-h-[160px] rounded-xl" />
                            </div>
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
