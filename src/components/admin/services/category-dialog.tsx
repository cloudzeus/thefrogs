"use client"

import * as React from "react"
import {
    Plus,
    Trash2,
    Edit,
    Image as ImageIcon,
    Check,
    X,
    Loader2,
    GripVertical,
    Upload,
    Languages,
    Sparkles,
    Layers
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory
} from "@/app/lib/actions/service"
import { ServiceCategoryType } from "./services-table"

interface CategoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    categories: ServiceCategoryType[]
    onCategoriesChange: (categories: ServiceCategoryType[]) => void
}

export function CategoryDialog({ open, onOpenChange, categories, onCategoriesChange }: CategoryDialogProps) {
    const [editingCategory, setEditingCategory] = React.useState<ServiceCategoryType | null>(null)
    const [isFormOpen, setIsFormOpen] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)
    const [isUploading, setIsUploading] = React.useState(false)
    const [isTranslating, setIsTranslating] = React.useState<string | null>(null)

    const [formData, setFormData] = React.useState({
        nameEL: "",
        nameEN: "",
        descriptionEL: "",
        descriptionEN: "",
        icon: "",
        order: 0
    })

    const resetForm = () => {
        setFormData({ nameEL: "", nameEN: "", descriptionEL: "", descriptionEN: "", icon: "", order: categories.length })
        setEditingCategory(null)
    }

    const handleEdit = (cat: ServiceCategoryType) => {
        setEditingCategory(cat)
        setFormData({
            nameEL: cat.nameEL,
            nameEN: cat.nameEN || "",
            descriptionEL: cat.descriptionEL || "",
            descriptionEN: cat.descriptionEN || "",
            icon: cat.icon || "",
            order: cat.order
        })
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete the category and all associated services.")) return
        try {
            await deleteServiceCategory(id)
            onCategoriesChange(categories.filter(c => c.id !== id))
            toast.success("Category deleted")
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploading(true)
        const uploadData = new FormData()
        uploadData.append("file", file)
        uploadData.append("type", "icon")

        try {
            const res = await fetch("/api/admin/services/upload", { method: "POST", body: uploadData })
            const data = await res.json()
            if (data.url) {
                setFormData(prev => ({ ...prev, icon: data.url }))
                toast.success("Icon uploaded")
            }
        } catch (err: any) {
            toast.error("Upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    const handleTranslate = async (sourceField: keyof typeof formData, targetField: keyof typeof formData) => {
        const sourceValue = formData[sourceField]
        if (!sourceValue || typeof sourceValue !== 'string') {
            toast.error("Please enter some text in Greek first")
            return
        }

        setIsTranslating(String(targetField))
        try {
            const res = await fetch("/api/admin/translate", {
                method: "POST",
                body: JSON.stringify({ text: sourceValue, targetLang: "en" })
            })
            const data = await res.json()
            if (data.translated) {
                setFormData(prev => ({ ...prev, [targetField]: data.translated }))
                toast.success("Translation complete")
            } else {
                throw new Error(data.error || "Translation failed")
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setIsTranslating(null)
        }
    }

    const handleSave = async () => {
        if (!formData.nameEL) return toast.error("Greek name is required")
        setIsSaving(true)
        try {
            if (editingCategory) {
                const updated = await updateServiceCategory(editingCategory.id, formData)
                onCategoriesChange(categories.map(c => c.id === updated.id ? { ...c, ...updated } : c))
                toast.success("Category updated")
            } else {
                const created = await createServiceCategory(formData)
                onCategoriesChange([...categories, created as any])
                toast.success("Category created")
            }
            setIsFormOpen(false)
            resetForm()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-xl">
                <DialogHeader className="border-b border-border bg-muted/40 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Layers className="w-5 h-5 text-muted-foreground" /> Service Categories
                        </DialogTitle>
                        {!isFormOpen && (
                            <Button size="sm" onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                <Plus className="w-4 h-4 mr-2" /> New Category
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="p-0">
                    {isFormOpen ? (
                        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="grid grid-cols-2 gap-6 p-6 bg-muted/30 rounded-xl border border-border">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">Name (Greek) *</Label>
                                    <Input
                                        value={formData.nameEL}
                                        onChange={e => setFormData({ ...formData, nameEL: e.target.value })}
                                        placeholder="π.χ. Λύσεις ERP"
                                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium text-foreground">Name (English)</Label>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={() => handleTranslate("nameEL", "nameEN")}
                                            disabled={!!isTranslating}
                                        >
                                            {isTranslating === "nameEN" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                            Translate
                                        </Button>
                                    </div>
                                    <Input
                                        value={formData.nameEN}
                                        onChange={e => setFormData({ ...formData, nameEN: e.target.value })}
                                        placeholder="e.g. ERP Solutions"
                                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-6 bg-muted/30 rounded-xl border border-border">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">Description (Greek)</Label>
                                    <Textarea
                                        value={formData.descriptionEL}
                                        onChange={e => setFormData({ ...formData, descriptionEL: e.target.value })}
                                        placeholder="Περιγράψτε την κατηγορία..."
                                        className="bg-card border-border text-foreground placeholder:text-muted-foreground h-32"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium text-foreground">Description (English)</Label>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={() => handleTranslate("descriptionEL", "descriptionEN")}
                                            disabled={!!isTranslating}
                                        >
                                            {isTranslating === "descriptionEN" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                            Translate
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={formData.descriptionEN}
                                        onChange={e => setFormData({ ...formData, descriptionEN: e.target.value })}
                                        placeholder="Describe the category..."
                                        className="bg-card border-border text-foreground placeholder:text-muted-foreground h-32 italic"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-6 p-6 bg-muted/50 rounded-xl border border-border">
                                <div className="space-y-2 flex-1">
                                    <Label className="text-sm font-medium text-foreground">Category Icon</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden relative group">
                                            {formData.icon ? (
                                                <>
                                                    <img src={formData.icon} className="w-full h-full object-contain p-2" alt="" />
                                                    <button type="button" onClick={() => setFormData({ ...formData, icon: "" })} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-primary-foreground transition-opacity">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="relative text-muted-foreground">
                                                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleIconUpload} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-sm text-muted-foreground leading-relaxed">
                                            Upload an SVG or PNG icon. Icons should be clear and minimalist to represent the category across the site.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-border">
                                <Button variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                    Save Category
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 space-y-3 max-h-[500px] overflow-y-auto">
                            {categories.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-xl border-2 border-dashed border-border">
                                    <Layers className="w-10 h-10 text-muted-foreground/50 mb-3" />
                                    <p className="text-sm text-muted-foreground">No categories found.<br />Click &quot;New Category&quot; to get started.</p>
                                </div>
                            ) : (
                                categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-border transition-all group">
                                        <div className="flex items-center gap-4 text-muted-foreground group-hover:text-foreground cursor-grab">
                                            <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-border">
                                                {cat.icon ? <img src={cat.icon} className="w-full h-full object-contain p-2" alt="" /> : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
                                            </div>
                                            <div>
                                                <span className="text-sm font-semibold text-foreground block">{cat.nameEL}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-xs">{cat._count?.services || 0} services</Badge>
                                                    {cat.nameEN && <span className="text-xs text-muted-foreground italic"> - {cat.nameEN}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)} className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
