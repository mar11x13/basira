import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { mapRecord } from '@/lib/record-mapper';
import { invalidateSourceCache } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status'); // sourceStatus
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '100', 10) || 100, 500);

    const rows = await db.sourceText.findMany({
      where: {
        ...(type ? { sourceType: type } : {}),
        ...(status ? { sourceStatus: status } : {}),
        ...(q
          ? {
              OR: [
                { slug: { contains: q } },
                { title: { contains: q } },
                { englishText: { contains: q } },
                { collection: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: [{ sourceType: 'asc' }, { slug: 'asc' }],
      take: limit,
    });
    return NextResponse.json({
      items: rows.map((r) => ({
        ...mapRecord(r),
        sourceStatus: r.sourceStatus,
        flagNote: r.flagNote,
        active: r.active,
      })),
      total: rows.length,
    });
  } catch (e) {
    console.error('admin content GET error', e);
    return NextResponse.json({ error: 'Could not list content' }, { status: 500 });
  }
}

const EDITABLE_FIELDS = [
  'title', 'collection', 'book', 'chapter', 'hadithNumber', 'referenceNote', 'narrator', 'grade',
  'scholar', 'school', 'arabicText', 'transliteration', 'englishText', 'explanation',
  'translationSource', 'topics', 'keywords', 'category', 'verificationStatus', 'reviewer',
  'sourceStatus', 'flagNote', 'surahNumber', 'ayahNumber', 'ayahEnd', 'targetCount',
] as const;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const slug = String(body.slug ?? '').trim();
    const sourceType = String(body.sourceType ?? '').trim();
    const englishText = String(body.englishText ?? '').trim();
    if (!slug || !sourceType || !englishText) {
      return NextResponse.json({ error: 'slug, sourceType and englishText are required' }, { status: 400 });
    }
    const exists = await db.sourceText.findUnique({ where: { slug } });
    if (exists) return NextResponse.json({ error: `Slug "${slug}" already exists.` }, { status: 409 });

    const data: Record<string, unknown> = { slug, sourceType, englishText, lastReviewedAt: new Date() };
    for (const f of EDITABLE_FIELDS) {
      if (f === 'hadithNumber' || f === 'surahNumber' || f === 'ayahNumber' || f === 'ayahEnd' || f === 'targetCount') {
        if (body[f] === null) data[f] = null;
        else if (typeof body[f] === 'number') data[f] = body[f];
      } else if (typeof body[f] === 'string') {
        data[f] = body[f];
      }
    }
    if (typeof body.practicalSteps === 'string') {
      data.practicalSteps = JSON.stringify(body.practicalSteps.split('\n').filter(Boolean));
    }

    const created = await db.sourceText.create({ data: data as never });
    await db.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'SourceText',
        entityId: created.id,
        afterJson: JSON.stringify({ slug, sourceType, title: created.title }),
      },
    });
    invalidateSourceCache();
    return NextResponse.json({ ok: true, record: mapRecord(created) });
  } catch (e) {
    console.error('admin content POST error', e);
    return NextResponse.json({ error: 'Could not create record' }, { status: 500 });
  }
}
