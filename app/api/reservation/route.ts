import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reservation } from '@/db/schema';
import { and, asc, count, desc, ilike, inArray, max, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 10)));
    const offset = (page - 1) * limit;

    const statusParam = searchParams.get('status');
    const statusValues = statusParam ? statusParam.split(',').filter(Boolean) : [];
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') ?? 'newest';

    const conditions: Parameters<typeof and>[0][] = [];
    if (statusValues.length > 0) conditions.push(inArray(reservation.status, statusValues as any));
    if (search) conditions.push(or(ilike(reservation.projectName, `%${search}%`), ilike(reservation.firstName, `%${search}%`), ilike(reservation.lastName, `%${search}%`))!);
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderBy = (() => {
      switch (sort) {
        case 'oldest': return asc(reservation.createdAt);
        case 'name_az': return asc(reservation.firstName);
        case 'name_za': return desc(reservation.firstName);
        default: return desc(reservation.createdAt);
      }
    })();

    const [{ total }, data] = await Promise.all([
      db.select({ total: count() }).from(reservation).where(whereClause).then((r) => r[0]),
      db.select().from(reservation).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
    ]);

    return NextResponse.json({ data, page, limit, total: total ?? 0 });
  } catch (error) {
    console.error('[GET /api/reservation]', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { firstName, lastName, email, phone, project, blockNumber, lotNumber, recipientEmail, ccEmail, bccEmail, inventoryCode } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required.' }, { status: 400 });
    }
    if (!email)  return NextResponse.json({ error: 'Email is required.' },  { status: 400 });
    if (!phone)  return NextResponse.json({ error: 'Phone is required.' },  { status: 400 });
    if (!project) return NextResponse.json({ error: 'Project is required.' }, { status: 400 });
    if (!inventoryCode) return NextResponse.json({ error: 'Inventory code is required.' }, { status: 400 });

    const [{ maxId }] = await db.select({ maxId: max(reservation.id) }).from(reservation);
    const newId         = (maxId ?? 0) + 1;
    const reservationId = `RS-${newId.toString().padStart(4, '0')}`;

    // Drizzle excludes bigint PKs from the inferred insert type when they have
    // no $defaultFn, so we cast to satisfy the type checker.
    const newReservation = await db
      .insert(reservation)
      .values({
        id:          newId,
        reservationId: reservationId,
        firstName:     firstName,
        lastName:      lastName,
        email,
        phone,
        inventoryCode: inventoryCode,
        projectName:   project,
        block:         blockNumber,
        lot:           lotNumber,
        recipientEmail: recipientEmail?? '',
        ccEmail:       ccEmail?? '',
        bccEmail:      bccEmail?? '',
      } as unknown as typeof reservation.$inferInsert)
      .returning();

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error('[POST /api/reservation]', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}