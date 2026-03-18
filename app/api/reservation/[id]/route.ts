import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reservation } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit, rateLimit429 } from "@/lib/rate-limit";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) {
    const limitResult = rateLimit(request, { maxRequests: 60, windowMs: 60_000 });
    if (!limitResult.success) return rateLimit429(limitResult, 60);

    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;

    try {
      const { id } = await params;
      const numericId = parseInt(id, 10);
  
      if (isNaN(numericId)) {
        return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
      }
  
      const body = await request.json();
      
      // Whitelisting fields ensures users can't overwrite sensitive columns like 'id' or 'createdAt'
      const allowedFields = ["status", "projectName", "block", "lot", "notes", "phone", "email", "firstName", "lastName"] as const;
      const updates: Partial<typeof reservation.$inferInsert> = {};
  
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          // @ts-ignore - Dynamic mapping to schema
          updates[field] = body[field];
        }
      }
  
      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No valid update fields provided" }, { status: 400 });
      }
  
      // Execute the update
      const [updated] = await db
        .update(reservation)
        .set(updates)
        .where(eq(reservation.id, numericId))
        .returning();
  
      if (!updated) {
        return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
      }
  
      revalidatePath("/home");
      return NextResponse.json({ 
          message: "Reservation updated successfully",
          data: updated 
      });
  
    } catch (error) {
      console.error(`[PATCH /api/reservation/:id]`, error);
      return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 });
    }
  }

  export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
    if (!limitResult.success) return rateLimit429(limitResult, 30);

    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;

    try {
      const { id } = await params;
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
      }
      const deletedReservation = await db.delete(reservation).where(eq(reservation.id, numericId));
      if (!deletedReservation) {
        return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
      }
      revalidatePath("/home");
      return NextResponse.json({ message: 'Reservation deleted successfully' }, { status: 200 });
    } catch (error) {
      console.error('[DELETE /api/reservation/:id]', error);
      return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 });
    }
  }