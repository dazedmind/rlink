import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectGallery } from "@/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

/**
 * Public API: Get gallery images for a project or model.
 * No auth required - for frontend display.
 * GET /api/public/projects/[id]/gallery?modelId=xxx
 * - modelId: optional, filter by house model
 * - omit modelId: project-level gallery
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limitResult = rateLimit(request, { maxRequests: 200, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 200);

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("modelId")?.trim() || null;

    const conditions = modelId
      ? and(eq(projectGallery.projectId, id), eq(projectGallery.modelId, modelId))
      : and(eq(projectGallery.projectId, id), isNull(projectGallery.modelId));

    const images = await db
      .select()
      .from(projectGallery)
      .where(conditions)
      .orderBy(asc(projectGallery.sortOrder), asc(projectGallery.createdAt));
    return NextResponse.json(images);
  } catch (error) {
    console.error("[GET /api/public/projects/:id/gallery]", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}
