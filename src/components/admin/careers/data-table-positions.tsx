"use client";

import * as React from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import {
    GripVertical,
    Plus,
    ChevronDown,
    RefreshCcw,
    Wand2,
    X,
    Users,
    Mail,
    Phone,
    FileText,
    Calendar,
    Edit,
    Trash2,
    Briefcase,
    MapPin,
    Clock,
    Sparkles,
    CheckCircle2,
    Target,
    Zap,
    ExternalLink,
    FileSpreadsheet,
    UserCheck,
    UserX,
    Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPosition, updatePosition, deletePosition, updatePositionOrder, updateCvStatus, deleteCvApplication } from "@/app/lib/actions/career";
import { GenericDataTable } from "../shared/generic-data-table";

type CvApplication = {
    id: string; firstName: string; lastName: string; phone?: string | null;
    email: string; cvUrl: string; coverLetter?: string | null;
    status: string; createdAt: Date;
};

type Position = {
    id: string; slug: string;
    titleEL: string; titleEN?: string | null;
    descriptionEL?: string | null; descriptionEN?: string | null;
    departmentEL?: string | null; departmentEN?: string | null;
    cityEL?: string | null; cityEN?: string | null;
    typeEL?: string | null; typeEN?: string | null;
    dutiesEL?: any | null; dutiesEN?: any | null;
    skillsEL?: any | null; skillsEN?: any | null;
    published: boolean; order: number;
    _count?: { applications: number };
    applications: CvApplication[];
};

const EMPTY = {
    titleEL: "", titleEN: "", descriptionEL: "", descriptionEN: "",
    departmentEL: "", departmentEN: "", cityEL: "", cityEN: "",
    typeEL: "", typeEN: "",
    dutiesEL: [] as string[], dutiesEN: [] as string[],
    skillsEL: [] as string[], skillsEN: [] as string[],
    published: true, order: 0, slug: "",
};

const CV_STATUS_COLORS: Record<string, string> = {
    NEW: "bg-blue-500/10 text-blue-500",
    REVIEWED: "bg-zinc-500/10 text-zinc-500",
    SHORTLISTED: "bg-emerald-500/10 text-emerald-500",
    REJECTED: "bg-red-500/10 text-red-500",
};

function ArrayInput({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (v: string[]) => void, placeholder?: string }) {
    const [draft, setDraft] = React.useState("");
    return (
        <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</Label>
            <div className="flex gap-2">
                <Input className="h-12 rounded-xl text-sm font-medium border-zinc-200" value={draft} placeholder={placeholder || "Add item..."}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { onChange([...values, draft.trim()]); setDraft(""); e.preventDefault(); } }} />
                <Button size="icon" className="h-12 w-12 rounded-xl bg-zinc-800 text-white" onClick={() => { if (draft.trim()) { onChange([...values, draft.trim()]); setDraft(""); } }}><Plus className="w-5 h-5" /></Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
                {values.map((v, i) => (
                    <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-none flex items-center gap-2 group transition-all hover:bg-red-50 hover:text-red-600">
                        <span className="text-[10px] font-bold">{v}</span>
                        <button onClick={() => onChange(values.filter((_, j) => j !== i))} className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-red-200 transition-colors"><X className="w-3 h-3" /></button>
                    </Badge>
                ))}
            </div>
        </div>
    );
}

export function DataTablePositions({ data: init }: { data: Position[] }) {
    const [data, setData] = React.useState<Position[]>(init || []);
    const [isMounted, setIsMounted] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<Position | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [translating, setTranslating] = React.useState(false);
    const [form, setForm] = React.useState({ ...EMPTY });

    React.useEffect(() => { setIsMounted(true); }, []);

    const openEdit = (item?: Position) => {
        if (item) {
            setEditing(item);
            setForm({
                titleEL: item.titleEL || "", titleEN: item.titleEN || "",
                descriptionEL: item.descriptionEL || "", descriptionEN: item.descriptionEN || "",
                departmentEL: item.departmentEL || "", departmentEN: item.departmentEN || "",
                cityEL: item.cityEL || "", cityEN: item.cityEN || "",
                typeEL: item.typeEL || "", typeEN: item.typeEN || "",
                dutiesEL: (item.dutiesEL as string[]) || [], dutiesEN: (item.dutiesEN as string[]) || [],
                skillsEL: (item.skillsEL as string[]) || [], skillsEN: (item.skillsEN as string[]) || [],
                published: item.published, order: item.order, slug: item.slug,
            });
        } else {
            setEditing(null);
            setForm({ ...EMPTY, order: data.length });
        }
        setOpen(true);
    };

    const handleSave = async () => {
        if (!form.titleEL.trim()) return toast.error("Position title is required");
        setSaving(true);
        try {
            const slug = form.slug || form.titleEL.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
            const payload = { ...form, slug, order: Number(form.order) };
            if (editing) {
                const updated = await updatePosition(editing.id, payload);
                setData(prev => prev.map(d => d.id === editing.id ? { ...d, ...updated } : d));
                toast.success("Talent funnel updated");
            } else {
                const created = await createPosition(payload);
                setData(prev => [...prev, { ...(created as any), applications: [] }]);
                toast.success("New hiring channel opened");
            }
            setOpen(false);
        } catch (e: any) { toast.error(e.message); }
        finally { setSaving(false); }
    };

    const handleReorder = async (newData: Position[]) => {
        setData(newData);
        try { await updatePositionOrder(newData.map(d => d.id)); toast.success("Talent hierarchy synchronized"); }
        catch { toast.error("Sync failed"); }
    };

    const runAiTranslation = async () => {
        setTranslating(true);
        const tid = toast.loading("AI is localizing position requirements...");
        try {
            const res = await fetch("/api/admin/translate", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: JSON.stringify({
                        title: form.titleEL, desc: form.descriptionEL, dept: form.departmentEL, city: form.cityEL, type: form.typeEL,
                        duties: form.dutiesEL, skills: form.skillsEL
                    }), targetLang: "English"
                }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error);
            const parsed = JSON.parse(d.translated);
            setForm(prev => ({
                ...prev, titleEN: parsed.title, descriptionEN: parsed.desc, departmentEN: parsed.dept, cityEN: parsed.city, typeEN: parsed.type,
                dutiesEN: parsed.duties, skillsEN: parsed.skills
            }));
            toast.success("Localized Intelligence Ready", { id: tid });
        } catch (e: any) { toast.error(e.message, { id: tid }); }
        finally { setTranslating(false); }
    };

    const columns: ColumnDef<Position>[] = [
        { id: "drag", header: "", cell: () => <GripVertical className="h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />, size: 40 },
        {
            accessorKey: "titleEL",
            header: "Talent Channel",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{row.original.titleEL}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{row.original.departmentEL || 'General'}</span>
                        <div className="w-1 h-1 rounded-full bg-zinc-200" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{row.original.cityEL || 'Remote'}</span>
                    </div>
                </div>
            )
        },
        {
            id: "yield",
            header: "Applied Yield",
            cell: ({ row }) => {
                const count = row.original._count?.applications ?? row.original.applications?.length ?? 0;
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[...Array(Math.min(count, 3))].map((_, i) => <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 flex items-center justify-center"><Users className="w-3 h-3 text-zinc-400" /></div>)}
                        </div>
                        <span className="text-xs font-black text-zinc-500">{count} profiles</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "published",
            header: "Funnel Status",
            cell: ({ row }) => row.original.published ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">Active Hiring</Badge>
            ) : (
                <Badge variant="outline" className="text-zinc-300 border-zinc-200 text-[10px] font-black uppercase tracking-widest px-3 py-1">Halt Operation</Badge>
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
                        <DropdownMenuItem onClick={() => openEdit(row.original)}><Edit className="w-4 h-4 mr-2" /> Modify Scope</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/careers/${row.original.slug}`, '_blank')}><ExternalLink className="w-4 h-4 mr-2" /> Live Listing</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { if (confirm("Terminate this channel?")) deletePosition(row.original.id).then(() => setData(d => d.filter(x => x.id !== row.original.id))) }} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" /> Delete Channel</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    if (!isMounted) return null;

    return (
        <div className="space-y-4">
            <GenericDataTable
                columns={columns} data={data} searchPlaceholder="Locate talent channel..." searchColumn="titleEL"
                onAddClick={() => openEdit()} addButtonLabel="Open Position"
                isSortable={true} onReorder={handleReorder}
                renderExpandedRow={(item) => (
                    <div className="py-10 px-8 bg-[#f8fafc] dark:bg-zinc-950/50 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-inner">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h4 className="text-2xl font-black text-zinc-800 dark:text-zinc-200 tracking-tighter">Candidate Inbound Protocol</h4>
                                <p className="text-xs text-zinc-400 font-medium">Screening {item.applications?.length || 0} active talent profiles for {item.titleEL}.</p>
                            </div>
                            <div className="flex gap-2">
                                <Badge className="bg-indigo-500 text-white border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest">{item.typeEL || 'Full Time'}</Badge>
                                <Badge variant="outline" className="border-zinc-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest">{item.cityEL || 'Headquarters'}</Badge>
                            </div>
                        </div>
                        <CvApplicationsPanel applications={item.applications || []} positionTitle={item.titleEL} />
                    </div>
                )}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-xl">
                    <DialogHeader className="bg-zinc-800 p-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-3xl font-black text-white tracking-tighter mb-2">{editing ? "Refine Hiring Scope" : "Initialize Talent Search"}</DialogTitle>
                                <DialogDescription className="text-zinc-400 font-medium">Configure position requirements and procedural skills mapping.</DialogDescription>
                            </div>
                            <Button size="lg" onClick={runAiTranslation} disabled={translating} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] px-10 rounded-2xl h-14 shadow-xl shadow-indigo-600/20">
                                {translating ? <RefreshCcw className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />} Global Sync
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="p-10 bg-[#f8fafc] dark:bg-zinc-950 max-h-[70vh] overflow-y-auto scrollbar-hide">
                        <Tabs defaultValue="greek">
                            <TabsList className="bg-zinc-200/50 dark:bg-zinc-800/50 p-1.5 h-12 rounded-[24px] mb-10 w-fit gap-2 border">
                                <TabsTrigger value="greek" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl">🇬🇷 Recruitment (GR)</TabsTrigger>
                                <TabsTrigger value="english" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl">🇬🇧 Localization (EN)</TabsTrigger>
                                <TabsTrigger value="governance" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl">⚖️ Governance</TabsTrigger>
                            </TabsList>

                            <TabsContent value="greek" className="space-y-8 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Position Identity</Label>
                                        <Input className="h-14 rounded-2xl text-lg font-bold border-zinc-200 shadow-sm" placeholder="Marketing Director..." value={form.titleEL} onChange={e => setForm({ ...form, titleEL: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-zinc-400">Department</Label>
                                            <Input className="h-12 rounded-xl border-zinc-200" value={form.departmentEL} onChange={e => setForm({ ...form, departmentEL: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-zinc-400">City</Label>
                                            <Input className="h-12 rounded-xl border-zinc-200" value={form.cityEL} onChange={e => setForm({ ...form, cityEL: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-zinc-400">Type</Label>
                                            <Input className="h-12 rounded-xl border-zinc-200" value={form.typeEL} onChange={e => setForm({ ...form, typeEL: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Strategic Description</Label>
                                    <Textarea rows={6} className="rounded-[32px] border-zinc-200 shadow-sm p-8 text-sm leading-relaxed" placeholder="Outline the organizational impact..." value={form.descriptionEL} onChange={e => setForm({ ...form, descriptionEL: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-10 pt-4">
                                    <ArrayInput label="Operational Duties" values={form.dutiesEL} onChange={v => setForm({ ...form, dutiesEL: v })} placeholder="Insert duty..." />
                                    <ArrayInput label="Technical Benchmarks" values={form.skillsEL} onChange={v => setForm({ ...form, skillsEL: v })} placeholder="Insert skill..." />
                                </div>
                            </TabsContent>

                            <TabsContent value="english" className="space-y-8 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Global Position Identity</Label>
                                        <Input className="h-14 rounded-2xl text-lg font-bold border-zinc-200 shadow-sm" value={form.titleEN || ''} onChange={e => setForm({ ...form, titleEN: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-zinc-400">Dept (EN)</Label>
                                            <Input className="h-12 rounded-xl border-zinc-200" value={form.departmentEN || ''} onChange={e => setForm({ ...form, departmentEN: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-zinc-400">City (EN)</Label>
                                            <Input className="h-12 rounded-xl border-zinc-200" value={form.cityEN || ''} onChange={e => setForm({ ...form, cityEN: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-zinc-400">Type (EN)</Label>
                                            <Input className="h-12 rounded-xl border-zinc-200" value={form.typeEN || ''} onChange={e => setForm({ ...form, typeEN: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Global Description</Label>
                                    <Textarea rows={6} className="rounded-[32px] border-zinc-200 shadow-sm p-8 text-sm leading-relaxed" value={form.descriptionEN || ''} onChange={e => setForm({ ...form, descriptionEN: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-10 pt-4">
                                    <ArrayInput label="Operational Duties (Global)" values={form.dutiesEN} onChange={v => setForm({ ...form, dutiesEN: v })} />
                                    <ArrayInput label="Technical Benchmarks (Global)" values={form.skillsEN} onChange={v => setForm({ ...form, skillsEN: v })} />
                                </div>
                            </TabsContent>

                            <TabsContent value="governance" className="space-y-8 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">System Link (Slug)</Label>
                                        <Input className="h-14 rounded-2xl border-zinc-200 font-mono text-xs text-indigo-600 shadow-sm" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Selection Hierarchy (Order)</Label>
                                        <Input type="number" className="h-14 rounded-2xl border-zinc-200 font-bold shadow-sm" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-10 rounded-[40px] border shadow-sm flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black uppercase text-zinc-800 dark:text-zinc-200 tracking-tighter">Availability Signal</h4>
                                        <p className="text-[10px] text-zinc-400 font-medium">Broadcast this position to the public talent market.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${form.published ? 'text-emerald-500' : 'text-zinc-300'}`}>{form.published ? 'Live Listing' : 'Internal Pipeline'}</span>
                                        <Switch checked={form.published} onCheckedChange={v => setForm({ ...form, published: v })} className="data-[state=checked]:bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="p-10 border-t bg-white dark:bg-zinc-950 flex justify-end gap-4 rounded-b-[40px]">
                        <Button variant="ghost" onClick={() => setOpen(false)} className="font-black text-xs uppercase tracking-[0.2em] text-zinc-400">Abort Operation</Button>
                        <Button disabled={saving} onClick={handleSave} className="bg-zinc-800 text-white font-black text-xs uppercase tracking-[0.2em] h-14 px-12 rounded-[20px] shadow-2xl hover:bg-zinc-900 transition-all active:scale-95">
                            {saving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Deploy Channel"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function CvApplicationsPanel({ applications: init, positionTitle }: { applications: CvApplication[]; positionTitle: string }) {
    const [apps, setApps] = React.useState(init);
    if (apps.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-[32px] bg-white dark:bg-zinc-900/50">
            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4"><Search className="w-8 h-8 text-zinc-200" /></div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-300 italic">Potential talent not yet detected</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 gap-4">
            {apps.map(app => (
                <div key={app.id} className="group bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-wrap items-center gap-8">
                    <div className="w-16 h-16 rounded-[20px] bg-zinc-800 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:bg-indigo-600 transition-colors">
                        {app.firstName[0]}{app.lastName[0]}
                    </div>

                    <div className="flex-1 min-w-[200px] space-y-1">
                        <h5 className="text-xl font-black text-zinc-800 dark:text-zinc-100 tracking-tighter">{app.firstName} {app.lastName}</h5>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                            <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {app.email}</span>
                            {app.phone && <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {app.phone}</span>}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-300 uppercase italic tracking-widest"><Calendar className="w-3.5 h-3.5" /> {new Date(app.createdAt).toLocaleDateString()}</div>
                        <Badge className={`${CV_STATUS_COLORS[app.status] || "bg-zinc-100"} border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full`}>{app.status}</Badge>
                    </div>

                    <div className="flex items-center gap-2 pl-6 border-l border-zinc-100">
                        <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl border-zinc-200 text-zinc-600 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all flex items-center gap-2" onClick={() => window.open(app.cvUrl, "_blank")}>
                            <FileSpreadsheet className="w-5 h-5 text-indigo-500" /> Retrieve CV
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-all"><ChevronDown className="w-5 h-5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px] rounded-2xl shadow-2xl p-2 border-zinc-100">
                                <div className="px-3 py-2 text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">State Transition</div>
                                {["REVIEWED", "SHORTLISTED", "REJECTED"].map(s => (
                                    <DropdownMenuItem key={s} className="h-12 rounded-xl flex items-center gap-3 cursor-pointer" onClick={async () => {
                                        await updateCvStatus(app.id, s);
                                        setApps(prev => prev.map(a => a.id === app.id ? { ...a, status: s } : a));
                                        toast.success(`Candidate status: ${s}`);
                                    }}>
                                        <div className={`w-2 h-2 rounded-full ${CV_STATUS_COLORS[s]?.split(' ')[1] || 'bg-zinc-300'}`} />
                                        <span className="font-bold text-xs">Mark {s}</span>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="h-12 rounded-xl text-red-500 focus:bg-red-50 focus:text-red-600 flex items-center gap-3 cursor-pointer" onClick={async () => {
                                    if (!confirm("Remove application?")) return;
                                    await deleteCvApplication(app.id);
                                    setApps(prev => prev.filter(prevApp => prevApp.id !== app.id));
                                    toast.success("Profile purged");
                                }}>
                                    <UserX className="w-4 h-4" /> <span className="font-bold text-xs">Purge Profile</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            ))}
        </div>
    );
}
