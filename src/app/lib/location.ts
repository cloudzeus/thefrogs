"use server";

import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function getLocations() {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") throw new Error("Unauthorized access. Admin only.")

    try {
        return await prisma.presence.findMany({
            orderBy: { order: "asc" },
        })
    } catch (error: any) {
        console.error("GET LOCATIONS Error:", error)
        throw new Error(error.message)
    }
}

export async function getPublicLocations() {
    try {
        return await prisma.presence.findMany({
            where: { published: true },
            orderBy: { order: "asc" },
        })
    } catch (error: any) {
        console.error("GET PUBLIC LOCATIONS Error:", error)
        return []
    }
}

export async function getLocation(id: string) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") throw new Error("Unauthorized access. Admin only.")

    try {
        return await prisma.presence.findUnique({
            where: { id }
        })
    } catch (error: any) {
        console.error("GET LOCATION Error:", error)
        throw new Error(error.message)
    }
}

export async function createLocation(data: any) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") throw new Error("Unauthorized access. Admin only.")

    try {
        return await prisma.presence.create({
            data: {
                ...data,
                latitude: data.latitude ? parseFloat(data.latitude) : null,
                longitude: data.longitude ? parseFloat(data.longitude) : null,
                order: data.order ? parseInt(data.order, 10) : 0,
                published: data.published ?? true,
            }
        })
    } catch (error: any) {
        console.error("CREATE LOCATION Error:", error)
        throw new Error(error.message)
    }
}

export async function updateLocation(id: string, data: any) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") throw new Error("Unauthorized access. Admin only.")

    try {
        return await prisma.presence.update({
            where: { id },
            data: {
                ...data,
                latitude: data.latitude ? parseFloat(data.latitude) : null,
                longitude: data.longitude ? parseFloat(data.longitude) : null,
                order: data.order ? parseInt(data.order, 10) : 0,
                published: data.published ?? true,
            }
        })
    } catch (error: any) {
        console.error("UPDATE LOCATION Error:", error)
        throw new Error(error.message)
    }
}

export async function deleteLocation(id: string) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") throw new Error("Unauthorized access. Admin only.")

    try {
        return await prisma.presence.delete({ where: { id } })
    } catch (error: any) {
        console.error("DELETE LOCATION Error:", error)
        throw new Error(error.message)
    }
}

export async function getCoordinates(query: string) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") throw new Error("Unauthorized access. Admin only.")

    try {
        const apiKey = process.env.GEOCODE_API;
        if (!apiKey) throw new Error("Geocode API key is missing");

        const url = `https://geocode.maps.co/search?q=${encodeURIComponent(query)}&api_key=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch coordinates: ${res.statusText}`);

        const data = await res.json();
        if (!data || data.length === 0) return null;

        // Return the best match's coordinates
        return {
            latitude: data[0].lat,
            longitude: data[0].lon
        };
    } catch (error: any) {
        console.error("GEOCODE LOCATIONS Error:", error);
        throw new Error(error.message);
    }
}
