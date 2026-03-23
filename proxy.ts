import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth",   // better-auth handles its own auth
  "/api/config", // intentionally public
  "/api/health", // intentionally public
];

const isDev = process.env.NODE_ENV === "development";
const ALLOWED_ORIGIN = isDev ? "http://localhost:3000" : "https://rlink-dev.vercel.app";

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Handle CORS preflight ─────────────────────────────────────────────────
  // Respond immediately to OPTIONS requests so the browser can proceed
  if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  // ── CORS origin check for protected API routes ───────────────────────────
  // Do NOT block /api/auth — better-auth's cross-origin flows need to be unimpeded
  if (pathname.startsWith("/api/") && !isPublicPath(pathname)) {
    const origin = request.headers.get("origin");
    // Block cross-origin requests that don't match the allowed origin
    if (origin && origin !== ALLOWED_ORIGIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // ── Route guard: protect /home/* ──────────────────────────────────────────
  // Check for better-auth session cookie as a fast gate.
  // This is a lightweight guard only — full session validation still happens
  // in requireAuth() inside each API route and ProtectedRoute on the client.
  if (pathname.startsWith("/home")) {
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ??
      request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
