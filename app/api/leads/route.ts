import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/db/schema';
import { eq, ilike, desc, max } from 'drizzle-orm';
import type { leadStatusEnum, leadSourceEnum } from '@/db/schema';

type LeadStatus = (typeof leadStatusEnum.enumValues)[number];
type LeadSource = (typeof leadSourceEnum.enumValues)[number];

export async function GET(request: NextRequest) {
  try {
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

    const { firstName, lastName, email, phone, project, source, inquiryDate } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required.' }, { status: 400 });
    }
    if (!email)  return NextResponse.json({ error: 'Email is required.' },  { status: 400 });
    if (!phone)  return NextResponse.json({ error: 'Phone is required.' },  { status: 400 });
    if (!project) return NextResponse.json({ error: 'Project is required.' }, { status: 400 });
    if (!source) return NextResponse.json({ error: 'Source is required.' }, { status: 400 });

    const [{ maxId }] = await db.select({ maxId: max(leads.id) }).from(leads);
    const newId  = (maxId ?? 0) + 1;
    const leadId = `LD-${newId.toString().padStart(4, '0')}`;

    // Drizzle excludes bigint PKs from the inferred insert type when they have
    // no $defaultFn, so we cast to satisfy the type checker.
    const newLead = await db
      .insert(leads)
      .values({
        id:          newId,
        leadId:      leadId,
        clientName:  `${firstName} ${lastName}`.trim(),
        email,
        phone,
        source,
        inquiryDate: inquiryDate ? new Date(inquiryDate).toISOString() : new Date().toISOString(),
        status:      body.status      ?? 'open',
        stage:       body.stage       ?? 'lead',
        nextAction:  body.nextAction  ?? 'call',
        project:     project,
        notes:       body.notes       ?? '',

      } as unknown as typeof leads.$inferInsert)
      .returning();

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error('[POST /api/leads]', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
