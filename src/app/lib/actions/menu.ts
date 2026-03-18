"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMenuLinks() {
    const links = await prisma.menuLink.findMany({ orderBy: { order: "asc" } });
    return JSON.parse(JSON.stringify(links));
}

export async function createMenuLink(data: { labelEL: string; labelEN?: string; href: string }) {
    const count = await prisma.menuLink.count();
    const link = await prisma.menuLink.create({
        data: {
            ...data,
            order: count,
        }
    });
    revalidatePath("/");
    revalidatePath("/admin/menu");
    return JSON.parse(JSON.stringify(link));
}

export async function updateMenuLink(id: string, data: { labelEL?: string; labelEN?: string; href?: string }) {
    const link = await prisma.menuLink.update({ where: { id }, data });
    revalidatePath("/");
    revalidatePath("/admin/menu");
    return JSON.parse(JSON.stringify(link));
}

export async function deleteMenuLink(id: string) {
    await prisma.menuLink.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/menu");
}

export async function updateMenuLinkOrder(ids: string[]) {
    await Promise.all(
        ids.map((id, index) => prisma.menuLink.update({ where: { id }, data: { order: index } }))
    );
    revalidatePath("/");
    revalidatePath("/admin/menu");
}
