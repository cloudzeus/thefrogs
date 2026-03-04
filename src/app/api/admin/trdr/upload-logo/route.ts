import { NextResponse } from "next/server";
import { auth } from "@/auth";
import sharp from "sharp";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("logo") as File;
        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Input = buffer.toString("base64");
        const mimeType = file.type || "image/png";

        const shouldRemoveBg = formData.get("removeBackground") === "true";
        let processedBuffer = buffer;

        // 1. Remove background via Claid API IF checked
        if (shouldRemoveBg) {
            const claidApiKey = process.env.CLAID_API_KEY;
            if (!claidApiKey) throw new Error("CLAID_API_KEY not configured");

            const claidRes = await fetch("https://api.claid.ai/v1-beta1/image/edit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${claidApiKey}`,
                },
                body: JSON.stringify({
                    input: `data:${mimeType};base64,${base64Input}`,
                    operations: {
                        background: { remove: true }
                    },
                    output: {
                        format: "png",
                        destination: "data" // Returns base64
                    }
                })
            });

            const claidData = await claidRes.json();

            if (claidRes.ok && claidData.data && claidData.data.output && claidData.data.output.data_url) {
                const b64Data = claidData.data.output.data_url.split(",")[1];
                processedBuffer = Buffer.from(b64Data, "base64");
            } else {
                console.error("Claid API Error or missing output data URL:", claidData);
                // We will just continue with original image if it fails safely, but we should log it
            }
        }

        // 2. Sharp to contain inside 300x200 canvas with padding and convert to WebP
        const webpBuffer = await sharp(processedBuffer)
            .resize({
                width: 250, // Leaving 25px padding left/right
                height: 150, // Leaving 25px padding top/bottom
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 } // transparent background
            })
            .extend({
                top: 25,
                bottom: 25,
                left: 25,
                right: 25,
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .webp({ lossless: true }) // preserve transparency perfectly
            .toBuffer();

        // 3. Upload to Bunny CDN
        const filename = `logo-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const bunnyUrl = `https://${process.env.BUNNY_STORAGE_API_HOST}/${process.env.BUNNY_STORAGE_ZONE}/logos/${filename}`;

        const uploadRes = await fetch(bunnyUrl, {
            method: "PUT",
            headers: {
                "AccessKey": process.env.BUNNY_ACCESS_KEY!,
                "Content-Type": "image/webp",
            },
            body: webpBuffer as any,
        });

        if (!uploadRes.ok) {
            console.error("Bunny CDN upload failed", await uploadRes.text());
            throw new Error("Bunny CDN upload failed");
        }

        const finalUrl = `https://${process.env.BUNNY_CDN_HOSTNAME}/logos/${filename}`;
        return NextResponse.json({ url: finalUrl });

    } catch (error: any) {
        console.error("Upload Logo Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process logo" }, { status: 500 });
    }
}
