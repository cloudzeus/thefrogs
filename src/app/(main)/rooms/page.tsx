import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import RoomsClient from '@/components/rooms/RoomsClient';
import { getPageMeta } from '@/app/lib/actions/page-meta';
import { buildMetadata, lodgingBusinessSchema, buildFaqSchema, buildBreadcrumbSchema } from '@/lib/metadata';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://frogs.wwa.gr';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const pageMeta = await getPageMeta('rooms');
    return buildMetadata(pageMeta, { canonicalHint: '/rooms' });
}

export default async function RoomsPage() {
    const rooms = await prisma.room.findMany({
        where: { published: true },
        include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
            amenities: { orderBy: { order: 'asc' } },
            facilities: { orderBy: { order: 'asc' } },
        },
        orderBy: { order: 'asc' },
    });

    const pageMeta = await getPageMeta('rooms');
    const faqQuestions = Array.isArray((pageMeta as any)?.faqSuggestions)
        ? (pageMeta as any).faqSuggestions as string[]
        : [];
    const faqSchema = buildFaqSchema(faqQuestions);
    const breadcrumb = buildBreadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Rooms', url: `${SITE_URL}/rooms` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingBusinessSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
            {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
            <RoomsClient rooms={JSON.parse(JSON.stringify(rooms))} pageMeta={pageMeta} />
        </>
    );
}
