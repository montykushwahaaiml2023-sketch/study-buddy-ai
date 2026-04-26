import { NextResponse } from "next/server";
import twilio from "twilio";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("☎️ Call Request Received...");
    const { phoneNumber, taskId, eventId, taskName, profile, reason = "deadline" } = await req.json();

    if (!phoneNumber || !eventId || !profile) {
      console.warn("❌ Missing Call Data:", { phoneNumber, eventId, profile: !!profile });
      return NextResponse.json({ error: "Missing required call data." }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioNumber) {
      console.error("❌ Twilio Credentials Missing in .env!");
      return NextResponse.json({ error: "Twilio credentials missing" }, { status: 500 });
    }

    console.log("💾 Creating CallSession in SQLite (Optional)...");
    let session;
    try {
      session = await prisma.callSession.create({
        data: {
          profile: JSON.stringify(profile),
          eventId,
          taskId,
          taskName,
          reason
        }
      });
      console.log("✅ CallSession created:", session.id);
    } catch (dbErr: any) {
      console.warn("⚠️ DATABASE WARNING (CallSession skipped):", dbErr.message);
      // We continue even if DB fails to ensure the demo works
    }

    const client = twilio(accountSid, authToken);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      console.error("❌ NEXT_PUBLIC_BASE_URL is missing!");
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_BASE_URL" }, { status: 500 });
    }

    // We pass taskId and taskName in params so voice route doesn't need DB
    const webhookUrl = `${baseUrl}/api/twilio/voice?eventId=${encodeURIComponent(eventId)}&taskId=${encodeURIComponent(taskId)}&taskName=${encodeURIComponent(taskName)}&reason=${encodeURIComponent(reason)}`;
    
    console.log("📞 Triggering Twilio Outbound Call...");
    const call = await client.calls.create({
      url: webhookUrl,
      to: phoneNumber,
      from: twilioNumber,
    });

    console.log("✅ Twilio Call SID:", call.sid);

    // Update session with callSid if session exists
    if (session) {
      try {
        await prisma.callSession.update({
          where: { id: session.id },
          data: { callSid: call.sid }
        });
      } catch (e) {}
    }

    return NextResponse.json({ success: true, callSid: call.sid });
  } catch (error: any) {
    console.error("❌ CRITICAL CALL ROUTE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
