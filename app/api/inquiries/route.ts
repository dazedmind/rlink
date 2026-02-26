import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inquiry } from "@/db/schema";
import { eq, ilike, desc, max } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") ?? 20)),
    );
    const offset = (page - 1) * limit;

    let query = db.select().from(inquiry).$dynamic();

    const results = await query
      .orderBy(desc(inquiry.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ data: results, page, limit });
  } catch (error) {
    console.error("[GET /api/inquiries]", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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
