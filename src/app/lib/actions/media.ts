"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMedia() {
    return await prisma.media.findMany({
        orderBy: { order: "asc" },
    });
}

export async function createMedia(data: { type: string; url: string; order?: number }) {
    const media = await prisma.media.create({ data });
    revalidatePath("/admin/media");
    return JSON.parse(JSON.stringify(media));
}

export async function deleteMedia(id: string) {
    await prisma.media.delete({ where: { id } });
    revalidatePath("/admin/media");
}

export async function updateMediaOrder(ids: string[]) {
    await Promise.all(
        ids.map((id, i) => prisma.media.update({ where: { id }, data: { order: i } }))
    );
    revalidatePath("/admin/media");
}
