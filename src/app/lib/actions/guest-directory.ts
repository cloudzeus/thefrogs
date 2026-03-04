"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGuestDirectories() {
    return await prisma.guestDirectory.findMany({ orderBy: { order: "asc" } });
}

export async function createGuestDirectory(data: {
    titleEL: string;
    titleEN?: string;
    descriptionEL?: string;
    descriptionEN?: string;
    order?: number;
}) {
    const item = await prisma.guestDirectory.create({ data });
    revalidatePath("/admin/guest-directory");
    return JSON.parse(JSON.stringify(item));
}

export async function updateGuestDirectory(id: string, data: {
    titleEL?: string;
    titleEN?: string;
    descriptionEL?: string;
    descriptionEN?: string;
    order?: number;
}) {
    const item = await prisma.guestDirectory.update({ where: { id }, data });
    revalidatePath("/admin/guest-directory");
    return JSON.parse(JSON.stringify(item));
}

export async function deleteGuestDirectory(id: string) {
    await prisma.guestDirectory.delete({ where: { id } });
    revalidatePath("/admin/guest-directory");
}

export async function updateGuestDirectoryOrder(ids: string[]) {
    await Promise.all(
        ids.map((id, i) => prisma.guestDirectory.update({ where: { id }, data: { order: i } }))
    );
    revalidatePath("/admin/guest-directory");
}
