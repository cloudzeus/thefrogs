import { NextResponse } from "next/server";
import { auth } from "@/auth";
import sharp from "sharp";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

        const isVideo = file.type.startsWith("video/");
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

        let fileBuffer: Buffer = Buffer.from(await file.arrayBuffer());
        let uploadType = "image/webp";
        let extension = "webp";

        if (isVideo) {
            // For videos, we just pass through and don't re-encode in this script for now
            uploadType = file.type;
            extension = file.name.split('.').pop() || "mp4";
        } else if (isPdf) {
            // For PDFs, pass through transparently 
            uploadType = "application/pdf";
            extension = "pdf";
        } else {
            // Image processing to WebP max width 1920
            fileBuffer = await sharp(new Uint8Array(fileBuffer))
                .resize({
                    width: 1920,
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                .webp({ quality: 80, lossless: false })
                .toBuffer();
        }

        const filename = `media-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
        // we can place it in /media folder or /articles
        const bunnyUrl = `https://${process.env.BUNNY_STORAGE_API_HOST}/${process.env.BUNNY_STORAGE_ZONE}/articles/${filename}`;

        const uploadRes = await fetch(bunnyUrl, {
            method: "PUT",
            headers: {
                "AccessKey": process.env.BUNNY_ACCESS_KEY!,
                "Content-Type": uploadType,
            },
            body: fileBuffer as any,
        });

        if (!uploadRes.ok) {
            console.error("Bunny CDN upload failed", await uploadRes.text());
            throw new Error("Bunny CDN upload failed");
        }

        const finalUrl = `https://${process.env.BUNNY_CDN_HOSTNAME}/articles/${filename}`;

        return NextResponse.json({
            url: finalUrl,
            type: isVideo ? "VIDEO" : "IMAGE"
        });

    } catch (error: any) {
        console.error("Upload Media Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process media" }, { status: 500 });
    }
}
