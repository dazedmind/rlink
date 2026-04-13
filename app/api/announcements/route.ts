import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { announcementAcknowledgments, announcements } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

function serializeRow(
  row: typeof announcements.$inferSelect,
  acknowledgedByMe?: boolean
) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(acknowledgedByMe !== undefined ? { acknowledgedByMe } : {}),
  };
}

export async function GET(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const userId = authResult.session!.user.id;

  try {
    const rows = await db
      .select({
        announcement: announcements,
        ackRowId: announcementAcknowledgments.id,
      })
      .from(announcements)
      .leftJoin(
        announcementAcknowledgments,
        and(
          eq(announcementAcknowledgments.announcementId, announcements.id),
          eq(announcementAcknowledgments.userId, userId)
        )
      )
      .orderBy(desc(announcements.createdAt));

    const data = rows.map(({ announcement, ackRowId }) =>
      serializeRow(announcement, ackRowId != null)
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/announcements]", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const body = await request.json();
    const headline = typeof body.headline === "string" ? body.headline.trim() : "";
    const text = typeof body.body === "string" ? body.body.trim() : "";

    if (!headline) {
      return NextResponse.json({ error: "Headline is required" }, { status: 400 });
    }
    if (!text) {
      return NextResponse.json({ error: "Body is required" }, { status: 400 });
    }

    const [created] = await db
      .insert(announcements)
      .values({ headline, body: text })
      .returning();

    revalidatePath("/home");
    return NextResponse.json(serializeRow(created), { status: 201 });
  } catch (error) {
    console.error("[POST /api/announcements]", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
