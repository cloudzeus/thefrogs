"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
    ArrowUpDown,
    ChevronDown,
    Plus,
    Loader2,
    Search,
    ChevronRight,
    Building2,
    Mail,
    Phone,
    Globe,
    Calendar,
    Users2,
    MapPin,
    Trash2,
    Edit3,
    CheckCircle2,
    ExternalLink,
    Zap,
    RefreshCcw,
    BadgeCheck
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { createCustomer, updateCustomer, deleteCustomer, getKAD } from "@/app/lib/actions/trdr"
import { GenericDataTable } from "../shared/generic-data-table"

export type Customer = {
    id: string
    SODTYPE: number
    TRDR: number
    CODE: string
    NAME: string
    AFM: string | null
    ADDRESS: string | null
    CITY: string | null
    PHONE01: string | null
    EMAIL: string | null
    logo: string | null
    website: string | null
    displayAtCarousel: boolean
    registDate: string | null
    legalStatus: string | null
    numEmployees: number | null
    kads?: any[]
}

export function CustomersDataTable({ data: initialData }: { data: Customer[] }) {
    const [data, setData] = React.useState<Customer[]>(initialData)
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null)

    const [formData, setFormData] = React.useState({
        SODTYPE: 13,
        TRDR: 0,
        CODE: "",
        NAME: "",
        AFM: "",
        ADDRESS: "",
        ZIP: "",
        CITY: "",
        PHONE01: "",
        EMAIL: "",
        website: "",
        registDate: "",
        legalStatus: "",
        numEmployees: "",
        displayAtCarousel: false,
        removeBackgroundLogo: true,
        logo: "",
        kads: [] as any[],
    })

    const emptyFormData = (): typeof formData => ({
        SODTYPE: 13,
        TRDR: 0,
        CODE: "",
        NAME: "",
        AFM: "",
        ADDRESS: "",
        ZIP: "",
        CITY: "",
        PHONE01: "",
        EMAIL: "",
        website: "",
        registDate: "",
        legalStatus: "",
        numEmployees: "",
        displayAtCarousel: false,
        removeBackgroundLogo: true,
        logo: "",
        kads: [],
    })

    const [isUploading, setIsUploading] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)
    const [isSearchingVat, setIsSearchingVat] = React.useState(false)

    const handleFetchVat = async () => {
        if (!formData.AFM || formData.AFM.trim() === "") return toast.error("Provide an AFM first")
        setIsSearchingVat(true)
        const tid = toast.loading("Syncing with Government VAT API...")
        try {
            const res = await fetch("/api/vat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ afm: formData.AFM.trim() })
            })
            const apiData = await res.json()
            if (apiData.basic_rec) {
                const fetchedKads = apiData.firm_act_tab?.item?.map((k: any) => ({
                    afm: formData.AFM.trim(),
                    firm_act_code: String(k.firm_act_code || ""),
                    firm_act_descr: String(k.firm_act_descr || ""),
                    firm_act_kind: k.firm_act_kind === "1"
                })) || [];

                setFormData(prev => ({
                    ...prev,
                    NAME: apiData.basic_rec.onomasia || prev.NAME,
                    ADDRESS: `${apiData.basic_rec.postal_address || ""} ${apiData.basic_rec.postal_address_no || ""}`.trim() || prev.ADDRESS,
                    ZIP: apiData.basic_rec.postal_zip_code || prev.ZIP,
                    registDate: apiData.basic_rec.regist_date || prev.registDate,
                    legalStatus: apiData.basic_rec.legal_status_descr || prev.legalStatus,
                    kads: fetchedKads,
                }))
                toast.success("VIES/VAT Data Retrieved", { id: tid })
            } else throw new Error(apiData.error || "No record found")
        } catch (err: any) { toast.error(err.message, { id: tid }) }
        finally { setIsSearchingVat(false) }
    }

    const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploading(true)
        const tid = toast.loading("Processing logo with AI...")
        try {
            const form = new FormData()
            form.append("logo", file)
            form.append("removeBackground", String(formData.removeBackgroundLogo))
            const res = await fetch("/api/admin/trdr/upload-logo", { method: "POST", body: form })
            const d = await res.json()
            if (!res.ok) throw new Error(d.error || "Upload failed")
            setFormData(prev => ({ ...prev, logo: d.url }))
            toast.success("Logo Optimized & Uploaded", { id: tid })
        } catch (error: any) { toast.error(error.message, { id: tid }) }
        finally { setIsUploading(false) }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const payload = { ...formData, TRDR: Number(formData.TRDR), SODTYPE: Number(formData.SODTYPE), numEmployees: formData.numEmployees ? Number(formData.numEmployees) : null }
            if (editingCustomer) {
                const updated = await updateCustomer(editingCustomer.id, payload)
                setData(data.map(c => c.id === updated.id ? updated as any : c))
                toast.success("Customer updated")
            } else {
                const created = await createCustomer(payload)
                setData([created as any, ...data])
                toast.success("Customer created")
            }
            setIsDialogOpen(false)
        } catch (err: any) { toast.error(err.message) }
        finally { setIsSaving(false) }
    }

    const columns: ColumnDef<Customer>[] = [
        {
            id: "avatar",
            header: "",
            cell: ({ row }) => (
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border shadow-sm p-1.5 flex items-center justify-center">
                    <img src={row.original.logo || ""} alt="" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(row.original.NAME))} />
                </div>
            ),
            size: 60
        },
        {
            accessorKey: "NAME",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-black text-[10px] uppercase tracking-widest p-0 hover:bg-transparent">
                    Company Name <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{row.original.NAME}</span>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">{row.original.AFM}</span>
                </div>
            )
        },
        {
            accessorKey: "CODE",
            header: "System Code",
            cell: ({ row }) => <code className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{row.original.CODE}</code>
        },
        {
            accessorKey: "displayAtCarousel",
            header: "Visibility",
            cell: ({ row }) => row.original.displayAtCarousel ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-black uppercase"><BadgeCheck className="w-3 h-3 mr-1" /> Featured</Badge>
            ) : (
                <Badge variant="outline" className="text-zinc-300 border-zinc-200 text-[10px] font-black uppercase">Standard</Badge>
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
                    <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuItem onClick={() => {
                            setEditingCustomer(row.original);
                            setFormData({ ...row.original, ZIP: (row.original as any).ZIP || "", numEmployees: row.original.numEmployees?.toString() || "", removeBackgroundLogo: true } as any);
                            setIsDialogOpen(true);
                        }}><Edit3 className="w-4 h-4 mr-2" /> Modify Profile</DropdownMenuItem>
                        <DropdownMenuItem onClick={async () => {
                            toast.promise(getKAD(row.original.id, row.original.AFM || ""), {
                                loading: 'Syncing KADs...',
                                success: (d) => { setData(prev => prev.map(c => c.id === d.id ? d as any : c)); return 'Knowledge database synced'; },
                                error: (e) => e.message
                            });
                        }} className="text-indigo-600"><Zap className="w-4 h-4 mr-2" /> Sync KADs</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={async () => {
                            if (confirm("Delete client?")) {
                                await deleteCustomer(row.original.id);
                                setData(data.filter(c => c.id !== row.original.id));
                            }
                        }} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" /> Expunge Client</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    const renderExpandedRow = (customer: Customer) => (
        <div className="py-8 px-6 bg-[#f8fafc] dark:bg-zinc-950/50 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-inner">
            <Tabs defaultValue="stats">
                <TabsList className="mb-8 bg-white dark:bg-zinc-900 p-1.5 h-12 rounded-[20px] border shadow-sm w-fit gap-2">
                    <TabsTrigger value="stats" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-xl h-9">Market Intelligence</TabsTrigger>
                    <TabsTrigger value="kads" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-xl h-9">KAD Profile ({customer.kads?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="stats" className="animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border shadow-sm">
                            <h5 className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4"><Users2 className="w-4 h-4" /> Workforce</h5>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-zinc-800 dark:text-zinc-100">{customer.numEmployees || '0'}</span>
                                <span className="text-xs font-bold text-zinc-400">Total FTEs</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border shadow-sm">
                            <h5 className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4"><Calendar className="w-4 h-4" /> established</h5>
                            <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{customer.registDate || 'Unknown'}</span>
                        </div>
                        <div className="md:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-[32px] border shadow-sm grid grid-cols-2 gap-4">
                            <div>
                                <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Location Strategy</h5>
                                <p className="text-sm font-bold flex items-center gap-2"><MapPin className="w-3 h-3 text-red-500" /> {customer.ADDRESS}, {customer.CITY}</p>
                            </div>
                            <div>
                                <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Legal Identity</h5>
                                <p className="text-sm font-bold text-indigo-600">{customer.legalStatus || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4 bg-zinc-800 p-6 rounded-[32px] text-white shadow-xl">
                        <div className="flex items-center gap-3 px-4">
                            <Mail className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-bold">{customer.EMAIL || 'no-email@recorded.com'}</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 border-l border-white/10">
                            <Phone className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-bold">{customer.PHONE01 || 'Unlisted'}</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 border-l border-white/10 ml-auto">
                            <Globe className="w-4 h-4 text-sky-400" />
                            <a href={customer.website || '#'} target="_blank" className="text-sm font-bold underline underline-offset-4 decoration-sky-400/30 hover:text-sky-400 transition-colors">{customer.website ? 'Visit Corporate Site' : 'No Web Presence'}</a>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="kads">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] border overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-50 border-b">
                                <tr>
                                    <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-zinc-400">Activity Code</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-zinc-400">Official Description</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-zinc-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {customer.kads?.map((k, i) => (
                                    <tr key={i} className="hover:bg-zinc-50/50">
                                        <td className="px-8 py-4 font-mono text-[11px] font-bold text-indigo-600">{k.firm_act_code}</td>
                                        <td className="px-8 py-4 text-xs font-semibold text-zinc-600">{k.firm_act_descr}</td>
                                        <td className="px-8 py-4 text-right">
                                            {k.firm_act_kind ? <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-full h-6 px-3">Primary</Badge> : <Badge variant="outline" className="rounded-full h-6 px-3 text-zinc-300">Secondary</Badge>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {customer.kads?.length === 0 && <div className="p-12 text-center text-zinc-300 font-black text-xs uppercase tracking-widest">No KAD activities indexed.</div>}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )

    if (!isMounted) return null

    return (
        <div className="space-y-4">
            <GenericDataTable
                columns={columns} data={data} searchPlaceholder="Search clients by name or AFM..." searchColumn="NAME"
                onAddClick={() => { setEditingCustomer(null); setFormData(emptyFormData()); setIsDialogOpen(true); }}
                addButtonLabel="Onboard Client"
                renderExpandedRow={renderExpandedRow}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-xl">
                    <DialogHeader className="bg-zinc-800 p-10">
                        <DialogTitle className="text-3xl font-black text-white tracking-tighter flex items-center gap-3"><Building2 className="w-8 h-8 text-indigo-400" /> {editingCustomer ? 'Update Client Corporate Profile' : 'Onboard New Global Client'}</DialogTitle>
                        <DialogDescription className="text-zinc-400 font-medium text-base">Populate corporate intelligence data and synchronize identity records.</DialogDescription>
                    </DialogHeader>

                    <div className="p-10 bg-[#f8fafc] dark:bg-zinc-950 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-dashed border-indigo-200 shadow-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-6 flex items-center gap-2"><Zap className="w-4 h-4" /> Enterprise Identity Sync</h4>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">VAT Identification Number (AFM)</Label>
                                        <div className="flex gap-2">
                                            <Input className="h-14 rounded-2xl border-indigo-100 font-mono text-lg font-bold" value={formData.AFM ?? ""} onChange={e => setFormData({ ...formData, AFM: e.target.value })} placeholder="801946016" />
                                            <Button disabled={isSearchingVat || !formData.AFM} onClick={handleFetchVat} className="h-14 aspect-square bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/20">
                                                {isSearchingVat ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-medium">Use official VAT number to autofill corporate name and geography data.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase text-zinc-400">Brand Identity Logo</Label>
                                    <div className="flex items-center gap-6 p-6 border rounded-[32px] bg-white dark:bg-zinc-900">
                                        <div className="w-24 h-24 rounded-2xl border bg-zinc-50 flex items-center justify-center overflow-hidden p-2">
                                            {formData.logo ? <img src={formData.logo} className="w-full h-full object-contain" /> : <Building2 className="w-8 h-8 text-zinc-200" />}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <Label className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-800 px-4 text-[10px] font-black uppercase text-white cursor-pointer hover:bg-zinc-900 active:scale-95 transition-all">
                                                Choose Icon
                                                <input type="file" className="hidden" accept="image/*" onChange={handleUploadLogo} disabled={isUploading} />
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Checkbox id="rmbg" checked={formData.removeBackgroundLogo} onCheckedChange={v => setFormData({ ...formData, removeBackgroundLogo: !!v })} />
                                                <Label htmlFor="rmbg" className="text-[10px] font-bold text-zinc-500 uppercase cursor-pointer">Remove BG</Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-zinc-400">Official Company Name</Label>
                                    <Input className="h-12 rounded-xl" value={formData.NAME ?? ""} onChange={e => setFormData({ ...formData, NAME: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Internal ERP Code</Label>
                                        <Input className="h-12 rounded-xl font-mono" value={formData.CODE ?? ""} onChange={e => setFormData({ ...formData, CODE: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Headcount (Ett)</Label>
                                        <Input type="number" className="h-12 rounded-xl" value={formData.numEmployees ?? ""} onChange={e => setFormData({ ...formData, numEmployees: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-zinc-400">Primary Contact Email</Label>
                                    <Input type="email" className="h-12 rounded-xl" value={formData.EMAIL ?? ""} onChange={e => setFormData({ ...formData, EMAIL: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Phone</Label>
                                        <Input className="h-12 rounded-xl" value={formData.PHONE01 ?? ""} onChange={e => setFormData({ ...formData, PHONE01: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Corporate Web URL</Label>
                                        <Input className="h-12 rounded-xl" value={formData.website ?? ""} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                                    </div>
                                </div>
                                <div className="py-4 border-t flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-xs font-black uppercase">Showroom Exposure</h4>
                                        <p className="text-[10px] text-zinc-400">Feature this logo on promotional carousels.</p>
                                    </div>
                                    <Switch checked={formData.displayAtCarousel} onCheckedChange={v => setFormData({ ...formData, displayAtCarousel: v })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 border-t bg-white dark:bg-zinc-950 flex justify-end gap-4">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-black text-xs uppercase tracking-widest text-zinc-400">Abort</Button>
                        <Button disabled={isSaving || isUploading} onClick={handleSave} className="bg-indigo-600 text-white font-black text-xs uppercase tracking-widest h-14 px-12 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                            {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Sync Corporate Data"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
