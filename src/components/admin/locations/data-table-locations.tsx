"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
    ChevronDown,
    Plus,
    RefreshCcw,
    MapPin,
    Trash2,
    Map,
    ChevronRight,
    ArrowUpDown,
    Globe,
    Phone,
    Mail,
    ExternalLink,
    Compass,
    Layers,
    Navigation,
    Home
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"

import { createLocation, updateLocation, deleteLocation, getCoordinates } from "@/app/lib/actions/location"
import { GenericDataTable } from "../shared/generic-data-table"

export type Location = {
    id: string;
    nameEL: string;
    nameEN: string | null;
    addressEL: string | null;
    addressEN: string | null;
    zip: string | null;
    cityEL: string | null;
    cityEN: string | null;
    countryEL: string | null;
    countryEN: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    logo: string | null;
    latitude: number | null;
    longitude: number | null;
    order: number;
    published: boolean;
    createdAt: Date;
}

export function DataTableLocations({ data: initialData }: { data: Location[] }) {
    const [data, setData] = React.useState<Location[]>(initialData || [])
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [editingLocation, setEditingLocation] = React.useState<Location | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)
    const [isGeocoding, setIsGeocoding] = React.useState(false)
    const [geocodeQuery, setGeocodeQuery] = React.useState("")

    const [formData, setFormData] = React.useState({
        nameEL: "", nameEN: "", addressEL: "", addressEN: "", zip: "", cityEL: "", cityEN: "", countryEL: "", countryEN: "",
        email: "", phone: "", website: "", logo: "", latitude: "", longitude: "", order: "0", published: true
    })

    const openEdit = (location?: Location) => {
        if (location) {
            setEditingLocation(location)
            setFormData({
                nameEL: location.nameEL || "", nameEN: location.nameEN || "",
                addressEL: location.addressEL || "", addressEN: location.addressEN || "",
                zip: location.zip || "", cityEL: location.cityEL || "", cityEN: location.cityEN || "",
                countryEL: location.countryEL || "", countryEN: location.countryEN || "",
                email: location.email || "", phone: location.phone || "", website: location.website || "",
                logo: location.logo || "", latitude: location.latitude ? String(location.latitude) : "",
                longitude: location.longitude ? String(location.longitude) : "",
                order: String(location.order || 0), published: location.published ?? true,
            })
        } else {
            setEditingLocation(null)
            setFormData({
                nameEL: "", nameEN: "", addressEL: "", addressEN: "", zip: "", cityEL: "", cityEN: "", countryEL: "", countryEN: "",
                email: "", phone: "", website: "", logo: "", latitude: "", longitude: "", order: "0", published: true
            })
        }
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            if (!formData.nameEL) throw new Error("Regional Name (EL) is required")
            if (editingLocation) {
                const res = await updateLocation(editingLocation.id, formData)
                setData(data.map(d => d.id === (res as any).id ? res as any : d))
                toast.success("Location updated")
            } else {
                const res = await createLocation(formData)
                setData([...data, res as any])
                toast.success("Branch location created")
            }
            setIsDialogOpen(false)
        } catch (err: any) { toast.error(err.message) }
        finally { setIsSaving(false) }
    }

    React.useEffect(() => {
        const query = [formData.addressEL || formData.addressEN, formData.cityEL || formData.cityEN, formData.countryEL || formData.countryEN].filter(Boolean).join(", ")
        setGeocodeQuery(query)
    }, [formData.addressEL, formData.addressEN, formData.cityEL, formData.cityEN, formData.countryEL, formData.countryEN])

    const handleLogoUpload = async (file: File | null) => {
        if (!file) return
        const tid = toast.loading("Uploading branding assets...")
        try {
            const form = new FormData(); form.append("file", file);
            const res = await fetch("/api/admin/articles/upload", { method: "POST", body: form })
            const d = await res.json()
            if (!res.ok) throw new Error(d.error)
            setFormData(prev => ({ ...prev, logo: d.url }))
            toast.success("Identity Asset Verified", { id: tid })
        } catch (error: any) { toast.error(error.message, { id: tid }) }
    }

    const handleGeocode = async () => {
        if (!geocodeQuery.trim()) return toast.error("Provide a location query")
        setIsGeocoding(true)
        const tid = toast.loading(`Resolving coordinates for "${geocodeQuery}"...`)
        try {
            const coords = await getCoordinates(geocodeQuery)
            if (coords) {
                setFormData(prev => ({ ...prev, latitude: String(coords.latitude), longitude: String(coords.longitude) }))
                toast.success("GPS Lock Established", { id: tid })
            } else throw new Error("Location resolution failed")
        } catch (error: any) { toast.error(error.message, { id: tid }) }
        finally { setIsGeocoding(false) }
    }

    const columns: ColumnDef<Location>[] = [
        {
            id: "branding",
            header: "",
            cell: ({ row }) => (
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border shadow-sm p-1.5 flex items-center justify-center">
                    {row.original.logo ? <img src={row.original.logo} className="w-full h-full object-contain" /> : <Home className="w-5 h-5 text-zinc-300" />}
                </div>
            ),
            size: 60
        },
        {
            accessorKey: "nameEL",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-black text-[10px] uppercase tracking-widest p-0 h-auto hover:bg-transparent">
                    Location Name <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{row.original.nameEL}</span>
                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 uppercase tracking-tighter"><MapPin className="w-2 h-2 text-red-400" /> {row.original.cityEL}, {row.original.countryEL}</span>
                </div>
            )
        },
        {
            accessorKey: "phone",
            header: "Contact Intelligence",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-2"><Phone className="w-3 h-3" /> {row.original.phone || 'N/A'}</span>
                    <span className="text-[10px] font-medium text-zinc-400 flex items-center gap-2"><Mail className="w-3 h-3" /> {row.original.email || 'N/A'}</span>
                </div>
            )
        },
        {
            accessorKey: "published",
            header: "Status",
            cell: ({ row }) => row.original.published ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-black uppercase">Live Reach</Badge>
            ) : (
                <Badge variant="outline" className="text-zinc-300 border-zinc-200 text-[10px] font-black uppercase">Internal Only</Badge>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="h-9 bg-zinc-800 text-white border-none font-bold hover:bg-zinc-700 rounded-xl">
                            Actions <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuItem onClick={() => openEdit(row.original)}><Navigation className="w-4 h-4 mr-2" /> Adjust Point</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(row.original.website || '#', '_blank')} disabled={!row.original.website}><ExternalLink className="w-4 h-4 mr-2" /> Explore Site</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500" onClick={async () => {
                            if (confirm("Permanently archive this location?")) {
                                await deleteLocation(row.original.id);
                                setData(data.filter(d => d.id !== row.original.id));
                            }
                        }}><Trash2 className="w-4 h-4 mr-2" /> Decommission</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    const renderExpandedRow = (location: Location) => (
        <div className="py-8 px-8 bg-[#f8fafc] dark:bg-zinc-950/50 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-inner grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-3"><Compass className="w-4 h-4" /> Global Presence</h4>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border shadow-sm space-y-4">
                    <div>
                        <Label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Address (Greek)</Label>
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{location.addressEL || "—"}</p>
                        <p className="text-xs text-zinc-500">{location.zip} {location.cityEL}, {location.countryEL}</p>
                    </div>
                    {(location.addressEN || location.cityEN || location.countryEN) && (
                        <div>
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Address (English)</Label>
                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{location.addressEN || "—"}</p>
                            <p className="text-xs text-zinc-500">{[location.cityEN, location.countryEN].filter(Boolean).join(", ") || "—"}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-3"><Navigation className="w-4 h-4" /> Geolocation Data</h4>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border shadow-sm flex flex-col items-center justify-center text-center gap-3">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                        <MapPin className="w-8 h-8 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-mono text-zinc-400 uppercase">Latitude / Longitude</p>
                        <p className="text-lg font-black text-indigo-600 font-mono leading-none mt-1">{location.latitude}, {location.longitude}</p>
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-3"><Globe className="w-4 h-4" /> Digital Ecosystem</h4>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border shadow-sm space-y-4">
                    <p className="text-xs font-bold flex items-center gap-2"><Mail className="w-3 h-3 text-zinc-300" /> {location.email || 'no-email@point.com'}</p>
                    <p className="text-xs font-bold flex items-center gap-2"><Globe className="w-3 h-3 text-zinc-300" /> {location.website || 'corporate.web'}</p>
                    <Badge variant="outline" className="text-[10px] font-black bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg px-3 py-1 mt-2">Display Order: {location.order}</Badge>
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-4">
            <GenericDataTable
                columns={columns} data={data} searchPlaceholder="Locate branch name..." searchColumn="nameEL"
                onAddClick={() => openEdit()} addButtonLabel="Deploy New Point"
                renderExpandedRow={renderExpandedRow}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-xl">
                    <DialogHeader className="bg-zinc-800 p-10">
                        <DialogTitle className="text-3xl font-black text-white tracking-tighter flex items-center gap-3"><Map className="w-8 h-8 text-indigo-400" /> {editingLocation ? 'Modify Operational Node' : 'Initialize Geographic Node'}</DialogTitle>
                        <DialogDescription className="text-zinc-400 font-medium text-base">Configure spatial identity and digital coordination parameters for this location.</DialogDescription>
                    </DialogHeader>

                    <div className="p-10 bg-[#f8fafc] dark:bg-zinc-950 max-h-[70vh] overflow-y-auto scrollbar-hide">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-dashed border-indigo-200 shadow-sm text-center">
                                    <div className="w-24 h-24 rounded-3xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6 border shadow-inner">
                                        {formData.logo ? <img src={formData.logo} className="w-full h-full object-contain p-2" /> : <Home className="w-8 h-8 text-zinc-300" />}
                                    </div>
                                    <Label className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-800 px-6 text-[10px] font-black uppercase text-white cursor-pointer hover:bg-zinc-900 transition-all active:scale-95 shadow-lg">
                                        Upload Point Icon
                                        <input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e.target.files?.[0] || null)} />
                                    </Label>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border shadow-sm space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2 flex items-center gap-2"><Compass className="w-4 h-4" /> Spatial Intelligence</h4>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-zinc-400 uppercase">Geocode Resolution</Label>
                                        <div className="flex gap-2">
                                            <Input className="h-12 rounded-xl font-medium" value={geocodeQuery} onChange={e => setGeocodeQuery(e.target.value)} placeholder="Full address string..." />
                                            <Button disabled={isGeocoding} onClick={handleGeocode} className="h-12 bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg px-4">
                                                {isGeocoding ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Map className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black text-zinc-300 uppercase">Latitude</Label>
                                            <Input className="h-10 rounded-lg font-mono text-xs" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black text-zinc-300 uppercase">Longitude</Label>
                                            <Input className="h-10 rounded-lg font-mono text-xs" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Name (Greek) *</Label>
                                        <Input className="h-12 rounded-xl font-bold" value={formData.nameEL ?? ""} onChange={e => setFormData({ ...formData, nameEL: e.target.value })} placeholder="Περιοχή / Όνομα" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Name (English)</Label>
                                        <Input className="h-12 rounded-xl" value={formData.nameEN ?? ""} onChange={e => setFormData({ ...formData, nameEN: e.target.value })} placeholder="Location name" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Address (Greek)</Label>
                                        <Input className="h-12 rounded-xl" value={formData.addressEL ?? ""} onChange={e => setFormData({ ...formData, addressEL: e.target.value })} placeholder="Οδός, αριθμός" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Address (English)</Label>
                                        <Input className="h-12 rounded-xl" value={formData.addressEN ?? ""} onChange={e => setFormData({ ...formData, addressEN: e.target.value })} placeholder="Street, number" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">City (Greek)</Label>
                                        <Input className="h-10 rounded-xl" value={formData.cityEL ?? ""} onChange={e => setFormData({ ...formData, cityEL: e.target.value })} placeholder="Πόλη" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">City (English)</Label>
                                        <Input className="h-10 rounded-xl" value={formData.cityEN ?? ""} onChange={e => setFormData({ ...formData, cityEN: e.target.value })} placeholder="City" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Country (Greek)</Label>
                                        <Input className="h-10 rounded-xl" value={formData.countryEL ?? ""} onChange={e => setFormData({ ...formData, countryEL: e.target.value })} placeholder="Χώρα" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400">Country (English)</Label>
                                        <Input className="h-10 rounded-xl" value={formData.countryEN ?? ""} onChange={e => setFormData({ ...formData, countryEN: e.target.value })} placeholder="Country" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-zinc-400">Postal code</Label>
                                    <Input className="h-10 rounded-xl font-mono w-full max-w-[140px]" value={formData.zip ?? ""} onChange={e => setFormData({ ...formData, zip: e.target.value })} placeholder="TK" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-zinc-400">Contact Switchboard</Label>
                                    <Input className="h-12 rounded-xl" value={formData.phone ?? ""} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="flex items-center justify-between p-6 border rounded-[32px] bg-white dark:bg-zinc-900 mt-6">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-200">Broadcast Protocol</h4>
                                        <p className="text-[10px] text-zinc-400">Should this node be active on public maps?</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase transition-colors ${formData.published ? 'text-emerald-500' : 'text-zinc-300'}`}>{formData.published ? 'Live' : 'Off-grid'}</span>
                                        <Switch checked={formData.published} onCheckedChange={v => setFormData({ ...formData, published: v })} className="data-[state=checked]:bg-emerald-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 border-t bg-white dark:bg-zinc-950 flex justify-end gap-4">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-black text-xs uppercase tracking-[0.2em] text-zinc-400">Abort Mission</Button>
                        <Button disabled={isSaving} onClick={handleSave} className="bg-zinc-800 text-white font-black text-xs uppercase tracking-[0.2em] h-14 px-12 rounded-2xl shadow-xl hover:bg-zinc-900 transition-all active:scale-95">
                            {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Deploy Point Parameters"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
