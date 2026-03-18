import { getDirectoryItems } from "@/app/lib/actions/directory";
import { DataTableDirectory } from "@/components/admin/guest-directory/data-table-guest-directory";

export default async function GuestDirectoryPage() {
    const items = await getDirectoryItems();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">
                    Guest Directory
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Manage guest directory entries — icon, bilingual title, and description. Drag to reorder.
                </p>
            </div>
            <DataTableDirectory data={items} />
        </div>
    );
}
