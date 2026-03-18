import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import AthensDetailClient from '@/components/athens/AthensDetailClient';
import { notFound } from 'next/navigation';
import { buildMetadata, lodgingBusinessSchema, buildFaqSchema, buildBreadcrumbSchema } from '@/lib/metadata';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://frogs.wwa.gr';

export async function generateStaticParams() {
    const pois = await prisma.poi.findMany({ select: { slug: true } });
    return pois.map((p: { slug: string }) => ({ sightId: p.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ sightId: string }>;
}): Promise<Metadata> {
    const { sightId } = await params;
    const poi = await prisma.poi.findUnique({
        where: { slug: sightId },
        select: {
            titleEN: true, titleEL: true,
            shortDescriptionEN: true, shortDescriptionEL: true,
            featuredImage: true,
            media: { where: { isHero: true, type: 'IMAGE' }, take: 1, select: { url: true } },
        },
    });
    if (!poi) return {};

    const heroImage = poi.featuredImage ?? poi.media?.[0]?.url ?? undefined;

    return buildMetadata(null, {
        title: `${poi.titleEN ?? poi.titleEL} — Athens | The Frogs Guesthouse`,
        description:
            (poi.shortDescriptionEN ?? poi.shortDescriptionEL ?? '').slice(0, 155) || undefined,
        heroImage: heroImage ?? undefined,
        canonicalHint: `/athens/${sightId}`,
        robotsDirective: 'index, follow',
    });
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
        select: {
            slug: true, titleEN: true, titleEL: true, featuredImage: true,
            media: { where: { type: 'IMAGE' }, orderBy: [{ isHero: 'desc' }, { order: 'asc' }], take: 1 },
        },
        orderBy: { order: 'asc' },
        take: 3,
    });

    // TouristAttraction JSON-LD for the POI
    const poiSchema = {
        '@context': 'https://schema.org',
        '@type': 'TouristAttraction',
        name: poi.titleEN ?? poi.titleEL,
        url: `${SITE_URL}/athens/${poi.slug}`,
        description: poi.shortDescriptionEN ?? poi.shortDescriptionEL ?? undefined,
        image: poi.featuredImage ?? poi.media?.[0]?.url ?? undefined,
        ...(poi.latitude && poi.longitude
            ? { geo: { '@type': 'GeoCoordinates', latitude: poi.latitude, longitude: poi.longitude } }
            : {}),
        containedInPlace: {
            '@type': 'City',
            name: 'Athens, Greece',
        },
    };

    // FAQ from visitor tips
    const tipQuestions = poi.visitorTips?.slice(0, 3).map((t) => t.nameEN ?? t.nameEL) ?? [];
    const faqSchema = buildFaqSchema(tipQuestions);

    const breadcrumb = buildBreadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Athens', url: `${SITE_URL}/athens` },
        { name: poi.titleEN ?? poi.titleEL, url: `${SITE_URL}/athens/${poi.slug}` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(poiSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
            {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
            <AthensDetailClient
                poi={JSON.parse(JSON.stringify(poi))}
                relatedPois={JSON.parse(JSON.stringify(relatedPois))}
            />
        </>
    );
}
