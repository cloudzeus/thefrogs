import prisma from '@/lib/prisma';
import AthensDetailClient from '@/components/athens/AthensDetailClient';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const pois = await prisma.poi.findMany({ select: { slug: true } });
    return pois.map((p: { slug: string }) => ({ sightId: p.slug }));
}

export default async function AthensDetailPage({
    params,
}: {
    params: Promise<{ sightId: string }>;
}) {
    const { sightId } = await params;

    const poi = await prisma.poi.findUnique({
        where: { slug: sightId },
        include: {
            media: { orderBy: { order: 'asc' } },
            visitorTips: { orderBy: { order: 'asc' } },
            visitInfo: true,
            nearby: { orderBy: { order: 'asc' } },
        },
    });

    if (!poi) notFound();

    const relatedPois = await prisma.poi.findMany({
        where: { slug: { not: sightId } },
        select: { slug: true, titleEN: true, titleEL: true, featuredImage: true, media: { where: { type: 'IMAGE' }, orderBy: [{ isHero: 'desc' }, { order: 'asc' }], take: 1 } },
        orderBy: { order: 'asc' },
        take: 3,
    });

    return (
        <AthensDetailClient
            poi={JSON.parse(JSON.stringify(poi))}
            relatedPois={JSON.parse(JSON.stringify(relatedPois))}
        />
    );
}
