import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projectInventory, projectModels } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';
import { rateLimit, rateLimit429 } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const rows = await db
      .select({
        id: projectInventory.id,
        projectId: projectInventory.projectId,
        modelId: projectInventory.modelId,
        modelName: projectModels.modelName,
        inventoryCode: projectInventory.inventoryCode,
        block: projectInventory.block,
        lot: projectInventory.lot,
        soldTo: projectInventory.soldTo,
        sellingPrice: projectInventory.sellingPrice,
        isFeatured: projectInventory.isFeatured,
      })
      .from(projectInventory)
      .leftJoin(projectModels, eq(projectInventory.modelId, projectModels.id))
      .orderBy(desc(projectInventory.createdAt));

    const inventoryList = rows.map((r) => ({
      ...r,
      modelName: r.modelName ?? "Unknown Model",
    }));

    return NextResponse.json(inventoryList);
  } catch (error) {
    console.error('[GET /api/projects/inventory]', error);
    return NextResponse.json({ error: 'Failed to fetch inventory list' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 60, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 60);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const body = await request.json();
    const { inventoryCode, soldTo } = body;

    if (!inventoryCode) {
      return NextResponse.json(
        { error: "Missing inventoryCode" },
        { status: 400 }
      );
    }

    // soldTo may be a number (reserve) or explicitly null (un-reserve)
    if (soldTo === undefined) {
      return NextResponse.json(
        { error: "Missing soldTo value" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(projectInventory)
      .set({ soldTo: soldTo ?? null })
      .where(eq(projectInventory.inventoryCode, inventoryCode))
      .returning();

    // 3. Handle "Not Found"
    if (!updated) {
      return NextResponse.json(
        { error: "Inventory item not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Inventory updated successfully",
      data: updated
    });

  } catch (error) {
    console.error("[PATCH /api/projects/inventory]", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}