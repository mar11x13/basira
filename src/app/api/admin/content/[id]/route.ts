import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { mapRecord } from '@/lib/record-mapper';
import { invalidateSourceCache } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

const EDITABLE_FIELDS = [
  'title', 'collection', 'book', 'chapter', 'referenceNote', 'narrator', 'grade',
  'scholar', 'school', 'arabicText', 'transliteration', 'englishText', 'explanation',
  'translationSource', 'topics', 'keywords', 'category', 'verificationStatus', 'reviewer',
  'sourceStatus', 'flagNote',
] as const;
const NUMERIC_FIELDS = ['hadithNumber', 'surahNumber', 'ayahNumber', 'ayahEnd', 'targetCount'] as const;
const FLAGS = new Set(['FLAG', 'DISABLE', 'ENABLE']);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const row = await db.sourceText.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!row) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

    const body = await req.json();
    const action = typeof body.action === 'string' ? body.action : null;

    const data: Record<string, unknown> = {};
    if (action && FLAGS.has(action)) {
      if (action === 'FLAG') {
        data.sourceStatus = 'FLAGGED';
        data.flagNote = typeof body.flagNote === 'string' ? body.flagNote.slice(0, 500) : 'Flagged for scholarly review';
      } else if (action === 'DISABLE') {
        data.sourceStatus = 'DISABLED';
      } else {
        data.sourceStatus = 'ACTIVE';
        data.flagNote = null;
      }
    } else {
      for (const f of EDITABLE_FIELDS) {
        if (typeof body[f] === 'string') data[f] = body[f];
      }
      for (const f of NUMERIC_FIELDS) {
        if (body[f] === null) data[f] = null;
        else if (typeof body[f] === 'number') data[f] = body[f];
      }
      if (typeof body.practicalSteps === 'string') {
        data.practicalSteps = JSON.stringify(body.practicalSteps.split('\n').filter(Boolean));
      }
      if (Object.keys(data).length) data.lastReviewedAt = new Date();
    }

    const before = { slug: row.slug, verificationStatus: row.verificationStatus, sourceStatus: row.sourceStatus, title: row.title, hadithNumber: row.hadithNumber, book: row.book };
    const updated = await db.sourceText.update({ where: { id: row.id }, data: data as never });
    await db.auditLog.create({
      data: {
        action: action && FLAGS.has(action) ? action : 'UPDATE',
        entity: 'SourceText',
        entityId: row.id,
        beforeJson: JSON.stringify(before),
        afterJson: JSON.stringify({ slug: updated.slug, verificationStatus: updated.verificationStatus, sourceStatus: updated.sourceStatus, title: updated.title, hadithNumber: updated.hadithNumber, book: updated.book, changed: Object.keys(data) }),
      },
    });
    invalidateSourceCache();
    return NextResponse.json({ ok: true, record: mapRecord(updated) });
  } catch (e) {
    console.error('admin content PATCH error', e);
    return NextResponse.json({ error: 'Could not update record' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const row = await db.sourceText.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!row) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    // Soft-delete: disable instead of destroying — audit trail integrity.
    const updated = await db.sourceText.update({
      where: { id: row.id },
      data: { sourceStatus: 'DISABLED', active: false },
    });
    await db.auditLog.create({
      data: {
        action: 'DISABLE',
        entity: 'SourceText',
        entityId: row.id,
        beforeJson: JSON.stringify({ slug: row.slug, sourceStatus: row.sourceStatus }),
        afterJson: JSON.stringify({ slug: row.slug, sourceStatus: 'DISABLED' }),
      },
    });
    invalidateSourceCache();
    return NextResponse.json({ ok: true, record: mapRecord(updated) });
  } catch (e) {
    console.error('admin content DELETE error', e);
    return NextResponse.json({ error: 'Could not disable record' }, { status: 500 });
  }
}
