import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { careers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";
import { nameToSlug } from "@/app/utils/nameToSlug";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const limitResult = rateLimit(request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const careerId = Number(id);

    if (isNaN(careerId)) {
      return NextResponse.json({ error: "Invalid career id" }, { status: 400 });
    }

    const [career] = await db.select().from(careers).where(eq(careers.id, careerId));

    if (!career) {
      return NextResponse.json({ error: "Career not found" }, { status: 404 });
    }

    return NextResponse.json(career);
  } catch (error) {
    console.error("[GET /api/careers/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch career" },
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
    const careerId = Number(id);

    if (isNaN(careerId)) {
      return NextResponse.json({ error: "Invalid career id" }, { status: 400 });
    }

    const body = await request.json();

    const allowedFields = [
      "position",
      "slug",
      "location",
      "status",
      "jobDescription",
      "purpose",
      "responsibilities",
      "qualifications",
      "requiredSkills",
    ] as const;

    const updates: Partial<typeof careers.$inferInsert> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        const val = body[field];
        if (field === "slug" && typeof val === "string") {
          (updates as Record<string, unknown>)[field] = nameToSlug(val.trim()) || nameToSlug(body.position ?? "");
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
      .update(careers)
      .set(updates)
      .where(eq(careers.id, careerId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Career not found" }, { status: 404 });
    }

    revalidatePath("/home");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/careers/:id]", error);
    return NextResponse.json(
      { error: "Failed to update career" },
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
    const careerId = Number(id);

    if (isNaN(careerId)) {
      return NextResponse.json({ error: "Invalid career id" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(careers)
      .where(eq(careers.id, careerId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Career not found" }, { status: 404 });
    }

    revalidatePath("/home");
    return NextResponse.json({ message: "Career deleted", id: deleted.id });
  } catch (error) {
    console.error("[DELETE /api/careers/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete career" },
      { status: 500 }
    );
  }
}
