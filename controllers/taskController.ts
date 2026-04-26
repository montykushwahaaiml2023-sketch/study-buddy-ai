import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Fetch all tasks for a specific user
 */
export const getTasks = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { scheduledDate: "asc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
};

/**
 * Create a new task
 */
export const createTask = async (request: Request) => {
  try {
    const body = await request.json();
    const { userId, eventId, topic, scheduledDate, durationMinutes, difficulty, priority } = body;

    if (!userId || !eventId || !topic || !scheduledDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        userId,
        eventId,
        topic,
        scheduledDate: new Date(scheduledDate),
        durationMinutes: durationMinutes || 30,
        difficulty: difficulty || "medium",
        priority: priority || "medium",
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;
    const body = await request.json();

    // Prepare update data, converting dates if present
    const updateData = { ...body };
    if (updateData.scheduledDate) updateData.scheduledDate = new Date(updateData.scheduledDate);
    if (updateData.completedAt) updateData.completedAt = new Date(updateData.completedAt);

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
};
