import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, projectModels, projectInventory, projectGallery } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";
import { nameToSlug } from "@/app/utils/nameToSlug";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limitResult = rateLimit(_request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error("[GET /api/projects/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

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
      slug,
      status,
      location,
      stage,
      type,
      photoUrl,
      logoUrl,
      mapLink,
      accentColor,
      description,
      dhsudNumber,
      address,
      completionDate,
      salesOffice,
      amenities,
      landmarks,
    } = body;

    const { id } = await params;

    if (!projectCode) {
      return NextResponse.json(
        { error: "Missing projectCode" },
        { status: 400 }
      );
    }

    const slugValue = slug?.trim() ? nameToSlug(slug) : nameToSlug(projectName ?? "");

    const normalizedLandmarks =
      landmarks && typeof landmarks === "object" && !Array.isArray(landmarks)
        ? Object.fromEntries(
            Object.entries(landmarks).map(([k, v]) => [
              k,
              Array.isArray(v) ? v.filter((i): i is string => typeof i === "string") : [],
            ])
          )
        : Array.isArray(landmarks)
          ? { Landmarks: landmarks.filter((i): i is string => typeof i === "string") }
          : {};

    const [updated] = await db
      .update(projects)
      .set({
        projectCode: String(projectCode).trim().toUpperCase(),
        projectName: String(projectName ?? "").trim(),
        slug: slugValue,
        status: status || null,
        location: location?.trim() || null,
        stage: stage || null,
        type: type ?? undefined,
        photoUrl: photoUrl?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
        mapLink: mapLink?.trim() || null,
        accentColor: accentColor?.trim() || null,
        description: description?.trim() || null,
        dhsudNumber: dhsudNumber?.trim() || null,
        address: address?.trim() || null,
        completionDate: completionDate ? String(completionDate).slice(0, 10) : null,
        salesOffice: salesOffice?.trim() || null,
        amenities: Array.isArray(amenities) ? amenities : [],
        landmarks: normalizedLandmarks,
      } as unknown as Partial<typeof projects.$inferInsert>)
      .where(eq(projects.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    revalidatePath("/home");
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
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;

    const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
    await db.delete(projectGallery).where(eq(projectGallery.projectId, id));
    await db.delete(projectModels).where(eq(projectModels.projectId, id));
    await db.delete(projectInventory).where(eq(projectInventory.projectId, id));

    revalidatePath("/home");
    return NextResponse.json({ message: "Project deleted successfully", id: deleted.id });
  } catch (error) {
    console.error("[DELETE /api/projects/[id]]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}