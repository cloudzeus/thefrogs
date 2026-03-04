"use client"

import * as React from "react"
import { useForm, Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Loader2,
    Upload,
    X,
    Check,
    ImageIcon,
    Video,
    Eraser,
    Search,
    Link as LinkIcon,
    Languages,
    Sparkles,
    Plus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, FileText, Settings, Layout } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createService, updateService } from "@/app/lib/actions/service"
import { ServiceType, ServiceCategoryType } from "./services-table"

const serviceSchema = z.object({
    nameEL: z.string().min(1, "Greek name is required"),
    nameEN: z.string().min(0).default(""),
    shortDescriptionEL: z.string().min(0).default(""),
    shortDescriptionEN: z.string().min(0).default(""),
    descriptionEL: z.string().min(0).default(""),
    descriptionEN: z.string().min(0).default(""),
    slug: z.string().min(1, "Slug is required"),
    categoryId: z.string().min(1, "Category is required"),
    brandName: z.string().min(0).default(""),
    order: z.number().default(0),
    featuresEL: z.array(z.string()).default([]),
    featuresEN: z.array(z.string()).default([]),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

interface ServiceFormProps {
    service?: ServiceType
    categories: ServiceCategoryType[]
    onSuccess: () => void
    onCancel: () => void
}

export function ServiceForm({ service, categories, onSuccess, onCancel }: ServiceFormProps) {
    const [isSaving, setIsSaving] = React.useState(false)
    const [featureImage, setFeatureImage] = React.useState<string | null>(service?.featureImage || null)
    const [brandLogo, setBrandLogo] = React.useState<string | null>(service?.brandLogo || null)
    const [isUploadingFeature, setIsUploadingFeature] = React.useState(false)
    const [isUploadingLogo, setIsUploadingLogo] = React.useState(false)
    const [removeLogoBg, setRemoveLogoBg] = React.useState(true)
    const [isTranslating, setIsTranslating] = React.useState<string | null>(null)

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema) as any,
        defaultValues: {
            nameEL: service?.nameEL || "",
            nameEN: service?.nameEN || "",
            shortDescriptionEL: service?.shortDescriptionEL || "",
            shortDescriptionEN: service?.shortDescriptionEN || "",
            descriptionEL: service?.descriptionEL || "",
            descriptionEN: service?.descriptionEN || "",
            slug: service?.slug || "",
            categoryId: service?.categoryId || "",
            brandName: service?.brandName || "",
            order: service?.order || 0,
            featuresEL: service?.featuresEL || [],
            featuresEN: service?.featuresEN || [],
        }
    })

    // Auto-generate slug from Greek name
    const watchNameEL = form.watch("nameEL")
    React.useEffect(() => {
        if (!service && watchNameEL) {
            const generatedSlug = watchNameEL
                .toLowerCase()
                .replace(/[α-ω]/g, (char) => {
                    const map: any = { 'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'i', 'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o' }
                    return map[char] || char
                })
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            form.setValue("slug", generatedSlug)
        }
    }, [watchNameEL, form, service])

    // Auto-generate slug from nameEL
    React.useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "nameEL" && !service) {
                const slug = value.nameEL
                    ?.toLowerCase()
                    .replace(/[^a-z0-9\u0370-\u03ff]+/g, "-")
                    .replace(/^-+|-+$/g, "")
                form.setValue("slug", slug || "")
            }
        })
        return () => subscription.unsubscribe()
    }, [form, service])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'feature' | 'logo') => {
        const file = e.target.files?.[0]
        if (!file) return

        const isLogo = type === 'logo'
        if (isLogo) setIsUploadingLogo(true)
        else setIsUploadingFeature(true)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", type)
        if (isLogo && removeLogoBg) formData.append("removeBackground", "true")

        try {
            const res = await fetch("/api/admin/services/upload", {
                method: "POST",
                body: formData
            })
            const data = await res.json()
            if (data.url) {
                if (isLogo) setBrandLogo(data.url)
                else setFeatureImage(data.url)
                toast.success(`${type === 'logo' ? 'Logo' : 'Image'} uploaded successfully`)
            } else {
                throw new Error(data.error || "Upload failed")
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            if (isLogo) setIsUploadingLogo(false)
            else setIsUploadingFeature(false)
        }
    }

    const handleTranslate = async (sourceField: keyof ServiceFormValues, targetField: keyof ServiceFormValues) => {
        const sourceValue = form.getValues(sourceField)
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
                form.setValue(targetField, data.translated as any)
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

    const onSubmit = async (values: ServiceFormValues) => {
        setIsSaving(true)
        console.log("Submitting values:", values)
        try {
            const payload = {
                ...values,
                featureImage,
                brandLogo
            }

            if (service) {
                await updateService(service.id, payload)
                toast.success("Service updated successfully")
            } else {
                await createService(payload)
                toast.success("Service created successfully")
            }
            onSuccess()
        } catch (err: any) {
            console.error("Save error:", err)
            toast.error(err.message || "Failed to save service")
        } finally {
            setIsSaving(false)
        }
    }

    // Handle form errors
    React.useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            console.log("Form errors:", form.formState.errors)
            const errorFields = Object.keys(form.formState.errors).join(", ")
            toast.error(`Please check the following fields: ${errorFields}`, {
                description: "Ensure all required fields are filled correctly."
            })
        }
    }, [form.formState.errors])

    const insertTag = (fieldName: keyof ServiceFormValues, tag: string) => {
        const currentValue = form.getValues(fieldName) as string
        const textarea = document.getElementById(fieldName) as HTMLTextAreaElement
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value

        const before = text.substring(0, start)
        const after = text.substring(end)
        const selectedText = text.substring(start, end) || "text"

        let newValue = ""
        if (tag === "bold") newValue = `${before}<b>${selectedText}</b>${after}`
        else if (tag === "italic") newValue = `${before}<i>${selectedText}</i>${after}`
        else if (tag === "list") newValue = `${before}<ul>\n  <li>${selectedText}</li>\n</ul>${after}`
        else if (tag === "br") newValue = `${before}<br/>${after}`

        form.setValue(fieldName, newValue as any)
        textarea.focus()
    }

    const RichToolbar = ({ fieldName }: { fieldName: keyof ServiceFormValues }) => (
        <div className="flex items-center gap-1 mb-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-fit">
            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertTag(fieldName, "bold")}><b>B</b></Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertTag(fieldName, "italic")}><i>I</i></Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold" onClick={() => insertTag(fieldName, "list")}>LIST</Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold" onClick={() => insertTag(fieldName, "br")}>LF</Button>
        </div>
    )

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-0">
                <Tabs defaultValue="general" className="w-full">
                    <div className="px-8 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-10">
                        <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 h-12 rounded-xl">
                            <TabsTrigger value="general" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white font-bold text-xs uppercase tracking-wider gap-2">
                                <Info className="w-4 h-4" /> General Info
                            </TabsTrigger>
                            <TabsTrigger value="content" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white font-bold text-xs uppercase tracking-wider gap-2">
                                <FileText className="w-4 h-4" /> Description & Content
                            </TabsTrigger>
                            <TabsTrigger value="media" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white font-bold text-xs uppercase tracking-wider gap-2">
                                <ImageIcon className="w-4 h-4" /> Media & Visuals
                            </TabsTrigger>
                            <TabsTrigger value="branding" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white font-bold text-xs uppercase tracking-wider gap-2">
                                <Layout className="w-4 h-4" /> Branding
                            </TabsTrigger>
                            <TabsTrigger value="features" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white font-bold text-xs uppercase tracking-wider gap-2">
                                <Sparkles className="w-4 h-4" /> Key Features
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-zinc-50/50 dark:bg-zinc-900/10">
                        <TabsContent value="general" className="mt-0 space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-2 bg-zinc-900 text-white rounded-lg"><Info className="w-4 h-4" /></div>
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Service Identity</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control as any}
                                                name="nameEL"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Name (Greek) *</FormLabel>
                                                        <FormControl><Input id="nameEL" {...field} placeholder="π.χ. ERP Cloud" className="h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-inner focus:ring-1 focus:ring-blue-500" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control as any}
                                                name="nameEN"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="flex items-center justify-between">
                                                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Name (English)</FormLabel>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 px-2 text-[9px] font-black bg-zinc-700 text-white hover:bg-zinc-800 hover:text-white uppercase"
                                                                onClick={() => handleTranslate("nameEL", "nameEN")}
                                                                disabled={!!isTranslating}
                                                            >
                                                                {isTranslating === "nameEN" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                                                Translate
                                                            </Button>
                                                        </div>
                                                        <FormControl><Input id="nameEN" {...field} placeholder="English name..." className="h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-inner focus:ring-1 focus:ring-blue-500" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-2 bg-zinc-900 text-white rounded-lg"><Settings className="w-4 h-4" /></div>
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Classification & URL</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control as any}
                                                name="slug"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">URL Slug *</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input id="slug" {...field} className="h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 pl-10 font-mono text-[11px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-inner" />
                                                                <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-300" />
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription className="text-[10px]">Auto-generated from Greek name during creation.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control as any}
                                                name="categoryId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Industry Category *</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-inner">
                                                                    <SelectValue placeholder="Select Category..." />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                                                {categories.map(cat => (
                                                                    <SelectItem key={cat.id} value={cat.id} className="text-sm text-zinc-900 dark:text-zinc-100">{cat.nameEL}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="content" className="mt-0 space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                {/* GREEK CONTENT */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-zinc-900 text-white rounded-2xl shadow-xl space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Primary Content (Greek)</h4>
                                        </div>
                                        <FormField
                                            control={form.control as any}
                                            name="shortDescriptionEL"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Catchphrase / Hook</FormLabel>
                                                    <FormControl><Textarea id="shortDescriptionEL" {...field} placeholder="π.χ. Η κορυφαία λύση ERP..." className="h-24 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 resize-none rounded-xl shadow-inner scrollbar-hide" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name="descriptionEL"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Full Editorial Description</FormLabel>
                                                        <RichToolbar fieldName="descriptionEL" />
                                                    </div>
                                                    <FormControl><Textarea id="descriptionEL" {...field} placeholder="Αναλυτική περιγραφή..." className="h-48 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 resize-none rounded-xl shadow-inner" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* ENGLISH CONTENT */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Internationalization (English)</h4>
                                        </div>
                                        <FormField
                                            control={form.control as any}
                                            name="shortDescriptionEN"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Catchphrase</FormLabel>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2 text-[9px] font-black bg-zinc-700 text-white hover:bg-zinc-800 hover:text-white uppercase"
                                                            onClick={() => handleTranslate("shortDescriptionEL", "shortDescriptionEN")}
                                                            disabled={!!isTranslating}
                                                        >
                                                            {isTranslating === "shortDescriptionEN" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                                            Auto-Translate
                                                        </Button>
                                                    </div>
                                                    <FormControl><Textarea id="shortDescriptionEN" {...field} placeholder="English hook..." className="h-24 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 italic resize-none rounded-xl shadow-inner placeholder:text-zinc-400" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name="descriptionEN"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Full Description</FormLabel>
                                                        <div className="flex gap-2">
                                                            <RichToolbar fieldName="descriptionEN" />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 px-2 text-[9px] font-black bg-zinc-700 text-white hover:bg-zinc-800 hover:text-white uppercase mb-2"
                                                                onClick={() => handleTranslate("descriptionEL", "descriptionEN")}
                                                                disabled={!!isTranslating}
                                                            >
                                                                {isTranslating === "descriptionEN" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                                                Translate
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <FormControl><Textarea id="descriptionEN" {...field} placeholder="English full description..." className="h-48 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 italic resize-none rounded-xl shadow-inner placeholder:text-zinc-400 focus:ring-1 focus:ring-blue-500" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="media" className="mt-0 space-y-6">
                            <div className="max-w-4xl mx-auto p-12 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-8">
                                <div className="text-center space-y-2">
                                    <h4 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Featured Asset Management</h4>
                                    <p className="text-xs text-zinc-400 max-w-md mx-auto">This asset will be used as the primary hero background. Use high-quality 1080p+ assets.</p>
                                </div>

                                <div className="relative aspect-video rounded-[2rem] border-4 border-dashed border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/30 overflow-hidden group transition-all hover:border-zinc-200 dark:hover:border-zinc-700">
                                    {featureImage ? (
                                        <div className="relative w-full h-full">
                                            {featureImage.endsWith('.mp4') ? (
                                                <video src={featureImage} className="w-full h-full object-cover" controls playsInline />
                                            ) : (
                                                <img src={featureImage} className="w-full h-full object-cover" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <Button type="button" variant="secondary" className="bg-white/90 hover:bg-white text-zinc-900 font-bold px-6 rounded-full" onClick={() => setFeatureImage(null)}>
                                                    <X className="w-4 h-4 mr-2 text-red-500" /> Remove Asset
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center w-full h-full p-12 text-center space-y-4">
                                            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                {isUploadingFeature ? <Loader2 className="w-8 h-8 animate-spin text-zinc-400" /> : <Upload className="w-8 h-8 text-zinc-300" />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-zinc-900 dark:text-white">Click to upload featured media</p>
                                                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Supports MP4, JPG, PNG, WEBP</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                onChange={(e) => handleFileUpload(e, 'feature')}
                                                accept="image/*,video/*"
                                                disabled={isUploadingFeature}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="branding" className="mt-0 space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="p-8 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><Layout className="w-4 h-4 text-zinc-900 dark:text-white" /></div>
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Partner Details</h4>
                                    </div>
                                    <FormField
                                        control={form.control as any}
                                        name="brandName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Associated Brand Name</FormLabel>
                                                <FormControl><Input {...field} className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100" placeholder="e.g. Soft1 ERP, CTI" /></FormControl>
                                                <FormDescription className="text-[10px]">Displayed as the vendor or technology partner.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="order"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Catalog Order Ranking</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={e => field.onChange(parseInt(e.target.value))}
                                                        className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-[10px]">Lower numbers appear first in the service grid.</FormDescription>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="p-8 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Sparkles className="w-4 h-4" /></div>
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Logo & Visual ID</h4>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 rounded-full border border-zinc-100 dark:border-zinc-800">
                                            <Switch checked={removeLogoBg} onCheckedChange={setRemoveLogoBg} className="scale-75" />
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-1"><Eraser className="w-3 h-3" /> Auto AI Clean</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="relative w-40 h-40 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 flex items-center justify-center overflow-hidden group">
                                            {brandLogo ? (
                                                <>
                                                    <img src={brandLogo} className="max-w-[70%] max-h-[70%] object-contain" />
                                                    <button onClick={() => setBrandLogo(null)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><X className="w-4 h-4" /></button>
                                                </>
                                            ) : (
                                                <div className="relative text-center">
                                                    {isUploadingLogo ? <Loader2 className="w-6 h-6 animate-spin text-zinc-300" /> : <Upload className="w-6 h-6 text-zinc-200 mx-auto" />}
                                                    <p className="text-[9px] font-bold text-zinc-400 mt-2 uppercase tracking-tight">Upload Logo</p>
                                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'logo')} accept="image/*" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <p className="text-xs font-bold text-zinc-900 dark:text-white leading-relaxed">Ensure logos are PNG or SVG for best quality.</p>
                                            <ul className="text-[10px] space-y-1.5 text-zinc-400 font-medium">
                                                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-zinc-300" /> Transparent background preferred</li>
                                                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-zinc-300" /> Max size: 512x512px</li>
                                                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-zinc-300" /> Horizontal aspect ratios work best</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="features" className="mt-0 space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-zinc-900 text-white rounded-lg"><Sparkles className="w-4 h-4" /></div>
                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Service Features (Greek)</h4>
                                            </div>
                                            <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase bg-zinc-800 text-white border-none hover:bg-zinc-700 hover:text-white" onClick={() => {
                                                const current = form.getValues("featuresEL")
                                                form.setValue("featuresEL", [...current, ""])
                                            }}>
                                                <Plus className="w-3 h-3 mr-1" /> Add Feature
                                            </Button>
                                        </div>
                                        <div className="space-y-3">
                                            {form.watch("featuresEL").map((_, i) => (
                                                <div key={i} className="flex items-center gap-3 group">
                                                    <span className="text-[10px] font-bold text-zinc-500 w-5 text-right">{i + 1}.</span>
                                                    <Input
                                                        className="h-10 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-1 focus:ring-blue-500"
                                                        placeholder="e.g. Αυτοματοποίηση ροών..."
                                                        value={form.watch(`featuresEL.${i}`)}
                                                        onChange={e => {
                                                            const arr = [...form.getValues("featuresEL")]
                                                            arr[i] = e.target.value
                                                            form.setValue("featuresEL", arr)
                                                        }}
                                                    />
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                                                        const arr = form.getValues("featuresEL").filter((_, idx) => idx !== i)
                                                        form.setValue("featuresEL", arr)
                                                    }}>
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {form.watch("featuresEL").length === 0 && (
                                                <p className="text-center py-8 text-xs text-zinc-400 italic border-2 border-dashed rounded-xl">No features added yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><Languages className="w-4 h-4 text-zinc-900 dark:text-white" /></div>
                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Service Features (English)</h4>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-black bg-zinc-700 text-white hover:bg-zinc-800 hover:text-white uppercase" onClick={async () => {
                                                    const featuresEL = form.getValues("featuresEL")
                                                    if (featuresEL.length === 0) return
                                                    const tid = toast.loading("Translating features...")
                                                    try {
                                                        const translated = await Promise.all(featuresEL.map(async (text) => {
                                                            if (!text) return ""
                                                            const r = await fetch("/api/admin/translate", {
                                                                method: "POST",
                                                                body: JSON.stringify({ text, targetLang: "en" })
                                                            })
                                                            const d = await r.json()
                                                            return d.translated || text
                                                        }))
                                                        form.setValue("featuresEN", translated)
                                                        toast.success("All features translated", { id: tid })
                                                    } catch {
                                                        toast.error("Bulk translation failed", { id: tid })
                                                    }
                                                }}>
                                                    <Sparkles className="w-3 h-3 mr-1" /> AI Bulk Translate
                                                </Button>
                                                <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase bg-zinc-800 text-white border-none hover:bg-zinc-700 hover:text-white" onClick={() => {
                                                    const current = form.getValues("featuresEN")
                                                    form.setValue("featuresEN", [...current, ""])
                                                }}>
                                                    <Plus className="w-3 h-3 mr-1" /> Add Feature
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {form.watch("featuresEN").map((_, i) => (
                                                <div key={i} className="flex items-center gap-3 group">
                                                    <span className="text-[10px] font-bold text-zinc-500 w-5 text-right">{i + 1}.</span>
                                                    <Input
                                                        className="h-10 text-sm italic bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-1 focus:ring-blue-500"
                                                        placeholder="e.g. Automation workflow..."
                                                        value={form.watch(`featuresEN.${i}`)}
                                                        onChange={e => {
                                                            const arr = [...form.getValues("featuresEN")]
                                                            arr[i] = e.target.value
                                                            form.setValue("featuresEN", arr)
                                                        }}
                                                    />
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                                                        const arr = form.getValues("featuresEN").filter((_, idx) => idx !== i)
                                                        form.setValue("featuresEN", arr)
                                                    }}>
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>

                    <div className="px-8 py-6 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Action</span>
                            <span className="text-sm font-bold text-zinc-900 dark:text-white">{service ? "Committing Updates" : "Initializing New Entry"}</span>
                        </div>
                        <div className="flex gap-4">
                            <Button type="button" onClick={onCancel} variant="outline" className="h-12 px-8 rounded-xl font-bold bg-zinc-600 text-white hover:bg-zinc-700 hover:text-white border-none">
                                Discard Changes
                            </Button>
                            <Button type="submit" disabled={isSaving} className="h-12 px-10 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:hover:bg-zinc-700 hover:text-white font-bold transition-all shadow-xl shadow-zinc-900/10">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Check className="w-4 h-4 mr-3" />}
                                {service ? "Publish Updates" : "Save & Create Service"}
                            </Button>
                        </div>
                    </div>
                </Tabs>
            </form>
        </Form>
    )
}
