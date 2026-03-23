import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { careers } from "@/db/schema";
import { and, asc, count, desc, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";
import { Department, department } from "@/lib/types";
import { nameToSlug } from "@/app/utils/nameToSlug";

export async function GET(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const offset = (page - 1) * limit;

    const statusParam = searchParams.get("status");
    const statusValues = statusParam ? statusParam.split(",").filter(Boolean) : [];
    const departmentParam = searchParams.get("department");
    const departmentValues = departmentParam
      ? departmentParam.split(",").filter(Boolean)
      : [];
    const sort = searchParams.get("sort") ?? "newest";

    const conditions: Parameters<typeof and>[0][] = [];
    if (statusValues.length > 0) {
      conditions.push(inArray(careers.status, statusValues as ("hiring" | "closed" | "archived")[]));
    }
    if (departmentValues.length > 0) {
      conditions.push(inArray(careers.department, departmentValues as (keyof typeof department)[]));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderBy = (() => {
      switch (sort) {
        case "oldest":
          return asc(careers.createdAt);
        case "name_asc":
          return asc(careers.position);
        case "name_desc":
          return desc(careers.position);
        default:
          return desc(careers.createdAt);
      }
    })();

    const [{ total }, data] = await Promise.all([
      db.select({ total: count() }).from(careers).where(whereClause).then((r) => r[0]),
      db
        .select()
        .from(careers)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
    ]);

    return NextResponse.json({ data, page, limit, total: total ?? 0 });
  } catch (error) {
    console.error("[GET /api/careers]", error);
    return NextResponse.json(
      { error: "Failed to fetch careers" },
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
      position,
      slug,
      department,
      location,
      status,
      jobDescription,
      responsibilities,
      qualifications,
      requiredSkills,
    } = body;

    if (!position?.trim()) {
      return NextResponse.json(
        { error: "Position is required" },
        { status: 400 }
      );
    }
    if (!location?.trim()) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }
    if (!jobDescription?.trim()) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    const slugValue = slug?.trim() ? nameToSlug(slug) : nameToSlug(position);

    const [created] = await db
      .insert(careers)
      .values({
        position: position.trim(),
        slug: slugValue,
        department: department as Department,
        location: location.trim(),
        status: status ?? "hiring",
        jobDescription: jobDescription.trim(),
        responsibilities: (responsibilities ?? "").trim() || "",
        qualifications: (qualifications ?? "").trim() || "",
        requiredSkills: (requiredSkills ?? "").trim() || "",
      } as typeof careers.$inferInsert)
      .returning();

    revalidatePath("/home");
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/careers]", error);
    return NextResponse.json(
      { error: "Failed to create career" },
      { status: 500 }
    );
  }
}
