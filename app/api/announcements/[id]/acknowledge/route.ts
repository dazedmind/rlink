import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { announcementAcknowledgments, announcements } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

function serializeRow(
  row: typeof announcements.$inferSelect,
  acknowledgedByMe: boolean
) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    acknowledgedByMe,
  };
}

/** Records one acknowledgment for the signed-in user; increments aggregate count only on first ack. */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const limitResult = rateLimit(request, { maxRequests: 60, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 60);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const userId = authResult.session!.user.id;

  try {
    const { id } = await params;
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const [announcement] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, numericId));

    if (!announcement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [already] = await db
      .select({ id: announcementAcknowledgments.id })
      .from(announcementAcknowledgments)
      .where(
        and(
          eq(announcementAcknowledgments.userId, userId),
          eq(announcementAcknowledgments.announcementId, numericId)
        )
      )
      .limit(1);

    if (already) {
      revalidatePath("/home");
      return NextResponse.json(serializeRow(announcement, true));
    }

    await db.insert(announcementAcknowledgments).values({
      userId,
      announcementId: numericId,
    });

    const [bumped] = await db
      .update(announcements)
      .set({
        acknowledgeCount: sql`${announcements.acknowledgeCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, numericId))
      .returning();

    revalidatePath("/home");
    return NextResponse.json(serializeRow(bumped ?? announcement, true));
  } catch (error) {
    console.error("[POST /api/announcements/:id/acknowledge]", error);
    return NextResponse.json({ error: "Failed to record acknowledgment" }, { status: 500 });
  }
}
