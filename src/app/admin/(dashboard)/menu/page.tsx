import { getMenuLinks } from "@/app/lib/actions/menu";
import { DataTableMenu } from "@/components/admin/menu/data-table-menu";

export const dynamic = "force-dynamic";

export default async function MenuAdminPage() {
    const links = await getMenuLinks();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">Main Menu</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Manage the main navigation menu items. Drag and drop to reorder. Legal pages are managed separately and appear in the footer.
                </p>
            </div>
            <DataTableMenu initialData={links} />
        </div>
    );
}
