import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inquiry } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const allowedFields = ["status", "notes"] as const;
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(inquiry)
      .set(updates as Partial<typeof inquiry.$inferInsert>)
      .where(eq(inquiry.id, numericId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/inquiries/:id]", error);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}
