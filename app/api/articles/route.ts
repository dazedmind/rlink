import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles } from "@/db/schema";
import { and, asc, count, desc, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";
import { nameToSlug } from "@/app/utils/nameToSlug";

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

    const typeParam = searchParams.get("type");
    const typeValues = typeParam ? typeParam.split(",").filter(Boolean) : [];
    const sort = searchParams.get("sort") ?? "newest";

    const conditions: Parameters<typeof and>[0][] = [];
    if (typeValues.length > 0) {
      conditions.push(inArray(articles.type, typeValues as ("news" | "blog")[]));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderBy = (() => {
      switch (sort) {
        case "oldest":
          return asc(articles.publishDate);
        case "newest":
        default:
          return desc(articles.publishDate);
      }
    })();

    const [{ total }, data] = await Promise.all([
      db.select({ total: count() }).from(articles).where(whereClause).then((r) => r[0]),
      db
        .select()
        .from(articles)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
    ]);

    return NextResponse.json({ data, page, limit, total: total ?? 0 });
  } catch (error) {
    console.error("[GET /api/articles]", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
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
    const reqBody = await request.json();
    const { headline, slug, body: articleBody, publishDate, tags, type, photoUrl, isFeatured } = reqBody;

    if (!headline?.trim()) {
      return NextResponse.json(
        { error: "Headline is required" },
        { status: 400 }
      );
    }
    if (!articleBody?.trim()) {
      return NextResponse.json(
        { error: "Body is required" },
        { status: 400 }
      );
    }
    if (!publishDate) {
      return NextResponse.json(
        { error: "Publish date is required" },
        { status: 400 }
      );
    }
    if (!type || !["news", "blog"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'news' or 'blog'" },
        { status: 400 }
      );
    }

    const pubDate = new Date(publishDate);
    const publishDateStr = pubDate.toISOString().slice(0, 10);
    const slugValue = slug?.trim() ? nameToSlug(slug) : nameToSlug(headline);

    const [created] = await db
      .insert(articles)
      .values({
        headline: headline.trim(),
        slug: slugValue,
        body: articleBody.trim(),
        publishDate: publishDateStr,
        tags: Array.isArray(tags) ? tags : [],
        type,
        photoUrl: photoUrl?.trim() ?? null,
        isFeatured: Boolean(isFeatured),
      } as typeof articles.$inferInsert)
      .returning();

    revalidatePath("/home");
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/articles]", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
