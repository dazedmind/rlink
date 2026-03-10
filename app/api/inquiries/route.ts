import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inquiry } from "@/db/schema";
import { and, asc, count, desc, ilike, inArray, max, or } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 100, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 100);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const offset = (page - 1) * limit;

    const statusParam = searchParams.get("status");
    const statusValues = statusParam ? statusParam.split(",").filter(Boolean) : [];
    const subjectParam = searchParams.get("subject");
    const subjectValues = subjectParam ? subjectParam.split(",").filter(Boolean) : [];
    const sourceParam = searchParams.get("source");
    const sourceValues = sourceParam ? sourceParam.split(",").filter(Boolean) : [];
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") ?? "newest";

    const conditions: Parameters<typeof and>[0][] = [];
    if (statusValues.length > 0) conditions.push(inArray(inquiry.status, statusValues as any));
    if (subjectValues.length > 0) conditions.push(inArray(inquiry.subject, subjectValues as any));
    if (sourceValues.length > 0) conditions.push(inArray(inquiry.source, sourceValues as any));
    if (search) conditions.push(or(ilike(inquiry.firstName, `%${search}%`), ilike(inquiry.lastName, `%${search}%`), ilike(inquiry.email, `%${search}%`), ilike(inquiry.message, `%${search}%`))!);
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderBy = (() => {
      switch (sort) {
        case "oldest": return asc(inquiry.createdAt);
        case "name_az": return asc(inquiry.firstName);
        case "name_za": return desc(inquiry.firstName);
        default: return desc(inquiry.createdAt);
      }
    })();

    const [{ total }, data] = await Promise.all([
      db.select({ total: count() }).from(inquiry).where(whereClause).then((r) => r[0]),
      db.select().from(inquiry).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
    ]);

    return NextResponse.json({ data, page, limit, total: total ?? 0 });
  } catch (error) {
    console.error("[GET /api/inquiries]", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const limitResult = rateLimit(request, { maxRequests: 20, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 20);

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      source,
      status,
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required." },
        { status: 400 },
      );
    }
    if (!email)
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    if (!phone)
      return NextResponse.json(
        { error: "Phone is required." },
        { status: 400 },
      );
    if (!subject)
      return NextResponse.json(
        { error: "Subject is required." },
        { status: 400 },
      );
    if (!message)
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    if (!source)
      return NextResponse.json(
        { error: "Source is required." },
        { status: 400 },
      );

    // Date.now() is in ms (13 digits) and overflows an integer column.
    // Unix timestamp in seconds fits safely within integer range (< 2.147B).
    const [{ maxId }] = await db.select({ maxId: max(inquiry.id) }).from(inquiry);
    const newId     = (maxId ?? 0) + 1;
    const inquiryId = `IN-${newId.toString().padStart(4, "0")}`;

    // Drizzle excludes bigint PKs from the inferred insert type when they have
    // no $defaultFn, so we cast to satisfy the type checker.
    const newInquiry = await db
      .insert(inquiry)
      .values({
        id: newId,
        inquiryId: inquiryId,
        firstName: firstName,
        lastName: lastName,
        email,
        phone,
        subject,
        message,
        source,
        status: body.status ?? "unread",
      } as unknown as typeof inquiry.$inferInsert)
      .returning();

    return NextResponse.json(newInquiry, { status: 201 });
  } catch (error) {
    console.error("[POST /api/inquiries]", error);
    return NextResponse.json(
      { error: "Failed to create inquiry" },
      { status: 500 },
    );
  }
}
