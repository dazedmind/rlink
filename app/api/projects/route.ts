import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, projectModels, projectInventory } from "@/db/schema";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";
import { max } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const projectsList = await db.select().from(projects).$dynamic();
    return NextResponse.json(projectsList);
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return NextResponse.json(
      { error: "Failed to fetch projects list" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

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

    if (!projectCode) {
      return NextResponse.json(
        { error: "Project code is required" },
        { status: 400 }
      );
    }
    if (!projectName) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }
    if (!type) {
      return NextResponse.json(
        { error: "Project type is required" },
        { status: 400 }
      );
    }
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

    const [{ maxId }] = await db.select({ maxId: max(projects.id) }).from(projects);
    const newId = Number(maxId ?? 0) + 1;

    const [newProject] = await db
      .insert(projects)
      .values({
        id: newId,
        projectCode: String(projectCode).trim().toUpperCase(),
        projectName: String(projectName).trim(),
        status: status || null,
        location: location?.trim() || null,
        stage: stage || null,
        type,
        photoUrl: photoUrl?.trim() || null,
        accentColor: accentColor?.trim() || null,
        description: description?.trim() || null,
        amenities: Array.isArray(amenities) ? amenities : [],
        landmarks: normalizedLandmarks,
      } as unknown as typeof projects.$inferInsert)
      .returning();

    const insertedModels: { id: string }[] = [];

    for (const m of models) {
      const [{ maxModelId }] = await db.select({ maxModelId: max(projectModels.id) }).from(projectModels);
      const newModelId = Number(maxModelId ?? 0) + 1;
      const modelId = String(newModelId);

      await db.insert(projectModels).values({
        id: modelId,
        projectId: newId,
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
      if (modelIndex == null || modelIndex < 0 || modelIndex >= insertedModels.length) {
        continue;
      }
      const modelId = String(insertedModels[modelIndex].id);
      const [{ maxInventoryId }] = await db.select({ maxInventoryId: max(projectInventory.id) }).from(projectInventory);
      const newInventoryId = String(Number(maxInventoryId ?? 0) + 1);

      await db.insert(projectInventory).values({
        id: newInventoryId,
        projectId: newId,
        modelId,
        inventoryCode: String(u.inventoryCode ?? "").trim(),
        block: Number(u.block ?? 0),
        lot: Number(u.lot ?? 0),
        soldTo: null,
        sellingPrice: Number(u.sellingPrice ?? 0),
        isFeatured: Boolean(u.isFeatured),
      } as unknown as typeof projectInventory.$inferInsert);
    }

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
