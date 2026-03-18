import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { developerToolsSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

const ALLOWED_SECTIONS = ["seo", "analytics", "security"] as const;
type SectionId = (typeof ALLOWED_SECTIONS)[number];

function canAccessDeveloperTools(session: { user: { role?: string | null; department?: string | null } }) {
  const role = session.user.role?.toLowerCase() ?? "";
  const dept = session.user.department?.toLowerCase() ?? "";
  return role === "admin" || role === "it" || dept === "it";
}

export async function GET(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;
  if (!canAccessDeveloperTools(authResult.session!)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const section = searchParams.get("section") as SectionId | null;
    if (section && !ALLOWED_SECTIONS.includes(section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    const rows = section
      ? await db.select().from(developerToolsSettings).where(eq(developerToolsSettings.id, section))
      : await db.select().from(developerToolsSettings);

    const data = section
      ? (rows[0]?.value as Record<string, unknown>) ?? {}
      : Object.fromEntries(rows.map((r) => [r.id, r.value]));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/developer-tools/settings]", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;
  if (!canAccessDeveloperTools(authResult.session!)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { section, value } = body as { section: SectionId; value: Record<string, unknown> };
    if (!section || !ALLOWED_SECTIONS.includes(section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    await db
      .insert(developerToolsSettings)
      .values({
        id: section,
        value: value ?? {},
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: developerToolsSettings.id,
        set: { value: value ?? {}, updatedAt: new Date() },
      });

    revalidatePath("/home");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/developer-tools/settings]", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
