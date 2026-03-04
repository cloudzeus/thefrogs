import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import RoomDetailClient from '@/components/rooms/RoomDetailClient';

export async function generateStaticParams() {
    const rooms = await prisma.room.findMany({
        where: { published: true },
        select: { slug: true },
    });
    return rooms.map((r) => ({ roomId: r.slug }));
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

    // Other rooms for the "related" section
    const relatedRooms = await prisma.room.findMany({
        where: { published: true, slug: { not: roomId } },
        select: { slug: true, name: true, featuredImage: true },
        orderBy: { order: 'asc' },
        take: 3,
    });

    return (
        <RoomDetailClient
            room={JSON.parse(JSON.stringify(room))}
            relatedRooms={JSON.parse(JSON.stringify(relatedRooms))}
        />
    );
}
