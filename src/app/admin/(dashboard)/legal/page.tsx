import { getLegalPages } from "@/app/lib/actions/legal";
import { DataTableLegal } from "@/components/admin/legal/data-table-legal";

export default async function LegalPagesAdminPage() {
    const pages = await getLegalPages();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">
                    Legal Pages
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Manage Privacy Policy, Terms & Conditions, and Cookie Policy — with bilingual rich text content.
                </p>
            </div>
            <DataTableLegal data={pages} />
        </div>
    );
}
