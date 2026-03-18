import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectGallery } from "@/db/schema";
import { eq, inArray, asc, and, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

/** Get gallery images for a project. Use ?modelId=xxx for a specific house model, or omit for project-level gallery. */
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
    console.error("[GET /api/projects/:id/gallery]", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

/** Add one or more images to the gallery */
export async function POST(
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
    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls
      : body.imageUrl
        ? [body.imageUrl]
        : [];
    const modelId = body.modelId?.trim() || null;

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: "At least one image URL is required" },
        { status: 400 }
      );
    }

    const existingConditions = modelId
      ? and(eq(projectGallery.projectId, projectId), eq(projectGallery.modelId, modelId))
      : and(eq(projectGallery.projectId, projectId), isNull(projectGallery.modelId));

    const existing = await db
      .select({ sortOrder: projectGallery.sortOrder })
      .from(projectGallery)
      .where(existingConditions)
      .orderBy(asc(projectGallery.sortOrder));

    let nextOrder = existing.length > 0
      ? Math.max(...existing.map((r) => r.sortOrder ?? 0)) + 1
      : 0;

    const inserted: { id: string; projectId: string; modelId: string | null; imageUrl: string; caption: null; sortOrder: number }[] = [];
    for (const url of imageUrls) {
      const u = String(url).trim();
      if (!u) continue;
      const rowId = crypto.randomUUID();
      const order = nextOrder++;
      await db.insert(projectGallery).values({
        id: rowId,
        projectId,
        modelId: modelId || null,
        imageUrl: u,
        caption: null,
        sortOrder: order,
      });
      inserted.push({ id: rowId, projectId, modelId, imageUrl: u, caption: null, sortOrder: order });
    }

    revalidatePath("/home");
    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects/:id/gallery]", error);
    return NextResponse.json(
      { error: "Failed to add gallery images" },
      { status: 500 }
    );
  }
}

/** Delete one or more gallery images by ID */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    const ids = idsParam ? idsParam.split(",").map((i) => i.trim()).filter(Boolean) : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "At least one image ID is required" },
        { status: 400 }
      );
    }

    await db
      .delete(projectGallery)
      .where(
        and(eq(projectGallery.projectId, projectId), inArray(projectGallery.id, ids))
      );

    revalidatePath("/home");
    return NextResponse.json({ message: "Images deleted" });
  } catch (error) {
    console.error("[DELETE /api/projects/:id/gallery]", error);
    return NextResponse.json(
      { error: "Failed to delete gallery images" },
      { status: 500 }
    );
  }
}
