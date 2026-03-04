import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const res = await fetch("https://vat.wwa.gr/afm2info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("VAT API Route Error:", error);
        return NextResponse.json({ error: "Failed to fetch VAT info" }, { status: 500 });
    }
}
