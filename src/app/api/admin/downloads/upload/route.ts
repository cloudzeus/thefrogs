import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const extension = file.name.split('.').pop() || "bin";
        const filename = `download-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

        const fileSizeKB = Math.round(fileBuffer.byteLength / 1024);
        const fileSizeStr = fileSizeKB > 1024
            ? `${(fileSizeKB / 1024).toFixed(1)} MB`
            : `${fileSizeKB} KB`;

        const bunnyUrl = `https://${process.env.BUNNY_STORAGE_API_HOST}/${process.env.BUNNY_STORAGE_ZONE}/downloads/${filename}`;

        const uploadRes = await fetch(bunnyUrl, {
            method: "PUT",
            headers: {
                "AccessKey": process.env.BUNNY_ACCESS_KEY!,
                "Content-Type": file.type || "application/octet-stream",
            },
            body: fileBuffer as any,
        });

        if (!uploadRes.ok) {
            throw new Error(`Bunny CDN upload failed: ${await uploadRes.text()}`);
        }

        const finalUrl = `https://${process.env.BUNNY_CDN_HOSTNAME}/downloads/${filename}`;

        return NextResponse.json({
            url: finalUrl,
            fileSize: fileSizeStr,
            fileType: file.type || extension.toUpperCase(),
            fileName: file.name,
        });

    } catch (error: any) {
        console.error("Download Upload Error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
