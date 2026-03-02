import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";

const MAX_NAME_LENGTH = 200;
const MAX_SUBJECT_LENGTH = 300;
const MAX_PREVIEW_LENGTH = 200;
const MAX_BODY_LENGTH = 100_000;

const ALLOWED_UPDATE_FIELDS = [
  "name",
  "subject",
  "previewLine",
  "body",
  "status",
  "scheduledAt",
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });
    }

    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, numericId));

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ data: campaign });
  } catch (error) {
    console.error("[GET /api/newsletter/campaigns/:id]", error);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) {
    return NextResponse.json(
      { error: limitResult.error },
      {
        status: 429,
        headers: { "Retry-After": String(limitResult.retryAfter) },
      }
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
      return NextResponse.json({ error: "Campaign already sent and cannot be updated" }, { status: 400 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (body[field] === undefined) continue;

      if (field === "name") {
        const val = String(body.name ?? "").trim();
        if (!val) continue;
        if (val.length > MAX_NAME_LENGTH) {
          return NextResponse.json({ error: `Name must be at most ${MAX_NAME_LENGTH} characters` }, { status: 400 });
        }
        updates.name = val;
      } else if (field === "subject") {
        const val = String(body.subject ?? "").trim();
        if (!val) continue;
        if (val.length > MAX_SUBJECT_LENGTH) {
          return NextResponse.json({ error: `Subject must be at most ${MAX_SUBJECT_LENGTH} characters` }, { status: 400 });
        }
        updates.subject = val;
      } else if (field === "previewLine") {
        const val = String(body.previewLine ?? body.preview ?? "").trim();
        if (val.length > MAX_PREVIEW_LENGTH) {
          return NextResponse.json({ error: `Preview must be at most ${MAX_PREVIEW_LENGTH} characters` }, { status: 400 });
        }
        updates.previewLine = val;
      } else if (field === "body") {
        const val = String(body.body ?? "").trim();
        if (val.length > MAX_BODY_LENGTH) {
          return NextResponse.json({ error: `Body must be at most ${MAX_BODY_LENGTH} characters` }, { status: 400 });
        }
        updates.body = val;
      } else if (field === "status") {
        const val = body.status as string;
        if (!["draft", "scheduled"].includes(val)) {
          return NextResponse.json({ error: "Status must be draft or scheduled" }, { status: 400 });
        }
        updates.status = val;

        if (val === "scheduled") {
          const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
          if (!scheduledAt || isNaN(scheduledAt.getTime())) {
            return NextResponse.json({ error: "Valid scheduledAt required for scheduled status" }, { status: 400 });
          }
          if (scheduledAt.getTime() <= Date.now()) {
            return NextResponse.json({ error: "scheduledAt must be in the future" }, { status: 400 });
          }
          updates.scheduledAt = scheduledAt;
        } else {
          updates.scheduledAt = null;
        }
      } else if (field === "scheduledAt") {
        if (updates.status === "scheduled" && body.scheduledAt) {
          const d = new Date(body.scheduledAt);
          if (!isNaN(d.getTime()) && d.getTime() > Date.now()) {
            updates.scheduledAt = d;
          }
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid update fields provided" }, { status: 400 });
    }

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(campaigns)
      .set(updates as Partial<typeof campaigns.$inferInsert>)
      .where(eq(campaigns.id, numericId))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/newsletter/campaigns/:id]", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limitResult = rateLimit(request, { maxRequests: 20, windowMs: 60_000 });
  if (!limitResult.success) {
    return NextResponse.json(
      { error: limitResult.error },
      {
        status: 429,
        headers: { "Retry-After": String(limitResult.retryAfter) },
      }
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

    const [deleted] = await db
      .delete(campaigns)
      .where(eq(campaigns.id, numericId))
      .returning({ id: campaigns.id });

    if (!deleted) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/newsletter/campaigns/:id]", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
