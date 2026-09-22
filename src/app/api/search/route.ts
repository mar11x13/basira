import { NextResponse } from 'next/server';
import { getActiveSources } from '@/lib/api-helpers';
import { rankRecords } from '@/lib/search';

export const dynamic = 'force-dynamic';

// GET /api/search?q=...&types=QURAN,HADITH
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') ?? '').trim();
    const types = url.searchParams.get('types');
    if (!q) return NextResponse.json({ query: '', total: 0, groups: [] });

    const rows = await getActiveSources();
    const { groups, total } = rankRecords(rows, q, {
      types: types ? types.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      limit: 36,
    });
    return NextResponse.json({ query: q, total, groups });
  } catch (e) {
    console.error('search error', e);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
