import type { Metadata } from 'next';
import { getGalleryImages } from "@/app/lib/actions/gallery";
import GalleryClient from "@/components/gallery/GalleryClient";
import { getPageMeta } from "@/app/lib/actions/page-meta";
import { buildMetadata, lodgingBusinessSchema, buildFaqSchema, buildBreadcrumbSchema } from "@/lib/metadata";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://frogs.wwa.gr';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const pageMeta = await getPageMeta('gallery');
    return buildMetadata(pageMeta, { canonicalHint: '/gallery' });
}

export default async function GalleryPage() {
    const images = await getGalleryImages();
    const pageMeta = await getPageMeta('gallery');

    const faqQuestions = Array.isArray((pageMeta as any)?.faqSuggestions)
        ? (pageMeta as any).faqSuggestions as string[]
        : [];
    const faqSchema = buildFaqSchema(faqQuestions);
    const breadcrumb = buildBreadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Gallery', url: `${SITE_URL}/gallery` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingBusinessSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
            {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
            <GalleryClient initialImages={images} pageMeta={pageMeta} />
        </>
    );
}
