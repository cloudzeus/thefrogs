"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type HomeSectionData = {
    key: string;
    order?: number;
    published?: boolean;
    image?: string | null;
    labelEL?: string | null;
    labelEN?: string | null;
    titleEL?: string | null;
    titleEN?: string | null;
    subtitleEL?: string | null;
    subtitleEN?: string | null;
    bodyEL?: string | null;
    bodyEN?: string | null;
    ctaLabelEL?: string | null;
    ctaLabelEN?: string | null;
    ctaUrl?: string | null;
    cta2LabelEL?: string | null;
    cta2LabelEN?: string | null;
    cta2Url?: string | null;
    extras?: Record<string, unknown>;
};

export async function getHomeSections() {
    const sections = await prisma.homeSection.findMany({ orderBy: { order: "asc" } });
    return JSON.parse(JSON.stringify(sections));
}

export async function getHomeSection(key: string) {
    const section = await prisma.homeSection.findUnique({ where: { key } });
    return section ? JSON.parse(JSON.stringify(section)) : null;
}

export async function upsertHomeSection(data: HomeSectionData) {
    const { key, ...rest } = data;
    const result = await prisma.homeSection.upsert({
        where: { key },
        update: rest as any,
        create: { key, ...(rest as any) },
    });
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return JSON.parse(JSON.stringify(result));
}

export async function updateHomeSectionOrder(keys: string[]) {
    await Promise.all(
        keys.map((key, i) => prisma.homeSection.update({ where: { key }, data: { order: i + 1 } }))
    );
    revalidatePath("/");
    revalidatePath("/admin/homepage");
}

export async function toggleHomeSectionPublished(key: string, published: boolean) {
    await prisma.homeSection.update({ where: { key }, data: { published } });
    revalidatePath("/");
    revalidatePath("/admin/homepage");
}
