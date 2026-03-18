import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import AthensClient from '@/components/athens/AthensClient';
import { getPageMeta } from '@/app/lib/actions/page-meta';
import { buildMetadata, lodgingBusinessSchema, buildFaqSchema, buildBreadcrumbSchema } from '@/lib/metadata';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://frogs.wwa.gr';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const pageMeta = await getPageMeta('athens');
    return buildMetadata(pageMeta, { canonicalHint: '/athens' });
}

export default async function AthensPage() {
    const pageMeta = await getPageMeta('athens');
    const pois = await prisma.poi.findMany({
        orderBy: { order: 'asc' },
        select: {
            id: true, slug: true, category: true, tags: true,
            titleEL: true, titleEN: true,
            subtitleEL: true, subtitleEN: true,
            shortDescriptionEL: true, shortDescriptionEN: true,
            featuredImage: true,
            media: { where: { type: 'IMAGE' }, orderBy: [{ isHero: 'desc' }, { order: 'asc' }], take: 1, select: { url: true, isHero: true } },
            visitInfo: { select: { distance: true, duration: true, price: true } },
        },
    });

    const faqQuestions = Array.isArray((pageMeta as any)?.faqSuggestions)
        ? (pageMeta as any).faqSuggestions as string[]
        : [];
    const faqSchema = buildFaqSchema(faqQuestions);
    const breadcrumb = buildBreadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Athens', url: `${SITE_URL}/athens` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingBusinessSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
            {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
            <AthensClient pois={JSON.parse(JSON.stringify(pois))} pageMeta={JSON.parse(JSON.stringify(pageMeta))} />
        </>
    );
}
