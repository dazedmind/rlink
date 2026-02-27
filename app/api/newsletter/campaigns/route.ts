import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/db/schema";
import { asc, count, desc, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const offset = (page - 1) * limit;

    // Optional filters
    const statusParam = searchParams.get("status");
    const statusValues = statusParam ? statusParam.split(",").filter(Boolean) : [];
    const sort = searchParams.get("sort") ?? "newest";

    const whereClause =
      statusValues.length > 0
        ? inArray(campaigns.status, statusValues as ("draft" | "scheduled" | "sent")[])
        : undefined;

    const orderBy = (() => {
      switch (sort) {
        case "oldest":   return asc(campaigns.createdAt);
        default:         return desc(campaigns.createdAt); // newest
      }
    })();

    const [{ total }, campaign] = await Promise.all([
      db.select({ total: count() }).from(campaigns).where(whereClause).then((r) => r[0]),
      db.select().from(campaigns).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
    ]);

    return NextResponse.json({ data: campaign, page, limit, total });
  } catch (error) {
    console.error("[GET /api/newsletter/campaigns]", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}