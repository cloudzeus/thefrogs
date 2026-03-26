"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPageMetas() {
    const metas = await prisma.pageMeta.findMany({ orderBy: { slug: "asc" } });
    return JSON.parse(JSON.stringify(metas));
}

export async function getPageMeta(slug: string) {
    const meta = await prisma.pageMeta.findUnique({ where: { slug } });
    return JSON.parse(JSON.stringify(meta));
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
    // Core SEO
    metaTitleEL?: string;
    metaTitleEN?: string;
    metaDescriptionEL?: string;
    metaDescriptionEN?: string;
    keywords?: string;
    // Open Graph
    ogTitle?: string;
    ogDescription?: string;
    // Twitter
    twitterTitle?: string;
    twitterDescription?: string;
    // Technical SEO
    robotsDirective?: string;
    canonicalHint?: string;
    schemaType?: string;
    // AI discoverability
    aiSummary?: string;
    faqSuggestions?: string[];
}) {
    const { slug, faqSuggestions, ...rest } = data;

    const payload = {
        ...rest,
        metaTitleEL: rest.metaTitleEL?.slice(0, 70),
        metaTitleEN: rest.metaTitleEN?.slice(0, 70),
        ogTitle: rest.ogTitle?.slice(0, 100),
        twitterTitle: rest.twitterTitle?.slice(0, 100),
        faqSuggestions: faqSuggestions ? JSON.stringify(faqSuggestions) : undefined,
    };

    const result = await prisma.pageMeta.upsert({
        where: { slug },
        update: payload,
        create: { slug, ...payload },
    });

    revalidatePath("/");
    revalidatePath(`/${slug === "home" ? "" : slug}`);
    revalidatePath("/admin/pages");
    return result;
}

export async function deletePageMeta(id: string) {
    await prisma.pageMeta.delete({ where: { id } });
    revalidatePath("/admin/pages");
}
