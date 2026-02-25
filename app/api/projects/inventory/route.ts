import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projectInventory } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const inventoryList = await db.select().from(projectInventory).$dynamic();

    const uniqueBlocks = [...new Set(inventoryList.map((inventory: any) => inventory.block))];
    
    return NextResponse.json(inventoryList);
  } catch (error) {
    console.error('[GET /api/projects/inventory]', error);
    return NextResponse.json({ error: 'Failed to fetch inventory list' }, { status: 500 });
  }
}