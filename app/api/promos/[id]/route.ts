import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promos } from "@/db/schema";
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
    const promoId = Number(id);

    if (isNaN(promoId)) {
      return NextResponse.json({ error: "Invalid promo id" }, { status: 400 });
    }

    const [promo] = await db.select().from(promos).where(eq(promos.id, promoId));

    if (!promo) {
      return NextResponse.json({ error: "Promo not found" }, { status: 404 });
    }

    return NextResponse.json(promo);
  } catch (error) {
    console.error("[GET /api/promos/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch promo" },
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
    const promoId = Number(id);

    if (isNaN(promoId)) {
      return NextResponse.json({ error: "Invalid promo id" }, { status: 400 });
    }

    const body = await request.json();

    const allowedFields = [
      "title",
      "description",
      "imageUrl",
      "status",
      "startDate",
      "endDate",
    ] as const;

    const updates: Partial<typeof promos.$inferInsert> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        const val = body[field];
        if (field === "startDate" || field === "endDate") {
          (updates as Record<string, unknown>)[field] = val ? new Date(val) : null;
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
      .update(promos)
      .set(updates)
      .where(eq(promos.id, promoId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Promo not found" }, { status: 404 });
    }

    revalidatePath("/home");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/promos/:id]", error);
    return NextResponse.json(
      { error: "Failed to update promo" },
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
    const promoId = Number(id);

    if (isNaN(promoId)) {
      return NextResponse.json({ error: "Invalid promo id" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(promos)
      .where(eq(promos.id, promoId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Promo not found" }, { status: 404 });
    }

    revalidatePath("/home");
    return NextResponse.json({ message: "Promo deleted", id: deleted.id });
  } catch (error) {
    console.error("[DELETE /api/promos/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete promo" },
      { status: 500 }
    );
  }
}
