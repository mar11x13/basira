// ============================================================================
// BASIRA prayer engine — the SINGLE authoritative calculation layer.
//
// Powered by `adhan` (Batoul Apps, MIT) — a mature, well-tested astronomical
// prayer-time library. Every consumer (home strip, salah view, settings,
// API route) MUST go through this module. No component ever computes prayer
// times on its own.
//
// Timezone contract (verified against the adhan source + empirically):
//  - adhan reads the input Date's year/month/day in the *machine-local*
//    calendar, and returns Date instants that are TRUE ABSOLUTE INSTANTS
//    (UTC frame) of each prayer event at the given coordinates.
//  - Therefore we (1) derive the location's calendar date with
//    Intl + explicit timeZone, (2) construct the input date so its
//    machine-local Y/M/D equals that date, and (3) format the returned
//    instants with an explicit locale + explicit timeZone.
//  - Result: identical wall-clock output on any machine/server timezone.
//
// Hydration contract:
//  - Nothing in this module is called during SSR rendering. The UI renders a
//    deterministic skeleton until the client PrayerProvider (post-hydration)
//    fills the store. Server initial render === client initial render.
// ============================================================================

import {
  Coordinates,
  CalculationMethod,
  PrayerTimes as AdhanPrayerTimes,
  Madhab,
  HighLatitudeRule,
  PolarCircleResolution,
  type CalculationParameters,
} from 'adhan';
import type { Profile } from '@/lib/types';

// ---------------------------------------------------------------------------
// Language-neutral prayer keys (NEVER translated strings as identifiers)
// ---------------------------------------------------------------------------

export const PRAYER_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type PrayerKey = (typeof PRAYER_KEYS)[number];

/** The five obligatory prayers (sunrise is informational only). */
export const PRAYER_SEQUENCE: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

/** Stable, hand-checked label mapping — never machine-translated at runtime. */
export const PRAYER_LABELS: Record<PrayerKey, { en: string; ar: string }> = {
  fajr: { en: 'Fajr', ar: 'الفجر' },
  sunrise: { en: 'Sunrise', ar: 'الشروق' },
  dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
  asr: { en: 'Asr', ar: 'العصر' },
  maghrib: { en: 'Maghrib', ar: 'المغرب' },
  isha: { en: 'Isha', ar: 'العشاء' },
};

export function prayerLabel(key: PrayerKey, lang: 'en' | 'ar'): string {
  return PRAYER_LABELS[key][lang];
}

// ---------------------------------------------------------------------------
// Calculation methods — every entry is genuinely implemented by adhan
// (source: adhan METHODS.md / CalculationMethod.js). Nothing invented.
// ---------------------------------------------------------------------------

export interface PrayerMethodInfo {
  key: string;
  /** adhan CalculationMethod factory */
  create: () => CalculationParameters;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
}

export const PRAYER_METHODS: PrayerMethodInfo[] = [
  {
    key: 'MWL',
    create: CalculationMethod.MuslimWorldLeague,
    name: 'Muslim World League',
    nameAr: 'رابطة العالم الإسلامي',
    description: 'Fajr 18°, Isha 17°. Widely used in Europe, the Far East and parts of the US.',
    descriptionAr: 'الفجر ١٨° والعشاء ١٧° — معتمدة في أوروبا والشرق الأقصى وأجزاء من أمريكا.',
  },
  {
    key: 'EGYPTIAN',
    create: CalculationMethod.Egyptian,
    name: 'Egyptian General Authority of Survey',
    nameAr: 'الهيئة المصرية العامة للمساحة',
    description: 'Fajr 19.5°, Isha 17.5°. Used in Africa, Syria, Lebanon and Iraq.',
    descriptionAr: 'الفجر ١٩٫٥° والعشاء ١٧٫٥° — معتمدة في أفريقيا وسوريا ولبنان والعراق.',
  },
  {
    key: 'UMM_AL_QURA',
    create: CalculationMethod.UmmAlQura,
    name: 'Umm al-Qura University, Makkah',
    nameAr: 'جامعة أم القرى، مكة المكرمة',
    description: 'Fajr 18.5°, Isha = Maghrib + 90 min. Official method in Saudi Arabia (add ~30 min for Isha during Ramadan).',
    descriptionAr: 'الفجر ١٨٫٥° والعشاء بعد المغرب بـ٩٠ دقيقة — الطريقة الرسمية في السعودية (تُضاف نحو ٣٠ دقيقة للعشاء في رمضان).',
  },
  {
    key: 'KARACHI',
    create: CalculationMethod.Karachi,
    name: 'University of Islamic Sciences, Karachi',
    nameAr: 'جامعة العلوم الإسلامية، كراتشي',
    description: 'Fajr 18°, Isha 18°. Used in Pakistan, India, Bangladesh and Afghanistan.',
    descriptionAr: 'الفجر ١٨° والعشاء ١٨° — معتمدة في باكستان والهند وبنغلاديش وأفغانستان.',
  },
  {
    key: 'ISNA',
    create: CalculationMethod.NorthAmerica,
    name: 'ISNA (North America)',
    nameAr: 'الجمعية الإسلامية لأمريكا الشمالية',
    description: 'Fajr 15°, Isha 15°. Common in the US and Canada.',
    descriptionAr: 'الفجر ١٥° والعشاء ١٥° — شائعة في الولايات المتحدة وكندا.',
  },
  {
    key: 'TEHRAN',
    create: CalculationMethod.Tehran,
    name: 'Institute of Geophysics, Univ. of Tehran',
    nameAr: 'معهد الجيوفيزياء، جامعة طهران',
    description: 'Fajr 17.7°, Maghrib 4.5°, Isha 14°. Official method in Iran.',
    descriptionAr: 'الفجر ١٧٫٧° والمغرب ٤٫٥° والعشاء ١٤° — الطريقة الرسمية في إيران.',
  },
  {
    key: 'TURKEY',
    create: CalculationMethod.Turkey,
    name: 'Diyanet (Turkey)',
    nameAr: 'الديانة التركية',
    description: 'Approximation of the Turkish Diyanet method with minute offsets for each prayer.',
    descriptionAr: 'تقريب لطريقة المؤسسة الدينية التركية مع تعديلات دقيقة لكل صلاة.',
  },
  {
    key: 'DUBAI',
    create: CalculationMethod.Dubai,
    name: 'Dubai (UAE)',
    nameAr: 'دبي، الإمارات',
    description: 'Fajr/Isha 18.2° with small offsets for sunrise, Dhuhr, Asr and Maghrib. Used in the UAE.',
    descriptionAr: 'الفجر والعشاء ١٨٫٢° مع تعديلات صغيرة للشروق والظهر والعصر والمغرب — معتمدة في الإمارات.',
  },
  {
    key: 'QATAR',
    create: CalculationMethod.Qatar,
    name: 'Qatar',
    nameAr: 'قطر',
    description: 'Fajr 18°, Isha = Maghrib + 90 min. Official method in Qatar.',
    descriptionAr: 'الفجر ١٨° والعشاء بعد المغرب بـ٩٠ دقيقة — الطريقة الرسمية في قطر.',
  },
  {
    key: 'KUWAIT',
    create: CalculationMethod.Kuwait,
    name: 'Kuwait',
    nameAr: 'الكويت',
    description: 'Fajr 18°, Isha 17.5°. Used in Kuwait.',
    descriptionAr: 'الفجر ١٨° والعشاء ١٧٫٥° — معتمدة في الكويت.',
  },
  {
    key: 'SINGAPORE',
    create: CalculationMethod.Singapore,
    name: 'Singapore / MUIS',
    nameAr: 'سنغافورة',
    description: 'Fajr 20°, Isha 18°, rounded up to the minute. Used in Singapore, Malaysia and Indonesia.',
    descriptionAr: 'الفجر ٢٠° والعشاء ١٨° مع التقريب للأعلى — معتمدة في سنغافورة وماليزيا وإندونيسيا.',
  },
  {
    key: 'MOONSIGHTING',
    create: CalculationMethod.MoonsightingCommittee,
    name: 'Moonsighting Committee Worldwide',
    nameAr: 'لجنة رؤية الهلال العالمية',
    description: 'Khalid Shaukat’s method with seasonal twilight adjustments. Recommended for North America and the UK.',
    descriptionAr: 'طريقة خالد شوق مع تعديلات موسمية للشفق — موصى بها في أمريكا الشمالية وبريطانيا.',
  },
];

/** Legacy keys stored by older BASIRA versions → current registry keys. */
const LEGACY_METHOD_ALIASES: Record<string, string> = {
  EGYPT: 'EGYPTIAN',
  MAKKAH: 'UMM_AL_QURA',
};

export function resolveMethodKey(stored: string | null | undefined): string {
  const raw = (stored ?? 'MWL').trim();
  if (LEGACY_METHOD_ALIASES[raw]) return LEGACY_METHOD_ALIASES[raw];
  return PRAYER_METHODS.some((m) => m.key === raw) ? raw : 'MWL';
}

export function getMethod(key: string): PrayerMethodInfo {
  const resolved = resolveMethodKey(key);
  return PRAYER_METHODS.find((m) => m.key === resolved) ?? PRAYER_METHODS[0];
}

// ---------------------------------------------------------------------------
// High-latitude adjustment
// ---------------------------------------------------------------------------

export const HIGH_LAT_RULES = [
  { key: 'auto', name: 'Automatic (recommended)', nameAr: 'تلقائي (موصى به)', description: 'Seventh of the night above 48° latitude, middle of the night below (the library’s recommendation).', descriptionAr: 'سبع الليل فوق خط عرض ٤٨°، ووسط الليل دونه (توصية المكتبة).' },
  { key: 'middle', name: 'Middle of the night', nameAr: 'وسط الليل', description: 'Fajr never before the middle of the night; Isha never after it.', descriptionAr: 'لا الفجر قبل منتصف الليل ولا العشاء بعده.' },
  { key: 'seventh', name: 'Seventh of the night', nameAr: 'سبع الليل', description: 'Fajr/Isha bounded by the first/last seventh of the night.', descriptionAr: 'يُحدّ الفجر والعشاء بأول وآخر سبع من الليل.' },
  { key: 'twilight', name: 'Twilight angle', nameAr: 'زاوية الشفق', description: 'The night is divided into thirds based on the Fajr/Isha angles.', descriptionAr: 'يُقسّم الليل إلى أثلاث بناءً على زاويتي الفجر والعشاء.' },
] as const;

export type HighLatRuleKey = (typeof HIGH_LAT_RULES)[number]['key'];

export function resolveHighLatRule(key: string | null | undefined, lat: number): HighLatitudeRule {
  switch (key) {
    case 'middle':
      return HighLatitudeRule.MiddleOfTheNight;
    case 'seventh':
      return HighLatitudeRule.SeventhOfTheNight;
    case 'twilight':
      return HighLatitudeRule.TwilightAngle;
    default:
      // 'auto' — the library's own recommendation for these coordinates
      // (verified in the adhan source: SeventhOfTheNight above 48° latitude,
      // MiddleOfTheNight otherwise)
      return HighLatitudeRule.recommended(new Coordinates(lat, 0));
  }
}

// ---------------------------------------------------------------------------
// Core data shapes (the conceptual architecture required by the spec)
// ---------------------------------------------------------------------------

export interface PrayerLocation {
  latitude: number;
  longitude: number;
  /** IANA timezone of the prayer location, e.g. "Asia/Qatar" */
  timezone: string;
  city: string | null;
  country: string | null;
  /** true when no explicit location was chosen and we fell back to the default */
  isDefault: boolean;
}

export interface PrayerCalculationSettings {
  methodKey: string;
  asrJuristic: 'standard' | 'hanafi';
  highLatRule: HighLatRuleKey;
  timeFormat: '12h' | '24h';
}

export interface PrayerTimesResult {
  /** Absolute instants (UTC frame) for one calendar day at the location. */
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export interface NextPrayer {
  key: PrayerKey;
  instant: Date;
  tomorrow: boolean;
}

export interface PrayerSnapshot {
  location: PrayerLocation;
  settings: PrayerCalculationSettings;
  /** YYYY-MM-DD — the calendar date these times belong to, in the location's timezone */
  dateKey: string;
  times: PrayerTimesResult;
  /** Fajr instant of the following day (for after-Isha "tomorrow" handling) */
  tomorrowFajr: Date;
}

// ---------------------------------------------------------------------------
// Default location (deterministic — never the device's location)
// ---------------------------------------------------------------------------

export const DEFAULT_PRAYER_LOCATION: PrayerLocation = {
  latitude: 21.4225,
  longitude: 39.8262,
  timezone: 'Asia/Riyadh',
  city: 'Makkah al-Mukarramah',
  country: 'Saudi Arabia',
  isDefault: true,
};

// ---------------------------------------------------------------------------
// Timezone utilities
// ---------------------------------------------------------------------------

const FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

function getCachedFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let f = FORMATTER_CACHE.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options);
    FORMATTER_CACHE.set(key, f);
  }
  return f;
}

/** The location's current calendar date, derived with an explicit timezone. */
export function zonedDateKey(timezone: string, instant: Date): { year: number; month: number; day: number; key: string } {
  const parts = getCachedFormatter('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(instant)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value;
      return acc;
    }, {});
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  return { year, month, day, key: `${parts.year}-${parts.month}-${parts.day}` };
}

export function isValidTimezone(tz: string): boolean {
  if (!tz || !/^[A-Za-z0-9/_+\-]+$/.test(tz)) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Build a Date whose machine-local Y/M/D equals the given calendar date.
 * Noon keeps it safely inside the day across DST transitions.
 */
function machineLocalDateFor(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

// ---------------------------------------------------------------------------
// The ONE calculation entry point
// ---------------------------------------------------------------------------

/** The authoritative daily computation (throws on invalid input — never fabricates). */
export function computePrayerDay(
  location: PrayerLocation,
  settings: PrayerCalculationSettings,
  dateKey: string,
): PrayerTimesResult {
  if (!isValidTimezone(location.timezone)) {
    throw new Error(`Invalid timezone: ${location.timezone}`);
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) throw new Error(`Invalid date key: ${dateKey}`);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const params = getMethod(settings.methodKey).create();
  params.madhab = settings.asrJuristic === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  params.highLatitudeRule = resolveHighLatRule(settings.highLatRule, location.latitude);
  // Honest polar-circle strategy: use the closest day with computable
  // sunrise/sunset (adhan's AqrabYaum) instead of returning nothing.
  params.polarCircleResolution = PolarCircleResolution.AqrabYaum;

  const coordinates = new Coordinates(location.latitude, location.longitude);
  const adhanTimes = new AdhanPrayerTimes(coordinates, machineLocalDateFor(year, month, day), params);

  const times: PrayerTimesResult = {
    fajr: adhanTimes.fajr,
    sunrise: adhanTimes.sunrise,
    dhuhr: adhanTimes.dhuhr,
    asr: adhanTimes.asr,
    maghrib: adhanTimes.maghrib,
    isha: adhanTimes.isha,
  };
  for (const t of Object.values(times)) {
    if (!t || Number.isNaN(t.getTime())) {
      throw new Error('Prayer times could not be computed for this location and date.');
    }
  }
  return times;
}

/** Full snapshot: today's times + tomorrow's Fajr + everything needed downstream. */
export function computePrayerSnapshot(
  location: PrayerLocation,
  settings: PrayerCalculationSettings,
  now: Date,
): PrayerSnapshot {
  const { year, month, day, key } = zonedDateKey(location.timezone, now);
  const times = computePrayerDay(location, settings, key);

  // Next calendar day (rollover handled by machine-local construction)
  const next = machineLocalDateFor(year, month, day + 1);
  const nextKey = zonedDateKey(location.timezone, next).key;
  const tomorrowTimes = computePrayerDay(location, settings, nextKey);

  return {
    location,
    settings,
    dateKey: key,
    times,
    tomorrowFajr: tomorrowTimes.fajr,
  };
}

// ---------------------------------------------------------------------------
// Next / current prayer derivation (pure, instant-based — no string parsing)
// ---------------------------------------------------------------------------

export function deriveNextPrayer(snapshot: PrayerSnapshot, now: Date): NextPrayer | null {
  for (const key of PRAYER_SEQUENCE) {
    const t = snapshot.times[key];
    if (t && now.getTime() < t.getTime()) {
      return { key, instant: t, tomorrow: false };
  }
  }
  const tf = snapshot.tomorrowFajr;
  if (tf && Number.isFinite(tf.getTime())) {
    return { key: 'fajr', instant: tf, tomorrow: true };
  }
  return null;
}

/** The prayer whose window contains `now` (null before Fajr). */
export function deriveCurrentPrayer(snapshot: PrayerSnapshot, now: Date): PrayerKey | null {
  let current: PrayerKey | null = null;
  for (const key of PRAYER_SEQUENCE) {
    const t = snapshot.times[key];
    if (t && now.getTime() >= t.getTime()) current = key;
  }
  return current;
}

// ---------------------------------------------------------------------------
// Formatting — explicit locale + explicit timezone, ALWAYS
// ---------------------------------------------------------------------------

export type UiLang = 'en' | 'ar';

function formatterLocale(lang: UiLang): string {
  // Latin digits on purpose: consistent with the rest of BASIRA's Arabic UI.
  return lang === 'ar' ? 'ar-u-nu-latn' : 'en';
}

/** Format a prayer instant in the location's timezone. */
export function formatPrayerTime(instant: Date, timezone: string, lang: UiLang, hour12: boolean): string {
  return getCachedFormatter(formatterLocale(lang), {
    timeZone: timezone,
    hour: hour12 ? 'numeric' : '2-digit',
    minute: '2-digit',
    hour12,
  }).format(instant);
}

/** Countdown label like "1h 42m" / "42m" / "now" — minute precision. */
export function countdownLabel(msRemaining: number, lang: UiLang): string {
  const totalMinutes = Math.max(0, Math.round(msRemaining / 60_000));
  if (totalMinutes <= 0) return lang === 'ar' ? 'الآن' : 'now';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (lang === 'ar') {
    if (h > 0) return m > 0 ? `${h} س ${m} د` : `${h} س`;
    return `${m} د`;
  }
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

// ---------------------------------------------------------------------------
// Profile → location/settings resolution (deterministic given the inputs)
// ---------------------------------------------------------------------------

export function resolvePrayerLocation(profile: Profile | null, deviceTimezone: string | null): PrayerLocation {
  if (profile && profile.locationLat != null && profile.locationLng != null) {
    // Saved coordinates. Timezone: the stored one if valid; otherwise the
    // device's (honest fallback for pre-migration geolocated profiles — the
    // device zone matches physical presence when coords came from GPS).
    const storedTz = profile.locationTimezone;
    const tz = isValidTimezone(storedTz ?? '') ? (storedTz as string) : isValidTimezone(deviceTimezone ?? '') ? (deviceTimezone as string) : 'UTC';
    return {
      latitude: profile.locationLat,
      longitude: profile.locationLng,
      timezone: tz,
      city: profile.locationName ?? null,
      country: null,
      isDefault: false,
    };
  }
  return DEFAULT_PRAYER_LOCATION;
}

export function resolvePrayerSettings(profile: Profile | null): PrayerCalculationSettings {
  const p = (profile ?? {}) as Partial<Profile>;
  return {
    methodKey: resolveMethodKey(p.prayerMethod ?? 'MWL'),
    asrJuristic: p.asrFactor === 2 ? 'hanafi' : 'standard',
    highLatRule: ((): HighLatRuleKey => {
      const key = p.highLatRule;
      return HIGH_LAT_RULES.some((r) => r.key === key) ? (key as HighLatRuleKey) : 'auto';
    })(),
    timeFormat: p.timeFormat === '24h' ? '24h' : '12h',
  };
}

/** Honest notes rendered beneath the times. */
export const MOSQUE_COMPARISON_NOTE =
  'Astronomical calculations can differ from your local mosque timetable — mosques may use different methods, angles or manual adjustments. Confirm with your local mosque when in doubt.';
export const MOSQUE_COMPARISON_NOTE_AR =
  'قد تختلف الحسابات الفلكية عن جدول مسجدك المحلي — فقد يستخدم المسجد طريقة أو زوايا مختلفة أو تعديلات يدوية. عند الشك راجع مسجدك.';
export const HIGH_LATITUDE_NOTE =
  'At high latitudes, Fajr and Isha are adjusted using the selected high-latitude rule, and polar-circle days use the closest day with computable sunrise/sunset (Aqrab Yaum).';
export const HIGH_LATITUDE_NOTE_AR =
  'في خطوط العرض العالية يُضبط الفجر والعشاء وفق قاعدة خطوط العرض المختارة، وتُحسب أيام الدائرة القطبية بأقرب يوم يمكن فيه حساب الشروق والغروب (أقرب يوم).';
