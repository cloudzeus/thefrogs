"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRooms() {
    const rooms = await prisma.room.findMany({
        orderBy: { order: "asc" },
        include: {
            images: { orderBy: { order: "asc" } },
            amenities: { orderBy: { order: "asc" } },
            facilities: { orderBy: { order: "asc" } },
        },
    });
    return JSON.parse(JSON.stringify(rooms));
}

export async function createRoom(data: {
    name: string;
    slug: string;
    descriptionEL?: string;
    descriptionEN?: string;
    sleeps?: number;
    squareMeters?: number;
    startingFrom?: number;
    featuredImage?: string;
    published?: boolean;
    order?: number;
    images?: { url: string; order: number }[];
    amenities?: { nameEL: string; nameEN: string; icon: string; order: number }[];
    facilities?: { nameEL: string; nameEN: string; icon: string; order: number }[];
}) {
    const { images, amenities, facilities, ...roomData } = data;
    const room = await prisma.room.create({
        data: {
            ...roomData,
            ...(images?.length && {
                images: {
                    create: images.map((img, i) => ({ url: img.url, order: img.order ?? i })),
                },
            }),
            ...(amenities?.length && {
                amenities: {
                    create: amenities.map((a, i) => ({ nameEL: a.nameEL, nameEN: a.nameEN, icon: a.icon, order: a.order ?? i })),
                },
            }),
            ...(facilities?.length && {
                facilities: {
                    create: facilities.map((f, i) => ({ nameEL: f.nameEL, nameEN: f.nameEN, icon: f.icon, order: f.order ?? i })),
                },
            }),
        },
        include: { images: true, amenities: true, facilities: true },
    });
    revalidatePath("/admin/rooms");
    revalidatePath("/rooms");
    return JSON.parse(JSON.stringify(room));
}

export async function updateRoom(
    id: string,
    data: {
        name?: string;
        slug?: string;
        descriptionEL?: string;
        descriptionEN?: string;
        sleeps?: number;
        squareMeters?: number;
        startingFrom?: number;
        featuredImage?: string;
        published?: boolean;
        order?: number;
        images?: { url: string; order: number }[];
        amenities?: { nameEL: string; nameEN: string; icon: string; order: number }[];
        facilities?: { nameEL: string; nameEN: string; icon: string; order: number }[];
    }
) {
    const { images, amenities, facilities, ...roomData } = data;
    const room = await prisma.room.update({
        where: { id },
        data: {
            ...roomData,
            ...(images !== undefined && {
                images: {
                    deleteMany: {},
                    create: images.map((img, i) => ({ url: img.url, order: img.order ?? i })),
                },
            }),
            ...(amenities !== undefined && {
                amenities: {
                    deleteMany: {},
                    create: amenities.map((a, i) => ({ nameEL: a.nameEL, nameEN: a.nameEN, icon: a.icon, order: a.order ?? i })),
                },
            }),
            ...(facilities !== undefined && {
                facilities: {
                    deleteMany: {},
                    create: facilities.map((f, i) => ({ nameEL: f.nameEL, nameEN: f.nameEN, icon: f.icon, order: f.order ?? i })),
                },
            }),
        },
        include: { images: true, amenities: true, facilities: true },
    });
    revalidatePath("/admin/rooms");
    revalidatePath("/rooms");
    return JSON.parse(JSON.stringify(room));
}

export async function deleteRoom(id: string) {
    await prisma.room.delete({ where: { id } });
    revalidatePath("/admin/rooms");
    revalidatePath("/rooms");
}

export async function updateRoomOrder(ids: string[]) {
    await Promise.all(
        ids.map((id, i) => prisma.room.update({ where: { id }, data: { order: i } }))
    );
    revalidatePath("/admin/rooms");
}
