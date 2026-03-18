"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Edit, FileText, Plus, Trash2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GenericDataTable } from "@/components/admin/shared/generic-data-table";
import { deleteCustomPage } from "@/app/lib/actions/custom-pages";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCustomPage } from "@/app/lib/actions/custom-pages";

export function DataTableCustomPages({ initialData }: { initialData: any[] }) {
    const router = useRouter();
    const [data, setData] = React.useState(initialData);
    const [createOpen, setCreateOpen] = React.useState(false);
    
    const [slug, setSlug] = React.useState("");
    const [titleEL, setTitleEL] = React.useState("");
    const [titleEN, setTitleEN] = React.useState("");

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this page?")) return;
        try {
            await deleteCustomPage(id);
            setData(d => d.filter(item => item.id !== id));
            toast.success("Page deleted");
        } catch {
            toast.error("Failed to delete page");
        }
    };

    const handleCreate = async () => {
        if (!titleEL || !slug) {
            toast.error("Greek Title and Slug are required.");
            return;
        }
        
        try {
            const res = await createCustomPage({
                slug,
                titleEL,
                titleEN: titleEN || titleEL,
                blocks: []
            });
            setData([res, ...data]);
            setCreateOpen(false);
            router.push(`/admin/custom-pages/${res.id}`);
            toast.success("Page created.");
        } catch(e: any) {
            toast.error("Slug might be duplicate.");
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "titleEL",
            header: "Title (EL)",
            cell: ({ row }) => <span className="font-semibold">{row.original.titleEL}</span>,
        },
        {
            accessorKey: "titleEN",
            header: "Title (EN)",
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.titleEN || "—"}</span>,
        },
        {
            accessorKey: "slug",
            header: "Slug / Link",
            cell: ({ row }) => <span className="text-xs font-mono bg-muted p-1 rounded">/{row.original.slug}</span>,
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2 text-right">
                    <Button size="sm" variant="outline" className="shadow-none h-8 w-8 p-0" title="Preview" onClick={() => window.open(`/${row.original.slug}`, "_blank")}>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="shadow-none h-8" onClick={() => router.push(`/admin/custom-pages/${row.original.id}`)}>
                        <Edit className="w-3.5 h-3.5 mr-2" /> Content Builder
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(row.original.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={() => setCreateOpen(true)} className="rounded-xl shadow-none">
                    <Plus className="w-4 h-4 mr-2" /> New Custom Page
                </Button>
            </div>
            
            <GenericDataTable
                columns={columns}
                data={data}
                searchColumn="titleEL"
                searchPlaceholder="Search pages..."
            />

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="rounded-3xl max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="font-black tracking-tight">Create Custom Page</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mr-1">🇬🇷 Initial Title</Label>
                            <Input value={titleEL} onChange={e => {
                                setTitleEL(e.target.value);
                            }} placeholder="e.g. Σχετικά με εμάς" className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mr-1">🇬🇧 Initial Title</Label>
                            <Input value={titleEN} onChange={e => {
                                setTitleEN(e.target.value);
                                if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                            }} placeholder="e.g. About Us" className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mr-1">URL / Slug</Label>
                            <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. about-us" className="rounded-xl font-mono text-sm" />
                            <p className="text-[10px] text-muted-foreground">This defines the link (e.g. /about-us). Must be unique and lowercase without spaces.</p>
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" className="rounded-xl" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button className="rounded-xl" onClick={handleCreate}>Create & Build</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
