import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Review AI answers (quality control workflow).
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status'); // UNREVIEWED | APPROVED | FLAGGED
    const rows = await db.questionLog.findMany({
      where: status ? { reviewStatus: status } : {},
      orderBy: { createdAt: 'desc' },
      take: 60,
    });
    return NextResponse.json({
      items: rows.map((r) => ({
        id: r.id,
        question: r.question,
        answer: r.answer,
        sources: safeParse(r.sourcesJson),
        verification: r.verification,
        reviewStatus: r.reviewStatus,
        reviewerNote: r.reviewerNote,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error('admin questions GET error', e);
    return NextResponse.json({ error: 'Could not load AI answers' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const id = String(body.id ?? '');
    const reviewStatus = String(body.reviewStatus ?? '');
    if (!id || !['UNREVIEWED', 'APPROVED', 'FLAGGED'].includes(reviewStatus)) {
      return NextResponse.json({ error: 'id and valid reviewStatus required' }, { status: 400 });
    }
    const reviewerNote = typeof body.reviewerNote === 'string' ? body.reviewerNote.slice(0, 500) : null;
    const updated = await db.questionLog.update({
      where: { id },
      data: { reviewStatus, reviewerNote },
    });
    await db.auditLog.create({
      data: {
        action: 'REVIEW',
        entity: 'QuestionLog',
        entityId: id,
        afterJson: JSON.stringify({ reviewStatus, reviewerNote }),
      },
    });
    return NextResponse.json({ ok: true, id: updated.id, reviewStatus: updated.reviewStatus });
  } catch (e) {
    console.error('admin questions PATCH error', e);
    return NextResponse.json({ error: 'Could not update review' }, { status: 500 });
  }
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}
