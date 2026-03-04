"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
    Pencil, Trash2, Languages, Upload, BedDouble, Eye, EyeOff, LibraryBig, Loader2, Star,
    Wifi, Wind, Coffee, Sparkles, Bed, Bath, Tv, Refrigerator, ShowerHead, VolumeX, Sun, Lock,
    BellRing, Martini, Plane, ConciergeBell, Ban, Luggage, Building2, Utensils
} from "lucide-react";
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext, rectSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GenericDataTable } from "@/components/admin/shared/generic-data-table";
import { Button } from "@/components/ui/button";
import {
    WideDialog, WideDialogContent, WideDialogHeader, WideDialogTitle,
    WideDialogBody, WideDialogFooter,
} from "@/components/ui/wide-dialog";
import { MediaPickerDialog } from "@/components/admin/shared/media-picker-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getRooms, createRoom, updateRoom, deleteRoom, updateRoomOrder } from "@/app/lib/actions/room";

type RoomImage = { id?: string; url: string; order: number };
type RoomAmenityItem = { id?: string; nameEL: string; nameEN: string; icon: string; order: number };

export const STANDARD_AMENITIES = [
    { icon: "Wifi", IconComp: Wifi, nameEN: "Free Wi-Fi", nameEL: "Δωρεάν Wi-Fi" },
    { icon: "Wind", IconComp: Wind, nameEN: "Air Conditioning", nameEL: "Κλιματισμός" },
    { icon: "Tv", IconComp: Tv, nameEN: "Flat-screen TV", nameEL: "Επίπεδη Τηλεόραση" },
    { icon: "Refrigerator", IconComp: Refrigerator, nameEN: "Minibar", nameEL: "Μίνι Μπαρ" },
    { icon: "Coffee", IconComp: Coffee, nameEN: "Coffee Machine", nameEL: "Μηχανή Καφέ" },
    { icon: "ShowerHead", IconComp: ShowerHead, nameEN: "Private Bathroom", nameEL: "Ιδιωτικό Μπάνιο" },
    { icon: "Sparkles", IconComp: Sparkles, nameEN: "Premium Toiletries", nameEL: "Προϊόντα Περιποίησης" },
    { icon: "Sun", IconComp: Sun, nameEN: "Balcony", nameEL: "Μπαλκόνι" },
    { icon: "Lock", IconComp: Lock, nameEN: "Safe", nameEL: "Χρηματοκιβώτιο" },
    { icon: "VolumeX", IconComp: VolumeX, nameEN: "Soundproofing", nameEL: "Ηχομόνωση" },
    { icon: "BellRing", IconComp: BellRing, nameEN: "Room Service", nameEL: "Υπηρεσία Δωματίου" },
    { icon: "Bed", IconComp: Bed, nameEN: "Premium Bedding", nameEL: "Premium Κλινοσκεπάσματα" },
];

export const STANDARD_FACILITIES = [
    { icon: "Wifi", IconComp: Wifi, nameEN: "Free High-Speed Wi-Fi", nameEL: "Δωρεάν Γρήγορο Wi-Fi" },
    { icon: "Coffee", IconComp: Coffee, nameEN: "Coffee Shop", nameEL: "Καφετέρια" },
    { icon: "Utensils", IconComp: Utensils, nameEN: "Breakfast", nameEL: "Πρωινό" },
    { icon: "Martini", IconComp: Martini, nameEN: "Bar & Lounge", nameEL: "Μπαρ" },
    { icon: "Plane", IconComp: Plane, nameEN: "Airport Shuttle", nameEL: "Υπηρεσία Μεταφοράς" },
    { icon: "ConciergeBell", IconComp: ConciergeBell, nameEN: "Concierge", nameEL: "Θυρωρείο" },
    { icon: "Ban", IconComp: Ban, nameEN: "Smoke-Free", nameEL: "Χωρίς Κάπνισμα" },
    { icon: "Luggage", IconComp: Luggage, nameEN: "Luggage Storage", nameEL: "Χώρος Αποσκευών" },
    { icon: "Sparkles", IconComp: Sparkles, nameEN: "Daily Housekeeping", nameEL: "Καθημερινός Καθαρισμός" },
    { icon: "Building2", IconComp: Building2, nameEN: "Historic Building", nameEL: "Ιστορικό Κτήριο" },
];

type RoomRow = {
    id: string;
    name: string;
    slug: string;
    descriptionEL: string | null;
    descriptionEN: string | null;
    sleeps: number;
    squareMeters: number | null;
    startingFrom: number | null;
    featuredImage: string | null;
    published: boolean;
    order: number;
    images: RoomImage[];
    amenities: RoomAmenityItem[];
    facilities: RoomAmenityItem[];
};

const emptyForm = {
    name: "",
    slug: "",
    descriptionEL: "",
    descriptionEN: "",
    sleeps: "2",
    squareMeters: "",
    startingFrom: "",
    published: true,
    images: [] as RoomImage[],
    amenities: [] as RoomAmenityItem[],
    facilities: [] as RoomAmenityItem[],
};

async function translate(text: string, from: string, to: string) {
    if (!text.trim()) return "";
    const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
    });
    const data = await res.json();
    return data.translation || "";
}

function slugify(str: string) {
    return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

function SortableImage({ img, index, onSetFeatured, onRemove }: { img: RoomImage; index: number; onSetFeatured: () => void; onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.url });
    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1, opacity: isDragging ? 0.6 : 1 }}
            className={cn(
                "relative group aspect-square rounded-xl overflow-hidden border-2 transition-all",
                index === 0 ? "border-amber-400 shadow-md" : "border-border hover:border-primary/30"
            )}
        >
            {/* Drag Handle Overlay */}
            <div {...attributes} {...listeners} className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing" />

            <img src={img.url} alt="" className="w-full h-full object-cover pointer-events-none" />

            {index === 0 && (
                <div className="absolute top-1.5 left-1.5 bg-amber-400 rounded-full p-0.5 z-20 pointer-events-none">
                    <Star className="w-3 h-3 text-white fill-white" />
                </div>
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 z-30 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-1">
                    {index !== 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onSetFeatured(); }}
                            title="Set as featured"
                            className="w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center hover:bg-amber-500 transition-colors"
                        >
                            <Star className="w-3.5 h-3.5 fill-white" />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="w-7 h-7 rounded-full bg-red-500 text-white text-sm flex items-center justify-center hover:bg-red-600 transition-colors"
                    >×</button>
                </div>
            </div>
        </div>
    );
}

export function DataTableRooms({ data: initialData }: { data: RoomRow[] }) {
    const [data, setData] = React.useState(initialData);
    const [open, setOpen] = React.useState(false);
    const [galleryOpen, setGalleryOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<RoomRow | null>(null);
    const [form, setForm] = React.useState(emptyForm);
    const [loading, setLoading] = React.useState(false);
    const [translating, setTranslating] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const fileRef = React.useRef<HTMLInputElement>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    React.useEffect(() => { setData(initialData); }, [initialData]);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
    const openEdit = (row: RoomRow) => {
        setEditing(row);
        setForm({
            name: row.name,
            slug: row.slug,
            descriptionEL: row.descriptionEL || "",
            descriptionEN: row.descriptionEN || "",
            sleeps: String(row.sleeps ?? 2),
            squareMeters: String(row.squareMeters ?? ""),
            startingFrom: String(row.startingFrom ?? ""),
            published: row.published,
            images: row.images || [],
            amenities: row.amenities || [],
            facilities: row.facilities || [],
        });
        setOpen(true);
    };

    const handleTranslate = async (from: "EL" | "EN") => {
        setTranslating(true);
        const to = from === "EL" ? "EN" : "EL";
        try {
            const desc = await translate(from === "EL" ? form.descriptionEL : form.descriptionEN, from, to);
            if (to === "EN") setForm(f => ({ ...f, descriptionEN: desc }));
            else setForm(f => ({ ...f, descriptionEL: desc }));
            toast.success("Translation complete");
        } catch { toast.error("Translation failed"); }
        setTranslating(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true);
        for (const file of files) {
            const fd = new FormData();
            fd.append("file", file);
            try {
                const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                if (!res.ok) { toast.error("Upload failed"); continue; }
                const { url } = await res.json();
                setForm(f => ({ ...f, images: [...f.images, { url, order: f.images.length }] }));
            } catch { toast.error("Upload failed"); }
        }
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleGallerySelect = (items: { id: string; type: string; url: string; order: number }[]) => {
        const newImages = items.map((item, i) => ({ url: item.url, order: form.images.length + i }));
        setForm(f => ({ ...f, images: [...f.images, ...newImages] }));
        toast.success(`Added ${items.length} image${items.length > 1 ? "s" : ""} from gallery`);
    };

    const setFeaturedImage = (url: string) => {
        // Move this image to front and mark it as featured
        setForm(f => {
            const others = f.images.filter(img => img.url !== url);
            return { ...f, images: [{ url, order: 0 }, ...others.map((img, i) => ({ ...img, order: i + 1 }))] };
        });
        toast.success("Featured image updated");
    };

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error("Room name is required"); return; }
        setLoading(true);
        try {
            const payload = {
                name: form.name,
                slug: form.slug || slugify(form.name),
                descriptionEL: form.descriptionEL || undefined,
                descriptionEN: form.descriptionEN || undefined,
                sleeps: form.sleeps ? Number(form.sleeps) : 2,
                squareMeters: form.squareMeters ? Number(form.squareMeters) : undefined,
                startingFrom: form.startingFrom ? Number(form.startingFrom) : undefined,
                featuredImage: form.images[0]?.url || undefined,
                published: form.published,
                images: form.images,
                amenities: form.amenities,
                facilities: form.facilities,
            };
            if (editing) {
                const updated = await updateRoom(editing.id, payload);
                setData(d => d.map(r => r.id === editing.id ? { ...r, ...updated } : r));
                toast.success("Room updated");
            } else {
                await createRoom({ ...payload, order: data.length });
                const full = await getRooms();
                setData(full);
                toast.success("Room created");
            }
            setOpen(false);
        } catch (e: any) { toast.error(e.message); }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this room?")) return;
        await deleteRoom(id);
        setData(d => d.filter(r => r.id !== id));
        toast.success("Room deleted");
    };

    const handleReorder = async (newData: RoomRow[]) => {
        setData(newData);
        await updateRoomOrder(newData.map(r => r.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIdx = form.images.findIndex(img => img.url === active.id);
        const newIdx = form.images.findIndex(img => img.url === over.id);
        const reordered = arrayMove(form.images, oldIdx, newIdx).map((img, i) => ({ ...img, order: i }));
        setForm(f => ({ ...f, images: reordered }));
    };

    const columns: ColumnDef<RoomRow>[] = [
        {
            id: "drag", header: "", size: 40, enableHiding: false,
            cell: () => <div className="cursor-grab text-center select-none text-muted-foreground">⠿</div>,
        },
        {
            id: "image", header: "", size: 56, enableHiding: false,
            cell: ({ row }) => row.original.featuredImage ? (
                <img src={row.original.featuredImage} alt="" className="w-10 h-10 rounded-lg object-cover border border-border" />
            ) : (
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <BedDouble className="w-4 h-4 text-muted-foreground" />
                </div>
            ),
        },
        {
            accessorKey: "name", header: "Room Name",
            cell: ({ row }) => <span className="font-semibold text-sm">{row.original.name}</span>,
        },
        {
            accessorKey: "slug", header: "Slug",
            cell: ({ row }) => <span className="text-xs text-muted-foreground font-mono">{row.original.slug}</span>,
        },
        {
            id: "specs", header: "Specs",
            cell: ({ row }) => (
                <div className="flex gap-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs gap-1"><BedDouble className="w-3 h-3" />{row.original.sleeps}</Badge>
                    {row.original.squareMeters && <Badge variant="outline" className="text-xs">{row.original.squareMeters}m²</Badge>}
                    {row.original.startingFrom && <Badge variant="outline" className="text-xs">€{Number(row.original.startingFrom).toFixed(0)}</Badge>}
                </div>
            ),
        },
        {
            id: "images", header: "Images",
            cell: ({ row }) => <Badge variant="secondary" className="text-xs">{row.original.images?.length || 0} photos</Badge>,
        },
        {
            accessorKey: "published", header: "Status",
            cell: ({ row }) => row.original.published
                ? <Badge className="text-xs gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-200"><Eye className="w-3 h-3" />Published</Badge>
                : <Badge variant="outline" className="text-xs gap-1 text-muted-foreground"><EyeOff className="w-3 h-3" />Draft</Badge>,
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
            <GenericDataTable
                columns={columns}
                data={data}
                searchColumn="name"
                searchPlaceholder="Search rooms..."
                onAddClick={openAdd}
                addButtonLabel="Add Room"
                isSortable
                onReorder={handleReorder}
            />

            {/* Gallery Picker */}
            <MediaPickerDialog
                open={galleryOpen}
                onOpenChange={setGalleryOpen}
                onSelect={handleGallerySelect}
                multiple
                filter="IMAGE"
                title="Select room images from gallery"
            />

            {/* Edit / Create Modal */}
            <WideDialog open={open} onOpenChange={setOpen}>
                <WideDialogContent size="xl">
                    <WideDialogHeader>
                        <div className="flex items-center justify-between pr-8">
                            <div>
                                <WideDialogTitle>{editing ? "Edit Room" : "New Room"}</WideDialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {editing ? editing.name : "Create a new room"}
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
                                <TabsTrigger value="el">🇬🇷 Greek</TabsTrigger>
                                <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                                <TabsTrigger value="details">🛏 Details & Images</TabsTrigger>
                                <TabsTrigger value="amenities">✨ Amenities</TabsTrigger>
                                <TabsTrigger value="facilities">🏢 Facilities</TabsTrigger>
                            </TabsList>

                            <TabsContent value="el" className="space-y-4 focus-visible:outline-none">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Room Name *</Label>
                                        <Input
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
                                            className="rounded-xl"
                                            placeholder="e.g. Deluxe Suite"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Slug</Label>
                                        <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="rounded-xl font-mono text-sm" placeholder="deluxe-suite" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Description (GR)</Label>
                                    <Textarea value={form.descriptionEL} onChange={e => setForm({ ...form, descriptionEL: e.target.value })} className="rounded-xl min-h-[180px]" />
                                </div>
                            </TabsContent>

                            <TabsContent value="en" className="space-y-4 focus-visible:outline-none">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Description (EN)</Label>
                                    <Textarea value={form.descriptionEN} onChange={e => setForm({ ...form, descriptionEN: e.target.value })} className="rounded-xl min-h-[180px]" />
                                </div>
                            </TabsContent>

                            <TabsContent value="details" className="space-y-5 focus-visible:outline-none">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Sleeps</Label>
                                        <Input type="number" min={1} value={form.sleeps} onChange={e => setForm({ ...form, sleeps: e.target.value })} className="rounded-xl" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Size (m²)</Label>
                                        <Input type="number" value={form.squareMeters} onChange={e => setForm({ ...form, squareMeters: e.target.value })} className="rounded-xl" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Starting From (€)</Label>
                                        <Input type="number" step="0.01" value={form.startingFrom} onChange={e => setForm({ ...form, startingFrom: e.target.value })} className="rounded-xl" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
                                    <Switch checked={form.published} onCheckedChange={(v: boolean) => setForm({ ...form, published: v })} />
                                    <div>
                                        <p className="text-sm font-semibold">Published</p>
                                        <p className="text-xs text-muted-foreground">Visible on the public website</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                            Room Images {form.images.length > 0 && <span className="normal-case font-normal text-muted-foreground/70">— first image is featured · ⭐ to change</span>}
                                        </Label>
                                        <div className="flex gap-2">
                                            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                            <Button variant="outline" size="sm" onClick={() => setGalleryOpen(true)} className="rounded-xl gap-2">
                                                <LibraryBig className="w-3.5 h-3.5" /> From Gallery
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-xl gap-2">
                                                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                                {uploading ? "Uploading..." : "Upload"}
                                            </Button>
                                        </div>
                                    </div>

                                    {form.images.length === 0 ? (
                                        <div
                                            className="border-2 border-dashed border-border rounded-xl p-10 text-center text-muted-foreground text-sm cursor-pointer hover:border-primary/40 transition-colors"
                                            onClick={() => fileRef.current?.click()}
                                        >
                                            <Upload className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            Click to upload or use gallery
                                        </div>
                                    ) : (
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={form.images.map(img => img.url)} strategy={rectSortingStrategy}>
                                                <div className="grid grid-cols-5 gap-3">
                                                    {form.images.map((img, i) => (
                                                        <SortableImage
                                                            key={img.url}
                                                            img={img}
                                                            index={i}
                                                            onSetFeatured={() => setFeaturedImage(img.url)}
                                                            onRemove={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="amenities" className="space-y-4 focus-visible:outline-none">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4 block">In-Room Amenities</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {STANDARD_AMENITIES.map((item, i) => {
                                        const isSelected = form.amenities.some(a => a.icon === item.icon);
                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                                    isSelected ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20" : "border-border hover:border-primary/30"
                                                )}
                                                onClick={() => {
                                                    setForm(f => ({
                                                        ...f,
                                                        amenities: isSelected
                                                            ? f.amenities.filter(a => a.icon !== item.icon)
                                                            : [...f.amenities, { nameEN: item.nameEN, nameEL: item.nameEL, icon: item.icon, order: f.amenities.length }]
                                                    }))
                                                }}
                                            >
                                                <div className={cn("p-2 rounded-lg", isSelected ? "bg-amber-400/20 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground")}>
                                                    <item.IconComp className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate">{item.nameEL}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{item.nameEN}</p>
                                                </div>
                                                <div className="shrink-0">
                                                    <Switch checked={isSelected} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>

                            <TabsContent value="facilities" className="space-y-4 focus-visible:outline-none">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4 block">Building Facilities</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {STANDARD_FACILITIES.map((item, i) => {
                                        const isSelected = form.facilities.some(a => a.icon === item.icon);
                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                                    isSelected ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20" : "border-border hover:border-primary/30"
                                                )}
                                                onClick={() => {
                                                    setForm(f => ({
                                                        ...f,
                                                        facilities: isSelected
                                                            ? f.facilities.filter(a => a.icon !== item.icon)
                                                            : [...f.facilities, { nameEN: item.nameEN, nameEL: item.nameEL, icon: item.icon, order: f.facilities.length }]
                                                    }))
                                                }}
                                            >
                                                <div className={cn("p-2 rounded-lg", isSelected ? "bg-amber-400/20 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground")}>
                                                    <item.IconComp className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate">{item.nameEL}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{item.nameEN}</p>
                                                </div>
                                                <div className="shrink-0">
                                                    <Switch checked={isSelected} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>

                        </Tabs>
                    </WideDialogBody>

                    <WideDialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSave} disabled={loading} className="rounded-xl px-8">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {loading ? "Saving..." : editing ? "Save Changes" : "Create Room"}
                        </Button>
                    </WideDialogFooter>
                </WideDialogContent>
            </WideDialog>
        </>
    );
}
