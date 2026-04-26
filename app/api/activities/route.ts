import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/middleware/auth";

export const GET = async (req: NextRequest) => {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Activity logs are persisted in UserContext/localStorage on the client.
  return NextResponse.json([]);
};
