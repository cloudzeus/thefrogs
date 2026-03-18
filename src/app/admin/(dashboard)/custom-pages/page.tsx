import { getCustomPages } from "@/app/lib/actions/custom-pages";
import { DataTableCustomPages } from "@/components/admin/custom-pages/data-table-custom-pages";

export const dynamic = "force-dynamic";

export default async function CustomPagesAdminPage() {
    const pages = await getCustomPages();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">Custom Pages</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Create dynamic pages with drag-and-drop text and gallery blocks.
                </p>
            </div>
            <DataTableCustomPages initialData={pages} />
        </div>
    );
}
