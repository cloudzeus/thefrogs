"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type DirectoryItem = {
    id: string;
    titleEL: string;
    titleEN: string | null;
    icon: string | null;
    descriptionEL: string | null;
    descriptionEN: string | null;
    order: number;
};

export async function getDirectoryItems(): Promise<DirectoryItem[]> {
    // Use $queryRaw to bypass stale Prisma client types
    const rows = await prisma.$queryRaw<DirectoryItem[]>`
        SELECT id, titleEL, titleEN, icon, descriptionEL, descriptionEN, \`order\`
        FROM directory
        ORDER BY \`order\` ASC
    `;
    return JSON.parse(JSON.stringify(rows));
}

export async function upsertDirectoryItem(data: {
    id?: string;
    titleEL: string;
    titleEN?: string;
    icon?: string;
    descriptionEL?: string;
    descriptionEN?: string;
    order?: number;
}): Promise<DirectoryItem> {
    if (data.id) {
        await prisma.$executeRaw`
            UPDATE directory SET
                titleEL = ${data.titleEL},
                titleEN = ${data.titleEN ?? null},
                icon = ${data.icon ?? null},
                descriptionEL = ${data.descriptionEL ?? null},
                descriptionEN = ${data.descriptionEN ?? null},
                \`order\` = ${data.order ?? 0},
                updatedAt = NOW()
            WHERE id = ${data.id}
        `;
    } else {
        const id = `dir${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
        await prisma.$executeRaw`
            INSERT INTO directory (id, titleEL, titleEN, icon, descriptionEL, descriptionEN, \`order\`, createdAt, updatedAt)
            VALUES (${id}, ${data.titleEL}, ${data.titleEN ?? null}, ${data.icon ?? null},
                    ${data.descriptionEL ?? null}, ${data.descriptionEN ?? null}, ${data.order ?? 0}, NOW(), NOW())
        `;
    }
    revalidatePath("/directory");
    revalidatePath("/admin/directory");
    const [row] = await prisma.$queryRaw<DirectoryItem[]>`
        SELECT id, titleEL, titleEN, icon, descriptionEL, descriptionEN, \`order\`
        FROM directory
        WHERE titleEL = ${data.titleEL}
        ORDER BY updatedAt DESC LIMIT 1
    `;
    return JSON.parse(JSON.stringify(row));
}

export async function deleteDirectoryItem(id: string): Promise<void> {
    await prisma.$executeRaw`DELETE FROM directory WHERE id = ${id}`;
    revalidatePath("/directory");
    revalidatePath("/admin/directory");
}

export async function reorderDirectoryItems(ids: string[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
        await prisma.$executeRaw`UPDATE directory SET \`order\` = ${i + 1}, updatedAt = NOW() WHERE id = ${ids[i]}`;
    }
    revalidatePath("/directory");
    revalidatePath("/admin/directory");
}
