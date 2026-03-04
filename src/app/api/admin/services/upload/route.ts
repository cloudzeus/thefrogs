import { NextResponse } from "next/server";
import { auth } from "@/auth";
import sharp from "sharp";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string; // 'feature', 'logo', 'media', 'icon'
        const removeBg = formData.get("removeBackground") === "true";

        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const isVideo = file.type.startsWith("video/");

        let processedBuffer = buffer;
        let finalExtension = isVideo ? file.name.split('.').pop() : "webp";
        let contentType = isVideo ? file.type : "image/webp";

        if (!isVideo) {
            // 1. Optional Background Removal (mainly for logos)
            if (removeBg) {
                const claidApiKey = process.env.CLAID_API_KEY;
                if (!claidApiKey) throw new Error("CLAID_API_KEY not configured");

                const claidRes = await fetch("https://api.claid.ai/v1-beta1/image/edit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${claidApiKey}`,
                    },
                    body: JSON.stringify({
                        input: `data:${file.type};base64,${buffer.toString("base64")}`,
                        operations: { background: { remove: true } },
                        output: { format: "png", destination: "data" }
                    })
                });

                const claidData = await claidRes.json();
                if (claidRes.ok && claidData.data?.output?.data_url) {
                    const b64Data = claidData.data.output.data_url.split(",")[1];
                    processedBuffer = Buffer.from(b64Data, "base64");
                }
            }

            // 2. Image Processing (Resize & WebP)
            let sharpInstance = sharp(processedBuffer);
            const metadata = await sharpInstance.metadata();

            if (type === 'feature' || type === 'media') {
                // Max width 1920px
                if (metadata.width && metadata.width > 1920) {
                    sharpInstance = sharpInstance.resize({ width: 1920, withoutEnlargement: true });
                }
            } else if (type === 'logo') {
                // Resize for logo containment (similar to trdr)
                sharpInstance = sharpInstance.resize({ width: 400, height: 400, fit: 'inside' });
            }

            processedBuffer = await sharpInstance.webp({ quality: 85, alphaQuality: 100 }).toBuffer() as any;
        }

        // 3. Upload to Bunny CDN
        const path = type === 'logo' ? 'brand-logos' : type === 'icon' ? 'service-icons' : 'services';
        const filename = `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}.${finalExtension}`;
        const bunnyUrl = `https://${process.env.BUNNY_STORAGE_API_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${path}/${filename}`;

        const uploadRes = await fetch(bunnyUrl, {
            method: "PUT",
            headers: {
                "AccessKey": process.env.BUNNY_ACCESS_KEY!,
                "Content-Type": contentType,
            },
            body: processedBuffer as any,
        });

        if (!uploadRes.ok) {
            throw new Error(`Bunny CDN upload failed: ${await uploadRes.text()}`);
        }

        const finalUrl = `https://${process.env.BUNNY_CDN_HOSTNAME}/${path}/${filename}`;
        return NextResponse.json({ url: finalUrl });

    } catch (error: any) {
        console.error("Service Upload Error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
