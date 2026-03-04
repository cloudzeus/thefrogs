import prisma from '@/lib/prisma';
import AthensClient from '@/components/athens/AthensClient';
import { getPageMeta } from '@/app/lib/actions/page-meta';

export const dynamic = "force-dynamic";

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

    return <AthensClient pois={JSON.parse(JSON.stringify(pois))} pageMeta={JSON.parse(JSON.stringify(pageMeta))} />;
}
