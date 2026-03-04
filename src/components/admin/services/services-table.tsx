"use client"

import * as React from "react"
import {
    Plus,
    MoreHorizontal,
    Image as ImageIcon,
    Film,
    Trash2,
    Edit,
    Layers,
    ChevronDown,
    Upload,
    Check,
    Loader2,
    Sparkles,
    GripVertical,
    Briefcase,
    Zap,
    ExternalLink,
    Search,
    RefreshCcw,
    Shield,
    Globe,
    Rocket,
    CheckCircle2,
    Target
} from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
    updateServicesOrder,
    deleteService,
    createServiceFeature,
    deleteServiceFeature,
    createServiceMedia,
    deleteServiceMedia,
    getServices
} from "@/app/lib/actions/service"
import { ServiceForm } from "./service-form"
import { CategoryDialog } from "./category-dialog"
import { GenericDataTable } from "../shared/generic-data-table"

export type ServiceCategoryType = {
    id: string
    nameEL: string
    nameEN: string | null
    descriptionEL: string | null
    descriptionEN: string | null
    icon: string | null
    order: number
    _count?: {
        services: number
    }
}

export type ServiceFeatureType = {
    id: string
    serviceId: string
    nameEL: string
    nameEN: string | null
    descriptionEL: string | null
    descriptionEN: string | null
    order: number
}

export type ServiceMediaType = {
    id: string
    serviceId: string
    url: string
    mediaType: string
    order: number
}

export type ServiceType = {
    id: string
    nameEL: string
    nameEN: string | null
    shortDescriptionEL: string | null
    shortDescriptionEN: string | null
    descriptionEL: string | null
    descriptionEN: string | null
    slug: string
    featureImage: string | null
    brandName: string | null
    brandLogo: string | null
    order: number
    categoryId: string
    featuresEL: any
    featuresEN: any
    category: ServiceCategoryType
    features: ServiceFeatureType[]
    media: ServiceMediaType[]
}

export function ServicesTable({ initialData, categories: initialCategories }: { initialData: ServiceType[], categories: ServiceCategoryType[] }) {
    const [services, setServices] = React.useState(initialData)
    const [categories, setCategories] = React.useState(initialCategories)
    const [isServiceFormOpen, setIsServiceFormOpen] = React.useState(false)
    const [selectedService, setSelectedService] = React.useState<ServiceType | undefined>()
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false)

    const refreshData = async () => {
        const s = await getServices()
        setServices(s as any)
    }

    const openAddService = () => {
        setSelectedService(undefined)
        setIsServiceFormOpen(true)
    }

    const openEditService = (s: ServiceType) => {
        setSelectedService(s)
        setIsServiceFormOpen(true)
    }

    const handleDeleteService = async (id: string) => {
        if (!confirm("Decommission this service module?")) return
        try {
            await deleteService(id)
            setServices(services.filter(s => s.id !== id))
            toast.success("Capability archived")
        } catch (err: any) { toast.error(err.message) }
    }

    const handleReorder = async (newData: ServiceType[]) => {
        setServices(newData)
        try {
            await updateServicesOrder(newData.map((s, i) => ({ id: s.id, order: i })))
            toast.success("Ecosystem hierarchy synchronized")
        } catch {
            toast.error("Hierarchy sync failed")
            refreshData()
        }
    }

    const columns: ColumnDef<ServiceType>[] = [
        { id: "drag", header: "", cell: () => <GripVertical className="h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />, size: 40 },
        {
            id: "hero",
            header: "Product Visual",
            cell: ({ row }) => (
                <div className="w-16 h-10 rounded-lg overflow-hidden border bg-zinc-50 shadow-sm flex items-center justify-center p-1">
                    {row.original.featureImage ? (
                        row.original.featureImage.endsWith('.mp4') ? <Film className="w-4 h-4 text-indigo-500" /> : <img src={row.original.featureImage} className="w-full h-full object-cover rounded" />
                    ) : <ImageIcon className="w-4 h-4 text-zinc-200" />}
                </div>
            ),
            size: 80
        },
        {
            accessorKey: "nameEL",
            header: "Operational Service",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{row.original.nameEL}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-zinc-800 text-white border-none rounded-xl text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                            {row.original.category.nameEL}
                        </Badge>
                        {row.original.brandName && (
                            <span className="text-[9px] font-black text-zinc-400 uppercase italic">/ {row.original.brandName}</span>
                        )}
                    </div>
                </div>
            )
        },
        {
            id: "payload",
            header: "Capability Payload",
            cell: ({ row }) => (
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{row.original.features?.length || 0}</span>
                        <span className="text-[8px] font-black uppercase text-zinc-400">Features</span>
                    </div>
                    <div className="w-px h-6 bg-zinc-100 dark:bg-zinc-800" />
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{row.original.media?.length || 0}</span>
                        <span className="text-[8px] font-black uppercase text-zinc-400">Assets</span>
                    </div>
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="h-9 bg-zinc-800 text-white border-none font-bold hover:bg-zinc-700 rounded-xl px-4">
                            Actions <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] rounded-2xl shadow-2xl p-2 border-zinc-100">
                        <DropdownMenuItem className="h-12 rounded-xl flex items-center gap-3 cursor-pointer" onClick={() => openEditService(row.original)}>
                            <Edit className="w-4 h-4 mr-2" /> Modify Scope
                        </DropdownMenuItem>
                        <DropdownMenuItem className="h-12 rounded-xl flex items-center gap-3 cursor-pointer" onClick={() => window.open(`/services/${row.original.slug}`, '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" /> View Public
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteService(row.original.id)} className="h-12 rounded-xl text-red-500 focus:bg-red-50 focus:text-red-600 flex items-center gap-3 cursor-pointer">
                            <Trash2 className="w-4 h-4 mr-2" /> Decommission
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-6 rounded-[32px] border shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tighter">{services.length}</span>
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Active Services</span>
                    </div>
                    <div className="w-px h-10 bg-zinc-100" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tighter">{categories.length}</span>
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Global Domains</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)} className="rounded-2xl border-zinc-200 font-bold h-12 px-8 text-xs hover:bg-zinc-50 transition-all shadow-sm">Manage Product Domains</Button>
                </div>
            </div>

            <GenericDataTable
                columns={columns} data={services} searchPlaceholder="Locate service capability..." searchColumn="nameEL"
                onAddClick={openAddService} addButtonLabel="Design Service"
                isSortable={true} onReorder={handleReorder}
                renderExpandedRow={(service) => <ServiceExpandedContent service={service} onRefresh={refreshData} />}
            />

            <Dialog open={isServiceFormOpen} onOpenChange={setIsServiceFormOpen}>
                <DialogContent className="max-w-6xl p-0 overflow-hidden rounded-xl">
                    <DialogHeader className="bg-zinc-800 p-10">
                        <DialogTitle className="text-3xl font-black text-white tracking-tighter">{selectedService ? 'Refine Service Architecture' : 'Engineer New Capability'}</DialogTitle>
                        <DialogDescription className="text-zinc-400 font-medium">Define high-impact service modules and strategic feature mapping.</DialogDescription>
                    </DialogHeader>
                    <div className="p-10 bg-[#f8fafc] dark:bg-zinc-950 max-h-[75vh] overflow-y-auto scrollbar-hide">
                        <ServiceForm
                            service={selectedService}
                            categories={categories}
                            onSuccess={() => { setIsServiceFormOpen(false); refreshData(); }}
                            onCancel={() => setIsServiceFormOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <CategoryDialog
                open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}
                categories={categories} onCategoriesChange={setCategories}
            />
        </div>
    )
}

function ServiceExpandedContent({ service, onRefresh }: { service: ServiceType, onRefresh: () => void }) {
    const [isAddingFeature, setIsAddingFeature] = React.useState(false)
    const [featureForm, setFeatureForm] = React.useState({ nameEL: "", nameEN: "", descriptionEL: "", descriptionEN: "" })
    const [isSavingFeature, setIsSavingFeature] = React.useState(false)
    const [isUploadingMedia, setIsUploadingMedia] = React.useState(false)
    const [isTranslatingFeature, setIsTranslatingFeature] = React.useState<string | null>(null)

    const handleAddFeature = async () => {
        if (!featureForm.nameEL) return
        setIsSavingFeature(true)
        try {
            await createServiceFeature({ ...featureForm, serviceId: service.id, order: service.features.length })
            setFeatureForm({ nameEL: "", nameEN: "", descriptionEL: "", descriptionEN: "" })
            setIsAddingFeature(false); onRefresh()
            toast.success("Capability feature initialized")
        } catch (err: any) { toast.error(err.message) }
        finally { setIsSavingFeature(false) }
    }

    const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return
        setIsUploadingMedia(true)
        const tid = toast.loading("Uploading visual component...")
        const formData = new FormData(); formData.append("file", file); formData.append("type", "media")
        try {
            const res = await fetch("/api/admin/services/upload", { method: "POST", body: formData })
            const data = await res.json()
            if (data.url) {
                await createServiceMedia({ serviceId: service.id, url: data.url, mediaType: file.type.startsWith("video/") ? "VIDEO" : "IMAGE", order: service.media.length })
                onRefresh(); toast.success("Asset integrated", { id: tid })
            }
        } catch (err: any) { toast.error(err.message, { id: tid }) }
        finally { setIsUploadingMedia(false) }
    }

    return (
        <div className="py-10 px-10 bg-[#f8fafc] dark:bg-zinc-950/50 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-inner">
            <Tabs defaultValue="details">
                <TabsList className="mb-8 bg-white dark:bg-zinc-900 p-1.5 h-12 rounded-[24px] border shadow-sm w-fit gap-2">
                    <TabsTrigger value="details" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl h-9 transition-all">Outcome Definition</TabsTrigger>
                    <TabsTrigger value="features" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl h-9 transition-all">Capability Blocks ({service.features.length})</TabsTrigger>
                    <TabsTrigger value="media" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl h-9 transition-all">Visual Evidence ({service.media.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-3"><Briefcase className="w-4 h-4" /> Primary Proposition</h5>
                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border shadow-sm min-h-[160px] flex flex-col justify-between">
                                <p className="text-sm leading-[1.8] font-medium text-zinc-600 dark:text-zinc-400 italic">"{service.descriptionEL || "Service narrative pending."}"</p>
                                {service.brandName && (
                                    <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {service.brandLogo && <div className="w-12 h-12 p-2 bg-zinc-50 rounded-xl border flex items-center justify-center"><img src={service.brandLogo} className="w-full h-full object-contain" /></div>}
                                            <span className="font-black text-lg text-zinc-800 tracking-tighter">{service.brandName}</span>
                                        </div>
                                        <Badge className="bg-zinc-100 text-zinc-500 border-none text-[8px] font-black uppercase tracking-[0.2em] px-3">Certified Partner</Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-3"><Globe className="w-4 h-4" /> Global Localization</h5>
                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border shadow-sm min-h-[160px] space-y-4">
                                <p className="text-xl font-black text-zinc-800 dark:text-zinc-100 italic tracking-tighter">{service.nameEN || "Sync Required"}</p>
                                <p className="text-sm font-medium leading-[1.8] text-zinc-400">{service.descriptionEN || "Global narrative draft pending synchronization."}</p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="features" className="animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {service.features.map(f => (
                            <div key={f.id} className="p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] relative group hover:shadow-xl hover:border-emerald-100 transition-all shadow-sm">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                                    <h6 className="text-lg font-black text-zinc-800 dark:text-zinc-200 tracking-tighter">{f.nameEL}</h6>
                                </div>
                                <p className="text-sm font-medium text-zinc-400 leading-relaxed">{f.descriptionEL}</p>
                                <Button variant="ghost" size="icon" onClick={() => deleteServiceFeature(f.id).then(() => onRefresh())} className="absolute top-4 right-4 h-10 w-10 text-zinc-200 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" onClick={() => setIsAddingFeature(true)} className="border-dashed border-2 h-auto min-h-[160px] rounded-[32px] bg-zinc-50 hover:bg-zinc-100 text-zinc-400 flex flex-col gap-3 transition-all">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Plus className="w-6 h-6" /></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Extend Capabilities</span>
                        </Button>
                    </div>

                    <Dialog open={isAddingFeature} onOpenChange={setIsAddingFeature}>
                        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl">
                            <DialogHeader className="bg-zinc-800 p-10">
                                <DialogTitle className="text-2xl font-black text-white tracking-tighter">Forge New Feature Block</DialogTitle>
                                <DialogDescription className="text-zinc-400 font-medium">Extend the service toolkit with modular characteristic blocks.</DialogDescription>
                            </DialogHeader>
                            <div className="p-10 bg-[#f8fafc] dark:bg-zinc-950 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Block Identity (GR)</Label>
                                        <Input className="h-14 rounded-2xl font-bold border-zinc-200" placeholder="e.g. Real-time Sync" value={featureForm.nameEL} onChange={e => setFeatureForm({ ...featureForm, nameEL: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Block Identity (EN)</Label>
                                        <Input className="h-14 rounded-2xl border-zinc-200" placeholder="English mapping..." value={featureForm.nameEN} onChange={e => setFeatureForm({ ...featureForm, nameEN: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Outcome Narrative (GR)</Label>
                                        <Textarea rows={4} className="rounded-[24px] border-zinc-200 p-6" placeholder="Describe the utility..." value={featureForm.descriptionEL} onChange={e => setFeatureForm({ ...featureForm, descriptionEL: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Outcome Narrative (EN)</Label>
                                        <Textarea rows={4} className="rounded-[24px] border-zinc-200 p-6" placeholder="Localized narrative..." value={featureForm.descriptionEN} onChange={e => setFeatureForm({ ...featureForm, descriptionEN: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 border-t bg-white flex justify-end gap-3 rounded-b-[40px]">
                                <Button variant="ghost" onClick={() => setIsAddingFeature(false)} className="font-black text-[10px] uppercase tracking-widest text-zinc-400">Abort</Button>
                                <Button onClick={handleAddFeature} disabled={isSavingFeature} className="bg-zinc-800 text-white font-black text-[10px] uppercase tracking-widest px-10 h-14 rounded-2xl shadow-xl hover:bg-zinc-900 transition-all active:scale-95">
                                    {isSavingFeature ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Deploy Feature"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                <TabsContent value="media" className="animate-in fade-in duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-200 tracking-tighter">Product Evidence Vault</h3>
                        <Label className={`cursor-pointer bg-amber-600 shadow-xl shadow-amber-500/20 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all flex items-center gap-3 ${isUploadingMedia ? 'opacity-50' : ''}`}>
                            {isUploadingMedia ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                            Attach Visual Component
                            <input type="file" className="hidden" onChange={handleUploadMedia} accept="image/*,video/*" />
                        </Label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {service.media.map(m => (
                            <div key={m.id} className="relative aspect-[4/3] rounded-[32px] overflow-hidden border border-zinc-100 dark:border-zinc-800 group shadow-sm hover:shadow-2xl transition-all hover:-translate-y-1">
                                {m.mediaType === 'VIDEO' ? <video src={m.url} className="w-full h-full object-cover" /> : <img src={m.url} className="w-full h-full object-cover" />}
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                                    <Button variant="destructive" size="icon" className="h-10 w-10 rounded-xl shadow-lg" onClick={() => deleteServiceMedia(m.id).then(() => onRefresh())}>
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
