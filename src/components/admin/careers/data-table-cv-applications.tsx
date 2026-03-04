"use client";

import * as React from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import {
    ExternalLink,
    ChevronDown,
    Trash2,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    UserCheck,
    UserX,
    FileSpreadsheet,
    FileText,
    ArrowUpDown,
    CheckCircle2,
    AlertCircle,
    Clock,
    Search,
    UserCircle,
    Plus,
    X,
    RefreshCcw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { updateCvStatus, deleteCvApplication } from "@/app/lib/actions/career";
import { GenericDataTable } from "../shared/generic-data-table";

const STATUS_COLORS: Record<string, string> = {
    NEW: "bg-blue-500/10 text-blue-500",
    REVIEWED: "bg-zinc-500/10 text-zinc-500",
    SHORTLISTED: "bg-emerald-500/10 text-emerald-600",
    REJECTED: "bg-red-500/10 text-red-500",
};

export function DataTableCvApplications({ data: init }: { data: any[] }) {
    const [data, setData] = React.useState(init || []);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => { setIsMounted(true); }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Purge applicant profile?")) return;
        try {
            await deleteCvApplication(id);
            setData((prev: any[]) => prev.filter(d => d.id !== id));
            toast.success("Identity record decommissioned");
        } catch (e: any) { toast.error(e.message); }
    };

    const columns: ColumnDef<any>[] = [
        {
            id: "firstName",
            accessorKey: "firstName",
            header: () => null,
            cell: () => null,
            enableHiding: false,
        },
        {
            id: "identity",
            header: "Applicant Identity",
            cell: ({ row }) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                        {row.original.firstName[0]}{row.original.lastName[0]}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{row.original.firstName} {row.original.lastName}</span>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">
                            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {row.original.email}</span>
                            {row.original.phone && (
                                <>
                                    <div className="w-1 h-1 rounded-full bg-zinc-200" />
                                    <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {row.original.phone}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "position",
            header: "Target Stream",
            cell: ({ row }) => (
                <div className="flex items-center gap-2.5">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {row.original.position?.titleEL || <span className="text-[10px] italic font-black text-zinc-300 uppercase tracking-widest">General Inbound</span>}
                    </span>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Lifecycle State",
            cell: ({ row }) => (
                <Badge className={`${STATUS_COLORS[row.original.status] || "bg-zinc-100"} border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full`}>
                    {row.original.status}
                </Badge>
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
                    <DropdownMenuContent align="end" className="w-[220px] rounded-2xl shadow-2xl p-2 border-zinc-100">
                        <DropdownMenuItem className="h-12 rounded-xl flex items-center gap-3 cursor-pointer" onClick={() => window.open(row.original.cvUrl, "_blank")}>
                            <FileSpreadsheet className="w-4 h-4 text-indigo-500" /> <span className="font-bold text-xs uppercase tracking-widest">Retrieve CV Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <div className="px-3 py-2 text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">State Transition</div>
                        {["REVIEWED", "SHORTLISTED", "REJECTED"].map(s => (
                            <DropdownMenuItem key={s} className="h-12 rounded-xl flex items-center gap-3 cursor-pointer" onClick={async () => {
                                await updateCvStatus(row.original.id, s);
                                setData((prev: any[]) => prev.map(d => d.id === row.original.id ? { ...d, status: s } : d));
                                toast.success(`Lifecycle updated: ${s}`);
                            }}>
                                <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[s]?.split(' ')[1] || 'bg-zinc-300'}`} />
                                <span className="font-bold text-xs">Mark {s}</span>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="h-12 rounded-xl text-red-500 focus:bg-red-50 focus:text-red-600 flex items-center gap-3 cursor-pointer">
                            <UserX className="w-4 h-4" /> <span className="font-bold text-xs uppercase tracking-widest">Terminate Record</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    if (!isMounted) return null;

    return (
        <div className="space-y-4">
            <GenericDataTable
                columns={columns}
                data={data}
                searchPlaceholder="Locate talent profile by identity..."
                searchColumn="firstName"
                initialColumnVisibility={{ firstName: false }}
                renderExpandedRow={(item) => (
                    <div className="py-10 px-10 bg-[#f8fafc] dark:bg-zinc-950/50 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-3"><UserCircle className="w-4 h-4" /> Identity Intelligence</h4>
                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border shadow-sm space-y-4">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-zinc-800 flex items-center justify-center text-white font-black text-2xl shadow-xl">
                                        {item.firstName[0]}{item.lastName[0]}
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tighter">{item.firstName} {item.lastName}</h5>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`${STATUS_COLORS[item.status] || "bg-zinc-100"} border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full`}>{item.status}</Badge>
                                            <span className="text-[10px] font-bold text-zinc-400 italic">verified submission</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-zinc-100 flex flex-wrap gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-zinc-300 tracking-widest">Deployment Email</p>
                                        <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{item.email}</p>
                                    </div>
                                    {item.phone && (
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-zinc-300 tracking-widest">Secure Line</p>
                                            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{item.phone}</p>
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-zinc-300 tracking-widest">Entry Date</p>
                                        <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-3"><FileText className="w-4 h-4" /> Strategic Narrative</h4>
                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border shadow-sm min-h-[160px] flex flex-col justify-between">
                                <p className="text-sm font-medium leading-[1.8] text-zinc-500 dark:text-zinc-400 italic">
                                    {item.coverLetter ? `"${item.coverLetter}"` : "No cover narrative provided for this applicant profile."}
                                </p>
                                <div className="pt-8 flex justify-end">
                                    <Button variant="outline" className="h-14 rounded-2xl border-zinc-200 text-zinc-600 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all flex items-center gap-2 px-10 shadow-sm" onClick={() => window.open(item.cvUrl, "_blank")}>
                                        <FileSpreadsheet className="w-5 h-5 text-indigo-500" /> Execute CV Retrieval
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            />
        </div>
    );
}
