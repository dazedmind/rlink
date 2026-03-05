import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, projectModels, projectInventory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

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
    const {
      projectCode,
      projectName,
      status,
      location,
      stage,
      type,
      photoUrl,
      accentColor,
      description,
      amenities,
      landmarks,
      models = [],
      units = [],
    } = body;

    const { id } = await params;

    if (!projectCode) {
      return NextResponse.json(
        { error: "Missing projectCode" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(projects)
      .set({
        projectCode: String(projectCode).trim().toUpperCase(),
        projectName: String(projectName ?? "").trim(),
        status: status || null,
        location: location?.trim() || null,
        stage: stage || null,
        type: type ?? undefined,
        photoUrl: photoUrl?.trim() || null,
        accentColor: accentColor?.trim() || null,
        description: description?.trim() || null,
        amenities: Array.isArray(amenities) ? amenities : [],
        landmarks: Array.isArray(landmarks) ? landmarks : [],
      } as unknown as Partial<typeof projects.$inferInsert>)
      .where(eq(projects.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const existingInventory = await db
      .select({ block: projectInventory.block, lot: projectInventory.lot, soldTo: projectInventory.soldTo })
      .from(projectInventory)
      .where(eq(projectInventory.projectId, id));

    const soldToMap = new Map<string, number | null>();
    for (const inv of existingInventory) {
      soldToMap.set(`${inv.block}-${inv.lot}`, inv.soldTo);
    }

    await db.delete(projectInventory).where(eq(projectInventory.projectId, id));
    await db.delete(projectModels).where(eq(projectModels.projectId, id));

    const insertedModels: { id: string }[] = [];

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
      insertedModels.push({ id: modelId });
    }

    for (const u of units) {
      const modelIndex = u.modelIndex;
      if (
        modelIndex == null ||
        modelIndex < 0 ||
        modelIndex >= insertedModels.length
      ) {
        continue;
      }
      const modelId = insertedModels[modelIndex].id;
      const block = Number(u.block ?? 0);
      const lot = Number(u.lot ?? 0);
      const preservedSoldTo = soldToMap.get(`${block}-${lot}`) ?? null;
      const inventoryId = crypto.randomUUID();
      await db.insert(projectInventory).values({
        id: inventoryId,
        projectId: id,
        modelId,
        inventoryCode: String(u.inventoryCode ?? "").trim(),
        block,
        lot,
        soldTo: preservedSoldTo,
        sellingPrice: Number(u.sellingPrice ?? 0),
        isFeatured: Boolean(u.isFeatured),
      } as unknown as typeof projectInventory.$inferInsert);
    }

    return NextResponse.json({
      message: "Project updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("[PATCH /api/projects/[id]]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;

    const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
    await db.delete(projectModels).where(eq(projectModels.projectId, id));
    await db.delete(projectInventory).where(eq(projectInventory.projectId, id));

    return NextResponse.json({ message: "Project deleted successfully", id: deleted.id });
  } catch (error) {
    console.error("[DELETE /api/projects/[id]]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}