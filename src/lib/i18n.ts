'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';

// ============================================================================
// BASIRA i18n — Arabic as a first-class UI language (full RTL), English
// default, and a bilingual mode (English chrome with Arabic subtitles in
// navigation). Content itself is always bilingual: Arabic texts, translated
// explanations. This module localizes the UI CHROME only.
//
// Design rules:
//  - Noreligious text is ever translated here — sacred text rendering stays
//    in SourceCard/ArabicText with its own translation pipeline.
//  - Keys are stable identifiers; the dictionary maps key → {en, ar}.
//  - 'bilingual' keeps English labels (Arabic is already visible everywhere
//    beside the content: titles, names, verses).
//  - When language === 'ar' the document flips to RTL (useDirection).
// ============================================================================

export type UiLanguage = 'en' | 'ar' | 'bilingual';

export const LANGUAGE_OPTIONS: { value: UiLanguage; label: string; labelAr: string; desc: string }[] = [
  {
    value: 'en',
    label: 'English',
    labelAr: 'الإنجليزية',
    desc: 'Interface in English. Arabic texts stay alongside translations.',
  },
  {
    value: 'ar',
    label: 'العربية',
    labelAr: 'العربية',
    desc: 'واجهة عربية كاملة من اليمين إلى اليسار — مع بقاء النصوص المصدرية كما هي.',
  },
  {
    value: 'bilingual',
    label: 'Bilingual',
    labelAr: 'ثنائي اللغة',
    desc: 'English interface with Arabic labels in navigation — a gentle middle way.',
  },
];

type Entry = { en: string; ar: string };

const DICT: Record<string, Entry> = {
  // ————— Navigation —————
  'nav.home': { en: 'Home', ar: 'الرئيسية' },
  'nav.quran': { en: "Qur'an", ar: 'القرآن' },
  'nav.hadith': { en: 'Hadith', ar: 'الحديث' },
  'nav.ask': { en: 'Ask BASIRA', ar: 'اسأل بصيرة' },
  'nav.dua': { en: 'Dua', ar: 'الدعاء' },
  'nav.dhikr': { en: 'Dhikr', ar: 'الذكر' },
  'nav.salah': { en: 'Salah', ar: 'الصلاة' },
  'nav.seerah': { en: 'Seerah', ar: 'السيرة' },
  'nav.calendar': { en: 'Calendar', ar: 'التقويم' },
  'nav.learn': { en: 'Learn', ar: 'التعلم' },
  'nav.glossary': { en: 'Glossary', ar: 'المعجم' },
  'nav.bookmarks': { en: 'Bookmarks', ar: 'المحفوظات' },
  'nav.settings': { en: 'Settings', ar: 'الإعدادات' },
  'nav.admin': { en: 'Admin', ar: 'الإدارة' },
  'nav.more': { en: 'More', ar: 'المزيد' },
  'nav.exploreSheet': { en: 'Explore BASIRA', ar: 'استكشف بصيرة' },

  'nav.home.desc': { en: 'Your daily Muslim companion', ar: 'رفيقك اليومي' },
  'nav.quran.desc': { en: 'Read, search, and reflect', ar: 'اقرأ وابحث وتدبّر' },
  'nav.hadith.desc': { en: 'Sahih al-Bukhari & more', ar: 'صحيح البخاري وغيره' },
  'nav.ask.desc': { en: 'Grounded answers with sources', ar: 'إجابات موثّقة بالمصادر' },
  'nav.dua.desc': { en: 'Supplications by situation', ar: 'أدعية لكل حال' },
  'nav.dhikr.desc': { en: 'Remembrance with counters', ar: 'الذكر بعدّادٍ ومصدر' },
  'nav.salah.desc': { en: 'Learn to pray, step by step', ar: 'تعلّم الصلاة خطوة بخطوة' },
  'nav.seerah.desc': { en: 'Life of the Prophet ﷺ', ar: 'سيرة النبي ﷺ' },
  'nav.calendar.desc': { en: 'Hijri dates & events', ar: 'التاريخ الهجري والمناسبات' },
  'nav.learn.desc': { en: 'Structured learning paths', ar: 'مسارات تعلّم متدرّجة' },
  'nav.glossary.desc': { en: 'Islamic terms simplified', ar: 'مصطلحات مبسّطة' },
  'nav.bookmarks.desc': { en: 'Your saved verses and hadith', ar: 'محفوظاتك من الآيات والأحاديث' },
  'nav.settings.desc': { en: 'Preferences & privacy', ar: 'التفضيلات والخصوصية' },
  'nav.admin.desc': { en: 'Knowledge base review', ar: 'مراجعة قاعدة المصادر' },

  // ————— Header / shell —————
  'shell.search': { en: 'Search BASIRA', ar: 'ابحث في بصيرة' },
  'shell.bookmarks': { en: 'Bookmarks', ar: 'المحفوظات' },
  'shell.bookmarksSaved': { en: 'saved', ar: 'محفوظ' },
  'shell.home': { en: 'BASIRA home', ar: 'صفحة بصيرة الرئيسية' },
  'shell.offline': { en: 'Offline — cached content', ar: 'غير متصل — محتوى مخزّن' },
  'shell.offlineShort': { en: 'Offline', ar: 'غير متصل' },
  'install.subtitle': {
    en: 'Faster reading and an app-like window, with saved content available offline.',
    ar: 'قراءة أسرع ووضع يشبه التطبيق، مع عمل أوفلاين للمحتوى المحفوظ.',
  },
  'shell.educationalTool': {
    en: 'Educational tool · not a fatwa service.',
    ar: 'أداة تعليمية · ليست خدمة فتاوى.',
  },
  'shell.complexMatters': {
    en: 'Complex matters → qualified scholars.',
    ar: 'المسائل المعقّدة → أهل العلم المؤهَّلون.',
  },

  // ————— Footer —————
  'footer.line1': {
    en: 'BASIRA is an educational Islamic guidance tool. It is not Allah, not the Prophet Muhammad ﷺ, and not a scholar — and never speaks as any of them. Answers are grounded in a curated source database (Qur\u2019an; Sahih al-Bukhari and other authentic collections) with citations you can inspect. For rulings on your personal circumstances — marriage, divorce, inheritance, finance, abuse, or medical matters — please consult a qualified scholar.',
    ar: 'بصيرة أداة تعليمية للتوجيه الإسلامي. ليست الله، وليست النبي محمدًا ﷺ، وليست عالِمًا — ولا تنطق بلسان أحدٍ منهم أبدًا. الإجابات مبنيّة على قاعدة مصادر منتقاة (القرآن؛ صحيح البخاري وغيره من الصحاح) بمراجع يمكنك فحصها. للفتاوى في أمورك الشخصية — الزواج والطلاق والميراث والمعاملات وسوء المعاملة والمسائل الطبية — يُرجى الرجوع إلى عالِمٍ مؤهَّل.',
  },
  'footer.line2': {
    en: 'Hadith numbering follows the widely used English edition (Darussalam / sunnah.com) and may differ in other editions. Translations: BASIRA Simple English rendering (public domain) · Full Qur\u2019an reading: Pickthall (1930, public domain) via alquran.cloud integration.',
    ar: 'ترقيم الأحاديث يتبع الطبعة الإنجليزية الشائعة (الدار السلام / sunnah.com) وقد يختلف بين الطبعات. الترجمات: صياغة بصيرة الإنجليزية المبسّطة (مجال عام) · قراءة القرآن الكامل: ترجمة بيكتوريل (1930، مجال عام) عبر تكامل alquran.cloud.',
  },

  // ————— Home —————
  'home.salam': { en: 'Assalamu Alaikum', ar: 'السلام عليكم' },
  'home.salamHi': { en: 'Peace be with you', ar: 'سلامٌ عليكم' },
  'home.morning': { en: 'Good morning', ar: 'صباح الخير' },
  'home.morningSub': { en: 'May your morning be filled with light.', ar: 'أسعد الله صباحك بنورٍ وهداية.' },
  'home.afternoon': { en: 'Good afternoon', ar: 'طاب نهارك' },
  'home.afternoonSub': { en: 'May your afternoon be blessed.', ar: 'بارك الله في نهارك.' },
  'home.evening': { en: 'Good evening', ar: 'مساء الخير' },
  'home.eveningSub': { en: 'May your evening bring tranquility.', ar: 'أمتع الله مساءك بالسكينة.' },
  'home.lateNight': { en: 'Peace be with you', ar: 'سلامٌ عليكم' },
  'home.lateNightSub': { en: 'A blessed late night — may your sleep be rest.', ar: 'ليلة مباركة — أعانك الله على طيب الرقاد.' },
  'home.nextPrayer': { en: 'Next prayer', ar: 'الصلاة القادمة' },
  'home.tomorrow': { en: 'tomorrow', ar: 'غدًا' },
  'home.remaining': { en: 'remaining', ar: 'المتبقي' },
  'home.prayerTimes': { en: "Today's prayer times", ar: 'مواقيت الصلاة اليوم' },
  'home.prayerGuide': { en: 'Prayer guide', ar: 'دليل الصلاة' },
  'home.makkahDefault': { en: 'Makkah (default) — set your location in Settings', ar: 'مكة المكرمة (افتراضي) — اضبط موقعك في الإعدادات' },
  'home.yourLocation': { en: 'Your location', ar: 'موقعك' },
  'home.askTitle': { en: 'Ask BASIRA', ar: 'اسأل بصيرة' },
  'home.askSub': {
    en: 'Grounded answers from verified sources — every citation inspectable.',
    ar: 'إجابات موثّقة من مصادر محقَّقة — وكل مرجعٍ قابل للفحص.',
  },
  'home.ayahOfDay': { en: 'Ayah of the day', ar: 'آية اليوم' },
  'home.hadithOfDay': { en: 'Hadith of the day', ar: 'حديث اليوم' },
  'home.duaOfDay': { en: 'Dua of the day', ar: 'دعاء اليوم' },
  'home.quranBadge': { en: "Qur'an", ar: 'القرآن' },
  'home.sahihBadge': { en: 'Sahih sources', ar: 'من الصحاح' },
  'home.sunnahBadge': { en: 'Sunnah-sourced', ar: 'من السنة' },
  'home.explore': { en: 'Explore', ar: 'استكشف' },
  'home.continueReading': { en: 'Continue reading', ar: 'متابعة القراءة' },
  'home.recentlyAsked': { en: 'Recently asked', ar: 'أسئلتك الأخيرة' },
  'home.surahLastAyah': { en: 'last read ayah', ar: 'آخر آية مقروءة' },

  // ————— Common actions —————
  'common.inspectSource': { en: 'Inspect source', ar: 'افحص المصدر' },
  'common.remove': { en: 'Remove', ar: 'إزالة' },
  'common.savedOn': { en: 'Saved', ar: 'حُفظ في' },
  'common.tryAgain': { en: 'Try again', ar: 'أعد المحاولة' },
  'common.copy': { en: 'Copy', ar: 'نسخ' },
  'common.explanation': { en: 'Explanation', ar: 'الشرح' },
  'common.viewSource': { en: 'View source', ar: 'المصدر' },

  // ————— Bookmarks view —————
  'bookmarks.title': { en: 'Bookmarks', ar: 'المحفوظات' },
  'bookmarks.desc': {
    en: 'Your saved verses, hadith, duas and more — kept in this anonymous session. Every saved item keeps its citation and verification status.',
    ar: 'آياتك وأحاديثك وأدعيتك المحفوظة — تُحفظ في هذه الجلسة المجهولة. كل عنصرٍ محفوظ يبقى بمرجعه وحالة توثيقه.',
  },
  'bookmarks.savedItems': { en: 'saved items', ar: 'عنصرًا محفوظًا' },
  'bookmarks.savedItem': { en: 'saved item', ar: 'عنصر محفوظ' },
  'bookmarks.all': { en: 'All', ar: 'الكل' },

  // ————— Settings —————
  'settings.title': { en: 'Settings', ar: 'الإعدادات' },
  'settings.desc': {
    en: 'Your preferences for this anonymous session. Every change saves automatically — no account needed.',
    ar: 'تفضيلاتك لهذه الجلسة المجهولة. كل تغييرٍ يُحفظ تلقائيًا — دون حسابٍ أو تسجيل.',
  },
  'settings.uiLanguage': { en: 'Interface language', ar: 'لغة الواجهة' },
  'settings.uiLanguageHint': {
    en: 'Arabic switches the whole interface to right-to-left Arabic. English keeps it as you see it now.',
    ar: 'العربية تحوّل الواجهة كاملة إلى اليمين واليسار. والإنجليزية تبقيها كما تراها الآن.',
  },
};

// ————————————————————————————————————————————————————————————————
// Hooks
// ————————————————————————————————————————————————————————————————

/**
 * Resolves the effective UI language from the session profile.
 * Falls back to English until the profile loads (first paint).
 */
export function useUiLanguage(): UiLanguage {
  const language = useApp((s) => s.profile?.language);
  if (language === 'ar') return 'ar';
  if (language === 'bilingual') return 'bilingual';
  return 'en';
}

/**
 * t('key') — translation lookup with graceful English fallback.
 * In bilingual mode returns the English label (Arabic already appears
 * across the content itself).
 */
export function useT(): (key: keyof typeof DICT | string) => string {
  const lang = useUiLanguage();
  return React.useCallback(
    (key: string) => {
      const entry = DICT[key];
      if (!entry) return key;
      return lang === 'ar' ? entry.ar : entry.en;
    },
    [lang]
  );
}

/**
 * Bilingual navigation labels: shows "Home · الرئيسية" style pairs
 * in bilingual mode (nav only — content already pairs languages).
 */
export function navLabel(key: string, lang: UiLanguage): string {
  const entry = DICT[key];
  if (!entry) return key;
  if (lang === 'ar') return entry.ar;
  if (lang === 'bilingual') return `${entry.en} · ${entry.ar}`;
  return entry.en;
}

export function isRtl(lang: UiLanguage): boolean {
  return lang === 'ar';
}

/**
 * Applies document-level direction & language for RTL Arabic mode.
 * Mount once near the app root. Also sets a data attribute that CSS
 * can use for direction-specific tweaks.
 */
export function useDocumentDirection(): 'rtl' | 'ltr' {
  const lang = useUiLanguage();
  const rtl = isRtl(lang);
  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    html.setAttribute('lang', rtl ? 'ar' : 'en');
    return () => {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
    };
  }, [rtl]);
  return rtl ? 'rtl' : 'ltr';
}
