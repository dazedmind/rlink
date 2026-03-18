import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

function normalizeAmenities(raw: unknown): { name: string; photoUrl?: string }[] {
  if (!raw || !Array.isArray(raw)) return [];
  const result: { name: string; photoUrl?: string }[] = [];
  for (const entry of raw) {
    if (typeof entry === "string") {
      if (entry.trim()) result.push({ name: entry.trim() });
    } else if (typeof entry === "object" && entry !== null) {
      const obj = entry as Record<string, unknown>;
      const name = typeof obj.name === "string" ? obj.name.trim() : "";
      if (!name) continue;
      const photoUrl =
        typeof obj.photoUrl === "string" && obj.photoUrl.trim()
          ? obj.photoUrl.trim()
          : undefined;
      result.push(photoUrl ? { name, photoUrl } : { name });
    }
  }
  return result;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limitResult = rateLimit(request, { maxRequests: 60, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 60);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const body = await request.json();
    const { amenities } = body;
    const { id } = await params;

    const normalized = normalizeAmenities(amenities);

    const [updated] = await db
      .update(projects)
      .set({ amenities: normalized } as unknown as Partial<typeof projects.$inferInsert>)
      .where(eq(projects.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    revalidatePath("/home");
    return NextResponse.json({
      message: "Amenities updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("[PATCH /api/projects/[id]/amenities]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
