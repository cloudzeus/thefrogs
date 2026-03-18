"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Pencil, Trash2, Languages, Loader2 } from "lucide-react";
import { GenericDataTable } from "@/components/admin/shared/generic-data-table";
import { Button } from "@/components/ui/button";
import {
    WideDialog,
    WideDialogContent,
    WideDialogHeader,
    WideDialogTitle,
    WideDialogBody,
    WideDialogFooter,
} from "@/components/ui/wide-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    upsertDirectoryItem,
    deleteDirectoryItem,
    reorderDirectoryItems,
    type DirectoryItem,
} from "@/app/lib/actions/directory";

// ── Tooltip on truncated text ─────────────────────────────────────────────
function TruncatedCell({ text, max = 120 }: { text: string; max?: number }) {
    const truncated = text.length > max ? text.slice(0, max) + "…" : text;
    return (
        <span
            title={text.length > max ? text : undefined}
            className="text-xs text-muted-foreground cursor-default"
        >
            {truncated}
        </span>
    );
}

// ── Icon picker options ────────────────────────────────────────────────────
const ICON_OPTIONS = [
    "Calendar", "Clock", "Sparkles", "Baby", "Heart", "Wifi", "Laptop",
    "Car", "MapPin", "Bus", "Briefcase", "Shirt", "Coffee", "Sun", "Moon",
    "Phone", "AlertCircle", "Package", "Star", "Key", "Utensils", "Bell",
    "Home", "Settings",
];

const emptyForm = {
    titleEL: "",
    titleEN: "",
    icon: "Package",
    descriptionEL: "",
    descriptionEN: "",
};

async function translate(text: string, from: string, to: string) {
    const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
    });
    const data = await res.json();
    return data.translation || "";
}

export function DataTableDirectory({ data: initialData }: { data: DirectoryItem[] }) {
    const [data, setData] = React.useState(initialData);
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<DirectoryItem | null>(null);
    const [form, setForm] = React.useState(emptyForm);
    const [loading, setLoading] = React.useState(false);
    const [translating, setTranslating] = React.useState(false);

    React.useEffect(() => { setData(initialData); }, [initialData]);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
    const openEdit = (row: DirectoryItem) => {
        setEditing(row);
        setForm({
            titleEL: row.titleEL,
            titleEN: row.titleEN || "",
            icon: row.icon || "Package",
            descriptionEL: row.descriptionEL || "",
            descriptionEN: row.descriptionEN || "",
        });
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
        if (!form.titleEL.trim()) { toast.error("Greek title is required"); return; }
        setLoading(true);
        try {
            const saved = await upsertDirectoryItem({
                id: editing?.id,
                titleEL: form.titleEL,
                titleEN: form.titleEN || undefined,
                icon: form.icon || undefined,
                descriptionEL: form.descriptionEL || undefined,
                descriptionEN: form.descriptionEN || undefined,
                order: editing?.order ?? data.length + 1,
            });
            if (editing) {
                setData(d => d.map(r => r.id === editing.id ? { ...r, ...saved } : r));
                toast.success("Item updated");
            } else {
                setData(d => [...d, saved]);
                toast.success("Item created");
            }
            setOpen(false);
        } catch (e: any) { toast.error(e.message); }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this directory entry?")) return;
        await deleteDirectoryItem(id);
        setData(d => d.filter(r => r.id !== id));
        toast.success("Deleted");
    };

    const handleReorder = async (newData: DirectoryItem[]) => {
        setData(newData);
        await reorderDirectoryItems(newData.map(r => r.id));
    };

    const columns: ColumnDef<DirectoryItem>[] = [
        {
            id: "drag",
            header: "",
            cell: () => <div className="cursor-grab text-muted-foreground text-center select-none">⠿</div>,
            size: 40,
            enableHiding: false,
        },
        {
            id: "icon",
            header: "Icon",
            cell: ({ row }) => (
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-lg text-muted-foreground">
                    {row.original.icon || "—"}
                </span>
            ),
            size: 110,
        },
        {
            accessorKey: "titleEL",
            header: "Title (GR)",
            cell: ({ row }) => <span className="font-medium text-sm">{row.original.titleEL}</span>,
        },
        {
            accessorKey: "titleEN",
            header: "Title (EN)",
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.titleEN || "—"}</span>,
        },
        {
            accessorKey: "descriptionEL",
            header: "Description",
            cell: ({ row }) => {
                const text = row.original.descriptionEL || "";
                return <TruncatedCell text={text || "—"} max={120} />;
            },
        },
        {
            id: "actions",
            header: "",
            enableHiding: false,
            cell: ({ row }) => (
                <div className="flex items-center gap-1 justify-end">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={e => { e.stopPropagation(); openEdit(row.original); }}>
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={e => { e.stopPropagation(); handleDelete(row.original.id); }}>
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
                searchColumn="titleEL"
                searchPlaceholder="Search directory items..."
                onAddClick={openAdd}
                addButtonLabel="Add Entry"
                isSortable
                onReorder={handleReorder}
            />

            <WideDialog open={open} onOpenChange={setOpen}>
                <WideDialogContent size="xl">
                    <WideDialogHeader>
                        <WideDialogTitle className="flex items-center justify-between">
                            {editing ? "Edit Directory Entry" : "New Directory Entry"}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl gap-2 text-xs" disabled={translating} onClick={() => handleTranslate("EL")}>
                                    {translating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3.5 h-3.5" />} GR → EN
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-xl gap-2 text-xs" disabled={translating} onClick={() => handleTranslate("EN")}>
                                    {translating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3.5 h-3.5" />} EN → GR
                                </Button>
                            </div>
                        </WideDialogTitle>
                    </WideDialogHeader>

                    <WideDialogBody className="space-y-5">
                        {/* Icon picker */}
                        <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Icon</Label>
                            <div className="flex flex-wrap gap-2">
                                {ICON_OPTIONS.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, icon }))}
                                        className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${form.icon === icon
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "border-border text-muted-foreground hover:border-primary/40"
                                            }`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                            <Input
                                value={form.icon}
                                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                                className="rounded-xl font-mono text-sm"
                                placeholder="Any Lucide icon name…"
                            />
                        </div>

                        {/* Bilingual content */}
                        <Tabs defaultValue="el">
                            <TabsList className="rounded-xl mb-4">
                                <TabsTrigger value="el">🇬🇷 Greek</TabsTrigger>
                                <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                            </TabsList>
                            <TabsContent value="el" className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Title (Greek) *</Label>
                                    <Input value={form.titleEL} onChange={e => setForm(f => ({ ...f, titleEL: e.target.value }))} className="rounded-xl" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                        Description (Greek) <span className={`normal-case font-normal ${form.descriptionEL.length > 300 ? "text-amber-500" : "text-muted-foreground/60"}`}>{form.descriptionEL.length} chars</span>
                                    </Label>
                                    <Textarea value={form.descriptionEL} onChange={e => setForm(f => ({ ...f, descriptionEL: e.target.value }))} className="min-h-[180px] rounded-xl" />
                                </div>
                            </TabsContent>
                            <TabsContent value="en" className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Title (English)</Label>
                                    <Input value={form.titleEN} onChange={e => setForm(f => ({ ...f, titleEN: e.target.value }))} className="rounded-xl" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                        Description (English) <span className={`normal-case font-normal ${form.descriptionEN.length > 300 ? "text-amber-500" : "text-muted-foreground/60"}`}>{form.descriptionEN.length} chars</span>
                                    </Label>
                                    <Textarea value={form.descriptionEN} onChange={e => setForm(f => ({ ...f, descriptionEN: e.target.value }))} className="min-h-[180px] rounded-xl" />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </WideDialogBody>

                    <WideDialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSave} disabled={loading} className="rounded-xl px-8">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</> : editing ? "Save Changes" : "Create Entry"}
                        </Button>
                    </WideDialogFooter>
                </WideDialogContent>
            </WideDialog>
        </>
    );
}
