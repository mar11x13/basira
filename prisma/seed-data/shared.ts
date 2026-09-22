// Shared seed types. All seed entries are curated, verified records.
export interface SeedRecord {
  slug: string;
  sourceType: string;
  title: string;
  surahNumber?: number;
  surahNameEn?: string;
  surahNameAr?: string;
  surahNameTranslit?: string;
  ayahNumber?: number;
  ayahEnd?: number;
  excerptOnly?: boolean;
  collection?: string;
  book?: string;
  chapter?: string;
  hadithNumber?: number | null;
  referenceNote?: string;
  narrator?: string;
  grade?: string;
  scholar?: string;
  school?: string;
  arabicText?: string | null;
  transliteration?: string | null;
  englishText: string;
  explanation?: string;
  practicalSteps?: string[];
  targetCount?: number;
  translationSource?: string;
  topics?: string;
  keywords?: string;
  category?: string;
  verificationStatus?: string;
  reviewer?: string;
  lastReviewedAt?: string;
  sortOrder?: number;
}

export const BASIRA_TRANSLATION = 'BASIRA Simple English rendering of the Arabic (public domain)';
export const EDITION_NOTE =
  'Hadith numbering follows the widely used English edition numbering (Darussalam / sunnah.com) and may differ in other editions.';
