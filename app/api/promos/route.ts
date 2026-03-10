import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promos } from "@/db/schema";
import { and, asc, count, desc, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const offset = (page - 1) * limit;
    const sort = searchParams.get("sort") ?? "newest";

    const statusParam = searchParams.get("status");
    const statusValues = statusParam ? statusParam.split(",").filter(Boolean) : [];
    const whereClause =
      statusValues.length > 0
        ? and(inArray(promos.status, statusValues))
        : undefined;

    const orderBy = sort === "oldest" ? asc(promos.createdAt) : desc(promos.createdAt);

    const [{ total }, data] = await Promise.all([
      db.select({ total: count() }).from(promos).where(whereClause).then((r) => r[0]),
      db
        .select()
        .from(promos)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
    ]);

    return NextResponse.json({ data, page, limit, total: total ?? 0 });
  } catch (error) {
    console.error("[GET /api/promos]", error);
    return NextResponse.json(
      { error: "Failed to fetch promos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const body = await request.json();
    const { title, description, imageUrl, linkUrl, status, startDate, endDate } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(promos)
      .values({
        title: title.trim(),
        description: description?.trim() ?? null,
        imageUrl: imageUrl?.trim() ?? null,
        linkUrl: linkUrl?.trim() ?? null,
        status: status?.trim() ?? "draft",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      } as typeof promos.$inferInsert)
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/promos]", error);
    return NextResponse.json(
      { error: "Failed to create promo" },
      { status: 500 }
    );
  }
}
