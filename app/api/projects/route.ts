import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const projectsList = await db.select().from(projects).$dynamic();
    return NextResponse.json(projectsList);
  } catch (error) {
    console.error('[GET /api/projects]', error);
    return NextResponse.json({ error: 'Failed to fetch projects list' }, { status: 500 });
  }
}