"use client"

import dynamic from "next/dynamic"
import type { PeriferiaType } from "@/components/admin/eu-programs/data-table-periferies"

// ssr:false here (inside a Client Component) prevents Radix DropdownMenu IDs
// from being generated on the server, eliminating the hydration mismatch cascade.
const DataTablePeriferies = dynamic(
    () => import("@/components/admin/eu-programs/data-table-periferies").then(m => m.DataTablePeriferies),
    {
        ssr: false,
        loading: () => (
            <div className="h-96 flex items-center justify-center text-muted-foreground text-sm">
                Loading regions...
            </div>
        ),
    }
)

export function PeriferiasTableClient({ data }: { data: PeriferiaType[] }) {
    return <DataTablePeriferies data={data} />
}
