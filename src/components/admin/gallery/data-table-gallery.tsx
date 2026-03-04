"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Trash2, Upload, Image as ImageIcon, Link2, LibraryBig, Edit } from "lucide-react";
import { GenericDataTable } from "@/components/admin/shared/generic-data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createGalleryImage, deleteGalleryImage, reorderGalleryImages, updateGalleryImage } from "@/app/lib/actions/gallery";
import { MediaPickerDialog } from "@/components/admin/shared/media-picker-dialog";

type GalleryRow = { id: string; url: string; title: string | null; category: string | null; order: number; createdAt: Date };

export function DataTableGallery({ initialImages }: { initialImages: GalleryRow[] }) {
    const [data, setData] = React.useState(initialImages);
    const [uploading, setUploading] = React.useState(false);
    const [mediaPickerOpen, setMediaPickerOpen] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [editItem, setEditItem] = React.useState<GalleryRow | null>(null);
    const [title, setTitle] = React.useState("");
    const [category, setCategory] = React.useState("");

    const fileRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => { setData(initialImages); }, [initialImages]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true);
        let uploaded = 0;
        const newImages: GalleryRow[] = [];
        for (const file of files) {
            const fd = new FormData();
            fd.append("file", file);
            try {
                const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                if (!res.ok) { const err = await res.json(); toast.error(err.error); continue; }
                const { url, type } = await res.json();
                if (type !== "IMAGE") { toast.error("Only images allowed here"); continue; }

                const img = await createGalleryImage({ url });
                newImages.push(img);
                uploaded++;
            } catch (err: any) {
                toast.error(err.message);
            }
        }
        setData(d => [...newImages, ...d]);
        if (uploaded) toast.success(`Uploaded ${uploaded} image(s)`);
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleGallerySelect = async (items: { id: string; type: string; url: string; order: number }[]) => {
        const newImages: GalleryRow[] = [];
        for (const item of items) {
            if (item.type !== "IMAGE") continue;
            const img = await createGalleryImage({ url: item.url });
            newImages.push(img);
        }
        setData(d => [...newImages, ...d]);
        toast.success(`Imported ${newImages.length} image(s)`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this gallery image?")) return;
        await deleteGalleryImage(id);
        setData(d => d.filter(m => m.id !== id));
        toast.success("Image removed from gallery");
    };

    const handleReorder = async (newData: GalleryRow[]) => {
        setData(newData);
        await reorderGalleryImages(newData.map(m => m.id));
    };

    const openEdit = (item: GalleryRow) => {
        setEditItem(item);
        setTitle(item.title || "");
        setCategory(item.category || "");
        setEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editItem) return;
        try {
            const updated = await updateGalleryImage(editItem.id, {
                title: title.trim() || undefined,
                category: category.trim() || undefined
            });
            setData(d => d.map(x => x.id === updated.id ? updated : x));
            setEditDialogOpen(false);
            toast.success("Image details saved");
        } catch (e: any) {
            toast.error("Failed to update");
        }
    };

    const columns: ColumnDef<GalleryRow>[] = [
        {
            id: "drag",
            header: "",
            cell: () => <div className="cursor-grab text-muted-foreground text-center select-none">⠿</div>,
            size: 40,
            enableHiding: false,
        },
        {
            accessorKey: "url",
            header: "Image Preview",
            cell: ({ row }) => (
                <div className="flex items-center gap-4">
                    <img src={row.original.url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm">{row.original.title || "Untitled"}</span>
                        {row.original.category ? (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-sm max-w-fit">{row.original.category}</span>
                        ) : (
                            <span className="text-xs text-muted-foreground">Uncategorized</span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="h-8 shadow-none" onClick={() => openEdit(row.original)}>
                        <Edit className="w-3.5 h-3.5 mr-2" /> Edit Details
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        onClick={e => { e.stopPropagation(); handleDelete(row.original.id); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            ),
            enableHiding: false,
        },
    ];

    return (
        <>
            <input ref={fileRef} type="file" multiple accept="image/*,.avif,.webp,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />

            <div className="flex justify-between items-center mb-6 bg-muted/30 p-4 rounded-3xl border border-border border-dashed">
                <div>
                    <h3 className="text-sm font-bold">Frontend Gallery Images</h3>
                    <p className="text-xs text-muted-foreground">Upload or select images to appear on the public gallery page. You can tag them with categories.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "Uploading..." : "Upload New"}
                    </Button>
                    <Button variant="outline" onClick={() => setMediaPickerOpen(true)}>
                        <LibraryBig className="w-4 h-4 mr-2" />
                        From Library
                    </Button>
                </div>
            </div>

            <GenericDataTable
                columns={columns}
                data={data}
                searchColumn="url"
                searchPlaceholder="Search images..."
                isSortable
                onReorder={handleReorder}
            />

            <MediaPickerDialog
                open={mediaPickerOpen}
                onOpenChange={setMediaPickerOpen}
                multiple
                filter="IMAGE"
                onSelect={handleGallerySelect}
                title="Select Images for Gallery"
            />

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="rounded-3xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-black">Edit Image Details</DialogTitle>
                    </DialogHeader>
                    {editItem && (
                        <div className="space-y-4 pt-2">
                            <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 border border-border">
                                <img src={editItem.url} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Display Title (Optional)</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Acropolis View" className="rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Category Tag (Optional)</Label>
                                <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Events, Rooms, City" className="rounded-xl" />
                                <p className="text-[10px] text-muted-foreground mt-1">This will be used to filter images on the public gallery page. Exact spelling matters.</p>
                            </div>
                            <div className="flex gap-2 justify-end pt-4">
                                <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-xl">Cancel</Button>
                                <Button onClick={handleSaveEdit} className="rounded-xl">Save Changes</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
