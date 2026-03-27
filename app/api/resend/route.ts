import { rateLimit, rateLimit429 } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/api-auth";
import { sendWelcomeEmail } from "@/lib/email/mailer";

/**
 * Sends the welcome email with temporary password (new users only).
 * Requires an authenticated session.
 */
export async function POST(request: Request) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }
    if (!password) {
      return Response.json(
        { error: "Password is required for the welcome email" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("[POST /api/resend] RESEND_API_KEY is not set");
      return Response.json({ error: "Email is not configured" }, { status: 500 });
    }

    const result = await sendWelcomeEmail(email, {
      email,
      firstName,
      lastName,
      password,
    });

    if (!result.ok) {
      console.error("[POST /api/resend]", result.error);
      return Response.json({ error: result.error }, { status: 500 });
    }

    return Response.json({ id: result.id });
  } catch (err) {
    console.error("[POST /api/resend]", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
