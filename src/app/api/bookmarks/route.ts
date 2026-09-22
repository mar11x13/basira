import { NextResponse } from 'next/server';
import { getOrCreateSession } from '@/lib/session';
import { db } from '@/lib/db';
import { mapRecord } from '@/lib/record-mapper';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { profile } = await getOrCreateSession();
    const rows = await db.bookmark.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: { source: true },
    });
    return NextResponse.json({
      items: rows
        .filter((b) => b.source.active && b.source.sourceStatus !== 'DISABLED')
        .map((b) => ({
          id: b.id,
          note: b.note,
          createdAt: b.createdAt.toISOString(),
          record: mapRecord(b.source),
        })),
    });
  } catch (e) {
    console.error('bookmarks GET error', e);
    return NextResponse.json({ error: 'Could not load bookmarks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { profile } = await getOrCreateSession();
    const body = await req.json();
    const recordId = String(body.recordId ?? '');
    const note = typeof body.note === 'string' ? body.note.slice(0, 280) : null;
    if (!recordId) return NextResponse.json({ error: 'recordId is required' }, { status: 400 });

    const source = await db.sourceText.findFirst({ where: { OR: [{ id: recordId }, { slug: recordId }] } });
    if (!source) return NextResponse.json({ error: 'Source not found' }, { status: 404 });

    const existing = await db.bookmark.findFirst({ where: { userId: profile.id, sourceTextId: source.id } });
    if (existing) {
      await db.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ ok: true, removed: true });
    }
    const created = await db.bookmark.create({ data: { userId: profile.id, sourceTextId: source.id, note } });
    return NextResponse.json({ ok: true, removed: false, id: created.id });
  } catch (e) {
    console.error('bookmarks POST error', e);
    return NextResponse.json({ error: 'Could not save bookmark' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { profile } = await getOrCreateSession();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    const bm = await db.bookmark.findFirst({ where: { id, userId: profile.id } });
    if (bm) await db.bookmark.delete({ where: { id: bm.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('bookmarks DELETE error', e);
    return NextResponse.json({ error: 'Could not remove bookmark' }, { status: 500 });
  }
}
