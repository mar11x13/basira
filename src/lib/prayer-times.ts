// ============================================================================
// BASIRA prayer times — isomorphic astronomical calculation (PrayTimes-style).
// Works server-side and client-side (offline-friendly). No external API needed.
// ============================================================================

export interface PrayerMethodConfig {
  key: string;
  name: string;
  fajrAngle: number;
  ishaAngle?: number;
  ishaIntervalMinutes?: number; // used by Umm al-Qura
  description: string;
}

export const PRAYER_METHODS: PrayerMethodConfig[] = [
  {
    key: 'MWL',
    name: 'Muslim World League',
    fajrAngle: 18,
    ishaAngle: 17,
    description: 'Fajr 18°, Isha 17°. Widely used in Europe, Far East, parts of US.',
  },
  {
    key: 'ISNA',
    name: 'Islamic Society of North America',
    fajrAngle: 15,
    ishaAngle: 15,
    description: 'Fajr 15°, Isha 15°. Commonly used in North America.',
  },
  {
    key: 'EGYPT',
    name: 'Egyptian General Authority',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    description: 'Fajr 19.5°, Isha 17.5°. Used in Africa, Syria, Lebanon.',
  },
  {
    key: 'MAKKAH',
    name: 'Umm al-Qura, Makkah',
    fajrAngle: 18.5,
    ishaIntervalMinutes: 90,
    description: 'Fajr 18.5°, Isha = Maghrib + 90 min. Used in Saudi Arabia.',
  },
  {
    key: 'KARACHI',
    name: 'University of Islamic Sciences, Karachi',
    fajrAngle: 18,
    ishaAngle: 18,
    description: 'Fajr 18°, Isha 18°. Used in Pakistan, India, Bangladesh, Afghanistan.',
  },
];

export function getMethod(key: string): PrayerMethodConfig {
  return PRAYER_METHODS.find((m) => m.key === key) ?? PRAYER_METHODS[0];
}

// ---------- degree-based trig helpers ----------
const dsin = (d: number) => Math.sin((d * Math.PI) / 180);
const dcos = (d: number) => Math.cos((d * Math.PI) / 180);
const dtan = (d: number) => Math.tan((d * Math.PI) / 180);
const darcsin = (x: number) => (Math.asin(x) * 180) / Math.PI;
const darccos = (x: number) => (Math.acos(x) * 180) / Math.PI;
const darctan2 = (y: number, x: number) => (Math.atan2(y, x) * 180) / Math.PI;
const darccot = (x: number) => (Math.atan(1 / x) * 180) / Math.PI;
const fixAngle = (a: number) => ((a % 360) + 360) % 360;
const fixHour = (h: number) => ((h % 24) + 24) % 24;

/** Julian date for a Gregorian date at 0h UT. */
export function julian(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

function sunPosition(jd: number): { declination: number; equation: number } {
  const d = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * d);
  const q = fixAngle(280.459 + 0.98564736 * d);
  const l = fixAngle(q + 1.915 * dsin(g) + 0.02 * dsin(2 * g));
  const e = 23.439 - 0.00000036 * d;
  const ra = fixHour(darctan2(dcos(e) * dsin(l), dcos(l)) / 15);
  const decl = darcsin(dsin(e) * dsin(l));
  const eqt = q / 15 - ra;
  return { declination: decl, equation: eqt };
}

export interface ComputedTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface ComputeOptions {
  date?: Date; // defaults to today
  lat: number;
  lng: number;
  timezoneOffsetMinutes: number; // e.g. new Date().getTimezoneOffset() (JS-style, UTC−local)
  method: string; // method key
  asrFactor?: 1 | 2; // 1 = Shafi'i/Maliki/Hanbali (shadow=1), 2 = Hanafi (shadow=2)
}

function fmtTime(hoursFloat: string | number): string {
  const h = typeof hoursFloat === 'number' ? hoursFloat : parseFloat(hoursFloat);
  if (!isFinite(h)) return '—';
  const totalMinutes = Math.round(h * 60);
  let hh = Math.floor(((totalMinutes / 60) % 24 + 24) % 24);
  const mm = ((totalMinutes % 60) + 60) % 60;
  const ampm = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 === 0 ? 12 : hh % 12;
  return `${hh}:${String(mm).padStart(2, '0')} ${ampm}`;
}

/** Raw hours (local clock hours as float). */
function computeRaw(opts: ComputeOptions) {
  const date = opts.date ?? new Date();
  const tzHours = -opts.timezoneOffsetMinutes / 60;
  const jDate = julian(date.getFullYear(), date.getMonth() + 1, date.getDate()) - opts.lng / (15 * 24);

  const midDay = (t: number) => fixHour(12 - sunPosition(jDate + t).equation);

  const sunAngleTime = (angle: number, t: number, ccw = false) => {
    const decl = sunPosition(jDate + t).declination;
    const inner = (-dsin(angle) - dsin(decl) * dsin(opts.lat)) / (dcos(decl) * dcos(opts.lat));
    if (inner < -1 || inner > 1) return NaN;
    const h = darccos(inner) / 15;
    return midDay(t) + (ccw ? -h : h);
  };

  const asrTime = (factor: number, t: number) => {
    const decl = sunPosition(jDate + t).declination;
    const angle = -darccot(factor + dtan(Math.abs(opts.lat - decl)));
    return sunAngleTime(angle, t);
  };

  const method = getMethod(opts.method);
  const asrFactor = opts.asrFactor === 2 ? 2 : 1;

  // iterate for accuracy
  let fajr = sunAngleTime(method.fajrAngle, 5 / 24, true);
  let sunrise = sunAngleTime(0.833, 6 / 24, true);
  let dhuhr = midDay(12 / 24);
  let asr = asrTime(asrFactor, 13 / 24);
  let maghrib = sunAngleTime(0.833, 18 / 24);
  let isha: number;
  if (method.ishaIntervalMinutes) {
    isha = maghrib + method.ishaIntervalMinutes / 60;
  } else {
    isha = sunAngleTime(method.ishaAngle ?? 17, 18 / 24);
  }

  for (let i = 0; i < 2; i++) {
    fajr = sunAngleTime(method.fajrAngle, fajr / 24, true);
    sunrise = sunAngleTime(0.833, sunrise / 24, true);
    dhuhr = midDay(dhuhr / 24);
    asr = asrTime(asrFactor, asr / 24);
    maghrib = sunAngleTime(0.833, maghrib / 24);
    isha = method.ishaIntervalMinutes
      ? maghrib + method.ishaIntervalMinutes / 60
      : sunAngleTime(method.ishaAngle ?? 17, isha / 24);
  }

  const toLocal = (h: number) => h + tzHours - opts.lng / 15;
  return {
    fajr: toLocal(fajr),
    sunrise: toLocal(sunrise),
    dhuhr: toLocal(dhuhr) + 1 / 60, // small safety margin after zenith
    asr: toLocal(asr),
    maghrib: toLocal(maghrib),
    isha: toLocal(isha),
  };
}

export function computePrayerTimes(opts: ComputeOptions): ComputedTimes {
  const raw = computeRaw(opts);
  return {
    fajr: fmtTime(raw.fajr),
    sunrise: fmtTime(raw.sunrise),
    dhuhr: fmtTime(raw.dhuhr),
    asr: fmtTime(raw.asr),
    maghrib: fmtTime(raw.maghrib),
    isha: fmtTime(raw.isha),
  };
}

// ---------- next prayer helper (client-side friendly) ----------

export const PRAYER_ORDER: (keyof ComputedTimes)[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_LABELS: Record<string, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};
export function prayerLabel(key: string): string {
  return PRAYER_LABELS[key] ?? key;
}

function parseTimeToMinutes(t: string): number | null {
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

/** Which prayer is next, given times and "now". Sunrise is informational. */
export function nextPrayer(times: ComputedTimes, now: Date) {
  const entries = (['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const)
    .map((k) => ({ key: k, minutes: parseTimeToMinutes(times[k]) }))
    .filter((e): e is { key: string; minutes: number } => e.minutes != null)
    .sort((a, b) => a.minutes - b.minutes);
  if (!entries.length) return null;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (const e of entries) {
    if (e.minutes > nowMinutes) {
      return {
        name: PRAYER_LABELS[e.key],
        key: e.key,
        time: times[e.key as keyof ComputedTimes],
        minutesUntil: e.minutes - nowMinutes,
      };
    }
  }
  // after Isha → next is tomorrow's Fajr
  const fajr = entries[0];
  return {
    name: 'Fajr',
    key: 'fajr',
    time: times.fajr,
    minutesUntil: 24 * 60 - nowMinutes + fajr.minutes,
    tomorrow: true,
  };
}

export function minutesUntilLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
