"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CustomPageBlock = 
  | { id: string; type: "heading"; level: "h1"|"h2"|"h3"|"h4"|"h5"|"h6"; contentEL: string; contentEN: string }
  | { id: string; type: "richtext"; contentEL: string; contentEN: string }
  | { id: string; type: "gallery"; images: { url: string; alt?: string }[]; columns: number };

export type CustomPageData = {
    slug: string;
    titleEL: string;
    titleEN?: string;
    heroImage?: string;
    blocks?: CustomPageBlock[];
};

export async function getCustomPages() {
    const pages = await prisma.page.findMany({ orderBy: { createdAt: "desc" } });
    return JSON.parse(JSON.stringify(pages));
}

export async function getCustomPage(id: string) {
    const page = await prisma.page.findUnique({ where: { id } });
    return page ? JSON.parse(JSON.stringify(page)) : null;
}

export async function getCustomPageBySlug(slug: string) {
    const page = await prisma.page.findUnique({ where: { slug } });
    return page ? JSON.parse(JSON.stringify(page)) : null;
}

export async function createCustomPage(data: CustomPageData) {
    const page = await prisma.page.create({
        data: {
            slug: data.slug,
            titleEL: data.titleEL,
            titleEN: data.titleEN,
            heroImage: data.heroImage,
            blocks: data.blocks ?? [],
        }
    });
    revalidatePath("/admin/custom-pages");
    revalidatePath(`/${data.slug}`);
    return JSON.parse(JSON.stringify(page));
}

export async function updateCustomPage(id: string, data: Partial<CustomPageData>) {
    const page = await prisma.page.update({
        where: { id },
        data: {
            slug: data.slug,
            titleEL: data.titleEL,
            titleEN: data.titleEN,
            heroImage: data.heroImage,
            blocks: data.blocks ?? undefined,
        }
    });
    revalidatePath("/admin/custom-pages");
    revalidatePath(`/${page.slug}`);
    return JSON.parse(JSON.stringify(page));
}

export async function deleteCustomPage(id: string) {
    const page = await prisma.page.delete({ where: { id } });
    revalidatePath("/admin/custom-pages");
    revalidatePath(`/${page.slug}`);
}
