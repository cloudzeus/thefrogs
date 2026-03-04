"use client";

import * as React from "react";
import { toast } from "sonner";
import {
    GripVertical, Pencil, ChevronDown, ChevronUp, Languages,
    Loader2, Save, Image as ImageIcon, Plus, Trash2, Check,
    Eye, EyeOff, GalleryHorizontalEnd,
} from "lucide-react";
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaPickerDialog } from "@/components/admin/shared/media-picker-dialog";

import {
    upsertHomeSection, updateHomeSectionOrder, toggleHomeSectionPublished,
} from "@/app/lib/actions/home-sections";

// ── Types ─────────────────────────────────────────────────────────────────────

type SectionRow = {
    id: string;
    key: string;
    order: number;
    published: boolean;
    image: string | null;
    labelEL: string | null; labelEN: string | null;
    titleEL: string | null; titleEN: string | null;
    subtitleEL: string | null; subtitleEN: string | null;
    bodyEL: string | null; bodyEN: string | null;
    ctaLabelEL: string | null; ctaLabelEN: string | null; ctaUrl: string | null;
    cta2LabelEL: string | null; cta2LabelEN: string | null; cta2Url: string | null;
    extras: Record<string, unknown>;
};

const SECTION_LABELS: Record<string, string> = {
    hero: "🏠 Hero Banner",
    stayAndDrink: "🍸 Stay & Drink",
    guesthouse: "🛏 Guesthouse",
    bar: "☕ Bar",
    rooms: "🚪 Rooms Showcase",
    amenities: "✨ Amenities",
    location: "📍 Location",
    gallery: "🖼 Gallery",
    testimonials: "⭐ Testimonials",
    contactCta: "📬 Contact CTA",
};

// Sections that have image collections inside their extras
const IMAGE_COLLECTION_KEYS: Record<string, string> = {
    bar: "galleryImages",
    gallery: "images",
};

// ── Translation helper ────────────────────────────────────────────────────────

async function translate(text: string, from: string, to: string) {
    if (!text.trim()) return "";
    const res = await fetch("/api/admin/translate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
    });
    return (await res.json()).translation || "";
}

// ── Image Collection Manager ──────────────────────────────────────────────────

function ImageCollectionManager({
    images, onUpdate, label,
}: { images: string[]; onUpdate: (imgs: string[]) => void; label: string }) {
    const [galleryOpen, setGalleryOpen] = React.useState(false);

    const handleAdd = (items: { url: string }[]) => {
        onUpdate([...images, ...items.map(i => i.url)]);
    };
    const handleRemove = (idx: number) => {
        onUpdate(images.filter((_, i) => i !== idx));
    };
    const handleMove = (from: number, to: number) => {
        const arr = [...images];
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        onUpdate(arr);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                    {label} ({images.length} images)
                </Label>
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => setGalleryOpen(true)}>
                    <Plus className="w-3.5 h-3.5" /> Add Images
                </Button>
            </div>

            {images.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {images.map((src, i) => (
                        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                            <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                {i > 0 && (
                                    <button onClick={() => handleMove(i, i - 1)} className="w-6 h-6 rounded-full bg-white/80 text-gray-800 text-xs flex items-center justify-center">←</button>
                                )}
                                <button onClick={() => handleRemove(i)} className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                                {i < images.length - 1 && (
                                    <button onClick={() => handleMove(i, i + 1)} className="w-6 h-6 rounded-full bg-white/80 text-gray-800 text-xs flex items-center justify-center">→</button>
                                )}
                            </div>
                            <span className="absolute top-1 left-1 text-[9px] bg-black/60 text-white rounded px-1">#{i + 1}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
                    <GalleryHorizontalEnd className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No images yet — click "Add Images"
                </div>
            )}

            <MediaPickerDialog
                open={galleryOpen}
                onOpenChange={setGalleryOpen}
                multiple
                filter="IMAGE"
                title={`Select ${label}`}
                onSelect={handleAdd}
            />
        </div>
    );
}

// Safely coerce a Prisma Json field to a plain object
function safeExtras(raw: unknown): Record<string, unknown> {
    if (raw === null || raw === undefined) return {};
    if (typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>;
    if (typeof raw === "string") {
        try { const parsed = JSON.parse(raw); return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}; } catch { return {}; }
    }
    return {};
}

// ── Accordion Section ─────────────────────────────────────────────────────────

function AccordionSection({
    section: initialSection,
    onOrderChange,
    dragHandleProps,
}: {
    section: SectionRow;
    onOrderChange?: () => void;
    dragHandleProps: Record<string, unknown>;
}) {
    const normalized = { ...initialSection, extras: safeExtras(initialSection.extras) };
    const [section, setSection] = React.useState(normalized);
    const [expanded, setExpanded] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [translating, setTranslating] = React.useState(false);
    const [dirty, setDirty] = React.useState(false);
    const [heroGalleryOpen, setHeroGalleryOpen] = React.useState(false);
    // Separate string state for the raw JSON text editor — avoids parsing on every keystroke
    const [extrasText, setExtrasText] = React.useState(() => {
        try { return JSON.stringify(normalized.extras, null, 2); } catch { return "{}"; }
    });
    const [extrasTextError, setExtrasTextError] = React.useState(false);

    const set = (field: keyof SectionRow, value: unknown) => {
        setSection(s => ({ ...s, [field]: value }));
        setDirty(true);
    };

    const setExtras = (update: Record<string, unknown>) => {
        setSection(s => {
            const next = { ...s, extras: { ...s.extras, ...update } };
            // Keep extrasText in sync when changed through structured fields
            try { setExtrasText(JSON.stringify(next.extras, null, 2)); } catch { /* skip */ }
            return next;
        });
        setDirty(true);
    };

    const handleTogglePublished = async () => {
        const next = !section.published;
        setSection(s => ({ ...s, published: next }));
        try {
            await toggleHomeSectionPublished(section.key, next);
            toast.success(next ? "Section published" : "Section hidden");
        } catch { toast.error("Failed to toggle"); }
    };

    const handleTranslate = async (dir: "toEL" | "toEN") => {
        setTranslating(true);
        try {
            const pairs: [keyof SectionRow, keyof SectionRow][] = [
                ["labelEN", "labelEL"], ["titleEN", "titleEL"],
                ["subtitleEN", "subtitleEL"], ["bodyEN", "bodyEL"],
                ["ctaLabelEN", "ctaLabelEL"], ["cta2LabelEN", "cta2LabelEL"],
            ];
            const updates: Partial<SectionRow> = {};
            for (const [enF, elF] of pairs) {
                if (dir === "toEL") {
                    const src = (section[enF] as string) || "";
                    if (src) updates[elF] = await translate(src, "EN", "EL") as never;
                } else {
                    const src = (section[elF] as string) || "";
                    if (src) updates[enF] = await translate(src, "EL", "EN") as never;
                }
            }
            setSection(s => ({ ...s, ...updates }));
            setDirty(true);
            toast.success("Translated!");
        } catch { toast.error("Translation failed"); }
        setTranslating(false);
    };

    const handleSave = async () => {
        // Before saving, attempt to apply any pending extrasText changes
        let finalExtras = section.extras;
        try {
            const parsed = JSON.parse(extrasText);
            if (typeof parsed === "object" && !Array.isArray(parsed)) finalExtras = parsed;
        } catch { /* use current section.extras */ }
        setSaving(true);
        try {
            await upsertHomeSection({
                key: section.key,
                image: section.image,
                labelEL: section.labelEL, labelEN: section.labelEN,
                titleEL: section.titleEL, titleEN: section.titleEN,
                subtitleEL: section.subtitleEL, subtitleEN: section.subtitleEN,
                bodyEL: section.bodyEL, bodyEN: section.bodyEN,
                ctaLabelEL: section.ctaLabelEL, ctaLabelEN: section.ctaLabelEN, ctaUrl: section.ctaUrl,
                cta2LabelEL: section.cta2LabelEL, cta2LabelEN: section.cta2LabelEN, cta2Url: section.cta2Url,
                published: section.published,
                extras: finalExtras,
            });
            setSection(s => ({ ...s, extras: finalExtras }));
            setDirty(false);
            setExtrasTextError(false);
            toast.success("Saved!");
        } catch { toast.error("Save failed"); }
        setSaving(false);
    };

    const collectionKey = IMAGE_COLLECTION_KEYS[section.key];
    const collectionImages = collectionKey
        ? ((section.extras[collectionKey] as string[]) ?? [])
        : null;

    const BilingualField = ({ label: fieldLabel, elField, enField, multiline }: {
        label: string;
        elField: keyof SectionRow;
        enField: keyof SectionRow;
        multiline?: boolean;
    }) => {
        const Comp = multiline ? Textarea : Input;
        const compProps = multiline ? { rows: 3, className: "rounded-xl resize-none text-sm" } : { className: "rounded-xl text-sm" };
        return (
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">🇬🇷 {fieldLabel}</Label>
                    <Comp value={(section[elField] as string) ?? ""} onChange={e => set(elField, e.target.value)} {...compProps} />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">🇬🇧 {fieldLabel}</Label>
                    <Comp value={(section[enField] as string) ?? ""} onChange={e => set(enField, e.target.value)} {...compProps} />
                </div>
            </div>
        );
    };

    return (
        <div className={`rounded-2xl border bg-card transition-all duration-200 ${expanded ? 'border-primary/30 shadow-sm' : 'border-border'}`}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3">
                {/* Drag handle */}
                <div {...dragHandleProps} className="cursor-grab text-muted-foreground hover:text-foreground p-1 shrink-0">
                    <GripVertical className="w-4 h-4" />
                </div>

                {/* Thumbnail */}
                <div className="w-14 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                    {section.image ? (
                        <img src={section.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                            <ImageIcon className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {/* Name + key */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{SECTION_LABELS[section.key] ?? section.key}</span>
                        {dirty && <span className="text-[10px] text-amber-500 font-medium">● unsaved</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{section.titleEN ?? section.labelEN ?? "—"}</p>
                </div>

                <span className="text-[11px] text-muted-foreground font-mono w-5 text-center shrink-0">{section.order}</span>

                {/* Published */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {section.published ? <Eye className="w-3.5 h-3.5 text-green-500" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                    <Switch checked={section.published} onCheckedChange={handleTogglePublished} />
                </div>

                {/* Expand toggle */}
                <Button
                    variant="ghost" size="sm"
                    className="rounded-xl gap-1 shrink-0"
                    onClick={() => setExpanded(v => !v)}
                >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {expanded ? "Close" : "Edit"}
                </Button>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="border-t border-border px-4 pb-4 pt-4">
                    <Tabs defaultValue="content">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList className="rounded-xl bg-muted/50 h-9">
                                <TabsTrigger value="content" className="rounded-lg text-xs">📝 Content</TabsTrigger>
                                <TabsTrigger value="images" className="rounded-lg text-xs">🖼 Images</TabsTrigger>
                                <TabsTrigger value="ctas" className="rounded-lg text-xs">🔗 CTAs</TabsTrigger>
                                <TabsTrigger value="extras" className="rounded-lg text-xs">⚙️ Extras</TabsTrigger>
                            </TabsList>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs h-8" disabled={translating} onClick={() => handleTranslate("toEL")}>
                                    {translating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />} EN→GR
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs h-8" disabled={translating} onClick={() => handleTranslate("toEN")}>
                                    {translating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />} GR→EN
                                </Button>
                                <Button size="sm" className="rounded-xl gap-1.5 text-xs h-8" disabled={saving || !dirty} onClick={handleSave}>
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                                </Button>
                            </div>
                        </div>

                        {/* Content Tab */}
                        <TabsContent value="content" className="space-y-4 focus-visible:outline-none">
                            <BilingualField label="Micro Label" elField="labelEL" enField="labelEN" />
                            <BilingualField label="Title / Headline" elField="titleEL" enField="titleEN" multiline />
                            <BilingualField label="Subtitle" elField="subtitleEL" enField="subtitleEN" multiline />
                            <BilingualField label="Body Text" elField="bodyEL" enField="bodyEN" multiline />
                        </TabsContent>

                        {/* Images Tab */}
                        <TabsContent value="images" className="space-y-5 focus-visible:outline-none">
                            {/* Hero image */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hero / Background Image</Label>
                                <div className="flex gap-3 items-start">
                                    {section.image && (
                                        <div className="relative w-32 h-20 rounded-xl overflow-hidden shrink-0">
                                            <img src={section.image} alt="" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => set("image", null)}
                                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center"
                                            >✕</button>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2">
                                        <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => setHeroGalleryOpen(true)}>
                                            <ImageIcon className="w-3.5 h-3.5" /> {section.image ? "Change" : "Select Image"}
                                        </Button>
                                        {section.image && (
                                            <Input
                                                value={section.image}
                                                onChange={e => set("image", e.target.value)}
                                                className="rounded-xl text-xs font-mono h-8"
                                                placeholder="or paste URL"
                                            />
                                        )}
                                    </div>
                                </div>
                                <MediaPickerDialog
                                    open={heroGalleryOpen}
                                    onOpenChange={setHeroGalleryOpen}
                                    multiple={false}
                                    filter="IMAGE"
                                    title="Select hero/background image"
                                    onSelect={items => { if (items[0]) { set("image", items[0].url); setDirty(true); } }}
                                />
                            </div>

                            {/* Image collection (if applicable) */}
                            {collectionKey && collectionImages !== null && (
                                <>
                                    <div className="h-px bg-border" />
                                    <ImageCollectionManager
                                        label={section.key === "bar" ? "Bar Gallery Images" : "Gallery Images"}
                                        images={collectionImages}
                                        onUpdate={imgs => { setExtras({ [collectionKey]: imgs }); }}
                                    />
                                </>
                            )}

                            {/* Bar-specific section images */}
                            {section.key === "bar" && (
                                <>
                                    <div className="h-px bg-border" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Breakfast Section Image</Label>
                                            <BarSubImagePicker
                                                value={(section.extras.breakfastImage as string) ?? ""}
                                                onChange={v => setExtras({ breakfastImage: v })}
                                                label="Breakfast Image"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cocktails Section Image</Label>
                                            <BarSubImagePicker
                                                value={(section.extras.cocktailsImage as string) ?? ""}
                                                onChange={v => setExtras({ cocktailsImage: v })}
                                                label="Cocktails Image"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        {/* CTAs Tab */}
                        <TabsContent value="ctas" className="space-y-5 focus-visible:outline-none">
                            <div className="space-y-3">
                                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Primary CTA Button</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">🇬🇷 Label</Label>
                                        <Input value={section.ctaLabelEL ?? ""} onChange={e => set("ctaLabelEL", e.target.value)} className="rounded-xl text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">🇬🇧 Label</Label>
                                        <Input value={section.ctaLabelEN ?? ""} onChange={e => set("ctaLabelEN", e.target.value)} className="rounded-xl text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">URL</Label>
                                    <Input value={section.ctaUrl ?? ""} onChange={e => set("ctaUrl", e.target.value)} className="rounded-xl text-xs font-mono" placeholder="https://... or /rooms" />
                                </div>
                            </div>

                            <div className="h-px bg-border" />

                            <div className="space-y-3">
                                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Secondary CTA Button</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">🇬🇷 Label</Label>
                                        <Input value={section.cta2LabelEL ?? ""} onChange={e => set("cta2LabelEL", e.target.value)} className="rounded-xl text-sm" placeholder="Optional" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">🇬🇧 Label</Label>
                                        <Input value={section.cta2LabelEN ?? ""} onChange={e => set("cta2LabelEN", e.target.value)} className="rounded-xl text-sm" placeholder="Optional" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">URL</Label>
                                    <Input value={section.cta2Url ?? ""} onChange={e => set("cta2Url", e.target.value)} className="rounded-xl text-xs font-mono" placeholder="Optional" />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Extras Tab */}
                        <TabsContent value="extras" className="space-y-3 focus-visible:outline-none">
                            {/* Section-specific structured extras */}
                            {section.key === "location" && (
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground font-black uppercase tracking-widest">Street Address</Label>
                                        <Input value={(section.extras.address as string) ?? ""} onChange={e => setExtras({ address: e.target.value })} className="rounded-xl text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground font-black uppercase tracking-widest">City / Postcode</Label>
                                        <Input value={(section.extras.city as string) ?? ""} onChange={e => setExtras({ city: e.target.value })} className="rounded-xl text-sm" />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-xs text-muted-foreground font-black uppercase tracking-widest">Google Maps Embed URL</Label>
                                        <Input value={(section.extras.mapEmbedUrl as string) ?? ""} onChange={e => setExtras({ mapEmbedUrl: e.target.value })} className="rounded-xl text-xs font-mono" placeholder="https://www.google.com/maps/embed?pb=..." />
                                    </div>
                                </div>
                            )}

                            {section.key === "contactCta" && (
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground font-black uppercase tracking-widest">Email</Label>
                                        <Input value={(section.extras.email as string) ?? ""} onChange={e => setExtras({ email: e.target.value })} className="rounded-xl text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground font-black uppercase tracking-widest">Phone</Label>
                                        <Input value={(section.extras.phone as string) ?? ""} onChange={e => setExtras({ phone: e.target.value })} className="rounded-xl text-sm" />
                                    </div>
                                </div>
                            )}

                            <div className="h-px bg-border" />
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Extras JSON (advanced)</Label>
                                {extrasTextError && <span className="text-[10px] text-red-500">⚠ Invalid JSON — fix before saving</span>}
                            </div>
                            <Textarea
                                rows={10}
                                className={`rounded-xl font-mono text-xs resize-none ${extrasTextError ? 'border-red-500' : ''}`}
                                value={extrasText}
                                onChange={e => {
                                    setExtrasText(e.target.value);
                                    setDirty(true);
                                    // Validate (don't apply yet — applied on Save)
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        setExtrasTextError(typeof parsed !== "object" || Array.isArray(parsed));
                                    } catch {
                                        setExtrasTextError(true);
                                    }
                                }}
                            />
                            <p className="text-xs text-muted-foreground">Edits are applied when you click Save. Red border = invalid JSON.</p>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}

// Small reusable image picker button for bar sub-images
function BarSubImagePicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
    const [open, setOpen] = React.useState(false);
    return (
        <div className="space-y-2">
            {value && <img src={value} alt={label} className="w-full h-24 object-cover rounded-xl" />}
            <Button variant="outline" size="sm" className="w-full rounded-xl gap-1.5 text-xs" onClick={() => setOpen(true)}>
                <ImageIcon className="w-3 h-3" /> {value ? "Change" : "Select"}
            </Button>
            <MediaPickerDialog open={open} onOpenChange={setOpen} multiple={false} filter="IMAGE" title={`Select ${label}`} onSelect={items => { if (items[0]) onChange(items[0].url); }} />
        </div>
    );
}

// ── Sortable wrapper ──────────────────────────────────────────────────────────

function SortableSection({ section, onOrderChange }: { section: SectionRow; onOrderChange: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
    return (
        <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
            <AccordionSection section={section} dragHandleProps={{ ...attributes, ...listeners }} />
        </div>
    );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function DataTableHomeSections({ data: initialData }: { data: SectionRow[] }) {
    const [data, setData] = React.useState(initialData);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIdx = data.findIndex(s => s.id === active.id);
        const newIdx = data.findIndex(s => s.id === over.id);
        const reordered = arrayMove(data, oldIdx, newIdx).map((s, i) => ({ ...s, order: i + 1 }));
        setData(reordered);
        try {
            await updateHomeSectionOrder(reordered.map(s => s.key));
            toast.success("Order saved");
        } catch { toast.error("Failed to save order"); }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={data.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {data.map(section => (
                        <SortableSection key={section.id} section={section} onOrderChange={() => { }} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
