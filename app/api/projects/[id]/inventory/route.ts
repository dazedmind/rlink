import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectInventory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

/** Replace all inventory for a project. Preserves soldTo when block/lot match. */
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
    const units = Array.isArray(body.units) ? body.units : [];

    const existingInventory = await db
      .select({ block: projectInventory.block, lot: projectInventory.lot, modelId: projectInventory.modelId, soldTo: projectInventory.soldTo })
      .from(projectInventory)
      .where(eq(projectInventory.projectId, id));

    const soldToMap = new Map<string, number | null>();
    for (const inv of existingInventory) {
      soldToMap.set(`${inv.block}-${inv.lot}-${inv.modelId}`, inv.soldTo);
    }

    await db.delete(projectInventory).where(eq(projectInventory.projectId, id));

    const modelIds = units.map((u: { modelId?: string }) => u.modelId).filter(Boolean);
    const modelIdSet = new Set(modelIds);

    // Ensure unique inventoryCode - append suffix when duplicate (same block/lot, different models)
    const seenCodes = new Map<string, number>();
    const unitsWithUniqueCodes = units.map((u: { inventoryCode?: string; block?: number; lot?: number; modelId?: string }) => {
      let base = String(u.inventoryCode ?? "").trim() || `INV-${u.block ?? 0}-${u.lot ?? 0}`;
      const count = (seenCodes.get(base) ?? 0) + 1;
      seenCodes.set(base, count);
      const code = count === 1 ? base : `${base}-${count}`;
      return { ...u, inventoryCode: code };
    });

    for (const u of unitsWithUniqueCodes) {
      const modelId = u.modelId;
      if (!modelId || !modelIdSet.has(modelId)) continue;

      const block = Number(u.block ?? 0);
      const lot = Number(u.lot ?? 0);
      const preservedSoldTo = soldToMap.get(`${block}-${lot}-${modelId}`) ?? null;
      const inventoryId = crypto.randomUUID();

      await db.insert(projectInventory).values({
        id: inventoryId,
        projectId: id,
        modelId: String(modelId),
        inventoryCode: String(u.inventoryCode ?? "").trim() || `INV-${block}-${lot}-${modelId}`,
        block,
        lot,
        soldTo: preservedSoldTo,
        sellingPrice: Number(u.sellingPrice ?? 0),
        isFeatured: Boolean(u.isFeatured),
      } as unknown as typeof projectInventory.$inferInsert);
    }

    return NextResponse.json({ message: "Inventory updated successfully" });
  } catch (error) {
    console.error("[PATCH /api/projects/:id/inventory]", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
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
    const inventory = await db
      .select()
      .from(projectInventory)
      .where(eq(projectInventory.projectId, id));
    return NextResponse.json(inventory);
  } catch (error) {
    console.error("[GET /api/projects/:id/inventory]", error);
    return NextResponse.json(
      { error: "Failed to fetch project inventory" },
      { status: 500 }
    );
  }
}
