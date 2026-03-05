import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectModels } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
