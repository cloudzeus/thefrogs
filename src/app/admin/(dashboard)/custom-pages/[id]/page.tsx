import { getCustomPage } from "@/app/lib/actions/custom-pages";
import { notFound } from "next/navigation";
import { CustomPageEditor } from "@/components/admin/custom-pages/custom-page-editor";

export const dynamic = "force-dynamic";

export default async function EditCustomPageAdminPage({ params }: { params: Promise<{ id: string }> }) {
    const p = await params;
    const page = await getCustomPage(p.id);
    if (!page) return notFound();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">Edit Page: {page.titleEL}</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Manage the structure and content of this page using blocks.
                </p>
            </div>
            <CustomPageEditor initialPage={page} />
        </div>
    );
}
