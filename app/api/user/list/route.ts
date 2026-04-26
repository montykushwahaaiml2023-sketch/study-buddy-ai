import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        profile: true
      }
    });

    const formattedUsers = users.map(user => ({
      name: user.name,
      role: `${user.profile?.year || ""} ${user.profile?.stream || ""} ${user.profile?.branch || ""}`.trim() || "Scholar",
      text: user.profile?.careerGoal ? `Aiming for ${user.profile.careerGoal}. Currently leveling up at ${user.profile.skillLevel || 'Beginner'} level.` : "Leveling up with AI-powered neural study roadmaps and real-time coaching.",
      stars: 5,
      avatar: user.name.split(" ").map(n => n[0]).join("").toUpperCase() || "S"
    }));

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error: any) {
    console.error("List Users Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
