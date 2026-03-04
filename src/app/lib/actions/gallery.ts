"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGalleryImages() {
    const images = await prisma.galleryImage.findMany({
        orderBy: { order: "asc" },
    });
    return JSON.parse(JSON.stringify(images));
}

export async function createGalleryImage({ url, title, category }: { url: string; title?: string; category?: string }) {
    const count = await prisma.galleryImage.count();
    const image = await prisma.galleryImage.create({
        data: {
            url,
            title,
            category,
            order: count,
        },
    });
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return JSON.parse(JSON.stringify(image));
}

export async function updateGalleryImage(id: string, data: { title?: string; category?: string; order?: number }) {
    const image = await prisma.galleryImage.update({
        where: { id },
        data,
    });
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return JSON.parse(JSON.stringify(image));
}

export async function deleteGalleryImage(id: string) {
    await prisma.galleryImage.delete({
        where: { id },
    });
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
}

export async function reorderGalleryImages(ids: string[]) {
    await Promise.all(
        ids.map((id, index) =>
            prisma.galleryImage.update({
                where: { id },
                data: { order: index },
            })
        )
    );
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
}
