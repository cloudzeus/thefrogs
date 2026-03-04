import { getPageMetas } from "@/app/lib/actions/page-meta";
import { DataTablePages } from "@/components/admin/pages/data-table-pages";

export const dynamic = "force-dynamic";

export default async function PagesAdminPage() {
    const data = await getPageMetas();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black tracking-tight">Page Content & SEO</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage hero images, bilingual content, and SEO metadata for each page. Use the AI button to auto-generate meta titles, descriptions, and keywords with DeepSeek.
                </p>
            </div>
            <DataTablePages data={JSON.parse(JSON.stringify(data))} />
        </div>
    );
}
