import { NextResponse } from "next/server";
import { updateTask, deleteTask } from "@/controllers/taskController";

/**
 * PUT /api/tasks/[id]
 * Updates a task. Params is a Promise in Next.js 16.
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    return await updateTask(request, { params });
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id]
 * Deletes a task.
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    return await deleteTask(request, { params });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
