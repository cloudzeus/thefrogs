"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Trash2, Upload, Image, Video, Play, Link2 } from "lucide-react";
import { GenericDataTable } from "@/components/admin/shared/generic-data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createMedia, deleteMedia, updateMediaOrder } from "@/app/lib/actions/media";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MediaRow = { id: string; type: string; url: string; order: number; createdAt: Date };

export function DataTableMedia({ data: initialData }: { data: MediaRow[] }) {
    const [data, setData] = React.useState(initialData);
    const [uploading, setUploading] = React.useState(false);
    const [urlDialogOpen, setUrlDialogOpen] = React.useState(false);
    const [urlInput, setUrlInput] = React.useState("");
    const [urlType, setUrlType] = React.useState("VIDEO");
    const fileRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => { setData(initialData); }, [initialData]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true);
        let uploaded = 0;
        const newMediaItems: MediaRow[] = [];
        for (const file of files) {
            const fd = new FormData();
            fd.append("file", file);
            try {
                const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                if (!res.ok) { const err = await res.json(); toast.error(err.error); continue; }
                const { url, type } = await res.json();
                const media = await createMedia({ type, url, order: data.length + uploaded });
                newMediaItems.push(media);
                uploaded++;
            } catch (err: any) {
                toast.error(err.message);
            }
        }
        setData(d => [...newMediaItems, ...d]);
        if (uploaded) toast.success(`Uploaded ${uploaded} file(s)`);
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleAddUrl = async () => {
        if (!urlInput.trim()) return;
        try {
            const media = await createMedia({ type: urlType, url: urlInput.trim(), order: data.length });
            setData(d => [media, ...d]);
            setUrlInput(""); setUrlDialogOpen(false);
            toast.success("Media URL added");
        } catch (e: any) { toast.error(e.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this media?")) return;
        await deleteMedia(id);
        setData(d => d.filter(m => m.id !== id));
        toast.success("Media deleted");
    };

    const handleReorder = async (newData: MediaRow[]) => {
        setData(newData);
        await updateMediaOrder(newData.map(m => m.id));
    };

    const columns: ColumnDef<MediaRow>[] = [
        {
            id: "drag",
            header: "",
            cell: () => <div className="cursor-grab text-muted-foreground text-center select-none">⠿</div>,
            size: 40,
            enableHiding: false,
        },
        {
            accessorKey: "url",
            header: "Preview",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    {row.original.type === "IMAGE" ? (
                        <img src={row.original.url} alt="" className="w-12 h-12 rounded-lg object-cover border border-border" />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-border flex items-center justify-center">
                            <Play className="w-5 h-5 text-muted-foreground" />
                        </div>
                    )}
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{row.original.url.split("/").pop()}</span>
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="outline" className="gap-1 text-xs">
                    {row.original.type === "IMAGE" ? <Image className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                    {row.original.type}
                </Badge>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => <span className="text-xs text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString("el-GR")}</span>,
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div className="flex justify-end">
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
            <input ref={fileRef} type="file" multiple accept="image/*,.avif,.webp,.png,.jpg,.jpeg,video/*" className="hidden" onChange={handleFileChange} />
            <div className="flex gap-2 mb-2">
                <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-xl gap-2">
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Upload Files"}
                </Button>
                <Button variant="outline" onClick={() => setUrlDialogOpen(true)} className="rounded-xl gap-2">
                    <Link2 className="w-4 h-4" />
                    Add by URL
                </Button>
            </div>

            <GenericDataTable
                columns={columns}
                data={data}
                searchColumn="url"
                searchPlaceholder="Search media..."
                isSortable
                onReorder={handleReorder}
            />

            <Dialog open={urlDialogOpen} onOpenChange={setUrlDialogOpen}>
                <DialogContent className="rounded-3xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-black">Add Media by URL</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Type</Label>
                            <select value={urlType} onChange={e => setUrlType(e.target.value)}
                                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm">
                                <option value="IMAGE">Image</option>
                                <option value="VIDEO">Video</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">URL</Label>
                            <Input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://..." className="rounded-xl" />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setUrlDialogOpen(false)} className="rounded-xl">Cancel</Button>
                            <Button onClick={handleAddUrl} className="rounded-xl">Add</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
