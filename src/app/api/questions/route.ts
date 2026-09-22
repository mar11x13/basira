import { NextResponse } from 'next/server';
import { getOrCreateSession } from '@/lib/session';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { profile } = await getOrCreateSession();
    const rows = await db.questionLog.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: { id: true, question: true, createdAt: true, verification: true },
    });
    return NextResponse.json({
      items: rows.map((r) => ({
        id: r.id,
        question: r.question,
        verification: r.verification,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error('questions error', e);
    return NextResponse.json({ error: 'Could not load questions' }, { status: 500 });
  }
}
