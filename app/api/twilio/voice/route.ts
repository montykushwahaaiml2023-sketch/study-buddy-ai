import { NextResponse } from "next/server";
import twilio from "twilio";
import prisma from "@/lib/prisma";

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const eventId = url.searchParams.get("eventId") || "unknown";
    const taskId = url.searchParams.get("taskId") || "unknown";
    const taskName = url.searchParams.get("taskName") || "your primary task";
    const reason = url.searchParams.get("reason") || "deadline";

    console.log("🎙️ Voice Webhook Triggered for Task:", taskName);

    const twiml = new VoiceResponse();
    twiml.pause({ length: 1 });

    const gather = twiml.gather({
      input: ["speech"],
      speechModel: "numbers_and_commands",
      speechTimeout: "auto",
      action: `/api/twilio/process?eventId=${encodeURIComponent(eventId)}&taskId=${encodeURIComponent(taskId)}`,
      method: "POST",
    });

    if (reason === "manual_test") {
       gather.say({ language: 'hi-IN' }, `नमस्ते! मैं आपका स्टडी बडी एआई असिस्टेंट हूँ। मैं देख रहा हूँ कि आपका अगला टास्क है: ${taskName}. क्या मैं इसे आपके डैशबोर्ड पर पूरा हुआ मार्क कर दूँ, या आप अभी और काम करना चाहते हैं? मुझे बताएँ।`);
    } else if (reason === "manual") {
      gather.say({ language: 'hi-IN' }, `नमस्ते! मैं आपको चेक-इन करने के लिए कॉल कर रहा हूँ। आपका वर्तमान स्टडी टास्क है: ${taskName}. क्या आप इसे पूरा हुआ मार्क करना चाहते हैं, या क्या मुझे आपका प्लान एडजस्ट करना चाहिए?`);
    } else {
      gather.say({ language: 'hi-IN' }, `नमस्ते। आप अपने इस टास्क में थोड़ा पीछे चल रहे हैं: ${taskName}. मैं आपकी मदद के लिए हूँ। क्या मैं आपका टाइम टेबल बढ़ा दूँ, या आप इसे अभी पूरा हुआ मार्क करना चाहते हैं? कृपया अपना जवाब दें।`);
    }

    // If they don't say anything
    twiml.say({ language: 'hi-IN' }, "मैं अभी भी सुन रहा हूँ। अगर आपको और समय चाहिए तो कृपया अपने डैशबोर्ड को अपडेट करें। अभी के लिए अलविदा!");

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error: any) {
    console.error("Twilio Voice Webhook Error:", error);
    return new NextResponse("<Response><Say>An internal error occurred. Please check your dashboard.</Say></Response>", {
      status: 500,
      headers: { "Content-Type": "text/xml" },
    });
  }
}
