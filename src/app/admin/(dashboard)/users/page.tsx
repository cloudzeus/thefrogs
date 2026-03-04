import { getUsers } from "@/app/lib/actions/user";
import { DataTableUsers } from "@/components/admin/users/data-table-users";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">Users</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage admin users who can access the dashboard.</p>
      </div>
      <DataTableUsers data={users} />
    </div>
  );
}
