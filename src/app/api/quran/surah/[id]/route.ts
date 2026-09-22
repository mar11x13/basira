import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSurah, QURAN_TRANSLATION_SOURCE } from '@/lib/surahs';
import { mapRecord } from '@/lib/record-mapper';

export const dynamic = 'force-dynamic';

// ============================================================================
// Full-Quran reading — INTEGRATION LAYER.
// Primary: external dataset api.alquran.cloud (Uthmani script + Pickthall
// translation, public domain 1930). Cached in QuranCache (24h).
// Fallback: BASIRA's curated verified ayahs from the source database, with
// an honest "partial" status — never silently faked.
// ============================================================================

const CACHE_TTL = 24 * 60 * 60 * 1000;
const API_BASE = process.env.QURAN_API_URL ?? 'https://api.alquran.cloud/v1';

interface ExternalAyah {
  numberInSurah: number;
  arabic: string;
  translation: string;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const surahNumber = parseInt(id, 10);
    if (Number.isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      return NextResponse.json({ error: 'Surah number must be 1–114.' }, { status: 400 });
    }
    const meta = getSurah(surahNumber);
    if (!meta) return NextResponse.json({ error: 'Surah not found' }, { status: 404 });

    // 1) fresh cache?
    const cached = await db.quranCache.findUnique({ where: { surahNumber } });
    if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL) {
      return NextResponse.json({
        surah: meta,
        ayahs: JSON.parse(cached.dataJson),
        translationSource: 'The Meaning of the Glorious Qur\'an — Marmaduke Pickthall (1930, public domain)',
        status: 'cached',
        source: 'External Quran dataset (api.alquran.cloud) — cached locally',
        note: 'Arabic: Uthmani script. This is the full surah.',
      });
    }

    // 2) try the external dataset
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 9000);
      const res = await fetch(`${API_BASE}/surah/${surahNumber}/editions/quran-uthmani,en.pickthall`, {
        signal: ctrl.signal,
        headers: { accept: 'application/json' },
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`API responded ${res.status}`);
      const json = await res.json();
      const editions = json?.data as { edition?: { identifier?: string }; ayahs?: { numberInSurah: number; text: string }[] }[] | undefined;
      const arabicEdition = editions?.find((e) => e.edition?.identifier === 'quran-uthmani');
      const englishEdition = editions?.find((e) => e.edition?.identifier === 'en.pickthall');
      if (!arabicEdition?.ayahs?.length || !englishEdition?.ayahs?.length) throw new Error('Malformed API payload');

      const ayahs: ExternalAyah[] = arabicEdition.ayahs.map((a) => ({
        numberInSurah: a.numberInSurah,
        arabic: a.text,
        translation: englishEdition.ayahs.find((e) => e.numberInSurah === a.numberInSurah)?.text ?? '',
      }));

      await db.quranCache.upsert({
        where: { surahNumber },
        create: { surahNumber, dataJson: JSON.stringify(ayahs) },
        update: { dataJson: JSON.stringify(ayahs), fetchedAt: new Date() },
      });

      return NextResponse.json({
        surah: meta,
        ayahs,
        translationSource: 'The Meaning of the Glorious Qur\'an — Marmaduke Pickthall (1930, public domain)',
        status: 'external',
        source: 'External Quran dataset (api.alquran.cloud)',
        note: 'Arabic: Uthmani script. This is the full surah.',
      });
    } catch (err) {
      console.error('quran api error', err);
    }

    // 3) honest fallback: BASIRA's curated verified ayahs for this surah
    const rows = await db.sourceText.findMany({
      where: { sourceType: 'QURAN', surahNumber, active: true },
      orderBy: [{ ayahNumber: 'asc' }],
    });
    const curated = rows
      .filter((r) => r.sourceStatus !== 'DISABLED')
      .map((r) => ({
        numberInSurah: r.ayahNumber ?? 0,
        arabic: r.arabicText ?? '',
        translation: r.englishText,
        excerptOnly: r.excerptOnly,
        slug: r.slug,
      }));

    return NextResponse.json({
      surah: meta,
      ayahs: curated,
      translationSource: QURAN_TRANSLATION_SOURCE,
      status: 'local-curated',
      source: 'BASIRA local verified source database',
      note: curated.length
        ? `The external full-Quran dataset could not be reached right now, so BASIRA is showing its ${curated.length} curated verified ayah${curated.length > 1 ? 's' : ''} of this surah (of ${meta.ayahs} total) with full source cards. Nothing is invented — you are seeing exactly what BASIRA has verified.`
        : 'The external full-Quran dataset could not be reached right now, and BASIRA has no curated ayahs for this surah yet. Please try again later — BASIRA will not display invented text.',
    });
  } catch (e) {
    console.error('quran surah error', e);
    return NextResponse.json({ error: 'Could not load this surah.' }, { status: 500 });
  }
}
