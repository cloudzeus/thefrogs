import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.split(".").pop() || "pdf";
        const filename = `cv-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const bunnyUrl = `https://${process.env.BUNNY_STORAGE_API_HOST}/${process.env.BUNNY_STORAGE_ZONE}/cvs/${filename}`;
        const uploadRes = await fetch(bunnyUrl, {
            method: "PUT",
            headers: { "AccessKey": process.env.BUNNY_ACCESS_KEY!, "Content-Type": file.type || "application/pdf" },
            body: fileBuffer as any,
        });
        if (!uploadRes.ok) throw new Error("CDN upload failed");

        return NextResponse.json({ url: `https://${process.env.BUNNY_CDN_HOSTNAME}/cvs/${filename}` });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
