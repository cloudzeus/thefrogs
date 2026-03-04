import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { titleEL, customerName, servicesUsed } = await req.json();

        if (!titleEL) {
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

        const context = [
            customerName ? `Customer/Client: ${customerName}` : null,
            servicesUsed?.length ? `Services used: ${servicesUsed.join(", ")}` : null,
        ].filter(Boolean).join("\n");

        const prompt = `You are an expert B2B copywriter and digital marketing strategist. Generate compelling case study content for a Greek software/ERP company's portfolio.

Project Title (Greek): "${titleEL}"
${context ? `Context:\n${context}` : ""}

Generate a complete portfolio case study in strict JSON format. Output ONLY valid raw JSON, no markdown wrappers.

JSON Structure:
{
  "titleEN": "Professional English translation of the project title",
  "challengeEL": "2-3 paragraphs in Greek describing the business challenge the customer faced before implementing the solution. Be specific and compelling.",
  "challengeEN": "Same challenge in English",
  "stepsEL": ["Step 1 description in Greek", "Step 2 description in Greek", "Step 3 description in Greek", "Step 4 description in Greek", "Step 5 description in Greek"],
  "stepsEN": ["Step 1 in English", "Step 2 in English", "Step 3 in English", "Step 4 in English", "Step 5 in English"],
  "stats": [
    { "icon": "TrendingUp", "value": "40%", "textEL": "Αύξηση παραγωγικότητας", "textEN": "Productivity Increase" },
    { "icon": "Clock", "value": "60%", "textEL": "Μείωση χρόνου επεξεργασίας", "textEN": "Processing Time Reduction" },
    { "icon": "Users", "value": "200+", "textEL": "Χρήστες στο σύστημα", "textEN": "Users on the platform" },
    { "icon": "CheckCircle", "value": "99.9%", "textEL": "Λειτουργική αξιοπιστία", "textEN": "System reliability" }
  ]
}

Rules:
- stepsEL and stepsEN must each have exactly 5 bullet points describing the implementation process
- stats must have exactly 4 items with realistic and impressive metrics
- icon values must be valid Lucide icon names: TrendingUp, Clock, Users, CheckCircle, BarChart2, Database, Zap, Shield, Globe, Award
- challengeEL/EN should be compelling business narrative, not technical jargon
- Output ONLY raw JSON, no explanation text`;

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
            const jsonStart = content.indexOf('{');
            const jsonEnd = content.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                parsedData = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
            } else {
                throw new Error("Failed to parse AI JSON response");
            }
        }

        return NextResponse.json(parsedData);

    } catch (error: any) {
        console.error("Work Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
