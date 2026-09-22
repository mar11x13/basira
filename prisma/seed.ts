// BASIRA seed runner — loads all curated verified content into the database.
// Run with: bunx bun prisma/seed.ts  (or bun prisma/seed.ts)
// Idempotent: clears SourceText and re-inserts (bookmarks cascade — the app
// is pre-launch, so a clean knowledge base matters more than old rows).

import { PrismaClient } from '@prisma/client';
import { QURAN_SEED_CLEAN } from './seed-data/quran';
import { HADITH_SEED } from './seed-data/hadith';
import { DUA_SEED } from './seed-data/duas';
import { DHIKR_SEED } from './seed-data/dhikr';
import { FIQH_SEED } from './seed-data/fiqh';
import { GLOSSARY_SEED } from './seed-data/glossary';
import { SEERAH_SEED } from './seed-data/seerah';
import { SCHOLARLY_SEED } from './seed-data/scholarly';
import type { SeedRecord } from './seed-data/shared';

const db = new PrismaClient();

async function main() {
  const all: SeedRecord[] = [
    ...QURAN_SEED_CLEAN,
    ...HADITH_SEED,
    ...DUA_SEED,
    ...DHIKR_SEED,
    ...FIQH_SEED,
    ...GLOSSARY_SEED,
    ...SEERAH_SEED,
    ...SCHOLARLY_SEED,
  ];

  // slug uniqueness across every collection
  const seen = new Set<string>();
  for (const r of all) {
    if (seen.has(r.slug)) throw new Error(`Duplicate slug: ${r.slug}`);
    seen.add(r.slug);
    if (!r.slug || !r.sourceType || !r.englishText) throw new Error(`Incomplete record: ${r.slug}`);
  }

  console.log(`Seeding ${all.length} verified source records…`);
  await db.sourceText.deleteMany({});

  const data = all.map((r) => ({
    slug: r.slug,
    sourceType: r.sourceType,
    title: r.title,
    surahNumber: r.surahNumber ?? null,
    surahNameEn: r.surahNameEn ?? null,
    surahNameAr: r.surahNameAr ?? null,
    surahNameTranslit: r.surahNameTranslit ?? null,
    ayahNumber: r.ayahNumber ?? null,
    ayahEnd: r.ayahEnd ?? null,
    excerptOnly: r.excerptOnly ?? false,
    collection: r.collection ?? null,
    book: r.book ?? null,
    chapter: r.chapter ?? null,
    hadithNumber: r.hadithNumber ?? null,
    referenceNote: r.referenceNote ?? null,
    narrator: r.narrator ?? null,
    grade: r.grade ?? null,
    scholar: r.scholar ?? null,
    school: r.school ?? null,
    arabicText: r.arabicText ?? null,
    transliteration: r.transliteration ?? null,
    englishText: r.englishText,
    explanation: r.explanation ?? null,
    practicalSteps: r.practicalSteps ? JSON.stringify(r.practicalSteps) : null,
    targetCount: r.targetCount ?? null,
    translationSource: r.translationSource ?? 'BASIRA Simple English rendering (public domain)',
    topics: r.topics ?? '',
    keywords: r.keywords ?? '',
    category: r.category ?? null,
    verificationStatus: r.verificationStatus ?? 'VERIFIED',
    reviewer: r.reviewer ?? null,
    lastReviewedAt: r.lastReviewedAt ? new Date(r.lastReviewedAt) : null,
    sourceStatus: 'ACTIVE',
    flagNote: null,
    sortOrder: r.sortOrder ?? 0,
    active: true,
  }));

  // chunk inserts to be safe with SQLite limits
  const CHUNK = 50;
  for (let i = 0; i < data.length; i += CHUNK) {
    await db.sourceText.createMany({ data: data.slice(i, i + CHUNK) });
  }

  const counts: Record<string, number> = {};
  for (const r of all) counts[r.sourceType] = (counts[r.sourceType] ?? 0) + 1;
  console.log('Seeded by type:', counts);

  const pending = all.filter((r) => r.verificationStatus === 'REFERENCE_PENDING').length;
  const disputed = all.filter((r) => r.verificationStatus === 'DISPUTED').length;
  console.log(`Verification: ${all.length - pending - disputed} verified, ${pending} reference-pending, ${disputed} disputed (labeled honestly).`);
  console.log('BASIRA knowledge base seeded ✓');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
