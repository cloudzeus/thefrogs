import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { title } = await req.json();

        if (!title) {
            return NextResponse.json({ error: "Missing title" }, { status: 400 });
        }

        const isDeepseek = !!process.env.DEEPSEEK_API_KEY;
        const apiUrl = isDeepseek
            ? (process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions")
            : "https://api.openai.com/v1/chat/completions";
        const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
        const model = isDeepseek ? "deepseek-chat" : "gpt-4o-mini";

        if (!apiKey) {
            return NextResponse.json({ error: "No AI API Key Available" }, { status: 500 });
        }

        const prompt = `You are an expert SEO copywriter and journalist. Your task is to generate a comprehensive, highly engaging, and SEO-optimized article structure based ONLY on the provided title: "${title}".
        
You must generate the output in strict JSON format matching the structure exactly below, with no markdown code blocks outside the pure JSON string. Wait, just output valid JSON.

JSON Structure:
{
  "titleEN": "A catchy translated English title",
  "shortDescriptionEL": "A compelling 2-3 sentence Greek summary optimized for SEO and readability.",
  "shortDescriptionEN": "A compelling 2-3 sentence English summary optimized for SEO and readability.",
  "descriptionEL": "A fully detailed article body in Greek. CRITICAL: MUST use rich semantic HTML (<h2>, <p>, <strong>, <ul>, etc.) instead of Markdown. Make it comprehensive, engaging, and SEO-friendly.",
  "descriptionEN": "A fully detailed article body in English. CRITICAL: MUST use rich semantic HTML matching the Greek structure. Make it comprehensive, engaging, and SEO-friendly.",
  "metaTitleEL": "SEO Optimized Meta Title (Greek, max 60 chars)",
  "metaTitleEN": "SEO Optimized Meta Title (English, max 60 chars)",
  "metaDescriptionEL": "SEO Optimized Meta Description (Greek, max 160 chars)",
  "metaDescriptionEN": "SEO Optimized Meta Description (English, max 160 chars)",
  "keywordsEL": "keyword1, keyword2, keyword3",
  "keywordsEN": "keyword1, keyword2, keyword3",
  "categories": [
     { "nameEL": "Τεχνολογία", "nameEN": "Technology" },
     { "nameEL": "Ειδήσεις", "nameEN": "News" }
  ]
}

Ensure the HTML descriptions are robust and look like a proper news/blog post. Limit categories to 2 or 3 highly relevant tags.
Generate highly targeted keywords to maximize Google Search visibility.
Output ONLY raw JSON. Do not include \`\`\`json wrappers.`;

        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        if (!res.ok) {
            const errorBase = await res.text();
            throw new Error(`AI API Failed: ${res.statusText} - ${errorBase}`);
        }

        const data = await res.json();
        const content = data.choices[0]?.message?.content?.trim();

        let parsedData;
        try {
            parsedData = JSON.parse(content);
        } catch (e) {
            // fallback if it included markdown blocks or raw text
            console.warn("Direct JSON parse failed, attempting extraction...");
            const jsonStart = content.indexOf('{');
            const jsonEnd = content.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                const extracted = content.slice(jsonStart, jsonEnd + 1);
                try {
                    parsedData = JSON.parse(extracted);
                } catch (e2) {
                    console.error("RAW AI OUTPUT (Failed Extraction):", content);
                    throw new Error("Failed to parse extracted JSON response from AI");
                }
            } else {
                console.error("RAW AI OUTPUT (No JSON Object Found):", content);
                throw new Error("Failed to find valid JSON object in AI response");
            }
        }

        return NextResponse.json(parsedData);

    } catch (error: any) {
        console.error("Article Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
