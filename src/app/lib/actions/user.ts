"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getUsers() {
    return await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export async function createUser(data: {
    name: string;
    email: string;
    password: string;
    role: string;
}) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
        },
    });
    revalidatePath("/admin/users");
    return JSON.parse(JSON.stringify(user));
}

export async function updateUser(
    id: string,
    data: { name?: string; email?: string; password?: string; role?: string }
) {
    const updateData: any = {
        name: data.name,
        email: data.email,
        role: data.role,
    };
    if (data.password && data.password.length > 0) {
        updateData.password = await bcrypt.hash(data.password, 10);
    }
    const user = await prisma.user.update({ where: { id }, data: updateData });
    revalidatePath("/admin/users");
    return JSON.parse(JSON.stringify(user));
}

export async function deleteUser(id: string) {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
}
