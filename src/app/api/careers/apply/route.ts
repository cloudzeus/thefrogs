import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function getMicrosoftToken(): Promise<string> {
    const tokenUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
    const res = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.APPLICATION_ID!,
            client_secret: process.env.CLIENT_SECRET_VALUE!,
            scope: "https://graph.microsoft.com/.default",
            grant_type: "client_credentials",
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Token error: ${data.error_description}`);
    return data.access_token;
}

async function sendThankYouEmail(to: string, firstName: string, positionTitle: string) {
    const token = await getMicrosoftToken();
    // Use connect@dgsmart.gr — must be a shared mailbox accessible by the Azure app
    const mailboxAddress = process.env.CAREERS_MAILBOX_ADDRESS || process.env.SHARED_MAILBOX_ADDRESS!;
    const replyToAddress = mailboxAddress;

    const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f9f9f9;">
  <div style="background: #0a0f18; border-radius: 16px; padding: 40px; color: #fff;">
    <img src="https://dgsoft.gr/logo.svg" alt="DGSOFT" style="height: 40px; margin-bottom: 30px;" />
    <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 8px;">Ευχαριστούμε, ${firstName}!</h1>
    <p style="color: #a0aec0; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
      Λάβαμε την αίτησή σας για τη θέση <strong style="color: #e63946;">${positionTitle}</strong>.
    </p>
    <p style="color: #a0aec0; font-size: 15px; line-height: 1.7;">
      Η ομάδα HR μας θα εξετάσει το βιογραφικό σας και θα επικοινωνήσει μαζί σας εντός 5-7 εργάσιμων ημερών.
    </p>
    <div style="margin: 30px 0; border-top: 1px solid rgba(255,255,255,0.1);"></div>
    <p style="color: #718096; font-size: 13px;">
      Με εκτίμηση,<br/>
      <strong style="color: #fff;">Ομάδα Ανθρώπινου Δυναμικού — DGSOFT</strong><br/>
      <a href="https://dgsoft.gr" style="color: #e63946; text-decoration: none;">dgsoft.gr</a>
    </p>
  </div>
</div>`;

    const res = await fetch(`https://graph.microsoft.com/v1.0/users/${mailboxAddress}/sendMail`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            message: {
                subject: `Λήψη Αίτησης — ${positionTitle} | DGSOFT`,
                body: { contentType: "HTML", content: emailBody },
                toRecipients: [{ emailAddress: { address: to } }],
                from: { emailAddress: { address: mailboxAddress, name: "Careers | DGSOFT" } },
                replyTo: [{ emailAddress: { address: replyToAddress, name: "Careers | DGSOFT" } }],
            },
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Graph API sendMail failed: ${err}`);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { firstName, lastName, phone, email, cvUrl, coverLetter, positionId } = body;

        if (!firstName || !lastName || !email || !cvUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Save to DB
        const application = await (prisma as any).cvApplication.create({
            data: { firstName, lastName, phone, email, cvUrl, coverLetter, positionId: positionId || null },
            include: { position: { select: { titleEL: true } } },
        });

        const positionTitle = application.position?.titleEL || "Γενική Αίτηση";

        // Send thank-you email — non-blocking
        sendThankYouEmail(email, firstName, positionTitle).catch(err =>
            console.error("Thank-you email error:", err)
        );

        return NextResponse.json({ success: true, id: application.id });
    } catch (e: any) {
        console.error("CV Application error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
