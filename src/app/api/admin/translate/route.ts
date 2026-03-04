import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;

export async function POST(request: NextRequest) {
    try {
        const { text, from, to } = await request.json();

        if (!text || text.trim() === "") {
            return NextResponse.json({ translation: "" });
        }

        const fromLang = from === "EL" ? "Greek" : "English";
        const toLang = to === "EL" ? "Greek" : "English";

        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: `You are a professional translator. Translate the following text from ${fromLang} to ${toLang}. Return ONLY the translated text, no explanations, no quotation marks.`,
                    },
                    {
                        role: "user",
                        content: text,
                    },
                ],
                temperature: 0.3,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            return NextResponse.json({ error: `DeepSeek error: ${err}` }, { status: 500 });
        }

        const data = await response.json();
        const translation = data.choices?.[0]?.message?.content?.trim() || "";

        return NextResponse.json({ translation });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
