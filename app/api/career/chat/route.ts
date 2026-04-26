import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey });

export async function POST(req: Request) {
  try {
    const { messages, roadmap, profile, careerGoal } = await req.json();

    const systemPrompt = `You are an AI Career Mentor for ${profile.name}.
    You are currently viewing their "Career Trajectory" dashboard for the goal: ${careerGoal}.
    
    Current Roadmap Summary:
    ${JSON.stringify(roadmap?.roadmap || "Not generated yet")}
    
    Student Context:
    - Major: ${profile.branch} (${profile.course})
    - Current Skills: ${profile.skills?.join(", ") || "Beginner"}
    
    Your goal is to give precise, encouraging, and highly technical career advice based on their roadmap.
    If they haven't generated a roadmap yet, encourage them to define a goal.
    Be concise (minimalism is the theme).`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ 
      content: completion.choices[0]?.message?.content || "I'm processing your trajectory..." 
    });

  } catch (error: any) {
    console.error("Career Chat Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
