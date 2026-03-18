"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenericDataTable } from "@/components/admin/shared/generic-data-table";
import { createMenuLink, updateMenuLink, deleteMenuLink, updateMenuLinkOrder } from "@/app/lib/actions/menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

type MenuLinkRow = { id: string; labelEL: string; labelEN: string | null; href: string; order: number };
export type AvailablePage = { type: "Standard" | "Custom"; labelEL: string; labelEN: string; href: string };

export function DataTableMenu({ initialData, availablePages = [] }: { initialData: MenuLinkRow[], availablePages?: AvailablePage[] }) {
    const [data, setData] = React.useState(initialData);
    const [open, setOpen] = React.useState(false);
    const [editId, setEditId] = React.useState<string | null>(null);
    
    const [labelEL, setLabelEL] = React.useState("");
    const [labelEN, setLabelEN] = React.useState("");
    const [href, setHref] = React.useState("");

    React.useEffect(() => { setData(initialData); }, [initialData]);

    const handleOpenEdit = (item?: MenuLinkRow) => {
        if (item) {
            setEditId(item.id);
            setLabelEL(item.labelEL);
            setLabelEN(item.labelEN || "");
            setHref(item.href);
        } else {
            setEditId(null);
            setLabelEL("");
            setLabelEN("");
            setHref("");
        }
        setOpen(true);
    };

    const handleSave = async () => {
        if (!labelEL || !href) {
            toast.error("Greek label and link are required");
            return;
        }

        try {
            if (editId) {
                const res = await updateMenuLink(editId, { labelEL, labelEN: labelEN || "", href });
                setData(d => d.map(x => x.id === editId ? res : x));
                toast.success("Menu item updated");
            } else {
                const res = await createMenuLink({ labelEL, labelEN: labelEN || "", href });
                setData(d => [...d, res]);
                toast.success("Menu item created");
            }
            setOpen(false);
        } catch {
            toast.error("Failed to save menu item");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this menu item?")) return;
        try {
            await deleteMenuLink(id);
            setData(d => d.filter(x => x.id !== id));
            toast.success("Menu item deleted");
        } catch {
            toast.error("Error deleting menu item");
        }
    };

    const handleReorder = async (newData: MenuLinkRow[]) => {
        setData(newData);
        try {
            await updateMenuLinkOrder(newData.map(item => item.id));
        } catch {
            toast.error("Error saving new order");
        }
    };

    const columns: ColumnDef<MenuLinkRow>[] = [
        {
            id: "drag",
            header: "",
            cell: () => <div className="cursor-grab text-muted-foreground select-none flex justify-center text-lg">⠿</div>,
            size: 40,
        },
        {
            accessorKey: "labelEL",
            header: "Label (EL)",
            cell: ({ row }) => <span className="font-semibold">{row.original.labelEL}</span>,
        },
        {
            accessorKey: "labelEN",
            header: "Label (EN)",
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.labelEN || "—"}</span>,
        },
        {
            accessorKey: "href",
            header: "URL Link",
            cell: ({ row }) => <span className="text-xs font-mono bg-muted p-1 rounded">{row.original.href}</span>,
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="h-8 shadow-none" onClick={() => handleOpenEdit(row.original)}>
                        <Edit className="w-3.5 h-3.5 mr-2" /> Edit
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
            <div className="flex justify-end mb-4 bg-muted/30 p-4 rounded-3xl border border-border border-dashed items-center relative">
                <div className="flex-1 mr-4">
                    <h3 className="text-sm font-bold">Frontend Navigation Elements</h3>
                    <p className="text-xs text-muted-foreground">Add links to existing pages or tools (e.g. `/rooms`, `/about-us`, or `https://google.com`). This orders and displays navigation at the top of the frontend site.</p>
                </div>
                <Button onClick={() => handleOpenEdit()} className="rounded-xl shadow-none whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-2" /> Add Menu Item
                </Button>
            </div>

            <GenericDataTable
                columns={columns}
                data={data}
                searchColumn="labelEL"
                searchPlaceholder="Search menu items..."
                isSortable
                onReorder={handleReorder}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="rounded-3xl max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="font-black">{editId ? "Edit" : "New"} Menu Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        {availablePages.length > 0 && (
                            <div className="space-y-1.5 mb-4">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Select an Existing Page</Label>
                                <Select
                                    onValueChange={(val) => {
                                        if (!val) return;
                                        const page = availablePages.find(p => p.href === val);
                                        if (page) {
                                            setLabelEL(page.labelEL);
                                            setLabelEN(page.labelEN || "");
                                            setHref(page.href);
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full rounded-xl">
                                        <SelectValue placeholder="Choose a page to auto-fill..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectGroup>
                                            <SelectLabel>Standard Pages</SelectLabel>
                                            {availablePages.filter(p => p.type === 'Standard').map(p => (
                                                <SelectItem key={p.href} value={p.href}>
                                                    {p.labelEL} ({p.labelEN}) - <span className="text-muted-foreground text-xs">{p.href}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                        {availablePages.some(p => p.type === 'Custom') && (
                                            <SelectGroup>
                                                <SelectLabel>Custom Pages</SelectLabel>
                                                {availablePages.filter(p => p.type === 'Custom').map(p => (
                                                    <SelectItem key={p.href} value={p.href}>
                                                        {p.labelEL} ({p.labelEN}) - <span className="text-muted-foreground text-xs">{p.href}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">🇬🇷 Greek Label</Label>
                            <Input value={labelEL} onChange={e => setLabelEL(e.target.value)} placeholder="e.g. Αρχική" className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">🇬🇧 English Label</Label>
                            <Input value={labelEN} onChange={e => setLabelEN(e.target.value)} placeholder="e.g. Home" className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Link / HREF</Label>
                            <Input value={href} onChange={e => setHref(e.target.value)} placeholder="e.g. /rooms or /about-us" className="rounded-xl font-mono text-sm" />
                            <p className="text-[10px] text-muted-foreground leading-tight">Can be a local path `/rooms` or an external URL `https://...`</p>
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button className="rounded-xl" onClick={handleSave}>Save Item</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
