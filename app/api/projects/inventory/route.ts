import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projectInventory } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const inventoryList = await db.select().from(projectInventory).$dynamic();

    const uniqueBlocks = [...new Set(inventoryList.map((inventory: any) => inventory.block))];
    const uniqueLots = [...new Set(inventoryList.map((inventory: any) => inventory.lot))];
    
    return NextResponse.json(inventoryList);
  } catch (error) {
    console.error('[GET /api/projects/inventory]', error);
    return NextResponse.json({ error: 'Failed to fetch inventory list' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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