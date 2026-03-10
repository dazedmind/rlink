import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const limitResult = rateLimit(request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const articleId = Number(id);

    if (isNaN(articleId)) {
      return NextResponse.json({ error: "Invalid article id" }, { status: 400 });
    }

    const [article] = await db.select().from(articles).where(eq(articles.id, articleId));

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("[GET /api/articles/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const limitResult = rateLimit(request, { maxRequests: 60, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 60);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const articleId = Number(id);

    if (isNaN(articleId)) {
      return NextResponse.json({ error: "Invalid article id" }, { status: 400 });
    }

    const body = await request.json();

    const allowedFields = [
      "headline",
      "body",
      "publishDate",
      "tags",
      "type",
      "photoUrl",
      "isFeatured",
    ] as const;

    const updates: Partial<typeof articles.$inferInsert> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        const val = body[field];
        if (field === "publishDate") {
          (updates as Record<string, unknown>)[field] = val
            ? new Date(val).toISOString().slice(0, 10)
            : undefined;
        } else if (field === "tags") {
          (updates as Record<string, unknown>)[field] = Array.isArray(val) ? val : [];
        } else if (field === "isFeatured") {
          (updates as Record<string, unknown>)[field] = Boolean(val);
        } else if (field === "type" && !["news", "blog"].includes(val)) {
          continue;
        } else {
          (updates as Record<string, unknown>)[field] =
            typeof val === "string" ? val.trim() : val;
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    (updates as Record<string, unknown>).updatedAt = new Date();

    const [updated] = await db
      .update(articles)
      .set(updates)
      .where(eq(articles.id, articleId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/articles/:id]", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const articleId = Number(id);

    if (isNaN(articleId)) {
      return NextResponse.json({ error: "Invalid article id" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(articles)
      .where(eq(articles.id, articleId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Article deleted", id: deleted.id });
  } catch (error) {
    console.error("[DELETE /api/articles/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
