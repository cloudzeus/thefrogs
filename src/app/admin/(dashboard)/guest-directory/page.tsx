import { getGuestDirectories } from "@/app/lib/actions/guest-directory";
import { DataTableGuestDirectory } from "@/components/admin/guest-directory/data-table-guest-directory";

export default async function GuestDirectoryPage() {
    const items = await getGuestDirectories();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">Guest Directory</h1>
                <p className="text-sm text-zinc-500 mt-1">Manage the guest directory content with Greek and English translations.</p>
            </div>
            <DataTableGuestDirectory data={items} />
        </div>
    );
}
