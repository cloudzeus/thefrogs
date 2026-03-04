import { getMedia } from "@/app/lib/actions/media";
import { DataTableMedia } from "@/components/admin/media/data-table-media";

export default async function MediaPage() {
    const media = await getMedia();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">Media Gallery</h1>
                <p className="text-sm text-zinc-500 mt-1">Upload and manage all images and videos. Files are stored on Bunny CDN. Images are auto-converted to WebP.</p>
            </div>
            <DataTableMedia data={media} />
        </div>
    );
}
