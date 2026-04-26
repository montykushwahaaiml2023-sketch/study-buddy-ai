import { NextResponse } from "next/server";
import twilio from "twilio";
import Groq from "groq-sdk";
import prisma from "@/lib/prisma";

const apiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey });

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const eventIdParam = url.searchParams.get("eventId") || "unknown";
    
    // Parse Twilio form data
    const formData = await req.formData();
    const speechResult = formData.get("SpeechResult") as string;
    
    if (!speechResult) {
      console.log("No speech heard, skipping mutation.");
      return new NextResponse("<Response><Say>I didn't hear a command. Please check your dashboard.</Say></Response>", {
        headers: { "Content-Type": "text/xml" }
      });
    }

    console.log(`🎙️ Voice Agent heard: "${speechResult}"`);

    // Attempt to load context from SQLite
    let session = null;
    try {
      session = await prisma.callSession.findFirst({
        where: { eventId: eventIdParam },
        orderBy: { createdAt: 'desc' }
      });
    } catch (e) {
      console.warn("⚠️ Process Route: Database lookup failed, proceeding without context.");
    }
    
    // Only proceed with LLM mutation if we have a session/profile
    if (session) {
      const profile = JSON.parse(session.profile);
      const { eventId, taskName } = session;

      // Use Groq to generate a new task list
      const systemPrompt = `You are a world-class AI Study Planner agent.
      A student missed their deadline for "${taskName}".
      They just said: "${speechResult}".
      
      Your goal is to REWRITE their study plan for TODAY according to their voice command.
      If they say "Push it back 30 mins", shift all remaining tasks.
      If they say "Skip it", remove the overdue task.
      You must output ONLY the new task list array inside [UPDATE_PLAN] tags.
      
      [UPDATE_PLAN]
      [
        { "task": "...", "type": "...", "estimated_time": "...", "priority": "...", "reason": "..." }
      ]
      [/UPDATE_PLAN]`;

      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3. instant", // Fixed typo if any
          temperature: 0.1,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `CURRENT PLAN TASKS: ${JSON.stringify(profile.events.find((e: any) => e.id === eventId)?.plan?.today_tasks || [])}` }
          ]
        });

        const responseText = completion.choices[0]?.message?.content || "";
        const updateMatch = responseText.match(/\[UPDATE_PLAN\]([\s\S]*?)\[\/UPDATE_PLAN\]/);

        if (updateMatch) {
          const rawBlock = updateMatch[1].trim().replace(/```json/g, "").replace(/```/g, "");
          const newTasks = JSON.parse(rawBlock);
          
          await prisma.twilioUpdate.create({
            data: {
              eventId,
              newTasks: JSON.stringify(newTasks),
              voiceCommand: speechResult
            }
          });
        }
      } catch (llmErr) {
        console.error("LLM Mutation Error:", llmErr);
      }
    }

    const twiml = new twilio.twiml.VoiceResponse();
    if (!session) {
      twiml.say("Command received. Note that because your database is currently out of sync, I cannot update your dashboard automatically yet, but your request has been noted. Good luck with your study!");
    } else {
      twiml.say("Command received. I have updated your study roadmap according to your request. Speak to you soon!");
    }
    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" }
    });
  } catch (error: any) {
    console.error("Twilio Process Error:", error);
    return new NextResponse("<Response><Say>Error processing your request.</Say></Response>", {
      headers: { "Content-Type": "text/xml" }
    });
  }
}
