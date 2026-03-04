"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
    Pencil, Trash2, Languages, MapPin, Upload, Plus, Star,
    ChevronDown, GripVertical, Info, Lightbulb, Navigation, Image as ImageIcon,
    Loader2, Search, Check, LibraryBig, Tag
} from "lucide-react";
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent
} from "@dnd-kit/core";
import {
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { GenericDataTable } from "@/components/admin/shared/generic-data-table";
import { Button } from "@/components/ui/button";
import {
    WideDialog, WideDialogContent, WideDialogHeader, WideDialogTitle,
    WideDialogBody, WideDialogFooter
} from "@/components/ui/wide-dialog";
import { MediaPickerDialog } from "@/components/admin/shared/media-picker-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
    createPoi, updatePoi, deletePoi, updatePoiOrder, setPoiTags,
    addPoiMedia, deletePoiMedia, setPoiHeroImage, reorderPoiMedia,
    addVisitorTip, updateVisitorTip, deleteVisitorTip, reorderVisitorTips,
    upsertVisitInfo,
    addNearby, updateNearby, deleteNearby, reorderNearby,
} from "@/app/lib/actions/poi";

// ── Types ─────────────────────────────────────────────────────────────────────

type MediaItem = { id: string; type: string; url: string; order: number; isHero: boolean };
type VisitorTip = { id: string; nameEL: string; nameEN: string | null; order: number };
type VisitInfo = { id: string; distance: string | null; duration: string | null; price: string | null; hours: string | null; bestTime: string | null } | null;
type NearbyItem = { id: string; name: string; distance: string | null; order: number };

type PoiRow = {
    id: string;
    titleEL: string;
    titleEN: string | null;
    subtitleEL: string | null;
    subtitleEN: string | null;
    shortDescriptionEL: string | null;
    shortDescriptionEN: string | null;
    descriptionEL: string | null;
    descriptionEN: string | null;
    category: string | null;
    slug: string;
    latitude: number | null;
    longitude: number | null;
    order: number;
    tags: string[];
    media: MediaItem[];
    visitorTips: VisitorTip[];
    visitInfo: VisitInfo;
    nearby: NearbyItem[];
};

const TAGS_OPTIONS = [
    'Archaeological', 'Museum', 'Neighborhood', 'Nightlife',
    'Nature', 'Square', 'Market', 'Restaurant', 'Bar', 'Shopping',
    'Church', 'Viewpoint', 'Beach', 'Park', 'Historic',
];

const emptyForm = {
    titleEL: "", titleEN: "", subtitleEL: "", subtitleEN: "",
    shortDescriptionEL: "", shortDescriptionEN: "",
    descriptionEL: "", descriptionEN: "",
    category: "", slug: "", locationQuery: "", latitude: "", longitude: "",
};

const GEOCODE_API = "699c00fd11199785018145iob585d4d";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function translate(text: string, from: string, to: string) {
    if (!text.trim()) return "";
    const res = await fetch("/api/admin/translate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
    });
    const data = await res.json();
    return data.translation || "";
}

async function geocode(query: string): Promise<{ lat: string; lng: string } | null> {
    const url = `https://geocode.maps.co/search?q=${encodeURIComponent(query)}&api_key=${GEOCODE_API}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const results = await res.json();
    if (!results?.length) return null;
    return { lat: String(results[0].lat), lng: String(results[0].lon) };
}

// ── Sortable sub-row ─────────────────────────────────────────────────────────

function SortableSubRow({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className="flex items-center gap-2 group"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
            >
                <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );
}

// ── Expanded accordion content ────────────────────────────────────────────────

function PoiExpandedContent({ poi, onUpdate }: { poi: PoiRow; onUpdate: (updated: PoiRow) => void }) {
    const fileRef = React.useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = React.useState(false);
    const [galleryOpen, setGalleryOpen] = React.useState(false);
    const [media, setMedia] = React.useState<MediaItem[]>(poi.media);
    const [tips, setTips] = React.useState<VisitorTip[]>(poi.visitorTips);
    const [visitInfo, setVisitInfo] = React.useState<VisitInfo>(poi.visitInfo);
    const [nearby, setNearby] = React.useState<NearbyItem[]>(poi.nearby);
    const [tags, setTags] = React.useState<string[]>(Array.isArray(poi.tags) ? poi.tags : []);
    const [newTipEL, setNewTipEL] = React.useState("");
    const [newTipEN, setNewTipEN] = React.useState("");
    const [newNearbyName, setNewNearbyName] = React.useState("");
    const [newNearbyDist, setNewNearbyDist] = React.useState("");
    const [editingTip, setEditingTip] = React.useState<VisitorTip | null>(null);
    const [editingNearby, setEditingNearby] = React.useState<NearbyItem | null>(null);
    const [savingInfo, setSavingInfo] = React.useState(false);
    const [infoForm, setInfoForm] = React.useState({
        distance: visitInfo?.distance || "",
        duration: visitInfo?.duration || "",
        price: visitInfo?.price || "",
        hours: visitInfo?.hours || "",
        bestTime: visitInfo?.bestTime || "",
    });

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // ── Tags ───────────────────────────────────────────────────────────────────

    const handleToggleTag = async (tag: string) => {
        const next = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
        setTags(next);
        try {
            await setPoiTags(poi.id, next);
            toast.success(tags.includes(tag) ? `Removed "${tag}"` : `Added "${tag}"`);
        } catch { toast.error("Failed to update tags"); }
    };

    // ── Media ──────────────────────────────────────────────────────────────────

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true);
        for (const file of files) {
            const fd = new FormData(); fd.append("file", file);
            try {
                const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                if (!res.ok) { toast.error("Upload failed"); continue; }
                const { url, type } = await res.json();
                const created = await addPoiMedia(poi.id, { type, url, order: media.length, isHero: media.length === 0 });
                setMedia(m => [...m, created]);
            } catch { toast.error("Upload error"); }
        }
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleGallerySelect = async (items: { id: string; type: string; url: string; order: number }[]) => {
        for (const item of items) {
            const created = await addPoiMedia(poi.id, { type: item.type, url: item.url, order: media.length, isHero: media.length === 0 });
            setMedia(m => [...m, created]);
        }
        toast.success(`Added ${items.length} image${items.length > 1 ? "s" : ""} from gallery`);
    };

    const handleDeleteMedia = async (id: string) => {
        await deletePoiMedia(id);
        setMedia(m => m.filter(x => x.id !== id));
        toast.success("Image removed");
    };

    const handleSetHero = async (id: string) => {
        await setPoiHeroImage(poi.id, id);
        setMedia(m => m.map(x => ({ ...x, isHero: x.id === id })));
        toast.success("Hero image updated");
    };

    const handleMediaReorder = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIdx = media.findIndex(m => m.id === active.id);
        const newIdx = media.findIndex(m => m.id === over.id);
        const reordered = arrayMove(media, oldIdx, newIdx).map((m, i) => ({ ...m, order: i }));
        setMedia(reordered);
        await reorderPoiMedia(poi.id, reordered.map(m => m.id));
    };

    // ── Tips ───────────────────────────────────────────────────────────────────

    const handleAddTip = async () => {
        if (!newTipEL.trim()) return;
        const tip = await addVisitorTip(poi.id, { nameEL: newTipEL, nameEN: newTipEN || undefined, order: tips.length });
        setTips(t => [...t, tip]);
        setNewTipEL(""); setNewTipEN("");
    };

    const handleSaveTip = async (tip: VisitorTip) => {
        const updated = await updateVisitorTip(tip.id, { nameEL: tip.nameEL, nameEN: tip.nameEN || undefined });
        setTips(t => t.map(x => x.id === updated.id ? updated : x));
        setEditingTip(null);
        toast.success("Tip updated");
    };

    const handleDeleteTip = async (id: string) => {
        await deleteVisitorTip(id);
        setTips(t => t.filter(x => x.id !== id));
        toast.success("Tip removed");
    };

    const handleTipsReorder = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIdx = tips.findIndex(t => t.id === active.id);
        const newIdx = tips.findIndex(t => t.id === over.id);
        const reordered = arrayMove(tips, oldIdx, newIdx).map((t, i) => ({ ...t, order: i }));
        setTips(reordered);
        await reorderVisitorTips(poi.id, reordered.map(t => t.id));
    };

    // ── Visit Info ─────────────────────────────────────────────────────────────

    const handleSaveInfo = async () => {
        setSavingInfo(true);
        try {
            const updated = await upsertVisitInfo(poi.id, {
                distance: infoForm.distance || undefined,
                duration: infoForm.duration || undefined,
                price: infoForm.price || undefined,
                hours: infoForm.hours || undefined,
                bestTime: infoForm.bestTime || undefined,
            });
            setVisitInfo(updated);
            toast.success("Visit info saved");
        } catch { toast.error("Failed to save"); }
        setSavingInfo(false);
    };

    // ── Nearby ─────────────────────────────────────────────────────────────────

    const handleAddNearby = async () => {
        if (!newNearbyName.trim()) return;
        const item = await addNearby(poi.id, { name: newNearbyName, distance: newNearbyDist || undefined, order: nearby.length });
        setNearby(n => [...n, item]);
        setNewNearbyName(""); setNewNearbyDist("");
    };

    const handleSaveNearby = async (item: NearbyItem) => {
        const updated = await updateNearby(item.id, { name: item.name, distance: item.distance || undefined });
        setNearby(n => n.map(x => x.id === updated.id ? updated : x));
        setEditingNearby(null);
        toast.success("Updated");
    };

    const handleDeleteNearby = async (id: string) => {
        await deleteNearby(id);
        setNearby(n => n.filter(x => x.id !== id));
        toast.success("Removed");
    };

    const handleNearbyReorder = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIdx = nearby.findIndex(n => n.id === active.id);
        const newIdx = nearby.findIndex(n => n.id === over.id);
        const reordered = arrayMove(nearby, oldIdx, newIdx).map((n, i) => ({ ...n, order: i }));
        setNearby(reordered);
        await reorderNearby(poi.id, reordered.map(n => n.id));
    };

    return (
        <div className="mt-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <Tabs defaultValue="images">
                <TabsList className="rounded-none border-b border-border bg-muted/40 w-full justify-start gap-1 px-4 h-12">
                    <TabsTrigger value="images" className="gap-1.5 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <ImageIcon className="w-3.5 h-3.5" />{media.length > 0 && <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">{media.length}</span>} Images
                    </TabsTrigger>
                    <TabsTrigger value="tips" className="gap-1.5 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Lightbulb className="w-3.5 h-3.5" />{tips.length > 0 && <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">{tips.length}</span>} Visitor Tips
                    </TabsTrigger>
                    <TabsTrigger value="visit-info" className="gap-1.5 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Info className="w-3.5 h-3.5" /> Visit Info
                    </TabsTrigger>
                    <TabsTrigger value="nearby" className="gap-1.5 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Navigation className="w-3.5 h-3.5" />{nearby.length > 0 && <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">{nearby.length}</span>} Nearby
                    </TabsTrigger>
                    <TabsTrigger value="tags" className="gap-1.5 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Tag className="w-3.5 h-3.5" />{tags.length > 0 && <span className="text-xs bg-amber-500 text-white rounded-full px-1.5 py-0.5 leading-none">{tags.length}</span>} Tags
                    </TabsTrigger>
                </TabsList>

                {/* ── Images ── */}
                <TabsContent value="images" className="p-4 space-y-4 focus-visible:outline-none">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Drag to reorder · ⭐ to set hero image · Click × to remove</p>
                        <div className="flex gap-2">
                            <input ref={fileRef} type="file" multiple accept="image/*,.avif,.webp,.png,.jpg,.jpeg,video/*" className="hidden" onChange={handleUpload} />
                            <Button size="sm" variant="outline" onClick={() => setGalleryOpen(true)} className="rounded-xl gap-2">
                                <LibraryBig className="w-3.5 h-3.5" /> From Gallery
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-xl gap-2">
                                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                {uploading ? "Uploading..." : "Upload"}
                            </Button>
                        </div>
                    </div>

                    <MediaPickerDialog
                        open={galleryOpen}
                        onOpenChange={setGalleryOpen}
                        onSelect={handleGallerySelect}
                        multiple
                        filter="IMAGE"
                        title="Select images for this POI"
                    />

                    {media.length === 0 && (
                        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-sm cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileRef.current?.click()}>
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            Click or drag to upload images
                        </div>
                    )}

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMediaReorder}>
                        <SortableContext items={media.map(m => m.id)} strategy={verticalListSortingStrategy}>
                            <div className="grid grid-cols-5 gap-3">
                                {media.map((m) => (
                                    <SortableSubRow key={m.id} id={m.id}>
                                        <div className={cn(
                                            "relative group aspect-square rounded-xl overflow-hidden border-2 transition-all",
                                            m.isHero ? "border-amber-400 shadow-md shadow-amber-100 dark:shadow-amber-900/30" : "border-border hover:border-primary/30"
                                        )}>
                                            {m.type === "IMAGE" ? (
                                                <img src={m.url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">VIDEO</div>
                                            )}
                                            {m.isHero && (
                                                <div className="absolute top-1.5 left-1.5 bg-amber-400 rounded-full p-0.5">
                                                    <Star className="w-3 h-3 text-white fill-white" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                                                <button
                                                    onClick={() => handleSetHero(m.id)}
                                                    title="Set as hero image"
                                                    className="w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center hover:bg-amber-500 transition-colors"
                                                >
                                                    <Star className="w-3.5 h-3.5 fill-white" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMedia(m.id)}
                                                    className="w-7 h-7 rounded-full bg-red-500 text-white text-sm flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >×</button>
                                            </div>
                                        </div>
                                    </SortableSubRow>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </TabsContent>

                {/* ── Visitor Tips ── */}
                <TabsContent value="tips" className="p-4 space-y-3 focus-visible:outline-none">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTipsReorder}>
                        <SortableContext items={tips.map(t => t.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {tips.map(tip => (
                                    <SortableSubRow key={tip.id} id={tip.id}>
                                        {editingTip?.id === tip.id ? (
                                            <div className="flex gap-2 items-center bg-muted/60 rounded-xl p-2">
                                                <Input value={editingTip.nameEL} onChange={e => setEditingTip({ ...editingTip, nameEL: e.target.value })} placeholder="GR" className="rounded-lg h-8 text-sm flex-1" />
                                                <Input value={editingTip.nameEN || ""} onChange={e => setEditingTip({ ...editingTip, nameEN: e.target.value })} placeholder="EN" className="rounded-lg h-8 text-sm flex-1" />
                                                <Button size="sm" className="rounded-lg h-8 px-3" onClick={() => handleSaveTip(editingTip)}><Check className="w-3.5 h-3.5" /></Button>
                                                <Button size="sm" variant="outline" className="rounded-lg h-8 px-3" onClick={() => setEditingTip(null)}>✕</Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-muted/30 rounded-xl px-3 py-2 group/tip">
                                                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <span className="text-sm flex-1">{tip.nameEL}</span>
                                                {tip.nameEN && <span className="text-xs text-muted-foreground">{tip.nameEN}</span>}
                                                <button onClick={() => setEditingTip(tip)} className="opacity-0 group-hover/tip:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDeleteTip(tip.id)} className="opacity-0 group-hover/tip:opacity-100 transition-opacity text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        )}
                                    </SortableSubRow>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <div className="flex gap-2 pt-2 border-t border-border">
                        <Input value={newTipEL} onChange={e => setNewTipEL(e.target.value)} placeholder="New tip (GR)" className="rounded-xl h-9 text-sm flex-1" onKeyDown={e => e.key === "Enter" && handleAddTip()} />
                        <Input value={newTipEN} onChange={e => setNewTipEN(e.target.value)} placeholder="Translation (EN)" className="rounded-xl h-9 text-sm flex-1" onKeyDown={e => e.key === "Enter" && handleAddTip()} />
                        <Button size="sm" onClick={handleAddTip} className="rounded-xl h-9 gap-1 px-4"><Plus className="w-3.5 h-3.5" />Add</Button>
                    </div>
                </TabsContent>

                {/* ── Visit Info ── */}
                <TabsContent value="visit-info" className="p-4 focus-visible:outline-none">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { key: "distance", label: "Distance from hotel", placeholder: "e.g. 1.2 km" },
                            { key: "duration", label: "Walking time", placeholder: "e.g. 15 min" },
                            { key: "price", label: "Entry price", placeholder: "e.g. €15 / Free" },
                            { key: "hours", label: "Opening hours", placeholder: "e.g. 8:00–20:00" },
                            { key: "bestTime", label: "Best time to visit", placeholder: "e.g. Early morning" },
                        ].map(({ key, label, placeholder }) => (
                            <div key={key} className="space-y-1.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
                                <Input
                                    value={infoForm[key as keyof typeof infoForm]}
                                    onChange={e => setInfoForm(f => ({ ...f, [key]: e.target.value }))}
                                    placeholder={placeholder}
                                    className="rounded-xl"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSaveInfo} disabled={savingInfo} className="rounded-xl gap-2">
                            {savingInfo && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Save Visit Info
                        </Button>
                    </div>
                </TabsContent>

                {/* ── Nearby ── */}
                <TabsContent value="nearby" className="p-4 space-y-3 focus-visible:outline-none">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleNearbyReorder}>
                        <SortableContext items={nearby.map(n => n.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {nearby.map(item => (
                                    <SortableSubRow key={item.id} id={item.id}>
                                        {editingNearby?.id === item.id ? (
                                            <div className="flex gap-2 items-center bg-muted/60 rounded-xl p-2">
                                                <Input value={editingNearby.name} onChange={e => setEditingNearby({ ...editingNearby, name: e.target.value })} placeholder="Name" className="rounded-lg h-8 text-sm flex-1" />
                                                <Input value={editingNearby.distance || ""} onChange={e => setEditingNearby({ ...editingNearby, distance: e.target.value })} placeholder="Distance" className="rounded-lg h-8 text-sm w-28" />
                                                <Button size="sm" className="rounded-lg h-8 px-3" onClick={() => handleSaveNearby(editingNearby)}><Check className="w-3.5 h-3.5" /></Button>
                                                <Button size="sm" variant="outline" className="rounded-lg h-8 px-3" onClick={() => setEditingNearby(null)}>✕</Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-muted/30 rounded-xl px-3 py-2 group/nb">
                                                <Navigation className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                <span className="text-sm flex-1">{item.name}</span>
                                                {item.distance && <Badge variant="outline" className="text-xs">{item.distance}</Badge>}
                                                <button onClick={() => setEditingNearby(item)} className="opacity-0 group-hover/nb:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDeleteNearby(item.id)} className="opacity-0 group-hover/nb:opacity-100 transition-opacity text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        )}
                                    </SortableSubRow>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <div className="flex gap-2 pt-2 border-t border-border">
                        <Input value={newNearbyName} onChange={e => setNewNearbyName(e.target.value)} placeholder="Place name" className="rounded-xl h-9 text-sm flex-1" onKeyDown={e => e.key === "Enter" && handleAddNearby()} />
                        <Input value={newNearbyDist} onChange={e => setNewNearbyDist(e.target.value)} placeholder="Distance (e.g. 300m)" className="rounded-xl h-9 text-sm w-40" onKeyDown={e => e.key === "Enter" && handleAddNearby()} />
                        <Button size="sm" onClick={handleAddNearby} className="rounded-xl h-9 gap-1 px-4"><Plus className="w-3.5 h-3.5" />Add</Button>
                    </div>
                </TabsContent>

                {/* ── Tags ── */}
                <TabsContent value="tags" className="p-4 focus-visible:outline-none">
                    <div className="mb-4">
                        <p className="text-xs text-muted-foreground">
                            Select all tags that apply. Tags power the filter bar on the Athens page. Changes save instantly.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {TAGS_OPTIONS.map(tag => {
                            const active = tags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    onClick={() => handleToggleTag(tag)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${active
                                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-200 dark:shadow-amber-900'
                                        : 'bg-transparent border-border text-muted-foreground hover:border-amber-400 hover:text-amber-600'
                                        }`}
                                >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                    {active && <Check className="w-3 h-3" />}
                                </button>
                            );
                        })}
                    </div>
                    {tags.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Active tags</p>
                            <div className="flex flex-wrap gap-1.5">
                                {tags.map(t => (
                                    <Badge key={t} className="gap-1 text-xs bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-800">
                                        <Tag className="w-3 h-3" />{t}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ── Main Table ────────────────────────────────────────────────────────────────

export function DataTablePois({ data: initialData }: { data: PoiRow[] }) {
    const [data, setData] = React.useState(initialData);
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<PoiRow | null>(null);
    const [form, setForm] = React.useState(emptyForm);
    const [loading, setLoading] = React.useState(false);
    const [translating, setTranslating] = React.useState(false);
    const [geocoding, setGeocoding] = React.useState(false);

    React.useEffect(() => { setData(initialData); }, [initialData]);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
    const openEdit = (row: PoiRow) => {
        setEditing(row);
        setForm({
            titleEL: row.titleEL, titleEN: row.titleEN || "",
            subtitleEL: row.subtitleEL || "", subtitleEN: row.subtitleEN || "",
            shortDescriptionEL: row.shortDescriptionEL || "", shortDescriptionEN: row.shortDescriptionEN || "",
            descriptionEL: row.descriptionEL || "", descriptionEN: row.descriptionEN || "",
            category: row.category || "", slug: row.slug,
            locationQuery: "", latitude: String(row.latitude ?? ""), longitude: String(row.longitude ?? ""),
        });
        setOpen(true);
    };

    const handleTranslate = async (from: "EL" | "EN") => {
        setTranslating(true);
        const to = from === "EL" ? "EN" : "EL";
        try {
            const [title, subtitle, short, desc] = await Promise.all([
                translate(from === "EL" ? form.titleEL : form.titleEN, from, to),
                translate(from === "EL" ? form.subtitleEL : form.subtitleEN, from, to),
                translate(from === "EL" ? form.shortDescriptionEL : form.shortDescriptionEN, from, to),
                translate(from === "EL" ? form.descriptionEL : form.descriptionEN, from, to),
            ]);
            if (to === "EN") setForm(f => ({ ...f, titleEN: title, subtitleEN: subtitle, shortDescriptionEN: short, descriptionEN: desc }));
            else setForm(f => ({ ...f, titleEL: title, subtitleEL: subtitle, shortDescriptionEL: short, descriptionEL: desc }));
            toast.success("Translation complete");
        } catch { toast.error("Translation failed"); }
        setTranslating(false);
    };

    const handleGeocode = async () => {
        if (!form.locationQuery.trim()) return;
        setGeocoding(true);
        try {
            const result = await geocode(form.locationQuery);
            if (result) {
                setForm(f => ({ ...f, latitude: result.lat, longitude: result.lng }));
                toast.success("Coordinates found");
            } else {
                toast.error("Location not found");
            }
        } catch { toast.error("Geocoding failed"); }
        setGeocoding(false);
    };

    const handleSave = async () => {
        if (!form.titleEL.trim()) { toast.error("Greek title is required"); return; }
        setLoading(true);
        try {
            const payload = {
                titleEL: form.titleEL, titleEN: form.titleEN || undefined,
                subtitleEL: form.subtitleEL || undefined, subtitleEN: form.subtitleEN || undefined,
                shortDescriptionEL: form.shortDescriptionEL || undefined, shortDescriptionEN: form.shortDescriptionEN || undefined,
                descriptionEL: form.descriptionEL || undefined, descriptionEN: form.descriptionEN || undefined,
                category: form.category || undefined,
                slug: form.slug || undefined,
                latitude: form.latitude ? Number(form.latitude) : undefined,
                longitude: form.longitude ? Number(form.longitude) : undefined,
            };
            if (editing) {
                const updated = await updatePoi(editing.id, payload);
                setData(d => d.map(r => r.id === editing.id ? { ...r, ...updated } : r));
                toast.success("POI updated");
            } else {
                const created = await createPoi({ ...payload, order: data.length });
                setData(d => [...d, { ...created, media: [], visitorTips: [], visitInfo: null, nearby: [] }]);
                toast.success("POI created");
            }
            setOpen(false);
        } catch (e: any) { toast.error(e.message); }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this POI? This will also delete all media, tips and visit info.")) return;
        await deletePoi(id);
        setData(d => d.filter(r => r.id !== id));
        toast.success("POI deleted");
    };

    const handleReorder = async (newData: PoiRow[]) => {
        setData(newData);
        await updatePoiOrder(newData.map(r => r.id));
    };

    const handlePoiUpdated = (id: string, updated: Partial<PoiRow>) => {
        setData(d => d.map(r => r.id === id ? { ...r, ...updated } : r));
    };

    const columns: ColumnDef<PoiRow>[] = [
        {
            id: "drag", header: "", size: 40, enableHiding: false,
            cell: () => <div className="cursor-grab text-center select-none text-muted-foreground">⠿</div>,
        },
        {
            id: "hero", header: "", size: 52, enableHiding: false,
            cell: ({ row }) => {
                const hero = row.original.media.find(m => m.isHero) || row.original.media[0];
                return hero ? (
                    <img src={hero.url} alt="" className="w-9 h-9 rounded-lg object-cover border border-border" />
                ) : (
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                );
            },
        },
        {
            accessorKey: "titleEL", header: "Title (GR)",
            cell: ({ row }) => (
                <div>
                    <p className="font-semibold text-sm">{row.original.titleEL}</p>
                    {row.original.category && <p className="text-xs text-muted-foreground">{row.original.category}</p>}
                </div>
            ),
        },
        {
            accessorKey: "titleEN", header: "Title (EN)",
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.titleEN || "—"}</span>,
        },
        {
            id: "location", header: "Coordinates",
            cell: ({ row }) => row.original.latitude ? (
                <Badge variant="outline" className="gap-1 text-xs font-mono">
                    <MapPin className="w-3 h-3" />
                    {Number(row.original.latitude).toFixed(4)}, {Number(row.original.longitude).toFixed(4)}
                </Badge>
            ) : <span className="text-muted-foreground text-xs">—</span>,
        },
        {
            id: "counts", header: "Content",
            cell: ({ row }) => (
                <div className="flex gap-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs gap-1"><ImageIcon className="w-3 h-3" />{row.original.media.length}</Badge>
                    {row.original.visitorTips.length > 0 && <Badge variant="secondary" className="text-xs gap-1"><Lightbulb className="w-3 h-3" />{row.original.visitorTips.length}</Badge>}
                    {row.original.nearby.length > 0 && <Badge variant="secondary" className="text-xs gap-1"><Navigation className="w-3 h-3" />{row.original.nearby.length}</Badge>}
                    {row.original.visitInfo && <Badge variant="outline" className="text-xs gap-1 text-emerald-600 border-emerald-200"><Info className="w-3 h-3" />Info</Badge>}
                </div>
            ),
        },
        {
            id: "actions", header: "", enableHiding: false,
            cell: ({ row }) => (
                <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 px-2 rounded-lg gap-1 text-xs">
                                <Plus className="w-3.5 h-3.5" />Add <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-48">
                            <DropdownMenuItem className="gap-2 text-sm cursor-pointer" onClick={() => {
                                // expand the row and switch to images tab - handled by accordion
                                row.toggleExpanded(true);
                            }}>
                                <ImageIcon className="w-3.5 h-3.5" /> Add Image
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-sm cursor-pointer" onClick={() => {
                                row.toggleExpanded(true);
                            }}>
                                <Lightbulb className="w-3.5 h-3.5" /> Add Visitor Tip
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-sm cursor-pointer" onClick={() => {
                                row.toggleExpanded(true);
                            }}>
                                <Info className="w-3.5 h-3.5" /> Edit Visit Info
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-sm cursor-pointer" onClick={() => {
                                row.toggleExpanded(true);
                            }}>
                                <Navigation className="w-3.5 h-3.5" /> Add Nearby
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(row.original)}>
                        <Pencil className="w-3.5 h-3.5" />
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
            <GenericDataTable
                columns={columns}
                data={data}
                searchColumn="titleEL"
                searchPlaceholder="Search POIs..."
                onAddClick={openAdd}
                addButtonLabel="Add POI"
                isSortable
                onReorder={handleReorder}
                renderExpandedRow={(row) => (
                    <PoiExpandedContent
                        poi={row as PoiRow}
                        onUpdate={(updated) => handlePoiUpdated(updated.id, updated)}
                    />
                )}
            />

            {/* Edit / Create Modal */}
            <WideDialog open={open} onOpenChange={setOpen}>
                <WideDialogContent size="xl">
                    <WideDialogHeader>
                        <div className="flex items-center justify-between pr-8">
                            <div>
                                <WideDialogTitle>{editing ? "Edit POI" : "New Point of Interest"}</WideDialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {editing ? editing.titleEL : "Create a new point of interest for Athens"}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs" disabled={translating} onClick={() => handleTranslate("EL")}>
                                    {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}GR→EN
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs" disabled={translating} onClick={() => handleTranslate("EN")}>
                                    {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}EN→GR
                                </Button>
                            </div>
                        </div>
                    </WideDialogHeader>

                    <WideDialogBody>
                        <Tabs defaultValue="el">
                            <TabsList className="rounded-xl mb-6">
                                <TabsTrigger value="el">🇬🇷 Greek Content</TabsTrigger>
                                <TabsTrigger value="en">🇬🇧 English Content</TabsTrigger>
                                <TabsTrigger value="meta">📍 Location & Meta</TabsTrigger>
                            </TabsList>

                            <TabsContent value="el" className="space-y-5 focus-visible:outline-none">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Title (GR) *</Label>
                                        <Input value={form.titleEL} onChange={e => setForm({ ...form, titleEL: e.target.value })} className="rounded-xl" placeholder="Ακρόπολη" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Subtitle (GR)</Label>
                                        <Input value={form.subtitleEL} onChange={e => setForm({ ...form, subtitleEL: e.target.value })} className="rounded-xl" placeholder="Αρχαιολογικός χώρος" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Short Description (GR)</Label>
                                    <Textarea value={form.shortDescriptionEL} onChange={e => setForm({ ...form, shortDescriptionEL: e.target.value })} className="rounded-xl min-h-[80px]" placeholder="Brief teaser text..." />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Full Description (GR)</Label>
                                    <Textarea value={form.descriptionEL} onChange={e => setForm({ ...form, descriptionEL: e.target.value })} className="rounded-xl min-h-[180px]" />
                                </div>
                            </TabsContent>

                            <TabsContent value="en" className="space-y-5 focus-visible:outline-none">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Title (EN)</Label>
                                        <Input value={form.titleEN} onChange={e => setForm({ ...form, titleEN: e.target.value })} className="rounded-xl" placeholder="Acropolis" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Subtitle (EN)</Label>
                                        <Input value={form.subtitleEN} onChange={e => setForm({ ...form, subtitleEN: e.target.value })} className="rounded-xl" placeholder="Archaeological site" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Short Description (EN)</Label>
                                    <Textarea value={form.shortDescriptionEN} onChange={e => setForm({ ...form, shortDescriptionEN: e.target.value })} className="rounded-xl min-h-[80px]" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Full Description (EN)</Label>
                                    <Textarea value={form.descriptionEN} onChange={e => setForm({ ...form, descriptionEN: e.target.value })} className="rounded-xl min-h-[180px]" />
                                </div>
                            </TabsContent>

                            <TabsContent value="meta" className="space-y-5 focus-visible:outline-none">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Category</Label>
                                        <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="rounded-xl" placeholder="e.g. Archaeological, Museum, Neighborhood" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Slug</Label>
                                        <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="rounded-xl font-mono text-sm" placeholder="acropolis" />
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground block">
                                        📍 Geocoding — convert address to coordinates
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={form.locationQuery}
                                            onChange={e => setForm({ ...form, locationQuery: e.target.value })}
                                            placeholder="Enter address or place name..."
                                            className="rounded-xl flex-1"
                                            onKeyDown={e => e.key === "Enter" && handleGeocode()}
                                        />
                                        <Button variant="outline" onClick={handleGeocode} disabled={geocoding} className="rounded-xl gap-2 shrink-0">
                                            {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                            {geocoding ? "Searching..." : "Geocode"}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Latitude</Label>
                                            <Input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} placeholder="37.9755" className="rounded-xl font-mono" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Longitude</Label>
                                            <Input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} placeholder="23.7348" className="rounded-xl font-mono" />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </WideDialogBody>

                    <WideDialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSave} disabled={loading} className="rounded-xl px-8">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {loading ? "Saving..." : editing ? "Save Changes" : "Create POI"}
                        </Button>
                    </WideDialogFooter>
                </WideDialogContent>
            </WideDialog>
        </>
    );
}
