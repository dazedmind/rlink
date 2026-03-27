/** Shared Resend / app URL settings (mirrors account-creation email behavior). */

export function getAppOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    process.env.SITE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function getDefaultFrom(): string {
  return (
    process.env.RESEND_FROM ??
    "R Land Development Inc. <onboarding@resend.dev>"
  );
}
