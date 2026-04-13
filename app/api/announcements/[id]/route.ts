import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { announcements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

function serializeRow(row: typeof announcements.$inferSelect) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const limitResult = rateLimit(request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const [row] = await db.select().from(announcements).where(eq(announcements.id, numericId));
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(serializeRow(row));
  } catch (error) {
    console.error("[GET /api/announcements/:id]", error);
    return NextResponse.json({ error: "Failed to fetch announcement" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const limitResult = rateLimit(request, { maxRequests: 60, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 60);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const updates: Partial<{ headline: string; body: string }> = {};

    if (body.headline !== undefined) {
      const h = typeof body.headline === "string" ? body.headline.trim() : "";
      if (!h) {
        return NextResponse.json({ error: "Headline cannot be empty" }, { status: 400 });
      }
      updates.headline = h;
    }
    if (body.body !== undefined) {
      const t = typeof body.body === "string" ? body.body.trim() : "";
      if (!t) {
        return NextResponse.json({ error: "Body cannot be empty" }, { status: 400 });
      }
      updates.body = t;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(announcements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(announcements.id, numericId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    revalidatePath("/home");
    return NextResponse.json(serializeRow(updated));
  } catch (error) {
    console.error("[PATCH /api/announcements/:id]", error);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const limitResult = rateLimit(request, { maxRequests: 60, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 60);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const [deleted] = await db.delete(announcements).where(eq(announcements.id, numericId)).returning();
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    revalidatePath("/home");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/announcements/:id]", error);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
