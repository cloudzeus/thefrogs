import { getGalleryImages } from "@/app/lib/actions/gallery";
import { DataTableGallery } from "@/components/admin/gallery/data-table-gallery";

export const dynamic = "force-dynamic";

export default async function GalleryAdminPage() {
    const images = await getGalleryImages();
    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Image Gallery</h1>
                <p className="text-muted-foreground mt-2">
                    Manage the hero gallery images, titles, and categories for the frontend site.
                </p>
            </div>
            <DataTableGallery initialImages={images} />
        </div>
    );
}
