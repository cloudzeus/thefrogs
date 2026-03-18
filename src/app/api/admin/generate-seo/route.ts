import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY!;

export async function POST(req: NextRequest) {
    const { slug, titleEN, titleEL, subtitleEN, subtitleEL, textEN, textEL } = await req.json();

    const context = [
        `Page slug: /${slug}`,
        `Site: The Frogs Guesthouse — boutique hotel in Plaka, Athens, Greece`,
        `Site URL: https://frogs.wwa.gr`,
        titleEN ? `Title (EN): ${titleEN}` : "",
        titleEL ? `Title (GR): ${titleEL}` : "",
        subtitleEN ? `Subtitle (EN): ${subtitleEN}` : "",
        subtitleEL ? `Subtitle (GR): ${subtitleEL}` : "",
        textEN ? `Content (EN): ${String(textEN).slice(0, 600)}` : "",
        textEL ? `Content (GR): ${String(textEL).slice(0, 600)}` : "",
    ].filter(Boolean).join("\n");

    const prompt = `You are a senior technical SEO specialist and AI-search optimization expert for "The Frogs Guesthouse", a boutique hotel in the Plaka neighborhood of Athens, Greece (frogs.wwa.gr).

Your task: generate a complete, production-ready SEO metadata package for the page described below, optimized for:
1. Google Search (classic SEO)
2. AI answer engines: ChatGPT/SearchGPT, Perplexity AI, Google SGE/AI Overviews, Bing Copilot
3. Social sharing (Open Graph + Twitter Cards)
4. Local hospitality search signals

PAGE CONTEXT:
${context}

REQUIREMENTS:
- metaTitleEN / metaTitleEL: max 60 chars, brand + primary keyword, natural language
- metaDescriptionEN / metaDescriptionEL: 130-155 chars exactly, includes a call-to-action, answers "what is this page about" clearly for AI crawlers
- keywords: 8-12 comma-separated English terms — mix head terms (e.g. "Athens boutique hotel") with long-tail (e.g. "pet-friendly guesthouse Plaka Athens") and question-style terms AI engines use (e.g. "where to stay near Acropolis")
- ogTitle: Open Graph title (can be slightly longer/more emotional than metaTitle, max 70 chars)
- ogDescription: Open Graph description (max 200 chars, humanised, great for social sharing)
- twitterTitle: Twitter/X card title (max 70 chars, punchy)
- twitterDescription: Twitter/X card description (max 160 chars)
- canonicalHint: the canonical path for this page (e.g. "/rooms")
- robotsDirective: appropriate robots meta value (e.g. "index, follow" or "noindex, nofollow")
- schemaType: the most appropriate Schema.org @type for this page (e.g. "LodgingBusiness", "ItemPage", "FAQPage", "WebPage", "ContactPage")
- faqSuggestions: array of 3 natural-language questions a traveller would ask about this page's topic — these will be used as FAQPage schema entries to capture AI featured snippets. Each item is a string (question only, no answers needed here).
- aiSummary: a 2-3 sentence factual, entity-rich summary of this page written for AI crawlers (Bing Copilot, Perplexity). Should mention: property name, location (Plaka, Athens), what this specific page covers, and one differentiator. No marketing fluff.

Return ONLY valid JSON with exactly these keys (no markdown fences, no extra text):
{
  "metaTitleEN": "",
  "metaTitleEL": "",
  "metaDescriptionEN": "",
  "metaDescriptionEL": "",
  "keywords": "",
  "ogTitle": "",
  "ogDescription": "",
  "twitterTitle": "",
  "twitterDescription": "",
  "canonicalHint": "",
  "robotsDirective": "",
  "schemaType": "",
  "faqSuggestions": ["", "", ""],
  "aiSummary": ""
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
                temperature: 0.6,
                max_tokens: 1024,
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
