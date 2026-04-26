import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Find the latest unprocessed update in PostgreSQL via Prisma
    const update = await prisma.twilioUpdate.findFirst({
      where: { processed: false },
      orderBy: { createdAt: 'desc' }
    });
    
    if (update) {
      // Mark as processed so it's only consumed once
      await prisma.twilioUpdate.update({
        where: { id: update.id },
        data: { processed: true }
      });
      
      return NextResponse.json({ 
        updateAvailable: true, 
        eventId: update.eventId, 
        newTasks: JSON.parse(update.newTasks), 
        voiceCommand: update.voiceCommand 
      });
    }

    return NextResponse.json({ updateAvailable: false });
  } catch (error) {
    console.error("Poller Error:", error);
    return NextResponse.json({ updateAvailable: false }, { status: 500 });
  }
}
