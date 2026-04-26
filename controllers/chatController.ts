import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Fetch all chat conversations for a specific user.
 */
export const getConversations = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const chats = await prisma.aIChat.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
};

/**
 * Save a new message and create a chat if it doesn't exist.
 */
export const saveMessage = async (request: Request) => {
  try {
    const body = await request.json();
    const { userId, chatId, role, content, title } = body;

    if (!userId || !role || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let chat;
    if (chatId) {
      chat = await prisma.aIChat.findUnique({
        where: { id: chatId },
      });
    }

    // Create a new chat if no chatId was provided or if the chat wasn't found
    if (!chat) {
      chat = await prisma.aIChat.create({
        data: {
          userId,
          title: title || (content.length > 50 ? `${content.substring(0, 47)}...` : content),
        },
      });
    }

    const message = await prisma.aIMessage.create({
      data: {
        chatId: chat.id,
        role,
        content,
      },
    });

    return NextResponse.json({ chat, message });
  } catch (error) {
    console.error("Save message error:", error);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
};

// --- Legacy Handlers (for backward compatibility if needed) ---

export const getChatHistory = getConversations;
export const saveChatHistory = saveMessage;
export const updateChatHistory = async (request: Request) => {
    return NextResponse.json({ message: "Update functionality not yet implemented" }, { status: 501 });
};
