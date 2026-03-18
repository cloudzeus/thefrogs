"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Pencil, Trash2, Loader2, Globe } from "lucide-react";
import { GenericDataTable } from "@/components/admin/shared/generic-data-table";
import { Button } from "@/components/ui/button";
import {
    WideDialog, WideDialogContent, WideDialogHeader,
    WideDialogTitle, WideDialogBody, WideDialogFooter,
} from "@/components/ui/wide-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichEditor } from "@/components/ui/rich-editor";
import { upsertLegalPage, deleteLegalPage, type LegalPageItem } from "@/app/lib/actions/legal";

const emptyForm = {
    slug: "",
    titleEL: "",
    titleEN: "",
    contentEL: "",
    contentEN: "",
};

export function DataTableLegal({ data: initialData }: { data: LegalPageItem[] }) {
    const [data, setData] = React.useState(initialData);
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<LegalPageItem | null>(null);
    const [form, setForm] = React.useState(emptyForm);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => { setData(initialData); }, [initialData]);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
    const openEdit = (row: LegalPageItem) => {
        setEditing(row);
        setForm({
            slug: row.slug,
            titleEL: row.titleEL,
            titleEN: row.titleEN || "",
            contentEL: row.contentEL || "",
            contentEN: row.contentEN || "",
        });
        setOpen(true);
    };

    const handleSave = async () => {
        if (!form.slug.trim()) { toast.error("Slug is required"); return; }
        if (!form.titleEL.trim()) { toast.error("Greek title is required"); return; }
        setLoading(true);
        try {
            const saved = await upsertLegalPage({
                id: editing?.id,
                slug: form.slug,
                titleEL: form.titleEL,
                titleEN: form.titleEN || undefined,
                contentEL: form.contentEL || undefined,
                contentEN: form.contentEN || undefined,
                order: editing?.order ?? data.length + 1,
            });
            if (editing) {
                setData(d => d.map(r => r.id === editing.id ? { ...r, ...saved } : r));
                toast.success("Page updated");
            } else {
                setData(d => [...d, saved]);
                toast.success("Page created");
            }
            setOpen(false);
        } catch (e: any) { toast.error(e.message); }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this legal page?")) return;
        await deleteLegalPage(id);
        setData(d => d.filter(r => r.id !== id));
        toast.success("Deleted");
    };

    const columns: ColumnDef<LegalPageItem>[] = [
        {
            accessorKey: "slug",
            header: "Slug",
            cell: ({ row }) => (
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-lg text-muted-foreground">
                    /{row.original.slug}
                </span>
            ),
            size: 160,
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
            id: "preview",
            header: "Content",
            cell: ({ row }) => {
                const raw = row.original.contentEL?.replace(/<[^>]+>/g, " ").trim() || "";
                const preview = raw.length > 100 ? raw.slice(0, 100) + "…" : raw;
                return (
                    <span title={raw || undefined} className="text-xs text-muted-foreground cursor-default">
                        {preview || "—"}
                    </span>
                );
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
                searchPlaceholder="Search legal pages…"
                onAddClick={openAdd}
                addButtonLabel="New Legal Page"
            />

            <WideDialog open={open} onOpenChange={setOpen}>
                <WideDialogContent size="2xl">
                    <WideDialogHeader>
                        <WideDialogTitle>
                            {editing ? `Edit — ${editing.titleEL}` : "New Legal Page"}
                        </WideDialogTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Rich text content for Privacy Policy, Terms, and Cookie pages.
                        </p>
                    </WideDialogHeader>

                    <WideDialogBody className="space-y-5">
                        {/* Slug + Titles */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    Slug *
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-xs font-mono">/</span>
                                    <Input
                                        value={form.slug}
                                        onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                                        className="rounded-xl pl-6 font-mono text-sm"
                                        placeholder="privacy-policy"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Title (Greek) *</Label>
                                <Input value={form.titleEL} onChange={e => setForm(f => ({ ...f, titleEL: e.target.value }))} className="rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Title (English)</Label>
                                <Input value={form.titleEN} onChange={e => setForm(f => ({ ...f, titleEN: e.target.value }))} className="rounded-xl" />
                            </div>
                        </div>

                        {/* Rich text — bilingual tabs */}
                        <Tabs defaultValue="el">
                            <TabsList className="rounded-xl mb-4">
                                <TabsTrigger value="el" className="gap-1.5"><Globe className="w-3.5 h-3.5" />🇬🇷 Greek content</TabsTrigger>
                                <TabsTrigger value="en" className="gap-1.5"><Globe className="w-3.5 h-3.5" />🇬🇧 English content</TabsTrigger>
                            </TabsList>
                            <TabsContent value="el">
                                <RichEditor
                                    value={form.contentEL}
                                    onChange={html => setForm(f => ({ ...f, contentEL: html }))}
                                    placeholder="Γράψτε το περιεχόμενο εδώ…"
                                    minHeight={380}
                                />
                            </TabsContent>
                            <TabsContent value="en">
                                <RichEditor
                                    value={form.contentEN}
                                    onChange={html => setForm(f => ({ ...f, contentEN: html }))}
                                    placeholder="Write content here…"
                                    minHeight={380}
                                />
                            </TabsContent>
                        </Tabs>
                    </WideDialogBody>

                    <WideDialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSave} disabled={loading} className="rounded-xl px-8">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</> : editing ? "Save Changes" : "Create Page"}
                        </Button>
                    </WideDialogFooter>
                </WideDialogContent>
            </WideDialog>
        </>
    );
}
