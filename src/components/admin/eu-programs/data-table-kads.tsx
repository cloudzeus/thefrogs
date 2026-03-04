"use client"

import * as React from "react"
import { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import {
    ChevronDown,
    Plus,
    RefreshCcw,
    FileCode,
    Link2,
    Edit,
    Trash2,
    CheckCircle2,
    Type
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import { createKad, updateKad, deleteKad, linkKadToProgram } from "@/app/lib/actions/eu-program"
import { Textarea } from "@/components/ui/textarea"
import { GenericDataTable } from "../shared/generic-data-table"

export type KadType = {
    id: string; code: string; dotcode: string | null; nameEL: string | null; nameEN: string | null;
};

export type EuProgramType = {
    id: string; nameEL: string | null; nameEN: string | null;
};

export function DataTableKads({
    data: initialData,
    programs = [],
}: {
    data: KadType[];
    programs?: EuProgramType[];
}) {
    const [data, setData] = React.useState<KadType[]>(initialData || [])
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isAssignOpen, setIsAssignOpen] = React.useState(false)
    const [editingItem, setEditingItem] = React.useState<KadType | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)
    const [isUploading, setIsUploading] = React.useState(false)
    const [isAssigning, setIsAssigning] = React.useState(false)
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
    const [selectedProgramId, setSelectedProgramId] = React.useState("")
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const [formData, setFormData] = React.useState({
        code: "", nameEL: "", nameEN: ""
    })

    const openEdit = (item?: KadType) => {
        if (item) {
            setEditingItem(item)
            setFormData({ code: item.code, nameEL: item.nameEL || "", nameEN: item.nameEN || "" })
        } else {
            setEditingItem(null)
            setFormData({ code: "", nameEL: "", nameEN: "" })
        }
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            if (!formData.code) throw new Error("Code is required")
            const cleanData = { code: formData.code.trim(), nameEL: formData.nameEL.trim(), nameEN: formData.nameEN.trim() || null }
            if (editingItem) {
                const updated = await updateKad(editingItem.id, cleanData)
                setData(prev => prev.map(d => d.id === updated.id ? updated as any : d))
                toast.success("KAD updated")
            } else {
                const created = await createKad(cleanData)
                setData(prev => [created as any, ...prev])
                toast.success("KAD created")
            }
            setIsDialogOpen(false)
        } catch (err: any) { toast.error(err.message) }
        finally { setIsSaving(false) }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ""
        setIsUploading(true)
        const tid = toast.loading(`Uploading "${file.name}"...`)
        try {
            const form = new FormData()
            form.append("file", file)
            const res = await fetch("/api/admin/eu-programs/upload-kads", { method: "POST", body: form })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || "Upload failed")
            toast.success(`Synced ${json.count} KADs`, { id: tid })
            setTimeout(() => window.location.reload(), 1200)
        } catch (err: any) { toast.error(err.message, { id: tid }) }
        finally { setIsUploading(false) }
    }

    const handleBulkAssign = async () => {
        if (!selectedProgramId) return toast.error("Select a program")
        const selectedIndices = Object.keys(rowSelection).filter(k => rowSelection[k])
        // Since GenericDataTable handles its own filtering/sorting, rowSelection indices refer to the current visible rows in the table instance.
        // This is a limitation if we use index-based selection. 
        // Better to use rowIdKey="id" in GenericDataTable so rowSelection uses IDs as keys.
        const kadIds = selectedIndices;

        setIsAssigning(true)
        const tid = toast.loading(`Linking ${kadIds.length} KADs...`)
        try {
            for (const id of kadIds) await linkKadToProgram(selectedProgramId, id)
            toast.success("Linked successfully", { id: tid })
            setRowSelection({})
            setIsAssignOpen(false)
        } catch (err: any) { toast.error(err.message, { id: tid }) }
        finally { setIsAssigning(false) }
    }

    const columns: ColumnDef<KadType>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(v) => row.toggleSelected(!!v)}
                    aria-label="Select row"
                    onClick={e => e.stopPropagation()}
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
        },
        {
            accessorKey: "code",
            header: "KAD Code",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono bg-zinc-50 dark:bg-zinc-800 text-primary border-primary/20">{row.original.code}</Badge>
                    {row.original.dotcode && <span className="text-[10px] text-muted-foreground italic">({row.original.dotcode})</span>}
                </div>
            )
        },
        {
            accessorKey: "nameEL",
            header: "KAD Description",
            cell: ({ row }) => (
                <div className="min-w-[200px] max-w-[500px] space-y-0.5" title={row.original.nameEL || ""}>
                    <p className="text-sm text-foreground line-clamp-2 leading-snug">{row.original.nameEL || "—"}</p>
                    {row.original.nameEN && (
                        <p className="text-xs text-muted-foreground line-clamp-1 italic">{row.original.nameEN}</p>
                    )}
                </div>
            ),
            enableHiding: false,
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
                        <DropdownMenuItem onClick={() => openEdit(row.original)}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={async () => {
                            if (confirm("Delete KAD?")) {
                                await deleteKad(row.original.id)
                                setData(prev => prev.filter(d => d.id !== row.original.id))
                                toast.success("Deleted")
                            }
                        }} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    const selectedCount = Object.keys(rowSelection).length

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                    <Button variant="outline" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none font-bold h-10 shadow-lg" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        <FileCode className="w-4 h-4 mr-2" /> Bulk Upload (Excel)
                    </Button>
                    {selectedCount > 0 && (
                        <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 shadow-xl" onClick={() => setIsAssignOpen(true)}>
                            <Link2 className="w-4 h-4 mr-2" /> Assign {selectedCount} to Program
                        </Button>
                    )}
                </div>
            </div>

            <GenericDataTable
                columns={columns}
                data={data}
                searchPlaceholder="Search KAD codes or descriptions..."
                searchColumn="nameEL"
                onAddClick={() => openEdit()}
                addButtonLabel="Add KAD"
                rowIdKey="id"
                enableRowSelection={true}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                renderExpandedRow={(kad) => (
                    <div className="py-6 px-4 bg-sky-50/50 dark:bg-sky-950/20 rounded-2xl border border-sky-200/60 dark:border-sky-800/50 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <h5 className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest flex items-center gap-2"><Type className="w-3 h-3" /> Full Description (Greek)</h5>
                            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{kad.nameEL || "No description provided."}</p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> English Metadata</h5>
                            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{kad.nameEN || "Translation not available."}</p>
                        </div>
                    </div>
                )}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl p-0 overflow-hidden rounded-xl">
                    <DialogHeader className="bg-zinc-800 p-8">
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2"><FileCode className="w-6 h-6 text-indigo-400" /> {editingItem ? "Edit KAD" : "Create KAD"}</DialogTitle>
                    </DialogHeader>
                    <div className="p-8 space-y-6 bg-zinc-50 dark:bg-zinc-950">
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Government Code</Label>
                            <Input className="font-mono h-12 text-lg focus:ring-indigo-500" placeholder="62.01" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Description (Greek)</Label>
                            <Textarea className="min-h-[100px] text-sm" placeholder="Δραστηριότητες προγραμματισμού..." value={formData.nameEL} onChange={e => setFormData({ ...formData, nameEL: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Description (English)</Label>
                            <Textarea className="min-h-[100px] text-sm" placeholder="Computer programming activities..." value={formData.nameEN} onChange={e => setFormData({ ...formData, nameEN: e.target.value })} />
                        </div>
                    </div>
                    <div className="p-8 border-t bg-white dark:bg-zinc-950 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-black text-xs uppercase">Cancel</Button>
                        <Button disabled={isSaving} onClick={handleSave} className="bg-zinc-800 text-white font-bold h-12 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                            {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : "Save KAD"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent className="max-w-lg p-0 overflow-hidden rounded-xl">
                    <DialogHeader className="bg-indigo-600 p-8 text-white">
                        <DialogTitle className="text-2xl font-bold">Assign to Program</DialogTitle>
                        <DialogDescription className="text-indigo-100 opacity-90">Link {selectedCount} selected KAD codes to an EU Program.</DialogDescription>
                    </DialogHeader>
                    <div className="p-8 bg-zinc-50 dark:bg-zinc-950">
                        <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-2 block">Choose EU Program</Label>
                        <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                            <SelectTrigger className="h-14 rounded-2xl border-2 focus:ring-indigo-500">
                                <SelectValue placeholder="Search target program..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl shadow-2xl">
                                {programs.map(p => <SelectItem key={p.id} value={p.id} className="h-12">{p.nameEL || p.id}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="p-8 border-t bg-white dark:bg-zinc-950 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsAssignOpen(false)} className="font-black text-xs uppercase">Cancel</Button>
                        <Button disabled={isAssigning || !selectedProgramId} onClick={handleBulkAssign} className="bg-indigo-600 text-white font-bold h-12 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                            {isAssigning ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : "Link KADs Now"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
