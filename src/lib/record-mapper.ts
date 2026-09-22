import type { SourceText } from '@prisma/client';
import type { SourceRecord, SourceType } from './types';
import { SOURCE_TYPE_LABELS } from './types';

/** Map a SourceText DB row into the public SourceRecord API shape. */
export function mapRecord(r: SourceText): SourceRecord {
  const rec: SourceRecord = {
    id: r.id,
    slug: r.slug,
    sourceType: r.sourceType as SourceType,
    title: r.title,
    surahNumber: r.surahNumber,
    surahNameEn: r.surahNameEn,
    surahNameAr: r.surahNameAr,
    surahNameTranslit: r.surahNameTranslit,
    ayahNumber: r.ayahNumber,
    ayahEnd: r.ayahEnd,
    excerptOnly: r.excerptOnly,
    collection: r.collection,
    book: r.book,
    chapter: r.chapter,
    hadithNumber: r.hadithNumber,
    referenceNote: r.referenceNote,
    narrator: r.narrator,
    grade: r.grade,
    scholar: r.scholar,
    school: r.school,
    arabicText: r.arabicText,
    transliteration: r.transliteration,
    englishText: r.englishText,
    explanation: r.explanation,
    practicalSteps: r.practicalSteps ? (JSON.parse(r.practicalSteps) as string[]) : null,
    translationSource: r.translationSource,
    topics: r.topics ? r.topics.split(',').map((t) => t.trim()).filter(Boolean) : [],
    keywords: r.keywords ? r.keywords.split(',').map((t) => t.trim()).filter(Boolean) : [],
    category: r.category,
    verificationStatus: r.verificationStatus as SourceRecord['verificationStatus'],
    reviewer: r.reviewer,
    lastReviewedAt: r.lastReviewedAt?.toISOString() ?? null,
    citation: '',
    citationDetail: '',
  };
  rec.citation = shortCitation(rec);
  rec.citationDetail = longCitation(rec);
  return rec;
}

export function shortCitation(r: SourceRecord): string {
  switch (r.sourceType) {
    case 'QURAN': {
      const ref = r.ayahEnd && r.ayahEnd !== r.ayahNumber ? `${r.surahNumber}:${r.ayahNumber}-${r.ayahEnd}` : `${r.surahNumber}:${r.ayahNumber}`;
      return `Qur'an ${ref} · ${r.surahNameEn ?? ''}`.trim();
    }
    case 'HADITH': {
      const num = r.hadithNumber != null ? ` ${r.hadithNumber}` : '';
      return `${r.collection ?? 'Hadith'}${num}`.trim() + (r.hadithNumber == null ? ' (ref. pending)' : '');
    }
    case 'DUA': {
      if (r.collection) {
        const num = r.hadithNumber != null ? ` ${r.hadithNumber}` : '';
        return `${r.collection}${num}`.trim();
      }
      return 'General permissible dua';
    }
    case 'DHIKR':
      return r.collection ? `${r.collection}${r.hadithNumber != null ? ` ${r.hadithNumber}` : ''}` : 'Authentic dhikr';
    case 'SCHOLARLY':
      return `${r.scholar ?? 'Recognized scholarly view'}${r.school ? ` (${r.school})` : ''}`;
    case 'FIQH':
      return 'Fiqh guide · educational';
    case 'GLOSSARY':
      return 'Glossary · Islamic term';
    case 'SEERAH':
      return `Seerah${r.collection ? ` · ${r.collection}` : ''}`;
    default:
      return 'General guidance';
  }
}

export function longCitation(r: SourceRecord): string {
  const parts: string[] = [shortCitation(r)];
  switch (r.sourceType) {
    case 'QURAN': {
      parts.push(`Surah ${r.surahNumber} — ${r.surahNameEn} (${r.surahNameTranslit}) · ${r.surahNameAr}`);
      if (r.excerptOnly) parts.push('Excerpt of the ayah — full ayah shown in explanation');
      parts.push(`Translation: ${r.translationSource}`);
      break;
    }
    case 'HADITH': {
      if (r.book) parts.push(`Book: ${r.book}`);
      if (r.chapter) parts.push(`Chapter: ${r.chapter}`);
      if (r.hadithNumber != null) parts.push(`Hadith: ${r.hadithNumber}`);
      else parts.push('Hadith number: pending verification');
      if (r.narrator) parts.push(`Narrated by: ${r.narrator}`);
      if (r.grade) parts.push(`Grade: ${r.grade}`);
      if (r.referenceNote) parts.push(r.referenceNote);
      parts.push('Numbering follows the widely used English edition (Darussalam / sunnah.com) and may differ in other editions.');
      break;
    }
    case 'DUA': {
      if (r.collection) {
        if (r.book) parts.push(`Book: ${r.book}`);
        if (r.hadithNumber != null) parts.push(`Hadith: ${r.hadithNumber}`);
        if (r.narrator) parts.push(`Narrated by: ${r.narrator}`);
        if (r.grade) parts.push(`Grade: ${r.grade}`);
      } else {
        parts.push('This is a general permissible supplication — it is not a specifically narrated Sunnah dua.');
      }
      break;
    }
    case 'DHIKR': {
      if (r.collection) parts.push(`${r.collection}${r.hadithNumber != null ? `, Hadith ${r.hadithNumber}` : ''}`);
      break;
    }
    case 'SCHOLARLY': {
      if (r.scholar) parts.push(`Scholar/Position: ${r.scholar}`);
      if (r.school) parts.push(`School: ${r.school}`);
      if (r.referenceNote) parts.push(r.referenceNote);
      parts.push('Presented as an educational summary of a recognized position — not a fatwa.');
      break;
    }
    case 'SEERAH': {
      if (r.collection) parts.push(`Source: ${r.collection}${r.hadithNumber != null ? ` ${r.hadithNumber}` : ''}`);
      if (r.referenceNote) parts.push(r.referenceNote);
      break;
    }
    default:
      parts.push('Clearly labeled general guidance — not a direct religious ruling.');
  }
  if (r.verificationStatus === 'REFERENCE_PENDING')
    parts.push('BASIRA could not fully verify this reference detail; treat the number with care.');
  if (r.verificationStatus === 'DISPUTED')
    parts.push('Scholars have differed over this report/grading — see explanation.');
  return parts.join(' · ');
}

export { SOURCE_TYPE_LABELS };
