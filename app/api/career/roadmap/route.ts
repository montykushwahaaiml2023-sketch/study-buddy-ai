import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey });

export async function POST(req: Request) {
  try {
    const { careerGoal, profile } = await req.json();

    if (!careerGoal) {
      return NextResponse.json({ error: "Career goal is required" }, { status: 400 });
    }

    const systemPrompt = `You are an Elite AI Career Strategist.
    Your task is to generate a personalized, 3-stage career roadmap for a student.
    
    Student Profile:
    - Name: ${profile.name}
    - Course: ${profile.course}
    - Major/Stream: ${profile.branch} (Year: ${profile.year})
    - Career Goal: ${careerGoal}
    - Current Skills: ${profile.skills?.join(", ") || "Beginner"}
    - Learning Style: ${profile.learningStyle}
    
    Format your response EXACTLY as a JSON object inside [ROADMAP_STAGED] tags.
    Each stage should have 'stage' (Beginner/Intermediate/Advanced), 'phase' (a time range), and 'tasks' (array of 3-4 specific high-impact actions).
    Also include 'skillGap' (array of 4 objects with { name, current, required, color }) and 'projects' (array of 4 objects with { level, title, tech }).

    Example Format:
    [ROADMAP_STAGED]
    {
      "roadmap": [
        { "stage": "Beginner", "phase": "Month 1-3", "tasks": ["...", "..."], "status": "completed" },
        { "stage": "Intermediate", "phase": "Month 4-7", "tasks": ["...", "..."], "status": "current" },
        { "stage": "Advanced", "phase": "Month 8-12", "tasks": ["...", "..."], "status": "upcoming" }
      ],
      "skillGap": [
        { "name": "...", "current": 30, "required": 85, "color": "bg-cyan-500" }
      ],
      "projects": [
        { "level": "Beginner", "title": "...", "tech": "..." }
      ]
    }
    [/ROADMAP_STAGED]`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.1,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    const match = responseText.match(/\[ROADMAP_STAGED\]([\s\S]*?)\[\/ROADMAP_STAGED\]/);

    if (!match) {
        console.error("Failed to parse roadmap from AI response:", responseText);
        throw new Error("AI failed to generate a valid roadmap structure.");
    }

    const data = JSON.parse(match[1].trim());
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Roadmap API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
