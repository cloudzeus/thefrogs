import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import RoomDetailClient from '@/components/rooms/RoomDetailClient';
import { buildMetadata, lodgingBusinessSchema, buildBreadcrumbSchema } from '@/lib/metadata';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://frogs.wwa.gr';

export async function generateStaticParams() {
    const rooms = await prisma.room.findMany({
        where: { published: true },
        select: { slug: true },
    });
    return rooms.map((r) => ({ roomId: r.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ roomId: string }>;
}): Promise<Metadata> {
    const { roomId } = await params;
    const room = await prisma.room.findUnique({
        where: { slug: roomId, published: true },
        select: { nameEN: true, nameEL: true, descriptionEN: true, featuredImage: true },
    });
    if (!room) return {};

    return buildMetadata(null, {
        title: `${room.nameEN ?? room.nameEL} | The Frogs Guesthouse`,
        description: room.descriptionEN?.slice(0, 155) ?? undefined,
        heroImage: room.featuredImage ?? undefined,
        canonicalHint: `/rooms/${roomId}`,
        robotsDirective: 'index, follow',
    });
}

export default async function RoomDetailPage({
    params,
}: {
    params: Promise<{ roomId: string }>;
}) {
    const { roomId } = await params;

    const room = await prisma.room.findUnique({
        where: { slug: roomId, published: true },
        include: {
            images: { orderBy: { order: 'asc' } },
            amenities: { orderBy: { order: 'asc' } },
            facilities: { orderBy: { order: 'asc' } },
        },
    });

    if (!room) notFound();

    const relatedRooms = await prisma.room.findMany({
        where: { published: true, slug: { not: roomId } },
        select: { 
            slug: true, 
            name: true, 
            nameEN: true,
            nameEL: true,
            featuredImage: true,
            images: { orderBy: { order: 'asc' }, take: 1 }
        },
        orderBy: { order: 'asc' },
        take: 3,
    });

    // Per-room structured data
    const roomSchema = {
        '@context': 'https://schema.org',
        '@type': 'HotelRoom',
        name: room.nameEN ?? room.name,
        url: `${SITE_URL}/rooms/${room.slug}`,
        description: room.descriptionEN ?? undefined,
        image: room.featuredImage ?? undefined,
        containedInPlace: {
            '@type': 'LodgingBusiness',
            name: 'The Frogs Guesthouse',
            url: SITE_URL,
        },
    };

    const breadcrumb = buildBreadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Rooms', url: `${SITE_URL}/rooms` },
        { name: room.nameEN ?? room.name, url: `${SITE_URL}/rooms/${room.slug}` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(roomSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
            <RoomDetailClient
                room={JSON.parse(JSON.stringify(room))}
                relatedRooms={JSON.parse(JSON.stringify(relatedRooms))}
            />
        </>
    );
}
