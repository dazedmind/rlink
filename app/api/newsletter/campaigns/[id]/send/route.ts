import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/newsletter/campaigns/[id]/send
 * Marks a draft campaign as sent (status=sent, sentAt=now).
 * Actual email delivery would be handled by a separate job/worker.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limitResult = rateLimit(request, { maxRequests: 10, windowMs: 60_000 });
  if (!limitResult.success) {
    return NextResponse.json(
      { error: limitResult.error },
      { status: 429, headers: { "Retry-After": String(limitResult.retryAfter) } }
    );
  }

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });
    }

    const [existing] = await db.select().from(campaigns).where(eq(campaigns.id, numericId));
    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (existing.status === "sent") {
      return NextResponse.json({ error: "Campaign has already been sent" }, { status: 400 });
    }

    const [updated] = await db
      .update(campaigns)
      .set({
        status: "sent",
        sentAt: new Date(),
        scheduledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, numericId))
      .returning();

    return NextResponse.json({ data: updated, message: "Campaign sent successfully" });
  } catch (error) {
    console.error("[POST /api/newsletter/campaigns/:id/send]", error);
    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}
