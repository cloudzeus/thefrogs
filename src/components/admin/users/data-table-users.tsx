"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Pencil, Trash2, MoreVertical, Shield, User } from "lucide-react";
import { GenericDataTable } from "@/components/admin/shared/generic-data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUser, updateUser, deleteUser } from "@/app/lib/actions/user";

type UserRow = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: Date;
};

const emptyForm = { name: "", email: "", password: "", role: "ADMIN" };

export function DataTableUsers({ data: initialData }: { data: UserRow[] }) {
    const [data, setData] = React.useState(initialData);
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<UserRow | null>(null);
    const [form, setForm] = React.useState(emptyForm);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => { setData(initialData); }, [initialData]);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
    const openEdit = (row: UserRow) => {
        setEditing(row);
        setForm({ name: row.name || "", email: row.email || "", password: "", role: row.role });
        setOpen(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (editing) {
                const updated = await updateUser(editing.id, form);
                setData(d => d.map(u => u.id === editing.id ? { ...u, ...updated } : u));
                toast.success("User updated");
            } else {
                if (!form.password) { toast.error("Password required"); return; }
                const created = await createUser(form);
                setData(d => [created, ...d]);
                toast.success("User created");
            }
            setOpen(false);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this user?")) return;
        await deleteUser(id);
        setData(d => d.filter(u => u.id !== id));
        toast.success("User deleted");
    };

    const columns: ColumnDef<UserRow>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-zinc-500" />
                    </div>
                    <span className="font-medium text-sm">{row.original.name || "—"}</span>
                </div>
            ),
        },
        { accessorKey: "email", header: "Email", cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.email}</span> },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => (
                <Badge variant={row.original.role === "ADMIN" ? "default" : "secondary"} className="gap-1">
                    <Shield className="w-3 h-3" />{row.original.role}
                </Badge>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => <span className="text-xs text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString("el-GR")}</span>,
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div className="flex items-center gap-1 justify-end">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={e => { e.stopPropagation(); openEdit(row.original); }}>
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={e => { e.stopPropagation(); handleDelete(row.original.id); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            ),
            enableHiding: false,
        },
    ];

    return (
        <>
            <GenericDataTable
                columns={columns}
                data={data}
                searchColumn="email"
                searchPlaceholder="Search by email..."
                onAddClick={openAdd}
                addButtonLabel="Add User"
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="rounded-3xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">{editing ? "Edit User" : "New User"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Name</Label>
                            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Email</Label>
                            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{editing ? "New Password (leave blank to keep)" : "Password"}</Label>
                            <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Role</Label>
                            <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                                    <SelectItem value="USER">USER</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSave} disabled={loading} className="rounded-xl">
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
