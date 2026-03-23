import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// CORS: Never use "*" — only allow specific trusted domains.
// Set ALLOWED_ORIGIN in env for production (e.g. https://rlink.vercel.app).
const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ??
  (isDev ? "http://localhost:3000" : "https://rlink-dev.vercel.app");

// Trusted image hosts already in use by the app
const IMG_HOSTS = "https://www.rland.ph https://i.imgur.com";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.rland.ph",
        pathname: "/storage/images/**",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        // Apply to ALL routes
        source: "/:path*",
        headers: [
          // ── Framing ──────────────────────────────────────────────────────
          // Block all framing — this is an admin portal, never needs to be iframed
          { key: "X-Frame-Options", value: "DENY" },

          // ── MIME Sniffing ─────────────────────────────────────────────────
          // Prevent browsers from guessing content-type — stops drive-by downloads
          { key: "X-Content-Type-Options", value: "nosniff" },

          // ── Referrer ──────────────────────────────────────────────────────
          // Send full URL only to same-origin; send only origin to HTTPS cross-origin; send nothing to HTTP
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // ── Permissions ───────────────────────────────────────────────────
          // Deny browser features this admin portal has no reason to use
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },

          // ── Content Security Policy ───────────────────────────────────────
          // Tailored for RLink:
          //   - Figtree font from Google Fonts (fonts.googleapis.com + fonts.gstatic.com)
          //   - Images from rland.ph and imgur (already whitelisted in next/image)
          //   - 'unsafe-inline' + 'unsafe-eval' required by Next.js for hydration and dev
          //   - 'unsafe-inline' on style-src — required by Tailwind CSS / shadcn
          //   - connect-src covers Neon DB requests that may be made server-side and
          //     the better-auth API calls from the client
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js uses inline scripts for hydration
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `img-src 'self' data: blob: ${IMG_HOSTS}`,
              `connect-src 'self' ${ALLOWED_ORIGIN} https://fonts.googleapis.com`,
              "frame-src 'none'",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },

      // ── API routes: lock down CORS ─────────────────────────────────────────
      // All API routes are admin-only. Only allow requests from the same origin.
      // This prevents cross-origin scripts from calling your API endpoints.
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: ALLOWED_ORIGIN },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PATCH, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          // Auth-gated API responses must never be shared via CDN or browser cache
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },

      // ── Public API routes: relax cache-control only ────────────────────────
      // /api/config and /api/health are intentionally public and safe to cache briefly
      {
        source: "/api/config",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/api/health",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=10, stale-while-revalidate=30" },
        ],
      },
    ];
  },
};

export default nextConfig;
