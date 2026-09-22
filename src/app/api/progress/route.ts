import { NextResponse } from 'next/server';
import { getOrCreateSession } from '@/lib/session';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { profile } = await getOrCreateSession();
    const [reading, dhikrToday, dhikrRecent, lessons, questions] = await Promise.all([
      db.readingProgress.findMany({ where: { userId: profile.id }, orderBy: { updatedAt: 'desc' } }),
      db.dhikrProgress.findMany({ where: { userId: profile.id, day: new Date().toISOString().slice(0, 10) } }),
      db.dhikrProgress.findMany({
        where: { userId: profile.id },
        orderBy: { updatedAt: 'desc' },
        take: 60,
      }),
      db.lessonProgress.findMany({ where: { userId: profile.id } }),
      db.questionLog.findMany({
        where: { userId: profile.id },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, question: true, createdAt: true },
      }),
    ]);
    return NextResponse.json({
      reading: reading.map((r) => ({ surahNumber: r.surahNumber, lastAyah: r.lastAyah, updatedAt: r.updatedAt.toISOString() })),
      dhikr: { today: dhikrToday.map(({ dhikrKey, count }) => ({ dhikrKey, count })), recent: dhikrRecent.map(({ dhikrKey, day, count }) => ({ dhikrKey, day, count })) },
      lessons: lessons.map((l) => ({ pathId: l.pathId, lessonId: l.lessonId, completed: l.completed })),
      questions: questions.map((q) => ({ id: q.id, question: q.question, createdAt: q.createdAt.toISOString() })),
    });
  } catch (e) {
    console.error('progress GET error', e);
    return NextResponse.json({ error: 'Could not load progress' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { profile } = await getOrCreateSession();
    const body = await req.json();
    const kind = String(body.kind ?? '');

    if (kind === 'reading') {
      const surahNumber = parseInt(body.surahNumber, 10);
      const lastAyah = parseInt(body.lastAyah, 10);
      if (Number.isNaN(surahNumber) || Number.isNaN(lastAyah)) {
        return NextResponse.json({ error: 'surahNumber and lastAyah are required' }, { status: 400 });
      }
      await db.readingProgress.upsert({
        where: { userId_surahNumber: { userId: profile.id, surahNumber } },
        create: { userId: profile.id, surahNumber, lastAyah },
        update: { lastAyah },
      });
      return NextResponse.json({ ok: true });
    }

    if (kind === 'dhikr') {
      const dhikrKey = String(body.dhikrKey ?? '').slice(0, 120);
      const count = Math.max(0, Math.min(parseInt(body.count, 10) || 0, 100000));
      const day = new Date().toISOString().slice(0, 10);
      if (!dhikrKey) return NextResponse.json({ error: 'dhikrKey is required' }, { status: 400 });
      await db.dhikrProgress.upsert({
        where: { userId_dhikrKey_day: { userId: profile.id, dhikrKey, day } },
        create: { userId: profile.id, dhikrKey, day, count },
        update: { count },
      });
      return NextResponse.json({ ok: true, count, day });
    }

    if (kind === 'lesson') {
      const pathId = String(body.pathId ?? '').slice(0, 80);
      const lessonId = String(body.lessonId ?? '').slice(0, 80);
      const completed = body.completed !== false;
      if (!pathId || !lessonId) return NextResponse.json({ error: 'pathId and lessonId are required' }, { status: 400 });
      await db.lessonProgress.upsert({
        where: { userId_pathId_lessonId: { userId: profile.id, pathId, lessonId } },
        create: { userId: profile.id, pathId, lessonId, completed },
        update: { completed },
      });
      return NextResponse.json({ ok: true, completed });
    }

    return NextResponse.json({ error: 'Unknown progress kind' }, { status: 400 });
  } catch (e) {
    console.error('progress POST error', e);
    return NextResponse.json({ error: 'Could not save progress' }, { status: 500 });
  }
}
