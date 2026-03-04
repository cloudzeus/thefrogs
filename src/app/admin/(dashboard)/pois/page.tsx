import { getPois } from "@/app/lib/actions/poi";
import { DataTablePois } from "@/components/admin/pois/data-table-pois";

export const dynamic = "force-dynamic";

export default async function PoisPage() {
    const pois = await getPois();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">Points of Interest</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Manage Athens POIs — click any row to expand and manage images, visitor tips, visit info and nearby places.
                </p>
            </div>
            <DataTablePois data={pois} />
        </div>
    );
}
