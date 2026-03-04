import prisma from '@/lib/prisma';
import RoomsClient from '@/components/rooms/RoomsClient';
import { getPageMeta } from '@/app/lib/actions/page-meta';

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

    const pageMeta = await getPageMeta("rooms");

    return <RoomsClient rooms={JSON.parse(JSON.stringify(rooms))} pageMeta={pageMeta} />;
}
