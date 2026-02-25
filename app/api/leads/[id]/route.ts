import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/db/schema';
import { eq } from 'drizzle-orm';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
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
  try {
    const { id } = await params;
    const leadId = Number(id);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead id' }, { status: 400 });
    }

    const body = await request.json();

    const disallowed = ['id', 'leadId', 'createdAt'];
    disallowed.forEach((key) => delete body[key]);

    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    body.updatedAt = new Date().toISOString().split('T')[0];

    const [updated] = await db
      .update(leads)
      .set(body)
      .where(eq(leads.id, leadId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/leads/:id]', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
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

    return NextResponse.json({ message: 'Lead deleted', id: deleted.id });
  } catch (error) {
    console.error('[DELETE /api/leads/:id]', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
