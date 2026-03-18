"use client";

import * as React from "react";
import { toast } from "sonner";
import { 
    GripVertical, Loader2, Save, Trash2, Plus, GripHorizontal, LayoutGrid, Type, Heading 
} from "lucide-react";
import { 
    DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent 
} from "@dnd-kit/core";
import { 
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaPickerDialog } from "@/components/admin/shared/media-picker-dialog";
import { RichEditor } from "@/components/ui/rich-editor";
import { updateCustomPage, CustomPageBlock } from "@/app/lib/actions/custom-pages";

// Helper for translation
async function translate(text: string, from: string, to: string) {
    if (!text.trim()) return "";
    const res = await fetch("/api/admin/translate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
    });
    return (await res.json()).translation || "";
}

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

function SortableBlock({ 
    block, onUpdate, onRemove 
}: { 
    block: CustomPageBlock; 
    onUpdate: (b: CustomPageBlock) => void; 
    onRemove: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
    
    const [translating, setTranslating] = React.useState(false);
    const [galleryOpen, setGalleryOpen] = React.useState(false);

    const handleTranslate = async (dir: "toEL" | "toEN") => {
        setTranslating(true);
        if (block.type === "heading" || block.type === "richtext") {
            const fieldSrc = dir === "toEL" ? "contentEN" : "contentEL";
            const fieldDst = dir === "toEL" ? "contentEL" : "contentEN";
            try {
                const translation = await translate(block[fieldSrc], dir === "toEL" ? "EN" : "EL", dir === "toEL" ? "EL" : "EN");
                onUpdate({ ...block, [fieldDst]: translation } as any);
                toast.success("Translated");
            } catch {
                toast.error("Translation failed");
            }
        }
        setTranslating(false);
    };

    const handleGalleryUpload = (items: { url: string }[]) => {
        if (block.type === "gallery") {
            const newImages = [...block.images, ...items.map(i => ({ url: i.url }))];
            onUpdate({ ...block, images: newImages });
        }
    };
    
    return (
        <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }} className="border border-border bg-card rounded-2xl overflow-hidden mb-4">
            <div className="flex items-center justify-between bg-muted/40 p-3 border-b border-border">
                <div className="flex items-center gap-3">
                    <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground p-1 hover:text-foreground">
                        <GripVertical className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {block.type === 'heading' && <><Heading className="w-3.5 h-3.5 inline mr-1" /> Heading</>}
                        {block.type === 'richtext' && <><Type className="w-3.5 h-3.5 inline mr-1" /> RichText</>}
                        {block.type === 'gallery' && <><LayoutGrid className="w-3.5 h-3.5 inline mr-1" /> Gallery</>}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {(block.type === "heading" || block.type === "richtext") && (
                        <>
                            <Button variant="ghost" size="sm" className="h-7 text-xs rounded-xl" onClick={() => handleTranslate("toEL")} disabled={translating}>🇬🇧 → 🇬🇷</Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs rounded-xl" onClick={() => handleTranslate("toEN")} disabled={translating}>🇬🇷 → 🇬🇧</Button>
                        </>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 rounded-xl" onClick={onRemove}>
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
            
            <div className="p-4">
                {block.type === "heading" && (
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-32">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Level</Label>
                                <select 
                                    className="flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                    value={block.level}
                                    onChange={e => onUpdate({ ...block, level: e.target.value as any })}
                                >
                                    <option value="h1">H1 - Main</option>
                                    <option value="h2">H2 - Section</option>
                                    <option value="h3">H3 - Sub</option>
                                    <option value="h4">H4</option>
                                    <option value="h5">H5</option>
                                    <option value="h6">H6</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">🇬🇷 Greek Header</Label>
                                <Input value={block.contentEL} onChange={e => onUpdate({ ...block, contentEL: e.target.value })} className="rounded-xl" />
                            </div>
                            <div>
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">🇬🇧 English Header</Label>
                                <Input value={block.contentEN} onChange={e => onUpdate({ ...block, contentEN: e.target.value })} className="rounded-xl" />
                            </div>
                        </div>
                    </div>
                )}
                
                {block.type === "richtext" && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">🇬🇷 Greek Content</Label>
                            <RichEditor value={block.contentEL} onChange={html => onUpdate({...block, contentEL: html})} minHeight={150} />
                        </div>
                        <div>
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">🇬🇧 English Content</Label>
                            <RichEditor value={block.contentEN} onChange={html => onUpdate({...block, contentEN: html})} minHeight={150} />
                        </div>
                    </div>
                )}
                
                {block.type === "gallery" && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thumbnails per row</Label>
                                <div className="flex items-center gap-2">
                                    {[2, 3, 4, 5, 6].map(col => (
                                        <Button 
                                            key={col} 
                                            size="sm" 
                                            variant={block.columns === col ? "default" : "outline"} 
                                            className="h-8 w-8 p-0 rounded-full"
                                            onClick={() => onUpdate({ ...block, columns: col })}
                                        >
                                            {col}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setGalleryOpen(true)}>
                                <Plus className="w-3.5 h-3.5 mr-2" /> Add Images
                            </Button>
                        </div>
                        
                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${block.columns}, minmax(0, 1fr))` }}>
                            {block.images.map((img, i) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
                                    <img src={img.url} alt="img" className="w-full h-full object-cover" />
                                    <button 
                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                            const newImages = block.images.filter((_, idx) => idx !== i);
                                            onUpdate({ ...block, images: newImages });
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <MediaPickerDialog
                            open={galleryOpen}
                            onOpenChange={setGalleryOpen}
                            multiple
                            filter="IMAGE"
                            title="Select Add Images to Gallery Block"
                            onSelect={handleGalleryUpload}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export function CustomPageEditor({ initialPage }: { initialPage: any }) {
    const [page, setPage] = React.useState(initialPage);
    const [blocks, setBlocks] = React.useState<CustomPageBlock[]>(initialPage.blocks || []);
    const [saving, setSaving] = React.useState(false);
    const [mediaOpen, setMediaOpen] = React.useState(false);
    
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const dndId = React.useId();

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIdx = blocks.findIndex(b => b.id === active.id);
        const newIdx = blocks.findIndex(b => b.id === over.id);
        setBlocks(arrayMove(blocks, oldIdx, newIdx));
    };
    
    const addBlock = (type: "heading" | "richtext" | "gallery") => {
        const id = generateId();
        let newBlock: CustomPageBlock;
        if (type === "heading") newBlock = { id, type, level: "h2", contentEL: "", contentEN: "" };
        else if (type === "richtext") newBlock = { id, type, contentEL: "", contentEN: "" };
        else newBlock = { id, type, images: [], columns: 3 };
        
        setBlocks([...blocks, newBlock]);
    };
    
    const updateBlock = (idx: number, b: CustomPageBlock) => {
        const next = [...blocks];
        next[idx] = b;
        setBlocks(next);
    };
    
    const removeBlock = (idx: number) => {
        setBlocks(blocks.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateCustomPage(page.id, {
                slug: page.slug,
                titleEL: page.titleEL,
                titleEN: page.titleEN,
                heroImage: page.heroImage,
                blocks
            });
            toast.success("Page updated!");
        } catch {
            toast.error("Failed to update page");
        }
        setSaving(false);
    };

    return (
        <div className="grid grid-cols-[1fr_280px] gap-8">
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold mb-4">Content Blocks</h3>
                    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {blocks.map((block, i) => (
                                    <SortableBlock 
                                        key={block.id} 
                                        block={block} 
                                        onUpdate={b => updateBlock(i, b)} 
                                        onRemove={() => removeBlock(i)} 
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                    
                    {blocks.length === 0 && (
                        <div className="border border-dashed border-border p-12 text-center rounded-3xl text-muted-foreground">
                            No content blocks yet. Add one from the sidebar.
                        </div>
                    )}
                </div>
            </div>
            
            <div>
                <div className="sticky top-6 space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
                        <Label className="font-bold text-sm">Add New Block</Label>
                        <div className="grid grid-cols-1 gap-2">
                            <Button variant="outline" className="justify-start rounded-xl" onClick={() => addBlock("heading")}>
                                <Heading className="w-4 h-4 mr-2" /> Heading Content
                            </Button>
                            <Button variant="outline" className="justify-start rounded-xl" onClick={() => addBlock("richtext")}>
                                <Type className="w-4 h-4 mr-2" /> Rich Text / Paragraph
                            </Button>
                            <Button variant="outline" className="justify-start rounded-xl" onClick={() => addBlock("gallery")}>
                                <LayoutGrid className="w-4 h-4 mr-2" /> Image Gallery
                            </Button>
                        </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
                        <Label className="font-bold text-sm">Page Settings</Label>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">🇬🇷 Title (EL)</Label>
                            <Input value={page.titleEL} onChange={e => setPage({...page, titleEL: e.target.value})} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">🇬🇧 Title (EN)</Label>
                            <Input value={page.titleEN || ""} onChange={e => setPage({...page, titleEN: e.target.value})} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Slug</Label>
                            <Input value={page.slug} onChange={e => setPage({...page, slug: e.target.value})} className="rounded-xl font-mono text-sm" />
                        </div>
                        <div className="space-y-2 pt-2 border-t border-border">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hero Image</Label>
                            {page.heroImage ? (
                                <div className="space-y-2">
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                                        <img src={page.heroImage} alt="Hero" className="w-full h-full object-cover" />
                                    </div>
                                    <Button size="sm" variant="outline" className="w-full text-xs rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setPage({...page, heroImage: null})}>Remove Image</Button>
                                </div>
                            ) : (
                                <div>
                                    <Button variant="outline" size="sm" className="w-full gap-2 rounded-xl text-xs" onClick={() => setMediaOpen(true)}>
                                        <Plus className="w-3 h-3"/> Select Hero Image
                                    </Button>
                                    <MediaPickerDialog
                                        open={mediaOpen}
                                        onOpenChange={setMediaOpen}
                                        multiple={false}
                                        filter="IMAGE"
                                        title="Select Hero Image"
                                        onSelect={(files: any) => {
                                            if (files && files[0]) {
                                                setPage({...page, heroImage: files[0].url});
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <Button className="w-full rounded-2xl h-12 shadow-md" size="lg" disabled={saving} onClick={handleSave}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Page
                    </Button>
                </div>
            </div>
        </div>
    );
}
