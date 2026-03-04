import { getHomeSections } from "@/app/lib/actions/home-sections";
import { DataTableHomeSections } from "@/components/admin/homepage/data-table-homepage";

export const dynamic = "force-dynamic";

export default async function HomepageAdminPage() {
    const data = await getHomeSections();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black tracking-tight">Homepage Sections</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage every section of the homepage — bilingual content, hero images, CTAs, and structured extras (opening hours, amenity lists, stats, etc.).
                    Drag rows to reorder. Toggle the switch to show/hide a section.
                </p>
            </div>
            <DataTableHomeSections data={JSON.parse(JSON.stringify(data))} />
        </div>
    );
}
