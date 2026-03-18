import { getMenuLinks } from "@/app/lib/actions/menu";
import { getPageMetas } from "@/app/lib/actions/page-meta";
import { getCustomPages } from "@/app/lib/actions/custom-pages";
import { DataTableMenu } from "@/components/admin/menu/data-table-menu";

export const dynamic = "force-dynamic";

export default async function MenuAdminPage() {
    const links = await getMenuLinks();
    const pageMetas = await getPageMetas();
    const customPages = await getCustomPages();

    const standardPages = pageMetas.map((p: any) => ({
      type: "Standard" as const,
      labelEL: p.titleEL,
      labelEN: p.titleEN || p.titleEL,
      href: p.slug === "home" ? "/" : `/${p.slug}`,
    }));

    const dynamicPages = customPages.map((p: any) => ({
      type: "Custom" as const,
      labelEL: p.titleEL,
      labelEN: p.titleEN || p.titleEL,
      href: `/${p.slug}`,
    }));

    const availablePages = [...standardPages, ...dynamicPages];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">Main Menu</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Manage the main navigation menu items. Drag and drop to reorder. Legal pages are managed separately and appear in the footer.
                </p>
            </div>
            <DataTableMenu initialData={links} availablePages={availablePages} />
        </div>
    );
}
