import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const [byType, byVerification, flagged, disabled, questions, unreviewed, audits, profiles, bookmarks] = await Promise.all([
      db.sourceText.groupBy({ by: ['sourceType'], _count: true }),
      db.sourceText.groupBy({ by: ['verificationStatus'], _count: true }),
      db.sourceText.count({ where: { sourceStatus: 'FLAGGED' } }),
      db.sourceText.count({ where: { sourceStatus: 'DISABLED' } }),
      db.questionLog.count(),
      db.questionLog.count({ where: { reviewStatus: 'UNREVIEWED' } }),
      db.auditLog.count(),
      db.userProfile.count(),
      db.bookmark.count(),
    ]);
    return NextResponse.json({
      byType: Object.fromEntries(byType.map((g) => [g.sourceType, g._count])),
      byVerification: Object.fromEntries(byVerification.map((g) => [g.verificationStatus, g._count])),
      flagged,
      disabled,
      questions: { total: questions, unreviewed },
      audits,
      profiles,
      bookmarks,
    });
  } catch (e) {
    console.error('admin stats error', e);
    return NextResponse.json({ error: 'Could not load stats' }, { status: 500 });
  }
}
