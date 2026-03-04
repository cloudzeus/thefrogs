import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import os from "os";

const BUNNY_ACCESS_KEY = process.env.BUNNY_ACCESS_KEY!;
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE!;
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME!;
const BUNNY_STORAGE_API_HOST = process.env.BUNNY_STORAGE_API_HOST!;

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;

async function processImage(buffer: Buffer): Promise<Buffer> {
    try {
        const sharp = (await import("sharp")).default;
        const img = sharp(buffer, { failOnError: false });
        const meta = await img.metadata();

        const needsResize =
            (meta.width && meta.width > MAX_WIDTH) ||
            (meta.height && meta.height > MAX_HEIGHT);

        const pipeline = needsResize
            ? img.resize(MAX_WIDTH, MAX_HEIGHT, {
                fit: "inside",
                withoutEnlargement: true,
            })
            : img;

        const processed = await pipeline
            .webp({
                quality: 87,
                alphaQuality: 100,
                lossless: false,
                smartSubsample: true,
            })
            .toBuffer();

        return Buffer.from(processed) as Buffer;
    } catch {
        return buffer;
    }
}

async function convertVideoToMp4(buffer: Buffer): Promise<Buffer> {
    // Bypass Next.js strict bundle checks by evaluating require directly
    const ffmpegInstaller = eval(`require('@ffmpeg-installer/ffmpeg')`);
    const ffmpegPath = ffmpegInstaller.path;
    const ffmpeg = require("fluent-ffmpeg");
    ffmpeg.setFfmpegPath(ffmpegPath);

    const tmpDir = os.tmpdir();
    const inputPath = join(tmpDir, `in_${Date.now()}_${Math.random().toString(36).substring(7)}.tmp`);
    const outputPath = join(tmpDir, `out_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`);

    await writeFile(inputPath, buffer);

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .videoCodec('libx264')
            .outputOptions([
                '-preset fast',
                '-crf 28',  // Good balance of compression vs quality
                '-movflags +faststart', // Web optimization (play before fully downloaded)
                '-pix_fmt yuv420p', // Broad compatibility
                '-vf scale=w=1920:h=1080:force_original_aspect_ratio=decrease'
            ])
            .on('end', async () => {
                try {
                    const outBuffer = await readFile(outputPath);
                    await unlink(inputPath).catch(() => { });
                    await unlink(outputPath).catch(() => { });
                    resolve(outBuffer);
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', async (err: Error) => {
                await unlink(inputPath).catch(() => { });
                await unlink(outputPath).catch(() => { });
                reject(err);
            })
            .run();
    });
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        let buffer = Buffer.from(bytes as ArrayBuffer) as unknown as Buffer;
        const isImage = file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".avif");
        const isVideo = file.type.startsWith("video/");

        let fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        let uploadMimeType = file.type;
        let mediaType = "IMAGE";

        if (isImage) {
            // Convert to WebP
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            buffer = (await processImage(buffer)) as any;
            fileName = fileName.replace(/\.[^.]+$/, ".webp");
            uploadMimeType = "image/webp";
            mediaType = "IMAGE";
        } else if (isVideo) {
            // Convert any video to mp4 Web-optimized
            buffer = await convertVideoToMp4(buffer);
            fileName = fileName.replace(/\.[^.]+$/, ".mp4");
            uploadMimeType = "video/mp4";
            mediaType = "VIDEO";
        }

        const uniqueName = `${Date.now()}-${fileName}`;
        const bunnyUrl = `https://${BUNNY_STORAGE_API_HOST}/${BUNNY_STORAGE_ZONE}/${uniqueName}`;

        const uploadRes = await fetch(bunnyUrl, {
            method: "PUT",
            headers: {
                AccessKey: BUNNY_ACCESS_KEY,
                "Content-Type": uploadMimeType,
            },
            body: new Uint8Array(buffer),
        });

        if (!uploadRes.ok) {
            const text = await uploadRes.text();
            return NextResponse.json({ error: `Bunny upload failed: ${text}` }, { status: 500 });
        }

        const cdnUrl = `https://${BUNNY_CDN_HOSTNAME}/${uniqueName}`;

        return NextResponse.json({ url: cdnUrl, type: mediaType });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
