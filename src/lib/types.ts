// ============================================================================
// BASIRA — shared types (API contract used by both backend and frontend)
// ============================================================================

export type SourceType =
  | 'QURAN'
  | 'HADITH'
  | 'DUA'
  | 'DHIKR'
  | 'FIQH'
  | 'GLOSSARY'
  | 'SEERAH'
  | 'SCHOLARLY'
  | 'GENERAL';

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  QURAN: "Qur'an",
  HADITH: 'Hadith',
  DUA: 'Dua',
  DHIKR: 'Dhikr',
  FIQH: 'Fiqh Guide',
  GLOSSARY: 'Glossary',
  SEERAH: 'Seerah',
  SCHOLARLY: 'Scholarly View',
  GENERAL: 'General Guidance',
};

export type VerificationStatus = 'VERIFIED' | 'REFERENCE_PENDING' | 'DISPUTED';

export interface SourceRecord {
  id: string;
  slug: string;
  sourceType: SourceType;
  title: string;

  surahNumber?: number | null;
  surahNameEn?: string | null;
  surahNameAr?: string | null;
  surahNameTranslit?: string | null;
  ayahNumber?: number | null;
  ayahEnd?: number | null;
  excerptOnly?: boolean;

  collection?: string | null;
  book?: string | null;
  chapter?: string | null;
  hadithNumber?: number | null;
  referenceNote?: string | null;
  narrator?: string | null;
  grade?: string | null;

  scholar?: string | null;
  school?: string | null;

  arabicText?: string | null;
  transliteration?: string | null;
  englishText: string;
  explanation?: string | null;
  practicalSteps?: string[] | null;
  translationSource: string;

  topics: string[];
  keywords: string[];
  category?: string | null;

  verificationStatus: VerificationStatus;
  reviewer?: string | null;
  lastReviewedAt?: string | null;

  /** Human-readable one-line citation, e.g. "Qur'an 2:286 · Al-Baqarah" */
  citation: string;
  /** Longer citation for the expanded source card */
  citationDetail: string;
}

export interface Profile {
  id: string;
  displayName?: string | null;
  madhhab?: string | null;
  language: string;
  showArabic: boolean;
  showTranslit: boolean;
  beginnerMode: boolean;
  translationPref: string;
  prayerMethod: string;
  asrFactor: number;
  locationLat?: number | null;
  locationLng?: number | null;
  locationName?: string | null;
  notifyPrayer: boolean;
  notifyQuran: boolean;
  notifyDhikr: boolean;
  notifyFriday: boolean;
  onboarded: boolean;
}

export interface PrayerTimesResult {
  date: string; // YYYY-MM-DD
  location: { lat: number; lng: number; name?: string | null };
  method: string;
  asrFactor: number;
  times: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  next?: { name: string; time: string; minutesUntil: number } | null;
}

export interface HijriResult {
  gregorian: string;
  hijri: string; // e.g. "15 Jumada al-Ula 1446"
  hijriDay: number;
  hijriMonth: number;
  hijriMonthName: string;
  hijriYear: number;
  methodNote: string;
  events: IslamicEvent[];
}

export interface IslamicEvent {
  key: string;
  name: string;
  nameAr?: string;
  hijriDate: string;
  expectedGregorian: string;
  note: string;
}

export interface AskResponse {
  questionId: string;
  answer: string;
  sources: SourceRecord[];
  verification: {
    status: 'OK' | 'PARTIAL' | 'FAILED';
    notice?: string;
  };
  groundingError?: string;
}

export interface SearchGroup {
  sourceType: SourceType;
  label: string;
  items: SourceRecord[];
}

export interface SearchResult {
  query: string;
  total: number;
  groups: SearchGroup[];
}

export interface BookmarkItem {
  id: string;
  note?: string | null;
  createdAt: string;
  record: SourceRecord;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  recordSlugs?: string[];
  contentBlocks?: { heading?: string; body: string }[];
}

export interface LearningPath {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  lessons: Lesson[];
}
