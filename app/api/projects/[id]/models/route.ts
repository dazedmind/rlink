import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectModels } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

/** Replace all models for a project. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const models = Array.isArray(body.models) ? body.models : [];

    await db.delete(projectModels).where(eq(projectModels.projectId, id));

    for (const m of models) {
      const modelId = crypto.randomUUID();
      await db.insert(projectModels).values({
        id: modelId,
        projectId: id,
        modelName: String(m.modelName ?? "").trim(),
        description: m.description?.trim() || null,
        bathroom: Number(m.bathroom ?? 0),
        kitchen: Number(m.kitchen ?? 0),
        carport: Number(m.carport ?? 0),
        serviceArea: Number(m.serviceArea ?? 0),
        livingRoom: Number(m.livingRoom ?? 0),
        lotArea: Number(m.lotArea ?? 0),
        floorArea: Number(m.floorArea ?? 0),
        lotClass: String(m.lotClass ?? "").trim() || "Standard",
        photoUrl: m.photoUrl?.trim() || null,
      } as unknown as typeof projectModels.$inferInsert);
    }

    return NextResponse.json({ message: "Models updated successfully" });
  } catch (error) {
    console.error("[PATCH /api/projects/:id/models]", error);
    return NextResponse.json(
      { error: "Failed to update models" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limitResult = rateLimit(request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const models = await db
      .select()
      .from(projectModels)
      .where(eq(projectModels.projectId, id))
      .orderBy(asc(projectModels.createdAt));
    return NextResponse.json(models);
  } catch (error) {
    console.error("[GET /api/projects/:id/models]", error);
    return NextResponse.json(
      { error: "Failed to fetch project models" },
      { status: 500 }
    );
  }
}
