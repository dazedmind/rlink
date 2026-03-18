import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';
import { rateLimit, rateLimit429 } from '@/lib/rate-limit';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const limitResult = rateLimit(request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const leadId = Number(id);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead id' }, { status: 400 });
    }

    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('[GET /api/leads/:id]', error);
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const limitResult = rateLimit(request, { maxRequests: 60, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 60);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const leadId = Number(id);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead id' }, { status: 400 });
    }

    const body = await request.json();

    const allowedFields = ['status', 'firstName', 'lastName', 'phone', 'email', 'project', 'profileLink', 'stage', 'nextAction', 'source', 'notes'] as const;
    const updates: Partial<typeof leads.$inferInsert> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) (updates as Record<string, unknown>)[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(leads)
      .set(updates)
      .where(eq(leads.id, leadId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    revalidatePath("/home");
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/leads/:id]', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const leadId = Number(id);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead id' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(leads)
      .where(eq(leads.id, leadId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    revalidatePath("/home");
    return NextResponse.json({ message: 'Lead deleted', id: deleted.id });
  } catch (error) {
    console.error('[DELETE /api/leads/:id]', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
