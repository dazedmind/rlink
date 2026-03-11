import { NextResponse } from "next/server";

/**
 * Health check endpoint. No auth required.
 * Optionally checks public site URL if SITE_URL env is set.
 */
export async function GET() {
  const siteUrl = process.env.SITE_URL || process.env.BETTER_AUTH_URL;
  let siteStatus: "operational" | "degraded" | "unknown" = "operational";

  if (siteUrl) {
    try {
      const res = await fetch(siteUrl, {
        method: "HEAD",
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      siteStatus = res.ok ? "operational" : "degraded";
    } catch {
      siteStatus = "degraded";
    }
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    site: siteStatus,
    siteUrl: siteUrl ?? null,
  });
}
