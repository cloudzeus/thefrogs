import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/seed-second-building
 * One-shot endpoint — inserts the `secondBuilding` HomeSection row if missing.
 * Safe to call multiple times (upsert with no-op on conflict).
 */
export async function GET() {
    try {
        // Find where guesthouse sits in the order
        const guesthouse = await prisma.homeSection.findUnique({
            where: { key: "guesthouse" },
            select: { order: true },
        });

        const guesthouseOrder = guesthouse?.order ?? 3;
        const newOrder = guesthouseOrder + 1;

        // Check if secondBuilding already exists
        const existing = await prisma.homeSection.findUnique({
            where: { key: "secondBuilding" },
        });

        if (!existing) {
            // Bump every section that sits after guesthouse to make room
            await prisma.homeSection.updateMany({
                where: { order: { gt: guesthouseOrder } },
                data: { order: { increment: 1 } },
            });

            await prisma.homeSection.create({
                data: {
                    key: "secondBuilding",
                    order: newOrder,
                    published: true,
                    image: null,
                    labelEL: "ΔΕΥΤΕΡΟ ΚΤΗΡΙΟ • EST. 2022",
                    labelEN: "SECOND BUILDING • EST. 2022",
                    titleEL: "ΤΟ\nΠΑΡΑΡΤΗΜΑ",
                    titleEN: "THE\nANNEX",
                    bodyEL: "Μία πιο ήσυχη γωνιά, λίγα βήματα μακριά — δωμάτια με την ίδια φροντίδα και χαρακτήρα, ιδανικά για μεγαλύτερες διαμονές.",
                    bodyEN: "A quieter corner just steps away — freshly designed rooms with the same care and character, perfect for longer stays.",
                    ctaLabelEL: "Δείτε Δωμάτια",
                    ctaLabelEN: "See Rooms",
                    ctaUrl: "/rooms",
                    cta2LabelEL: "Ελέγξτε Διαθεσιμότητα",
                    cta2LabelEN: "Check Availability",
                    cta2Url: "https://thefrogsguesthouse.reserve-online.net/",
                    extras: {},
                },
            });

            return NextResponse.json({ success: true, created: true, order: newOrder });
        }

        return NextResponse.json({ success: true, created: false, message: "Section already exists" });
    } catch (err: any) {
        console.error("[seed-second-building]", err);
        return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
    }
}
