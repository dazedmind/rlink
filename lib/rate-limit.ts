import { NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter for API routes.
 * Uses fixed-window algorithm. For production at scale, consider Redis (e.g. Upstash).
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

const DEFAULT_WINDOW_MS = 60_000; // 1 minute
const DEFAULT_MAX_REQUESTS = 60;  // 60 requests per minute

export type RateLimitOptions = {
  /** Max requests per window. Default: 60 */
  maxRequests?: number;
  /** Window in ms. Default: 60000 (1 min) */
  windowMs?: number;
  /** Custom identifier (default: IP from x-forwarded-for or x-real-ip) */
  identifier?: string;
};

export type RateLimitResult =
  | { success: true; remaining: number; resetAt: number }
  | { success: false; error: string; retryAfter: number };

/**
 * Returns a 429 NextResponse for rate limit failures.
 */
export function rateLimit429(result: { error: string; retryAfter: number }, maxRequests?: number) {
  return NextResponse.json(
    { error: result.error },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
        ...(maxRequests != null && { "X-RateLimit-Limit": String(maxRequests) }),
      },
    }
  );
}

/**
 * Check rate limit. Returns success or failure with retry-after.
 * Call at the start of mutating API routes (POST, PATCH, DELETE).
 */
export function rateLimit(
  request: Request,
  options: RateLimitOptions = {}
): RateLimitResult {
  const {
    maxRequests = DEFAULT_MAX_REQUESTS,
    windowMs = DEFAULT_WINDOW_MS,
    identifier: customId,
  } = options;

  const id =
    customId ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";

  const now = Date.now();
  let entry = store.get(id);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(id, entry);
    return { success: true, remaining: maxRequests - 1, resetAt: entry.resetAt };
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      success: false,
      error: "Too many requests",
      retryAfter,
    };
  }

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}
