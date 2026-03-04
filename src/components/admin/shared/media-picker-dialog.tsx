"use client";

import * as React from "react";
import { Search, Check, ImageIcon, Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
    WideDialog, WideDialogContent, WideDialogHeader, WideDialogTitle,
    WideDialogBody, WideDialogFooter,
} from "@/components/ui/wide-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getMedia } from "@/app/lib/actions/media";

type MediaItem = {
    id: string;
    type: string;
    url: string;
    order: number;
};

interface MediaPickerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Called with the selected media item(s) */
    onSelect: (items: MediaItem[]) => void;
    /** Allow picking multiple items */
    multiple?: boolean;
    /** Only show images, only videos, or both */
    filter?: "IMAGE" | "VIDEO" | "ALL";
    title?: string;
}

export function MediaPickerDialog({
    open,
    onOpenChange,
    onSelect,
    multiple = false,
    filter = "ALL",
    title = "Select from Media Gallery",
}: MediaPickerDialogProps) {
    const [media, setMedia] = React.useState<MediaItem[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const [selected, setSelected] = React.useState<Set<string>>(new Set());
    const [search, setSearch] = React.useState("");
    const fileRef = React.useRef<HTMLInputElement>(null);

    // Load media when dialog opens
    React.useEffect(() => {
        if (!open) return;
        setSelected(new Set());
        setSearch("");
        setLoading(true);
        getMedia().then(items => {
            setMedia(items as MediaItem[]);
            setLoading(false);
        }).catch(() => {
            toast.error("Failed to load media");
            setLoading(false);
        });
    }, [open]);

    const filtered = media.filter(m => {
        if (filter === "IMAGE" && m.type !== "IMAGE") return false;
        if (filter === "VIDEO" && m.type !== "VIDEO") return false;
        // Simple URL-based search (filename at end of URL)
        if (search.trim()) {
            const name = m.url.split("/").pop()?.toLowerCase() || "";
            return name.includes(search.toLowerCase());
        }
        return true;
    });

    const toggle = (id: string) => {
        if (multiple) {
            setSelected(prev => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
            });
        } else {
            setSelected(new Set([id]));
        }
    };

    const handleConfirm = () => {
        const chosen = media.filter(m => selected.has(m.id));
        onSelect(chosen);
        onOpenChange(false);
    };

    const handleUploadAndAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true);
        const newItems: MediaItem[] = [];
        for (const file of files) {
            const fd = new FormData();
            fd.append("file", file);
            try {
                const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                if (!res.ok) { toast.error("Upload failed"); continue; }
                const { url, type } = await res.json();
                // Add to local list (not persisted to Media table — callers handle that)
                const temp: MediaItem = { id: `temp-${Date.now()}-${Math.random()}`, type, url, order: 0 };
                newItems.push(temp);
                setMedia(prev => [temp, ...prev]);
                setSelected(prev => new Set([...prev, temp.id]));
            } catch { toast.error("Upload error"); }
        }
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
        if (!multiple && newItems.length === 1) {
            // Auto-confirm if single select and one file uploaded
            onSelect(newItems);
            onOpenChange(false);
        }
    };

    return (
        <WideDialog open={open} onOpenChange={onOpenChange}>
            <WideDialogContent size="2xl">
                <WideDialogHeader>
                    <div className="flex items-center justify-between pr-8">
                        <WideDialogTitle>{title}</WideDialogTitle>
                        <div className="flex items-center gap-2">
                            <input ref={fileRef} type="file" multiple={multiple} accept={filter === "VIDEO" ? "video/*" : "image/*,.avif,.webp,.png,.jpg,.jpeg,video/*"} className="hidden" onChange={handleUploadAndAdd} />
                            <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
                                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                {uploading ? "Uploading..." : "Upload New"}
                            </Button>
                        </div>
                    </div>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by filename..."
                            className="pl-9 rounded-xl"
                        />
                    </div>
                </WideDialogHeader>

                <WideDialogBody className="min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
                            <ImageIcon className="w-12 h-12 opacity-20" />
                            <p className="text-sm">{search ? "No results for that search" : "No media uploaded yet"}</p>
                            <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => fileRef.current?.click()}>
                                <Upload className="w-3.5 h-3.5" /> Upload files
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 gap-3">
                            {filtered.map(item => {
                                const isSelected = selected.has(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggle(item.id)}
                                        className={cn(
                                            "relative aspect-square rounded-xl overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group",
                                            isSelected
                                                ? "border-primary ring-2 ring-primary/30 shadow-md"
                                                : "border-border hover:border-primary/40"
                                        )}
                                    >
                                        {item.type === "IMAGE" ? (
                                            <img src={item.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
                                                VIDEO
                                            </div>
                                        )}
                                        {/* Selection overlay */}
                                        <div className={cn(
                                            "absolute inset-0 transition-colors",
                                            isSelected ? "bg-primary/20" : "bg-transparent group-hover:bg-black/10"
                                        )} />
                                        {/* Checkmark */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                                <Check className="w-3.5 h-3.5 text-primary-foreground" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </WideDialogBody>

                <WideDialogFooter>
                    <div className="flex-1 text-sm text-muted-foreground">
                        {selected.size > 0
                            ? `${selected.size} item${selected.size > 1 ? "s" : ""} selected`
                            : "Click to select"}
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selected.size === 0}
                        className="rounded-xl px-6"
                    >
                        {multiple ? `Add ${selected.size || ""} Selected` : "Use Selected"}
                    </Button>
                </WideDialogFooter>
            </WideDialogContent>
        </WideDialog>
    );
}
