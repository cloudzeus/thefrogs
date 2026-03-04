"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
    ChevronDown,
    ChevronRight,
    Plus,
    RefreshCcw,
    Globe,
    DownloadCloud,
    Edit,
    Trash2,
    MapPin,
    Layers,
    Navigation,
    Home
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import {
    createPeriferia,
    updatePeriferia,
    deletePeriferia,
    importKallikratis,
    translateAllPeriferies
} from "@/app/lib/actions/eu-program"
import { GenericDataTable } from "../shared/generic-data-table"

export type PeriferiaType = {
    id: string
    code: string
    nameEL: string
    nameEN: string | null
    level: number
    parentCode: string | null
    children?: PeriferiaType[]
}

const LEVEL_META: Record<number, { label: string; color: string; bg: string; icon: any }> = {
    3: { label: "Περιφέρεια", color: "text-blue-700", bg: "bg-blue-50/50 dark:bg-blue-900/10", icon: Globe },
    4: { label: "Νομός", color: "text-emerald-700", bg: "bg-emerald-50/40 dark:bg-emerald-900/10", icon: MapPin },
    5: { label: "Δήμος", color: "text-amber-700", bg: "bg-amber-50/30 dark:bg-amber-900/10", icon: Navigation },
    6: { label: "Περιοχή", color: "text-purple-700", bg: "bg-purple-50/20 dark:bg-purple-900/10", icon: Home },
}

export function DataTablePeriferies({ data: initialData }: { data: PeriferiaType[] }) {
    const [data, setData] = React.useState<PeriferiaType[]>(initialData || [])
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [editingItem, setEditingItem] = React.useState<PeriferiaType | null>(null)
    const [addingToParent, setAddingToParent] = React.useState<PeriferiaType | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)
    const [isTranslating, setIsTranslating] = React.useState(false)
    const [isImporting, setIsImporting] = React.useState(false)

    const [formData, setFormData] = React.useState({
        code: "", nameEL: "", nameEN: "", level: 3, parentCode: ""
    })

    const openEdit = (item: PeriferiaType) => {
        setAddingToParent(null)
        setEditingItem(item)
        setFormData({ code: item.code, nameEL: item.nameEL, nameEN: item.nameEN || "", level: item.level, parentCode: item.parentCode || "" })
        setIsDialogOpen(true)
    }

    const openAddRoot = () => {
        setEditingItem(null)
        setAddingToParent(null)
        setFormData({ code: "", nameEL: "", nameEN: "", level: 3, parentCode: "" })
        setIsDialogOpen(true)
    }

    const openAddChild = (parent: PeriferiaType) => {
        setEditingItem(null)
        setAddingToParent(parent)
        setFormData({ code: "", nameEL: "", nameEN: "", level: Math.min(parent.level + 1, 6), parentCode: parent.code })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete region and all children?")) return
        try {
            await deletePeriferia(id)
            toast.success("Deleted")
            window.location.reload()
        } catch (err: any) { toast.error(err.message) }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const payload = { ...formData, parentCode: formData.parentCode || null }
            if (editingItem) await updatePeriferia(editingItem.id, payload)
            else await createPeriferia(payload)
            toast.success("Saved")
            window.location.reload()
        } catch (err: any) { toast.error(err.message) }
        finally { setIsSaving(false) }
    }

    const handleImport = async () => {
        setIsImporting(true)
        const tid = toast.loading("Syncing Kallikratis...")
        try {
            await importKallikratis()
            toast.success("Synced", { id: tid })
            window.location.reload()
        } catch (err: any) { toast.error(err.message, { id: tid }) }
        finally { setIsImporting(false) }
    }

    const handleTranslateAll = async () => {
        setIsTranslating(true)
        const tid = toast.loading("Translating via AI...")
        try {
            const res = await translateAllPeriferies()
            toast.success(`Translated ${res.count} regions`, { id: tid })
            window.location.reload()
        } catch (err: any) { toast.error(err.message, { id: tid }) }
        finally { setIsTranslating(false) }
    }

    const columns: ColumnDef<PeriferiaType>[] = [
        {
            id: "expander",
            header: () => null,
            cell: ({ row }) => (row.original.children?.length || 0) > 0 ? (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={e => { e.stopPropagation(); row.toggleExpanded() }}>
                    <ChevronRight className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? 'rotate-90' : ''}`} />
                </Button>
            ) : null,
            size: 40
        },
        {
            accessorKey: "level",
            header: "Level",
            cell: ({ row }) => {
                const meta = LEVEL_META[row.original.level] || LEVEL_META[6]
                const Icon = meta.icon
                return (
                    <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest ${meta.color} bg-white dark:bg-zinc-900 border-current/20`}>
                        <Icon className="w-3 h-3 mr-1" /> {meta.label}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "nameEL",
            header: "Region Name",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm">{row.original.nameEL}</span>
                    {row.original.nameEN && <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{row.original.nameEN}</span>}
                </div>
            )
        },
        {
            accessorKey: "code",
            header: "Kallikratis ID",
            cell: ({ row }) => <code className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{row.original.code}</code>
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="h-8 bg-zinc-700 text-white border-none font-bold">
                            Actions <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {row.original.level < 6 && <DropdownMenuItem onClick={() => openAddChild(row.original)}><Plus className="w-4 h-4 mr-2" /> Add Child</DropdownMenuItem>}
                        <DropdownMenuItem onClick={() => openEdit(row.original)}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-4">
                <div className="flex gap-2">
                    {Object.entries(LEVEL_META).map(([lvl, meta]) => (
                        <div key={lvl} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${meta.color} font-bold text-[10px] uppercase tracking-widest bg-white dark:bg-zinc-900 shadow-sm`}>
                            <meta.icon className="w-3 h-3" /> {meta.label}
                        </div>
                    ))}
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={handleTranslateAll} disabled={isTranslating} className="border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl h-10 px-4">
                        {isTranslating ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />} Translate All
                    </Button>
                    <Button size="sm" onClick={handleImport} disabled={isImporting} className="bg-zinc-800 text-white font-bold h-10 px-4 rounded-xl shadow-lg transition-transform active:scale-95">
                        {isImporting ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <DownloadCloud className="w-4 h-4 mr-2" />} Sync Kallikratis
                    </Button>
                </div>
            </div>

            <GenericDataTable
                columns={columns}
                data={data}
                searchPlaceholder="Search regions..."
                searchColumn="nameEL"
                onAddClick={openAddRoot}
                addButtonLabel="Add Root Region"
                getSubRows={row => row.children}
                getRowClassName={row => LEVEL_META[row.level]?.bg || ""}
                renderExpandedRow={(region) => (
                    <div className="py-6 px-4">
                        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border shadow-inner max-w-2xl">
                            <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Layers className="w-3 h-3" /> Regional Metadata</h5>
                            <div className="grid grid-cols-2 gap-8 text-sm">
                                <div>
                                    <Label className="text-zinc-400 font-bold block mb-1">Hierarchy Path</Label>
                                    <p className="font-mono text-xs">{region.parentCode ? `${region.parentCode} → ${region.code}` : region.code}</p>
                                </div>
                                <div>
                                    <Label className="text-zinc-400 font-bold block mb-1">Total Sub-regions</Label>
                                    <p className="font-bold text-indigo-600">{region.children?.length || 0} Children</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl p-0 overflow-hidden rounded-xl">
                    <DialogHeader className="bg-zinc-800 p-8">
                        <DialogTitle className="text-2xl font-bold text-white">
                            {editingItem ? `Edit: ${editingItem.nameEL}` : addingToParent ? `Add sub-region under ${addingToParent.nameEL}` : "Create Root Region"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-8 space-y-6 bg-zinc-50 dark:bg-zinc-950">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-zinc-500">Government Code</Label>
                                <Input className="h-12 font-mono" value={formData.code} onChange={e => setFormData(f => ({ ...f, code: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-zinc-500">Regional Level</Label>
                                <Select value={String(formData.level)} onValueChange={v => setFormData(f => ({ ...f, level: parseInt(v) }))}>
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3">Περιφέρεια</SelectItem>
                                        <SelectItem value="4">Νομός / Ενότητα</SelectItem>
                                        <SelectItem value="5">Δήμος</SelectItem>
                                        <SelectItem value="6">Περιοχή</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-zinc-500">Full Name (Greek)</Label>
                            <Input className="h-12 font-bold" value={formData.nameEL} onChange={e => setFormData(f => ({ ...f, nameEL: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-zinc-500">Full Name (English)</Label>
                            <Input className="h-12" value={formData.nameEN} onChange={e => setFormData(f => ({ ...f, nameEN: e.target.value }))} />
                        </div>
                    </div>

                    <div className="p-8 border-t bg-white dark:bg-zinc-950 flex justify-end gap-3 rounded-b-3xl">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-bold uppercase tracking-widest text-xs">Cancel</Button>
                        <Button disabled={isSaving} onClick={handleSave} className="bg-zinc-800 text-white font-bold h-12 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                            {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : "Save Region"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
