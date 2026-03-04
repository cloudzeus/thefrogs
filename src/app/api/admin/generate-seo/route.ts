import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY!;

export async function POST(req: NextRequest) {
    const { slug, titleEN, titleEL, subtitleEN, subtitleEL, textEN, textEL } = await req.json();

    const context = [
        `Page slug: ${slug}`,
        titleEN ? `Title (EN): ${titleEN}` : "",
        titleEL ? `Title (GR): ${titleEL}` : "",
        subtitleEN ? `Subtitle (EN): ${subtitleEN}` : "",
        subtitleEL ? `Subtitle (GR): ${subtitleEL}` : "",
        textEN ? `Content excerpt (EN): ${String(textEN).slice(0, 400)}` : "",
        textEL ? `Content excerpt (GR): ${String(textEL).slice(0, 400)}` : "",
    ].filter(Boolean).join("\n");

    const prompt = `You are an expert SEO copywriter for "The Frogs Guesthouse", a boutique hotel in Athens, Greece.

Based on the following page information, generate SEO metadata in BOTH English and Greek.

${context}

Return ONLY valid JSON in exactly this shape (no markdown, no explanation):
{
  "metaTitleEN": "...",       // max 60 chars, compelling, includes brand
  "metaTitleEL": "...",       // max 60 chars, Greek version
  "metaDescriptionEN": "...", // 120-155 chars, natural, enticing
  "metaDescriptionEL": "...", // 120-155 chars, Greek version
  "keywords": "..."           // 6-10 comma-separated English keywords
}`;

    try {
        const res = await fetch(DEEPSEEK_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${DEEPSEEK_KEY}`,
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 512,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            return NextResponse.json({ error: err }, { status: 500 });
        }

        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content ?? "{}";

        // Strip potential markdown fences
        const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(clean);

        return NextResponse.json(parsed);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
