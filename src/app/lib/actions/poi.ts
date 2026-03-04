"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── POI Core ──────────────────────────────────────────────────────────────────

export async function getPois() {
    const pois = await prisma.poi.findMany({
        orderBy: { order: "asc" },
        include: {
            media: { orderBy: { order: "asc" } },
            visitorTips: { orderBy: { order: "asc" } },
            visitInfo: true,
            nearby: { orderBy: { order: "asc" } },
        },
    });
    return JSON.parse(JSON.stringify(pois));
}

export async function createPoi(data: {
    titleEL: string;
    titleEN?: string;
    subtitleEL?: string;
    subtitleEN?: string;
    shortDescriptionEL?: string;
    shortDescriptionEN?: string;
    descriptionEL?: string;
    descriptionEN?: string;
    category?: string;
    slug?: string;
    latitude?: number;
    longitude?: number;
    order?: number;
    tags?: string[];
}) {
    const slug = data.slug || data.titleEL.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    const { tags, ...rest } = data;
    const poi = await prisma.poi.create({ data: { ...rest, slug, tags: tags ?? [] } });
    revalidatePath("/admin/pois");
    revalidatePath("/athens");
    return JSON.parse(JSON.stringify(poi));
}

export async function updatePoi(id: string, data: {
    titleEL?: string;
    titleEN?: string;
    subtitleEL?: string;
    subtitleEN?: string;
    shortDescriptionEL?: string;
    shortDescriptionEN?: string;
    descriptionEL?: string;
    descriptionEN?: string;
    category?: string;
    slug?: string;
    latitude?: number;
    longitude?: number;
    featuredImage?: string;
    order?: number;
    tags?: string[];
}) {
    const poi = await prisma.poi.update({
        where: { id },
        data,
        include: {
            media: { orderBy: { order: "asc" } },
            visitorTips: { orderBy: { order: "asc" } },
            visitInfo: true,
            nearby: { orderBy: { order: "asc" } },
        },
    });
    revalidatePath("/admin/pois");
    revalidatePath("/athens");
    return JSON.parse(JSON.stringify(poi));
}

export async function deletePoi(id: string) {
    await prisma.poi.delete({ where: { id } });
    revalidatePath("/admin/pois");
    revalidatePath("/athens");
}

export async function updatePoiOrder(ids: string[]) {
    await Promise.all(
        ids.map((id, i) => prisma.poi.update({ where: { id }, data: { order: i } }))
    );
    revalidatePath("/admin/pois");
}

export async function setPoiTags(id: string, tags: string[]) {
    await prisma.poi.update({ where: { id }, data: { tags } });
    revalidatePath("/admin/pois");
    revalidatePath("/athens");
}

// ── POI Media ─────────────────────────────────────────────────────────────────

export async function addPoiMedia(poiId: string, item: { type: string; url: string; order: number; isHero?: boolean }) {
    const media = await prisma.poiMedia.create({ data: { poiId, ...item } });
    revalidatePath("/admin/pois");
    return JSON.parse(JSON.stringify(media));
}

export async function updatePoiMedia(id: string, data: { type?: string; url?: string; order?: number; isHero?: boolean }) {
    const media = await prisma.poiMedia.update({ where: { id }, data });
    revalidatePath("/admin/pois");
    return JSON.parse(JSON.stringify(media));
}

export async function setPoiHeroImage(poiId: string, mediaId: string) {
    // Clear all hero flags for this POI, then set the selected one
    await prisma.poiMedia.updateMany({ where: { poiId }, data: { isHero: false } });
    await prisma.poiMedia.update({ where: { id: mediaId }, data: { isHero: true } });
    revalidatePath("/admin/pois");
    revalidatePath("/athens");
}

export async function deletePoiMedia(id: string) {
    await prisma.poiMedia.delete({ where: { id } });
    revalidatePath("/admin/pois");
}

export async function reorderPoiMedia(poiId: string, ids: string[]) {
    await Promise.all(ids.map((id, i) => prisma.poiMedia.update({ where: { id }, data: { order: i } })));
    revalidatePath("/admin/pois");
}

// ── Visitor Tips ──────────────────────────────────────────────────────────────

export async function addVisitorTip(poiId: string, data: { nameEL: string; nameEN?: string; order?: number }) {
    const tip = await prisma.poiVisitorTip.create({ data: { poiId, ...data } });
    revalidatePath("/admin/pois");
    return JSON.parse(JSON.stringify(tip));
}

export async function updateVisitorTip(id: string, data: { nameEL?: string; nameEN?: string; order?: number }) {
    const tip = await prisma.poiVisitorTip.update({ where: { id }, data });
    revalidatePath("/admin/pois");
    return JSON.parse(JSON.stringify(tip));
}

export async function deleteVisitorTip(id: string) {
    await prisma.poiVisitorTip.delete({ where: { id } });
    revalidatePath("/admin/pois");
}

export async function reorderVisitorTips(poiId: string, ids: string[]) {
    await Promise.all(ids.map((id, i) => prisma.poiVisitorTip.update({ where: { id }, data: { order: i } })));
    revalidatePath("/admin/pois");
}

// ── Visit Info ────────────────────────────────────────────────────────────────

export async function upsertVisitInfo(poiId: string, data: {
    distance?: string;
    duration?: string;
    price?: string;
    hours?: string;
    bestTime?: string;
}) {
    const info = await prisma.poiVisitInfo.upsert({
        where: { poiId },
        update: data,
        create: { poiId, ...data },
    });
    revalidatePath("/admin/pois");
    return JSON.parse(JSON.stringify(info));
}

// ── Nearby ────────────────────────────────────────────────────────────────────

export async function addNearby(poiId: string, data: { name: string; distance?: string; order?: number }) {
    const nearby = await prisma.poiNearby.create({ data: { poiId, ...data } });
    revalidatePath("/admin/pois");
    return JSON.parse(JSON.stringify(nearby));
}

export async function updateNearby(id: string, data: { name?: string; distance?: string; order?: number }) {
    const nearby = await prisma.poiNearby.update({ where: { id }, data });
    revalidatePath("/admin/pois");
    return JSON.parse(JSON.stringify(nearby));
}

export async function deleteNearby(id: string) {
    await prisma.poiNearby.delete({ where: { id } });
    revalidatePath("/admin/pois");
}

export async function reorderNearby(poiId: string, ids: string[]) {
    await Promise.all(ids.map((id, i) => prisma.poiNearby.update({ where: { id }, data: { order: i } })));
    revalidatePath("/admin/pois");
}
