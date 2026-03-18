import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletter } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const limitResult = rateLimit(request, { maxRequests: 60, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 60);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { email: rawEmail } = await params;
    const email = rawEmail ? decodeURIComponent(rawEmail) : "";
    const body = await request.json();
    const status = body?.status;

    if (!email || !status) {
      return NextResponse.json({ error: "Invalid email or status" }, { status: 400 });
    }

    if (status !== "subscribed" && status !== "unsubscribed") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [updated] = await db.update(newsletter).set({ status: status }).where(eq(newsletter.email, email)).returning();
    revalidatePath("/home");
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/newsletter/subscriptions/:email]", error);
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { email: rawEmail } = await params;
    const email = rawEmail ? decodeURIComponent(rawEmail) : "";
    const deleted = await db.delete(newsletter).where(eq(newsletter.email, email)).returning();
    if (!deleted) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    } else {
      revalidatePath("/home");
      return NextResponse.json({ message: "Subscriber removed successfully" });
    }
  } catch (error) {
    console.error("[DELETE /api/newsletter/subscriptions/:email]", error);
    return NextResponse.json({ error: "Failed to remove subscriber" }, { status: 500 });
  }
}