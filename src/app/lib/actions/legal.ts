"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type LegalPageItem = {
    id: string;
    slug: string;
    titleEL: string;
    titleEN: string | null;
    contentEL: string | null;
    contentEN: string | null;
    order: number;
};

export async function getLegalPages(): Promise<LegalPageItem[]> {
    const rows = await prisma.$queryRaw<LegalPageItem[]>`
        SELECT id, slug, titleEL, titleEN, contentEL, contentEN, \`order\`
        FROM legal_pages
        ORDER BY \`order\` ASC
    `;
    return JSON.parse(JSON.stringify(rows));
}

export async function getLegalPage(slug: string): Promise<LegalPageItem | null> {
    const rows = await prisma.$queryRaw<LegalPageItem[]>`
        SELECT id, slug, titleEL, titleEN, contentEL, contentEN, \`order\`
        FROM legal_pages WHERE slug = ${slug} LIMIT 1
    `;
    const row = rows[0] ?? null;
    return row ? JSON.parse(JSON.stringify(row)) : null;
}

export async function upsertLegalPage(data: {
    id?: string;
    slug: string;
    titleEL: string;
    titleEN?: string;
    contentEL?: string;
    contentEN?: string;
    order?: number;
}): Promise<LegalPageItem> {
    if (data.id) {
        await prisma.$executeRaw`
            UPDATE legal_pages SET
                slug = ${data.slug},
                titleEL = ${data.titleEL},
                titleEN = ${data.titleEN ?? null},
                contentEL = ${data.contentEL ?? null},
                contentEN = ${data.contentEN ?? null},
                \`order\` = ${data.order ?? 0},
                updatedAt = NOW()
            WHERE id = ${data.id}
        `;
    } else {
        const id = `legal${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
        await prisma.$executeRaw`
            INSERT INTO legal_pages (id, slug, titleEL, titleEN, contentEL, contentEN, \`order\`, createdAt, updatedAt)
            VALUES (${id}, ${data.slug}, ${data.titleEL}, ${data.titleEN ?? null},
                    ${data.contentEL ?? null}, ${data.contentEN ?? null}, ${data.order ?? 0}, NOW(), NOW())
        `;
    }
    revalidatePath("/admin/legal");
    const [row] = await prisma.$queryRaw<LegalPageItem[]>`
        SELECT id, slug, titleEL, titleEN, contentEL, contentEN, \`order\`
        FROM legal_pages WHERE slug = ${data.slug} LIMIT 1
    `;
    return JSON.parse(JSON.stringify(row));
}

export async function deleteLegalPage(id: string): Promise<void> {
    await prisma.$executeRaw`DELETE FROM legal_pages WHERE id = ${id}`;
    revalidatePath("/admin/legal");
}
