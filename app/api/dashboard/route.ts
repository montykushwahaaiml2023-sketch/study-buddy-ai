import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/middleware/auth";

export const GET = async (req: NextRequest) => {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Dashboard data is served from localStorage on the client (UserContext).
  // This endpoint returns a lightweight profile stub for server-side consumers.
  return NextResponse.json({
    profile: {
      name: "Scholar",
      streak: 0,
      recommendedNextStep: "Complete your onboarding",
      weakTopics: [],
    },
    lastChat: null,
    recentActivities: [],
    pendingTasks: [],
  });
};
