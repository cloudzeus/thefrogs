"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getReviews() {
    return await prisma.review.findMany({ orderBy: { order: "asc" } });
}

export async function createReview(data: {
    name: string;
    email?: string;
    date?: Date;
    titleEL?: string;
    titleEN?: string;
    contentEL: string;
    contentEN?: string;
    avatar?: string;
    order?: number;
}) {
    const review = await prisma.review.create({ data });
    revalidatePath("/admin/reviews");
    return JSON.parse(JSON.stringify(review));
}

export async function updateReview(id: string, data: {
    name?: string;
    email?: string;
    date?: Date;
    titleEL?: string;
    titleEN?: string;
    contentEL?: string;
    contentEN?: string;
    avatar?: string;
    order?: number;
}) {
    const review = await prisma.review.update({ where: { id }, data });
    revalidatePath("/admin/reviews");
    return JSON.parse(JSON.stringify(review));
}

export async function deleteReview(id: string) {
    await prisma.review.delete({ where: { id } });
    revalidatePath("/admin/reviews");
}

export async function updateReviewOrder(ids: string[]) {
    await Promise.all(
        ids.map((id, i) => prisma.review.update({ where: { id }, data: { order: i } }))
    );
    revalidatePath("/admin/reviews");
}
