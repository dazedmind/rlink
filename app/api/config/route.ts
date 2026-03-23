import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { developerToolsSettings } from "@/db/schema";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

/**
 * Public API for the landing page to consume developer tools configuration.
 * No auth required. Rate limited to prevent abuse.
 */
export async function GET(request: Request) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  try {
    const rows = await db.select().from(developerToolsSettings);
    const data = Object.fromEntries(rows.map((r) => [r.id, r.value]));
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/config]", error);
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}
