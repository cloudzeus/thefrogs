import { getGalleryImages } from "@/app/lib/actions/gallery";
import GalleryClient from "@/components/gallery/GalleryClient";
import { getPageMeta } from "@/app/lib/actions/page-meta";

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
    const images = await getGalleryImages();
    const pageMeta = await getPageMeta("gallery");

    return <GalleryClient initialImages={images} pageMeta={pageMeta} />;
}
