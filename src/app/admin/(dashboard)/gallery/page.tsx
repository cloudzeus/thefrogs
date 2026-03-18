import { getGalleryImages } from "@/app/lib/actions/gallery";
import { DataTableGallery } from "@/components/admin/gallery/data-table-gallery";

export const dynamic = "force-dynamic";

export default async function GalleryAdminPage() {
    const images = await getGalleryImages();
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">Image Gallery</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Manage the hero gallery images, titles, and categories for the frontend site.
                </p>
            </div>
            <DataTableGallery initialImages={images} />
        </div>
    );
}
