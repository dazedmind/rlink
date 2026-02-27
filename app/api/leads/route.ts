import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/db/schema';
import { and, asc, count, desc, ilike, inArray, max, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 10)));
    const offset = (page - 1) * limit;

    const statusParam = searchParams.get('status');
    const statusValues = statusParam ? statusParam.split(',').filter(Boolean) : [];
    const stageParam = searchParams.get('stage');
    const stageValues = stageParam ? stageParam.split(',').filter(Boolean) : [];
    const nextActionParam = searchParams.get('nextAction');
    const nextActionValues = nextActionParam ? nextActionParam.split(',').filter(Boolean) : [];
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') ?? 'newest';

    const conditions: Parameters<typeof and>[0][] = [];
    if (statusValues.length > 0) conditions.push(inArray(leads.status, statusValues as any));
    if (stageValues.length > 0) conditions.push(inArray(leads.stage, stageValues as any));
    if (nextActionValues.length > 0) conditions.push(inArray(leads.nextAction, nextActionValues as any));
    if (search) conditions.push(or(ilike(leads.firstName, `%${search}%`), ilike(leads.lastName, `%${search}%`), ilike(leads.email, `%${search}%`))!);
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderBy = (() => {
      switch (sort) {
        case 'oldest': return asc(leads.inquiryDate);
        case 'updated_newest': return desc(leads.updatedAt);
        case 'updated_oldest': return asc(leads.updatedAt);
        case 'name_az': return asc(leads.firstName);
        case 'name_za': return desc(leads.firstName);
        default: return desc(leads.inquiryDate);
      }
    })();

    const [{ total }, data] = await Promise.all([
      db.select({ total: count() }).from(leads).where(whereClause).then((r) => r[0]),
      db.select().from(leads).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
    ]);

    return NextResponse.json({ data, page, limit, total: total ?? 0 });
  } catch (error) {
    console.error('[GET /api/leads]', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { firstName, lastName, email, phone, project, source, inquiryDate, stage, nextAction, profileLink } = body;

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
        firstName:   firstName,
        lastName:    lastName,
        email,
        phone,
        source,
        inquiryDate: inquiryDate ? new Date(inquiryDate).toISOString() : new Date().toISOString(),
        status:      body.status      ?? 'open',
        stage:       body.stage       ?? 'lead',
        nextAction:  nextAction      ?? 'call',
        profileLink: profileLink,
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
