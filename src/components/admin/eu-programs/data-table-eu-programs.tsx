"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
    ChevronDown,
    Plus,
    RefreshCcw,
    FileText,
    Settings,
    Map,
    FileCode,
    Check,
    Image as ImageIcon,
    Briefcase,
    FileSearch,
    Languages,
    Edit,
    Trash2,
    Calendar,
    Euro
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import {
    createEuProgram, updateEuProgram, deleteEuProgram,
    getAllPeriferies, linkPeriferiaToProgram, unlinkPeriferiaFromProgram,
    processOcrAndCreateKads, linkKadToProgram, unlinkKadFromProgram, getAllKadsList
} from "@/app/lib/actions/eu-program"
import { GenericDataTable } from "../shared/generic-data-table"

// Provide standard CDN worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export type EuProgramType = {
    id: string; nameEL: string; nameEN: string | null; shortDescriptionEL: string | null; shortDescriptionEN: string | null; descriptionEL: string | null; descriptionEN: string | null;
    announcedDate: Date | null; submissionDate: Date | null; endDate: Date | null; active: boolean; publicationFile: string | null; image: string | null;
    minimumCompanyYears: number | null; minimumEmployees: number | null; percentageOfFinance: string | null; maxBudget: number | null;
    technologiesEL: any; technologiesEN: any; companyTypes: any;
    kads?: { kad: { id: string; code: string; nameEL: string } }[];
    periferies?: { periferia: { id: string; nameEL: string } }[];
};

export function DataTableEuPrograms({ data: initialData }: { data: EuProgramType[] }) {
    const [data, setData] = React.useState<EuProgramType[]>(initialData || [])
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [editingProgram, setEditingProgram] = React.useState<EuProgramType | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)

    // Master lists
    const [allPeriferies, setAllPeriferies] = React.useState<any[]>([])
    const [allKads, setAllKads] = React.useState<any[]>([])

    // States for relational links
    const [selectedPeriferies, setSelectedPeriferies] = React.useState<Set<string>>(new Set())
    const [selectedKads, setSelectedKads] = React.useState<Set<string>>(new Set())
    const [kadSearch, setKadSearch] = React.useState("")

    // OCR PDF states
    const [isOcrModalOpen, setIsOcrModalOpen] = React.useState(false)
    const [pdfFile, setPdfFile] = React.useState<File | null>(null)
    const [numPages, setNumPages] = React.useState<number | null>(null)
    const [pageNumber, setPageNumber] = React.useState(1)
    const [crop, setCrop] = React.useState<Crop>({ unit: '%', width: 50, height: 50, x: 25, y: 25 })
    const [isProcessingOcr, setIsProcessingOcr] = React.useState(false)
    const [isTranslating, setIsTranslating] = React.useState(false)

    const [formData, setFormData] = React.useState({
        nameEL: "", nameEN: "", shortDescriptionEL: "", shortDescriptionEN: "", descriptionEL: "", descriptionEN: "",
        announcedDate: "", submissionDate: "", endDate: "", active: true, publicationFile: "", image: "",
        minimumCompanyYears: "", minimumEmployees: "", percentageOfFinance: "", maxBudget: "",
    })

    React.useEffect(() => {
        getAllPeriferies().then(p => setAllPeriferies(p || []))
        getAllKadsList().then(k => setAllKads(k || []))
    }, [])

    const openEdit = (program?: EuProgramType) => {
        if (program) {
            setEditingProgram(program)
            setFormData({
                nameEL: program.nameEL || "", nameEN: program.nameEN || "", shortDescriptionEL: program.shortDescriptionEL || "", shortDescriptionEN: program.shortDescriptionEN || "",
                descriptionEL: program.descriptionEL || "", descriptionEN: program.descriptionEN || "",
                announcedDate: program.announcedDate ? new Date(program.announcedDate).toISOString().split('T')[0] : "",
                submissionDate: program.submissionDate ? new Date(program.submissionDate).toISOString().split('T')[0] : "",
                endDate: program.endDate ? new Date(program.endDate).toISOString().split('T')[0] : "",
                active: program.active ?? true, publicationFile: program.publicationFile || "", image: program.image || "",
                minimumCompanyYears: program.minimumCompanyYears ? String(program.minimumCompanyYears) : "",
                minimumEmployees: program.minimumEmployees ? String(program.minimumEmployees) : "",
                percentageOfFinance: program.percentageOfFinance || "", maxBudget: program.maxBudget ? String(program.maxBudget) : ""
            })
            setSelectedPeriferies(new Set(program.periferies?.map(p => p.periferia.id) || []))
            setSelectedKads(new Set(program.kads?.map(k => k.kad.id) || []))
        } else {
            setEditingProgram(null)
            setFormData({
                nameEL: "", nameEN: "", shortDescriptionEL: "", shortDescriptionEN: "", descriptionEL: "", descriptionEN: "",
                announcedDate: "", submissionDate: "", endDate: "", active: true, publicationFile: "", image: "",
                minimumCompanyYears: "", minimumEmployees: "", percentageOfFinance: "", maxBudget: ""
            })
            setSelectedPeriferies(new Set())
            setSelectedKads(new Set())
        }
        setIsDialogOpen(true)
    }

    const handleTranslate = async () => {
        setIsTranslating(true)
        toast.loading("Translating...", { id: "translate" })
        try {
            const updates: any = {}
            const fields = [['nameEL', 'nameEN'], ['shortDescriptionEL', 'shortDescriptionEN'], ['descriptionEL', 'descriptionEN']]
            for (const [src, dst] of fields) {
                if (formData[src as keyof typeof formData] && !formData[dst as keyof typeof formData]) {
                    const res = await fetch("/api/admin/translate", { method: "POST", body: JSON.stringify({ text: formData[src as keyof typeof formData], targetLang: "en" }) })
                    const d = await res.json()
                    if (d.translated) updates[dst] = d.translated
                }
            }
            setFormData(prev => ({ ...prev, ...updates }))
            toast.success("Ready!", { id: "translate" })
        } catch (err: any) {
            toast.error(err.message, { id: "translate" })
        } finally {
            setIsTranslating(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            let resProgram: any = editingProgram
                ? await updateEuProgram(editingProgram.id, formData)
                : await createEuProgram(formData)

            if (resProgram && resProgram.id) {
                // Sync Periferies
                const previouslySelectedPerifs = editingProgram?.periferies?.map((p: any) => p.periferia.id) || [];
                for (let pId of previouslySelectedPerifs) if (!selectedPeriferies.has(pId)) await unlinkPeriferiaFromProgram(resProgram.id, pId)
                for (let pId of Array.from(selectedPeriferies)) if (!previouslySelectedPerifs.includes(pId)) await linkPeriferiaToProgram(resProgram.id, pId)

                // Sync KADs
                const previouslySelectedKads = editingProgram?.kads?.map((k: any) => k.kad.id) || [];
                for (let kId of previouslySelectedKads) if (!selectedKads.has(kId)) await unlinkKadFromProgram(resProgram.id, kId)
                for (let kId of Array.from(selectedKads)) if (!previouslySelectedKads.includes(kId)) await linkKadToProgram(resProgram.id, kId)

                toast.success("Saved successfully")
                window.location.reload()
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete program?")) return
        try {
            await deleteEuProgram(id)
            setData(prev => prev.filter(d => d.id !== id))
            toast.success("Deleted")
        } catch (err: any) { toast.error(err.message) }
    }

    const startOcrScan = async () => {
        setIsProcessingOcr(true);
        toast.loading("AI OCR Scan in progress...", { id: "ocr" })
        try {
            const canvasElement = document.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
            if (!canvasElement) throw new Error("PDF canvas not found");

            const cropCanvas = document.createElement('canvas')
            cropCanvas.width = (crop.width / 100) * canvasElement.width
            cropCanvas.height = (crop.height / 100) * canvasElement.height
            const ctx = cropCanvas.getContext('2d')
            ctx?.drawImage(canvasElement, (crop.x / 100) * canvasElement.width, (crop.y / 100) * canvasElement.height, cropCanvas.width, cropCanvas.height, 0, 0, cropCanvas.width, cropCanvas.height)

            const res = await fetch("/api/admin/eu-programs/ocr", { method: "POST", body: JSON.stringify({ base64Image: cropCanvas.toDataURL("image/jpeg") }) })
            const aiData = await res.json()
            if (!res.ok) throw new Error(aiData.error)

            if (aiData.kads?.length > 0 && editingProgram) {
                await processOcrAndCreateKads(editingProgram.id, aiData.kads)
                toast.success(`Extracted ${aiData.kads.length} KADs`, { id: "ocr" })
                setIsOcrModalOpen(false)
                setTimeout(() => window.location.reload(), 1000)
            } else {
                toast.error("No KADs detected", { id: "ocr" })
            }
        } catch (err: any) { toast.error(err.message, { id: "ocr" }) }
        finally { setIsProcessingOcr(false) }
    }

    const columns: ColumnDef<EuProgramType>[] = [
        {
            accessorKey: "nameEL",
            header: "Program Name",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm lg:text-base">{row.original.nameEL}</span>
                    {row.original.nameEN && <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{row.original.nameEN}</span>}
                </div>
            )
        },
        {
            accessorKey: "maxBudget",
            header: "Max Budget",
            cell: ({ row }) => row.original.maxBudget ? (
                <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <Euro className="w-3 h-3" />
                    {row.original.maxBudget.toLocaleString()}
                </div>
            ) : "—"
        },
        {
            id: "stats",
            header: "Mapping",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-5 bg-zinc-100 dark:bg-zinc-800">{row.original.kads?.length || 0} KADs</Badge>
                    <Badge variant="outline" className="text-[10px] h-5 bg-zinc-100 dark:bg-zinc-800">{row.original.periferies?.length || 0} Regions</Badge>
                </div>
            )
        },
        {
            accessorKey: "active",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.active ? "default" : "destructive"} className="text-[10px] font-bold">
                    {row.original.active ? "ACTIVE" : "CLOSED"}
                </Badge>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="bg-zinc-700 text-white border-none font-bold h-8">
                            Actions <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(row.original)}><Edit className="w-4 h-4 mr-2" /> Edit Program</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <div className="space-y-4">
            <GenericDataTable
                columns={columns}
                data={data}
                searchPlaceholder="Search programs..."
                searchColumn="nameEL"
                onAddClick={() => openEdit()}
                addButtonLabel="Add EU Program"
                renderExpandedRow={(program) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 px-2">
                        <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <h5 className="text-[10px] font-black text-zinc-400 uppercase mb-3 flex items-center gap-2"><FileText className="w-3 h-3" /> Program Overview</h5>
                            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{program.shortDescriptionEL || "No description provided."}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {program.submissionDate && <Badge variant="secondary" className="text-[10px]"><Calendar className="w-3 h-3 mr-1" /> Ends: {new Date(program.submissionDate).toLocaleDateString()}</Badge>}
                                {program.percentageOfFinance && <Badge variant="secondary" className="text-[10px]">{program.percentageOfFinance} Finance</Badge>}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <h5 className="text-[10px] font-black text-zinc-400 uppercase mb-3 flex items-center gap-2"><Map className="w-3 h-3" /> Active Regions</h5>
                            <div className="flex flex-wrap gap-1">
                                {program.periferies?.map(p => <Badge key={p.periferia.id} variant="outline" className="text-[9px]">{p.periferia.nameEL}</Badge>) || <span className="text-[10px] italic text-zinc-500">None linked</span>}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <h5 className="text-[10px] font-black text-zinc-400 uppercase mb-3 flex items-center gap-2"><FileCode className="w-3 h-3" /> Top Linked KADs</h5>
                            <div className="grid grid-cols-2 gap-1">
                                {program.kads?.slice(0, 10).map(k => <div key={k.kad.id} className="text-[10px] font-mono text-zinc-500 truncate">{k.kad.code}</div>) || <span className="text-[10px] italic text-zinc-500">None linked</span>}
                                {program.kads && program.kads.length > 10 && <div className="text-[10px] font-bold text-zinc-400">+{program.kads.length - 10} more</div>}
                            </div>
                        </div>
                    </div>
                )}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-xl">
                    <DialogHeader className="bg-zinc-800 p-8">
                        <DialogTitle className="text-2xl font-bold text-white">{editingProgram ? "Program Settings" : "New EU Program"}</DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
                        <div className="px-8 pt-4 pb-0 bg-white dark:bg-zinc-950 border-b">
                            <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 h-12 rounded-2xl border mb-4">
                                <TabsTrigger value="general" className="rounded-xl font-bold text-xs uppercase px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white">General Info</TabsTrigger>
                                <TabsTrigger value="criteria" className="rounded-xl font-bold text-xs uppercase px-4 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Criteria</TabsTrigger>
                                <TabsTrigger value="regions" className="rounded-xl font-bold text-xs uppercase px-4 data-[state=active]:bg-amber-600 data-[state=active]:text-white">Regions</TabsTrigger>
                                <TabsTrigger value="kads" disabled={!editingProgram} className="rounded-xl font-bold text-xs uppercase px-4 data-[state=active]:bg-purple-600 data-[state=active]:text-white">KADs (OCR)</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-zinc-50 dark:bg-zinc-950">
                            <TabsContent value="general" className="m-0 space-y-6">
                                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Automatic translation is available for Greek content.</span>
                                    <Button size="sm" onClick={handleTranslate} disabled={isTranslating} className="bg-zinc-800 text-white font-bold h-9">
                                        {isTranslating ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Languages className="w-4 h-4 mr-2" />} Translate to English
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div><Label>Name (GR)</Label><Input value={formData.nameEL} onChange={e => setFormData({ ...formData, nameEL: e.target.value })} /></div>
                                        <div><Label>Short Description (GR)</Label><Textarea value={formData.shortDescriptionEL} onChange={e => setFormData({ ...formData, shortDescriptionEL: e.target.value })} /></div>
                                        <div><Label>Description (GR)</Label><Textarea className="h-32" value={formData.descriptionEL} onChange={e => setFormData({ ...formData, descriptionEL: e.target.value })} /></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div><Label>Name (EN)</Label><Input value={formData.nameEN} onChange={e => setFormData({ ...formData, nameEN: e.target.value })} /></div>
                                        <div><Label>Short Description (EN)</Label><Textarea value={formData.shortDescriptionEN} onChange={e => setFormData({ ...formData, shortDescriptionEN: e.target.value })} /></div>
                                        <div><Label>Description (EN)</Label><Textarea className="h-32" value={formData.descriptionEN} onChange={e => setFormData({ ...formData, descriptionEN: e.target.value })} /></div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="criteria" className="m-0 space-y-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Financials</h4>
                                        <div><Label>Max Budget (€)</Label><Input type="number" value={formData.maxBudget} onChange={e => setFormData({ ...formData, maxBudget: e.target.value })} /></div>
                                        <div><Label>Finance %</Label><Input value={formData.percentageOfFinance} onChange={e => setFormData({ ...formData, percentageOfFinance: e.target.value })} /></div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Deadlines</h4>
                                        <div><Label>Submission Date</Label><Input type="date" value={formData.submissionDate} onChange={e => setFormData({ ...formData, submissionDate: e.target.value })} /></div>
                                        <div className="flex items-center gap-2 pt-6"><Checkbox checked={formData.active} onCheckedChange={c => setFormData({ ...formData, active: !!c })} /><Label className="font-bold">Program is Active</Label></div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="regions" className="m-0">
                                <div className="grid grid-cols-3 gap-3">
                                    {allPeriferies.map(p => (
                                        <div key={p.id} className={`p-4 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${selectedPeriferies.has(p.id) ? 'bg-amber-50 border-amber-300 dark:bg-amber-900/20' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`} onClick={() => {
                                            const next = new Set(selectedPeriferies);
                                            if (next.has(p.id)) next.delete(p.id); else next.add(p.id);
                                            setSelectedPeriferies(next);
                                        }}>
                                            <Checkbox checked={selectedPeriferies.has(p.id)} onCheckedChange={() => { }} />
                                            <span className="text-xs font-bold">{p.nameEL}</span>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="kads" className="m-0 space-y-6">
                                <div className="bg-purple-600 p-8 rounded-3xl text-white flex justify-between items-center shadow-2xl">
                                    <div>
                                        <h3 className="text-xl font-bold flex items-center gap-2"><FileSearch className="w-6 h-6" /> AI OCR PDF Processor</h3>
                                        <p className="text-sm opacity-80 mt-1">Upload policy document and select KAD tables to extract codes automatically.</p>
                                    </div>
                                    <Button onClick={() => setIsOcrModalOpen(true)} className="bg-white text-purple-600 font-bold hover:bg-zinc-100">Launch OCR Scanner</Button>
                                </div>
                                <div className="grid grid-cols-2 gap-6 h-[400px]">
                                    <div className="bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden flex flex-col pt-4">
                                        <div className="px-4 pb-4 border-b flex justify-between items-center"><span className="text-xs font-black uppercase tracking-widest text-zinc-400">Linked KADs ({selectedKads.size})</span></div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                                            {allKads.filter(k => selectedKads.has(k.id)).map(k => (
                                                <div key={k.id} className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                                    <span className="font-mono font-bold text-xs">{k.code}</span>
                                                    <span className="text-[10px] text-zinc-500 truncate">{k.nameEL}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden flex flex-col">
                                        <div className="p-4 border-b"><Input placeholder="Search KAD codes..." value={kadSearch} onChange={e => setKadSearch(e.target.value)} className="h-9 text-xs" /></div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                                            {allKads.filter(k => !kadSearch || k.code.includes(kadSearch) || k.nameEL.toLowerCase().includes(kadSearch.toLowerCase())).slice(0, 50).map(kad => (
                                                <div key={kad.id} className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer" onClick={() => {
                                                    const next = new Set(selectedKads);
                                                    if (next.has(kad.id)) next.delete(kad.id); else next.add(kad.id);
                                                    setSelectedKads(next);
                                                }}>
                                                    <Checkbox checked={selectedKads.has(kad.id)} onCheckedChange={() => { }} />
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-xs">{kad.code}</span>
                                                        <span className="text-[9px] text-zinc-500 truncate w-40">{kad.nameEL}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>

                        <div className="p-8 border-t bg-white dark:bg-zinc-950 flex justify-end gap-3 rounded-b-3xl">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-bold uppercase tracking-widest text-xs">Cancel</Button>
                            <Button disabled={isSaving} onClick={handleSave} className="bg-zinc-800 text-white font-bold h-12 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                                {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : "Save Changes"}
                            </Button>
                        </div>
                    </Tabs>
                </DialogContent>
            </Dialog>

            <Dialog open={isOcrModalOpen} onOpenChange={setIsOcrModalOpen}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-6 rounded-xl">
                    <DialogHeader>
                        <DialogTitle>Document OCR Scanner</DialogTitle>
                        <DialogDescription>Extract KAD data from PDF tables using Vision AI.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden flex flex-col bg-zinc-900 rounded-2xl relative">
                        <div className="absolute top-0 w-full z-10 bg-zinc-800/90 backdrop-blur p-4 border-b border-zinc-700 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Label className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs cursor-pointer shadow-lg">Choose PDF <input type="file" className="hidden" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} /></Label>
                                {numPages && <div className="flex items-center gap-3 text-white text-xs font-bold"><Button size="sm" variant="ghost" className="h-7 w-7" onClick={() => setPageNumber(p => Math.max(1, p - 1))}>&lt;</Button> Page {pageNumber} / {numPages} <Button size="sm" variant="ghost" className="h-7 w-7" onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}>&gt;</Button></div>}
                            </div>
                            <Button disabled={!pdfFile || isProcessingOcr} onClick={startOcrScan} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                                {isProcessingOcr ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : "Scan Area"}
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto flex items-center justify-center p-20 mt-16">
                            {pdfFile && (
                                <ReactCrop crop={crop} onChange={c => setCrop(c)}>
                                    <Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                                        <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} width={800} />
                                    </Document>
                                </ReactCrop>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
