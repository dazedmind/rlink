import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectModels, projectInventory } from "@/db/schema";
import { eq, asc, inArray, and } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

/** Replace all models for a project. Uses upsert: update existing, insert new, delete only models with no inventory. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const models = Array.isArray(body.models) ? body.models : [];

    const existingModels = await db
      .select({ id: projectModels.id })
      .from(projectModels)
      .where(eq(projectModels.projectId, projectId));

    const inventoryRefs = await db
      .select({ modelId: projectInventory.modelId })
      .from(projectInventory)
      .where(eq(projectInventory.projectId, projectId));
    const modelIdsInUse = new Set(inventoryRefs.map((r) => r.modelId));

    const incomingIds = new Set(
      models
        .map((m: { id: string }) => m.id)
        .filter((v: string) => typeof v === "string" && v.length > 0),
    );

    const toDelete = existingModels.filter(
      (em) => !incomingIds.has(em.id) && !modelIdsInUse.has(em.id),
    );
    const cannotDelete = existingModels.filter(
      (em) => !incomingIds.has(em.id) && modelIdsInUse.has(em.id),
    );

    if (cannotDelete.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot remove model(s) that have inventory units. Remove or reassign inventory first.",
        },
        { status: 400 }
      );
    }

    if (toDelete.length > 0) {
      await db.delete(projectModels).where(
        inArray(projectModels.id, toDelete.map((d) => d.id)),
      );
    }

    for (const m of models) {
      const existingId =
        typeof m.id === "string" && m.id.length > 0 ? m.id : null;
      const belongsToProject =
        existingId &&
        existingModels.some((em) => em.id === existingId);

      const payload = {
        projectId,
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
      };

      if (existingId && belongsToProject) {
        await db
          .update(projectModels)
          .set(payload)
          .where(
            and(
              eq(projectModels.id, existingId),
              eq(projectModels.projectId, projectId),
            ),
          );
      } else {
        const modelId = crypto.randomUUID();
        await db.insert(projectModels).values({
          id: modelId,
          ...payload,
        } as unknown as typeof projectModels.$inferInsert);
      }
    }

    revalidatePath("/home");
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
