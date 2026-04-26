import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_hackathon";

export const authenticate = async (req: NextRequest) => {
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return { error: "No token provided", status: 401 };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return { userId: decoded.userId };
  } catch (error) {
    return { error: "Invalid token", status: 401 };
  }
};
