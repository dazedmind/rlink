import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, newsletter } from "@/db/schema";
import { asc, count, desc, eq, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";

const MAX_NAME_LENGTH = 200;
const MAX_SUBJECT_LENGTH = 300;
const MAX_PREVIEW_LENGTH = 200;
const MAX_BODY_LENGTH = 100_000;

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { searchParams } = request.nextUrl;
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const offset = (page - 1) * limit;

    const statusParam = searchParams.get("status");
    const statusValues = statusParam ? statusParam.split(",").filter(Boolean) : [];
    const sort = searchParams.get("sort") ?? "newest";

    const whereClause =
      statusValues.length > 0
        ? inArray(campaigns.status, statusValues as ("draft" | "scheduled" | "sent")[])
        : undefined;

    const orderBy = (() => {
      switch (sort) {
        case "oldest":   return asc(campaigns.createdAt);
        case "name_az":  return asc(campaigns.name);
        case "name_za":  return desc(campaigns.name);
        default:         return desc(campaigns.createdAt);
      }
    })();

    const [{ total }, { totalSent }, campaign] = await Promise.all([
      db.select({ total: count() }).from(campaigns).where(whereClause).then((r) => r[0]),
      db.select({ totalSent: count() }).from(campaigns).where(eq(campaigns.status, "sent")).then((r) => r[0]),
      db.select().from(campaigns).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
    ]);

    return NextResponse.json({ data: campaign, page, limit, total, totalSent: totalSent ?? 0 });
  } catch (error) {
    console.error("[GET /api/newsletter/campaigns]", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 20, windowMs: 60_000 });
  if (!limitResult.success) {
    return NextResponse.json(
      { error: limitResult.error },
      {
        status: 429,
        headers: {
          "Retry-After": String(limitResult.retryAfter),
          "X-RateLimit-Limit": "20",
        },
      }
    );
  }

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const previewLine = String(body.previewLine ?? body.preview ?? "").trim();
    const bodyContent = String(body.body ?? "").trim();
    const status = (body.status as "draft" | "scheduled" | "sent") ?? "draft";
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;

    if (!name) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
    }
    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: `Name must be at most ${MAX_NAME_LENGTH} characters` }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (subject.length > MAX_SUBJECT_LENGTH) {
      return NextResponse.json({ error: `Subject must be at most ${MAX_SUBJECT_LENGTH} characters` }, { status: 400 });
    }
    if (previewLine.length > MAX_PREVIEW_LENGTH) {
      return NextResponse.json({ error: `Preview must be at most ${MAX_PREVIEW_LENGTH} characters` }, { status: 400 });
    }
    if (bodyContent.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ error: `Body must be at most ${MAX_BODY_LENGTH} characters` }, { status: 400 });
    }
    if (!["draft", "scheduled", "sent"].includes(status)) {
      return NextResponse.json({ error: "Status must be draft, scheduled, or sent" }, { status: 400 });
    }
    if (status === "scheduled") {
      if (!scheduledAt || isNaN(scheduledAt.getTime())) {
        return NextResponse.json({ error: "Valid scheduledAt is required for scheduled campaigns" }, { status: 400 });
      }
      if (scheduledAt.getTime() <= Date.now()) {
        return NextResponse.json({ error: "scheduledAt must be in the future" }, { status: 400 });
      }
    }

    const [{ count: recipientCount }] = await db
      .select({ count: count() })
      .from(newsletter)
      .where(eq(newsletter.status, "subscribed"));

    const [created] = await db
      .insert(campaigns)
      .values({
        name,
        subject,
        previewLine,
        body: bodyContent,
        recipients: recipientCount ?? 0,
        status,
        scheduledAt: status === "scheduled" ? scheduledAt : null,
        sentAt: status === "sent" ? new Date() : null,
      })
      .returning();

    revalidatePath("/home");
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/newsletter/campaigns]", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
