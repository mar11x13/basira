import { NextResponse } from 'next/server';
import { getActiveSources } from '@/lib/api-helpers';
import { mapRecord } from '@/lib/record-mapper';
import { rankRecords } from '@/lib/search';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/content
// params: type (QURAN|HADITH|...), category, surah, topic, q, slugs, limit, offset
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');
    const surah = url.searchParams.get('surah');
    const topic = url.searchParams.get('topic');
    const q = url.searchParams.get('q');
    const slugs = url.searchParams.get('slugs');
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '60', 10) || 60, 200);
    const offset = parseInt(url.searchParams.get('offset') ?? '0', 10) || 0;

    if (slugs) {
      const list = slugs.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 40);
      const rows = await db.sourceText.findMany({ where: { slug: { in: list }, active: true } });
      const order = new Map(list.map((s, i) => [s, i]));
      const items = rows
        .filter((r) => r.sourceStatus !== 'DISABLED')
        .sort((a, b) => (order.get(a.slug) ?? 999) - (order.get(b.slug) ?? 999))
        .map(mapRecord);
      return NextResponse.json({ items, total: items.length });
    }

    const all = await getActiveSources();
    let rows = all;

    if (type) rows = rows.filter((r) => r.sourceType === type);
    if (category) {
      const cat = category.toLowerCase();
      rows = rows.filter((r) => (r.category ?? '').toLowerCase().split(',').map((c) => c.trim()).includes(cat));
    }
    if (surah) {
      const n = parseInt(surah, 10);
      if (!Number.isNaN(n)) rows = rows.filter((r) => r.surahNumber === n);
    }
    if (topic) {
      const t = topic.toLowerCase();
      rows = rows.filter((r) => r.topics.toLowerCase().split(',').map((x) => x.trim()).includes(t));
    }

    if (q) {
      const ranked = rankRecords(rows, q, { limit });
      const items = ranked.groups.flatMap((g) => g.items);
      return NextResponse.json({ items, total: ranked.total });
    }

    const items = rows.slice(offset, offset + limit).map(mapRecord);
    return NextResponse.json({ items, total: rows.length });
  } catch (e) {
    console.error('content error', e);
    return NextResponse.json({ error: 'Could not load content' }, { status: 500 });
  }
}
