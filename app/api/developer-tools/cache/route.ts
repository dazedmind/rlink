import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

function canAccessDeveloperTools(session: {
  user: { role?: string | null; department?: string | null };
}) {
  const role = session.user.role?.toLowerCase() ?? "";
  const dept = session.user.department?.toLowerCase() ?? "";
  return role === "admin" || role === "it" || dept === "it";
}

/**
 * POST /api/developer-tools/cache
 * Clears the landing page cache only (not the admin portal).
 * Calls the landing page's revalidation endpoint when SITE_URL and
 * REVALIDATION_SECRET are configured.
 *
 * Landing page must expose: POST ${SITE_URL}/api/revalidate
 * with Authorization: Bearer ${REVALIDATION_SECRET}
 */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";
  const limitResult = rateLimit(request, {
    maxRequests: 30,
    windowMs: 60_000,
    identifier: `developer-tools-cache:${ip}`,
  });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;
  if (!canAccessDeveloperTools(authResult.session!)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");
  const secret = process.env.REVALIDATION_SECRET;

  if (!siteUrl || !secret) {
    return NextResponse.json(
      {
        error:
          "Landing page cache clear not configured. Set SITE_URL and REVALIDATION_SECRET.",
      },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[POST /api/developer-tools/cache] Landing page revalidate failed:", res.status, text);
      return NextResponse.json(
        { error: `Landing page revalidation failed: ${res.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Landing page cache cleared successfully.",
    });
  } catch (error) {
    console.error("[POST /api/developer-tools/cache]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to reach landing page. Check SITE_URL.",
      },
      { status: 502 }
    );
  }
}
