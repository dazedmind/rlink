import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/db/schema';
import { eq, ilike, desc } from 'drizzle-orm';
import type { leadStatusEnum, leadSourceEnum } from '@/db/schema';

type LeadStatus = (typeof leadStatusEnum.enumValues)[number];
type LeadSource = (typeof leadSourceEnum.enumValues)[number];

export async function GET(request: NextRequest) {
  try {
    // TODO: add authentication
    
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') as LeadStatus | null;
    const source = searchParams.get('source') as LeadSource | null;
    const search = searchParams.get('search');
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)));
    const offset = (page - 1) * limit;

    let query = db.select().from(leads).$dynamic();

    if (status) query = query.where(eq(leads.status, status));
    if (source) query = query.where(eq(leads.source, source));
    if (search) query = query.where(ilike(leads.clientName, `%${search}%`));

    const results = await query
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ data: results, page, limit });
  } catch (error) {
    console.error('[GET /api/leads]', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ['clientName', 'phone', 'email', 'source', 'inquiryDate'];
    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 },
      );
    }

    const now = new Date().toISOString().split('T')[0];

    const [newLead] = await db
      .insert(leads)
      .values({
        id: Date.now(),
        leadId: Date.now(),
        clientName: body.clientName,
        phone: body.phone,
        email: body.email,
        source: body.source,
        status: body.status ?? 'open',
        stage: body.stage ?? 'lead',
        nextAction: body.nextAction ?? 'call',
        notes: body.notes ?? '',
        inquiryDate: body.inquiryDate,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error('[POST /api/leads]', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
