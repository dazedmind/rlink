import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectInventory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
