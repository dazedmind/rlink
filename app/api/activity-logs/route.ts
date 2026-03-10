import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activityLogs } from "@/db/schema";
import { user } from "@/db/auth-schema";
import { asc, desc, eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

const ITEMS_PER_PAGE = 10;

function getRequestInfo(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  return { ip, userAgent };
}

export async function GET(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? ITEMS_PER_PAGE)));
    const offset = (page - 1) * limit;
    const sort = searchParams.get("sort") ?? "newest";

    const [totalResult, rows] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(activityLogs),
      db
        .select({
          id: activityLogs.id,
          userId: activityLogs.userId,
          activity: activityLogs.activity,
          ipAddress: activityLogs.ipAddress,
          userAgent: activityLogs.userAgent,
          status: activityLogs.status,
          createdAt: activityLogs.createdAt,
          userName: user.name,
          userEmail: user.email,
        })
        .from(activityLogs)
        .leftJoin(user, eq(activityLogs.userId, user.id))
        .orderBy(sort === "oldest" ? asc(activityLogs.createdAt) : desc(activityLogs.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json({
      data: rows,
      page,
      limit,
      total,
    });
  } catch (error) {
    console.error("[GET /api/activity-logs]", error);
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const session = authResult.session!;

  try {
    const body = await request.json().catch(() => ({}));
    const activity = (body.activity as string)?.trim();
    if (!activity) {
      return NextResponse.json({ error: "Activity is required" }, { status: 400 });
    }

    const { ip, userAgent } = getRequestInfo(request);

    await db.insert(activityLogs).values({
      userId: session.user.id,
      activity,
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/activity-logs]", error);
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
  }
}
