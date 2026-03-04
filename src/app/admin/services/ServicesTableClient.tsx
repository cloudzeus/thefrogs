"use client"

import dynamic from "next/dynamic"
import { ServiceWithRelations, ServiceCategoryWithCount } from "@/app/lib/types/service"

const ServicesTable = dynamic(
    () => import("@/components/admin/services/services-table").then(m => m.ServicesTable),
    { ssr: false, loading: () => <div className="h-96 flex items-center justify-center">Loading services...</div> }
)

export function ServicesTableClient({
    initialServices,
    categories
}: {
    initialServices: ServiceWithRelations[],
    categories: ServiceCategoryWithCount[]
}) {
    return (
        <ServicesTable
            initialData={initialServices}
            categories={categories}
        />
    )
}
