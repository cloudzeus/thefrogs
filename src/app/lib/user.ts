"use server";

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

export async function getUsers() {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") throw new Error("Unauthorized access. Admin only.")

    try {
        const res = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
            }
        })
        return JSON.parse(JSON.stringify(res))
    } catch (error: any) {
        console.error("GET USERS Error:", error)
        throw new Error(error.message)
    }
}

export async function createUser(data: any) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") throw new Error("Unauthorized access. Admin only.")

    try {
        const { password, ...rest } = data;
        let passwordHash = undefined;

        if (password) {
            passwordHash = await bcrypt.hash(password, 10);
        }

        const res = await prisma.user.create({
            data: {
                ...rest,
                password: passwordHash,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
            }
        })
        return JSON.parse(JSON.stringify(res))
    } catch (error: any) {
        if (error.code === 'P2002') return { error: "Email already exists" }
        console.error("CREATE USER Error:", error)
        throw new Error(error.message)
    }
}

export async function updateUser(id: string, data: any) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") throw new Error("Unauthorized access. Admin only.")

    try {
        const { password, ...rest } = data;
        let updateData = { ...rest };

        if (password && password.trim() !== "") {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const res = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
            }
        })
        return JSON.parse(JSON.stringify(res))
    } catch (error: any) {
        if (error.code === 'P2002') return { error: "Email already exists" }
        console.error("UPDATE USER Error:", error)
        throw new Error(error.message)
    }
}

export async function deleteUser(id: string) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") throw new Error("Unauthorized access. Admin only.")

    try {
        const res = await prisma.user.delete({ where: { id } })
        return JSON.parse(JSON.stringify(res))
    } catch (error: any) {
        console.error("DELETE USER Error:", error)
        throw new Error(error.message)
    }
}
