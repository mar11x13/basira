import { NextResponse } from 'next/server';
import { getActiveSources } from '@/lib/api-helpers';
import { pickDaily, mapRecord } from '@/lib/daily';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await getActiveSources();
    const verse = pickDaily(rows, 'QURAN');
    const hadith = pickDaily(rows, 'HADITH');
    const dua = pickDaily(rows, 'DUA');
    return NextResponse.json({
      date: new Date().toISOString().slice(0, 10),
      verse: verse ? mapRecord(verse) : null,
      hadith: hadith ? mapRecord(hadith) : null,
      dua: dua ? mapRecord(dua) : null,
      note: 'Daily content rotates at midnight from the verified source database — nothing random, nothing fabricated.',
    });
  } catch (e) {
    console.error('daily error', e);
    return NextResponse.json({ error: 'Could not load daily content' }, { status: 500 });
  }
}
