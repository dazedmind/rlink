import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletter } from "@/db/schema";
import { asc, count, desc, eq, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { searchParams } = request.nextUrl;
    
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const offset = (page - 1) * limit;

    // Optional filters
    const statusParam = searchParams.get("status");
    const statusValues = statusParam ? statusParam.split(",").filter(Boolean) : [];
    const sort = searchParams.get("sort") ?? "newest";

    const whereClause =
      statusValues.length > 0
        ? inArray(newsletter.status, statusValues as ("subscribed" | "unsubscribed")[])
        : undefined;

    const orderBy = (() => {
      switch (sort) {
        case "oldest":   return asc(newsletter.createdAt);
        case "email_az": return asc(newsletter.email);
        case "email_za": return desc(newsletter.email);
        default:         return desc(newsletter.createdAt); // newest
      }
    })();

    const [{ total }, { totalSubscribed }, { totalUnsubscribed }, subscribers] = await Promise.all([
      db.select({ total: count() }).from(newsletter).where(whereClause).then((r) => r[0]),
      db.select({ totalSubscribed: count() }).from(newsletter).where(eq(newsletter.status, "subscribed")).then((r) => r[0]),
      db.select({ totalUnsubscribed: count() }).from(newsletter).where(eq(newsletter.status, "unsubscribed")).then((r) => r[0]),
      db.select().from(newsletter).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
    ]);

    return NextResponse.json({
      data: subscribers,
      page,
      limit,
      total,
      totalSubscribed,
      totalUnsubscribed,
    });
  } catch (error) {
    console.error("[GET /api/newsletter/subscriptions]", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}