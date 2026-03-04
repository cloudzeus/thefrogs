"use client";

import dynamic from "next/dynamic";

const DataTableEuPrograms = dynamic(
    () => import("@/components/admin/eu-programs/data-table-eu-programs").then((mod) => mod.DataTableEuPrograms),
    { ssr: false }
);

export function EuProgramsClient({ data }: { data: any[] }) {
    return <DataTableEuPrograms data={data} />;
}
