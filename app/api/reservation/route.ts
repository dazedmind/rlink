import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reservation } from '@/db/schema';
import { eq, ilike, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const search = searchParams.get('search');
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)));
    const offset = (page - 1) * limit;

    let query = db.select().from(reservation).$dynamic();

    if (search) query = query.where(ilike(reservation.inventoryCode, `%${search}%`));

    const results = await query
      .orderBy(desc(reservation.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ data: results, page, limit });
  } catch (error) {
    console.error('[GET /api/reservation]', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { firstName, lastName, email, phone, inventoryCode, project, blockNumber, lotNumber, recipientEmail, ccEmail, bccEmail } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required.' }, { status: 400 });
    }
    if (!email)  return NextResponse.json({ error: 'Email is required.' },  { status: 400 });
    if (!phone)  return NextResponse.json({ error: 'Phone is required.' },  { status: 400 });
    if (!project) return NextResponse.json({ error: 'Project is required.' }, { status: 400 });

    // Date.now() is in ms (13 digits) and overflows an integer column.
    // Unix timestamp in seconds fits safely within integer range (< 2.147B).
    const count = await db.$count(reservation);
    const newId = count ? count +1 : 1;
    const reservationId = `RS-${(newId).toString().padStart(4, '0')}`;

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
        inventoryCode,
        projectName:   project,
        block:         blockNumber,
        lot:           lotNumber,
        recipientEmail: recipientEmail,
        ccEmail:       ccEmail,
        bccEmail:      bccEmail,
      } as unknown as typeof reservation.$inferInsert)
      .returning();

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error('[POST /api/reservation]', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
