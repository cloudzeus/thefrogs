"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPageMetas() {
    return prisma.pageMeta.findMany({ orderBy: { slug: "asc" } });
}

export async function getPageMeta(slug: string) {
    return prisma.pageMeta.findUnique({ where: { slug } });
}

export async function upsertPageMeta(data: {
    slug: string;
    published?: boolean;
    heroImage?: string;
    heroVideo?: string;
    titleEL: string;
    titleEN?: string;
    subtitleEL?: string;
    subtitleEN?: string;
    textEL?: string;
    textEN?: string;
    metaTitleEL?: string;
    metaTitleEN?: string;
    metaDescriptionEL?: string;
    metaDescriptionEN?: string;
    keywords?: string;
}) {
    const { slug, ...rest } = data;
    const result = await prisma.pageMeta.upsert({
        where: { slug },
        update: {
            ...rest,
            metaTitleEL: rest.metaTitleEL?.slice(0, 70),
            metaTitleEN: rest.metaTitleEN?.slice(0, 70),
        },
        create: {
            slug,
            ...rest,
            metaTitleEL: rest.metaTitleEL?.slice(0, 70),
            metaTitleEN: rest.metaTitleEN?.slice(0, 70),
        },
    });
    revalidatePath("/");
    revalidatePath(`/${slug}`);
    return result;
}

export async function deletePageMeta(id: string) {
    await prisma.pageMeta.delete({ where: { id } });
    revalidatePath("/admin/pages");
}
