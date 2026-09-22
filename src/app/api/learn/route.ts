import { NextResponse } from 'next/server';
import { LEARNING_PATHS } from '@/lib/learning-paths';
import { getOrCreateSession } from '@/lib/session';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { profile } = await getOrCreateSession().catch(() => null as never);
    let lessons: { pathId: string; lessonId: string; completed: boolean }[] = [];
    if (profile) {
      const rows = await db.lessonProgress.findMany({ where: { userId: profile.id } });
      lessons = rows.map((l) => ({ pathId: l.pathId, lessonId: l.lessonId, completed: l.completed }));
    }
    return NextResponse.json({
      paths: LEARNING_PATHS,
      progress: lessons,
      note: 'Progress is tracked for you alone — BASIRA deliberately has no leaderboards. Religious learning is between you and Allah.',
    });
  } catch {
    return NextResponse.json({ paths: LEARNING_PATHS, progress: [] });
  }
}
