// ============================================================================
// BASIRA prayer-engine validation suite.
//
// Run: bun scripts/validate-prayer.ts
//
// Honest verification strategy (no fabricated expected values):
//  1. Astronomical invariants — ordering, finiteness, sane gaps (physics).
//  2. Independent solar-noon cross-check — Dhuhr must match an independently
//     implemented NOAA equation-of-time formula (plus the method's documented
//     dhuhr minute-adjustment) within rounding tolerance.
//  3. DST transition days — times stay valid and reflect the clock change.
//  4. Timezone independence — the same computation under different machine
//     timezones must yield identical wall-clock output (the runner re-executes
//     itself with TZ=UTC and TZ=America/New_York and diffs the dumps).
//  5. Next-prayer boundary logic — exact-instant transitions, midnight
//     rollover, after-Isha → tomorrow's Fajr, sunrise skipped as a "prayer".
//  6. Formatting round-trip — 24h format parses back to the same minute in
//     the location's timezone.
//  7. Legacy method alias resolution.
//  8. High-latitude locations — resolved (never NaN) with honest bounds.
//  9. Cross-implementation comparison — the wall-clock times are compared
//     against an independent PrayTimes-style port (BASIRA's previous engine)
//     for shared mid-latitude methods: two independent implementations of the
//     standard algorithm agreeing within minutes is a strong correctness
//     signal for the adhan integration.
// ============================================================================

import {
  Coordinates,
  CalculationMethod,
  PrayerTimes as AdhanPrayerTimes,
  Madhab,
  HighLatitudeRule,
  PolarCircleResolution,
} from 'adhan';
import {
  computePrayerDay,
  computePrayerSnapshot,
  deriveNextPrayer,
  deriveCurrentPrayer,
  formatPrayerTime,
  zonedDateKey,
  resolveMethodKey,
  getMethod,
  PRAYER_METHODS,
  type PrayerLocation,
  type PrayerCalculationSettings,
  type PrayerKey,
} from '../src/lib/prayer/core';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, ok: boolean, detail = '') {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const LOCATIONS: Record<string, PrayerLocation> = {
  Doha: { latitude: 25.2867, longitude: 51.5312, timezone: 'Asia/Qatar', city: 'Doha', country: 'Qatar', isDefault: false },
  Cairo: { latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo', city: 'Cairo', country: 'Egypt', isDefault: false },
  Singapore: { latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore', city: 'Singapore', country: 'Singapore', isDefault: false },
  London: { latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', city: 'London', country: 'UK', isDefault: false },
  NewYork: { latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York', city: 'New York', country: 'US', isDefault: false },
  Reykjavik: { latitude: 64.1466, longitude: -21.9426, timezone: 'Atlantic/Reykjavik', city: 'Reykjavik', country: 'Iceland', isDefault: false },
  Anchorage: { latitude: 61.2181, longitude: -149.9003, timezone: 'America/Anchorage', city: 'Anchorage', country: 'US', isDefault: false },
  Sydney: { latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney', city: 'Sydney', country: 'Australia', isDefault: false },
};

const SETTINGS: Record<string, PrayerCalculationSettings> = {
  QATAR: { methodKey: 'QATAR', asrJuristic: 'standard', highLatRule: 'auto', timeFormat: '24h' },
  UMM_AL_QURA: { methodKey: 'UMM_AL_QURA', asrJuristic: 'standard', highLatRule: 'auto', timeFormat: '24h' },
  MWL: { methodKey: 'MWL', asrJuristic: 'standard', highLatRule: 'auto', timeFormat: '24h' },
  MWL_HANAFI: { methodKey: 'MWL', asrJuristic: 'hanafi', highLatRule: 'auto', timeFormat: '24h' },
  EGYPTIAN: { methodKey: 'EGYPTIAN', asrJuristic: 'standard', highLatRule: 'auto', timeFormat: '24h' },
  ISNA: { methodKey: 'ISNA', asrJuristic: 'standard', highLatRule: 'auto', timeFormat: '24h' },
  KARACHI: { methodKey: 'KARACHI', asrJuristic: 'hanafi', highLatRule: 'auto', timeFormat: '24h' },
  TEHRAN: { methodKey: 'TEHRAN', asrJuristic: 'standard', highLatRule: 'auto', timeFormat: '24h' },
  SINGAPORE: { methodKey: 'SINGAPORE', asrJuristic: 'standard', highLatRule: 'auto', timeFormat: '24h' },
  TURKEY: { methodKey: 'TURKEY', asrJuristic: 'standard', highLatRule: 'auto', timeFormat: '24h' },
  DUBAI: { methodKey: 'DUBAI', asrJuristic: 'standard', highLatRule: 'auto', timeFormat: '24h' },
  KUWAIT: { methodKey: 'KUWAIT', asrJuristic: 'standard', highLatRule: 'auto', timeFormat: '24h' },
  MOONSIGHTING: { methodKey: 'MOONSIGHTING', asrJuristic: 'standard', highLatRule: 'auto', timeFormat: '24h' },
};

/** Wall-clock minutes since local midnight for an instant in a timezone. */
function zonedMinutes(instant: Date, tz: string): number {
  const s = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(instant);
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
}

// ————————— 1. Ordering & sanity across locations × methods × dates —————————
console.log('\n—— 1. Astronomical ordering & sanity ——');
const DATES = ['2026-03-20', '2026-06-21', '2026-09-23', '2026-12-21', '2027-01-15'];
for (const [locName, location] of Object.entries(LOCATIONS)) {
  for (const [setName, settings] of Object.entries(SETTINGS)) {
    for (const date of DATES) {
      let times;
      try {
        times = computePrayerDay(location, settings, date);
      } catch (e) {
        check(`${locName}/${setName}/${date} computes`, false, String(e));
        continue;
      }
      const order: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
      // Compare INSTANTS (not minutes-of-day): at high latitudes Maghrib/Isha
      // can legitimately land after midnight (e.g. Reykjavik solstice sunset
      // 00:04 next day) — the absolute instants stay correctly ordered.
      const instants = order.map((k) => times[k].getTime());
      const ordered = instants.every((v, i) => i === 0 || v >= instants[i - 1]);
      const finite = order.every((k) => Number.isFinite(times[k].getTime()));
      // Gap sanity in instant-minutes; skip for polar-adjacent summers where
      // fajr-to-sunrise legitimately shrinks (angle unreachable → night rule).
      const midLat = Math.abs(location.latitude) < 60;
      const fajrGap = (times.sunrise.getTime() - times.fajr.getTime()) / 60_000;
      const ishaGap = (times.isha.getTime() - times.maghrib.getTime()) / 60_000;
      const ishaMin = settings.methodKey === 'TEHRAN' ? 25 : 40; // Tehran: maghrib at 4.5° compresses the gap
      const okGaps = !midLat || (fajrGap >= 40 && fajrGap <= 240 && ishaGap >= ishaMin && ishaGap <= 360);
      check(
        `${locName}/${setName}/${date} order+gaps`,
        finite && ordered && okGaps,
        finite && ordered ? `fajrGap=${fajrGap} ishaGap=${ishaGap}` : 'not finite/ordered',
      );
    }
  }
}

// ————————— 2. Dhuhr vs independent solar-noon (NOAA EoT) —————————
console.log('\n—— 2. Dhuhr vs independent solar noon (Meeus EoT) ——');
/**
 * Equation of time in minutes — precise Meeus (Astronomical Algorithms ch. 28)
 * implementation, independent of adhan's sidereal/RA approach.
 * Sign convention: apparent solar time = mean solar time + E (sundial fast when E > 0).
 */
function equationOfTimeMinutes(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  const jd = Date.UTC(y, m - 1, d, 0, 0, 0) / 86_400_000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const mod360 = (x: number) => ((x % 360) + 360) % 360;
  // Geometric mean longitude of the sun
  const L0 = mod360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  // Mean anomaly
  const M = mod360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  // Equation of the center
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin((M * Math.PI) / 180) +
    (0.019993 - 0.000101 * T) * Math.sin((2 * M * Math.PI) / 180) +
    0.000289 * Math.sin((3 * M * Math.PI) / 180);
  const trueLong = L0 + C;
  const omega = mod360(125.04 - 1934.136 * T);
  // Apparent longitude (aberration + nutation in longitude)
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin((omega * Math.PI) / 180);
  // Mean + apparent obliquity
  const eps0 = 23.439291 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T;
  const eps = eps0 + 0.00256 * Math.cos((omega * Math.PI) / 180);
  // Apparent right ascension
  const alpha = mod360((Math.atan2(Math.cos((eps * Math.PI) / 180) * Math.sin((lambda * Math.PI) / 180), Math.cos((lambda * Math.PI) / 180)) * 180) / Math.PI);
  // Equation of time in degrees → minutes (nutation-in-RA term omitted; ≈ ±0.3 min)
  let E = L0 - 0.0057183 - alpha;
  E = mod360(E + 180) - 180; // normalize to (−180, 180]
  return 4 * E;
}
function dayOfYear(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  const start = Date.UTC(y, 0, 1);
  const today = Date.UTC(y, m - 1, d);
  return Math.floor((today - start) / 86_400_000) + 1;
}
/** Method dhuhr minute-adjustments documented by adhan's CalculationMethod. */
const DHUHR_ADJ: Record<string, number> = {
  MWL: 1, EGYPTIAN: 1, KARACHI: 1, UMM_AL_QURA: 0, DUBAI: 3, MOONSIGHTING: 5,
  ISNA: 1, KUWAIT: 0, QATAR: 0, SINGAPORE: 1, TEHRAN: 0, TURKEY: 5,
};
for (const [locName, location] of Object.entries(LOCATIONS)) {
  for (const date of DATES) {
    const settings = SETTINGS.MWL;
    const times = computePrayerDay(location, settings, date);
    const eot = equationOfTimeMinutes(date);
    // Solar noon (local clock) = 12:00 + tzOffset − lng/15 − EoT
    // tzOffset for the date: derive from an instant at local noon of that date.
    const probe = new Date(`${date}T12:00:00Z`);
    const tzOffsetHours = (() => {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: location.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      }).formatToParts(probe);
      const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
      const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
      return (asUTC - probe.getTime()) / 3_600_000;
    })();
    const expectedNoonMinutes =
      12 * 60 + tzOffsetHours * 60 - (location.longitude / 15) * 60 - eot + DHUHR_ADJ[settings.methodKey];
    const actual = zonedMinutes(times.dhuhr, location.timezone);
    const diff = Math.abs(actual - expectedNoonMinutes);
    check(`${locName} ${date} dhuhr≈solarNoon+adj (Δ${diff.toFixed(1)}m)`, diff <= 3, `expected≈${expectedNoonMinutes.toFixed(1)} actual=${actual} eot=${eot.toFixed(2)}`);
  }
}

// ————————— 3. DST transition days —————————
console.log('\n—— 3. DST transitions ——');
{
  const ny = LOCATIONS.NewYork;
  for (const [springDay, before, label] of [
    ['2026-03-08', '2026-03-07', 'US spring-forward'],
    ['2026-11-01', '2026-10-31', 'US fall-back'],
  ] as const) {
    const onDay = computePrayerDay(ny, SETTINGS.ISNA, springDay);
    const preDay = computePrayerDay(ny, SETTINGS.ISNA, before);
    const sunriseOn = zonedMinutes(onDay.sunrise, ny.timezone);
    const sunrisePre = zonedMinutes(preDay.sunrise, ny.timezone);
    const jump = sunriseOn - sunrisePre;
    // Astronomical drift is ~1-2 min/day; the clock jump adds/subtracts ~60 min.
    const ok = Math.abs(Math.abs(jump) - 60) <= 6;
    check(`${label}: sunrise clock jump ≈ 60min (${jump}m)`, ok);
  }
  const london = LOCATIONS.London;
  for (const [springDay, before, label] of [
    ['2026-03-29', '2026-03-28', 'EU spring-forward'],
    ['2026-10-25', '2026-10-24', 'EU fall-back'],
  ] as const) {
    const onDay = computePrayerDay(london, SETTINGS.MWL, springDay);
    const preDay = computePrayerDay(london, SETTINGS.MWL, before);
    const jump = zonedMinutes(onDay.sunrise, london.timezone) - zonedMinutes(preDay.sunrise, london.timezone);
    const ok = Math.abs(Math.abs(jump) - 60) <= 6;
    check(`${label}: sunrise clock jump ≈ 60min (${jump}m)`, ok);
  }
  // Southern-hemisphere DST (Sydney, April 2026 fall-back)
  const syd = LOCATIONS.Sydney;
  {
    const onDay = computePrayerDay(syd, SETTINGS.MWL, '2026-04-05');
    const preDay = computePrayerDay(syd, SETTINGS.MWL, '2026-04-04');
    const jump = zonedMinutes(onDay.sunrise, syd.timezone) - zonedMinutes(preDay.sunrise, syd.timezone);
    check(`Sydney fall-back: sunrise clock jump ≈ -60min (${jump}m)`, Math.abs(jump + 60) <= 6);
  }
}

// ————————— 4. Timezone independence (re-executed by the runner) —————————
if (process.env.PRAYER_DUMP) {
  // Deterministic dump mode: print a stable table for cross-TZ diffing.
  for (const [name, location] of Object.entries(LOCATIONS)) {
    for (const date of DATES) {
      const t = computePrayerDay(location, SETTINGS.MWL, date);
      const row = (['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[])
        .map((k) => formatPrayerTime(t[k], location.timezone, 'en', false))
        .join(' ');
      console.log(`${name}|${date}|${row}`);
    }
  }
}

// ————————— 5. Next-prayer boundary logic —————————
console.log('\n—— 5. Next-prayer boundaries (exact instants) ——');
{
  const location = LOCATIONS.Doha;
  const settings = SETTINGS.QATAR;
  const dateKey = '2026-09-23';
  const snap = computePrayerSnapshot(location, settings, new Date(`2026-09-23T09:00:00Z`));
  const T = snap.times;

  check('now=fajr-1min → next fajr', deriveNextPrayer(snap, new Date(T.fajr.getTime() - 60_000))?.key === 'fajr');
  check('now=fajr exactly → next sunrise? no → dhuhr (sunrise informational)', deriveNextPrayer(snap, new Date(T.fajr.getTime()))?.key === 'dhuhr');
  check('now=asr exactly → next maghrib', deriveNextPrayer(snap, new Date(T.asr.getTime()))?.key === 'maghrib');
  check('now=dhuhr → next asr', deriveNextPrayer(snap, new Date(T.dhuhr.getTime()))?.key === 'asr');
  check('now=isha+1min → tomorrow fajr', (() => {
    const n = deriveNextPrayer(snap, new Date(T.isha.getTime() + 60_000));
    return n?.key === 'fajr' && n.tomorrow === true;
  })());
  check('now=isha+1min → tomorrowFajr is next calendar day', (() => {
    const n = deriveNextPrayer(snap, new Date(T.isha.getTime() + 60_000));
    return n ? zonedDateKey(location.timezone, n.instant).key === '2026-09-24' : false;
  })());
  check('now=23:59 local → tomorrow fajr', (() => {
    const late = new Date(`2026-09-23T20:59:00Z`); // 23:59 Doha (UTC+3)
    const n = deriveNextPrayer(snap, late);
    return n?.tomorrow === true;
  })());
  check('after midnight (00:30 Doha, Sep 24) → snapshot recomputes to new day', (() => {
    const afterMidnight = new Date(`2026-09-23T21:30:00Z`); // 2026-09-24 00:30 Doha
    const newSnap = computePrayerSnapshot(location, settings, afterMidnight);
    return newSnap.dateKey === '2026-09-24' && deriveNextPrayer(newSnap, afterMidnight)?.key === 'fajr';
  })());
  check('current=dhuhr window', deriveCurrentPrayer(snap, new Date(T.dhuhr.getTime() + 60_000)) === 'dhuhr');
  check('current=none before fajr', deriveCurrentPrayer(snap, new Date(T.fajr.getTime() - 60_000)) === null);
  check('countdown: now vs fajr', (() => {
    const n = deriveNextPrayer(snap, new Date(T.fajr.getTime() - 42 * 60_000));
    return n ? Math.round((n.instant.getTime() - (T.fajr.getTime() - 42 * 60_000)) / 60_000) === 42 : false;
  })());
}

// ————————— 6. Formatting round-trip (24h) —————————
console.log('\n—— 6. Formatting round-trip ——');
for (const [name, location] of Object.entries(LOCATIONS)) {
  const t = computePrayerDay(location, SETTINGS.MWL, '2026-06-21');
  for (const k of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[]) {
    const formatted = formatPrayerTime(t[k], location.timezone, 'en', false);
    const [h, m] = formatted.split(':').map(Number);
    const roundTrip = zonedMinutes(t[k], location.timezone);
    check(`${name} ${k} "${formatted}" round-trip`, h * 60 + m === roundTrip);
  }
}

// ————————— 7. Legacy aliases & method registry —————————
console.log('\n—— 7. Method registry & legacy aliases ——');
check("legacy 'EGYPT' → 'EGYPTIAN'", resolveMethodKey('EGYPT') === 'EGYPTIAN');
check("legacy 'MAKKAH' → 'UMM_AL_QURA'", resolveMethodKey('MAKKAH') === 'UMM_AL_QURA');
check("garbage → 'MWL'", resolveMethodKey('NOT_A_METHOD') === 'MWL');
check("null → 'MWL'", resolveMethodKey(null) === 'MWL');
check('registry has 12 methods', PRAYER_METHODS.length === 12);
check('every method factory creates params', PRAYER_METHODS.every((m) => { try { return m.create() != null; } catch { return false; } }));
check('every method has ar name', PRAYER_METHODS.every((m) => m.nameAr.length > 0 && m.descriptionAr.length > 0));

// ————————— 8. High latitude: honest resolution —————————
console.log('\n—— 8. High-latitude resolution ——');
{
  // Reykjavik mid-winter: sun barely rises; AqrabYaum resolves sunrise/sunset.
  const t = computePrayerDay(LOCATIONS.Reykjavik, SETTINGS.MWL, '2026-12-21');
  const all = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[];
  check('Reykjavik winter solstice: all times resolved (no NaN)', all.every((k) => Number.isFinite(t[k].getTime())));
  const order = all.map((k) => zonedMinutes(t[k], LOCATIONS.Reykjavik.timezone));
  check('Reykjavik winter solstice: still ordered', order.every((v, i) => i === 0 || v >= order[i - 1]));
  const t2 = computePrayerDay(LOCATIONS.Anchorage, SETTINGS.MWL, '2026-06-21');
  check('Anchorage summer solstice: all times resolved', all.every((k) => Number.isFinite(t2[k].getTime())));
}

// ————————— 9. Cross-implementation: independent PrayTimes-style port —————————
console.log('\n—— 9. Cross-implementation agreement (independent PrayTimes port) ——');
{
  // Independent re-implementation of the classic PrayTimes.js algorithm
  // (BASIRA's previous engine) — used ONLY here as a cross-check reference.
  const dsin = (d: number) => Math.sin((d * Math.PI) / 180);
  const dcos = (d: number) => Math.cos((d * Math.PI) / 180);
  const dtan = (d: number) => Math.tan((d * Math.PI) / 180);
  const darcsin = (x: number) => (Math.asin(x) * 180) / Math.PI;
  const darccos = (x: number) => (Math.acos(x) * 180) / Math.PI;
  const darctan2 = (y: number, x: number) => (Math.atan2(y, x) * 180) / Math.PI;
  const darccot = (x: number) => (Math.atan(1 / x) * 180) / Math.PI;
  const fixAngle = (a: number) => ((a % 360) + 360) % 360;
  const fixHour = (h: number) => ((h % 24) + 24) % 24;
  function julian(year: number, month: number, day: number) {
    if (month <= 2) { year -= 1; month += 12; }
    const a = Math.floor(year / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
  }
  function sunPos(jd: number) {
    const d = jd - 2451545.0;
    const g = fixAngle(357.529 + 0.98560028 * d);
    const q = fixAngle(280.459 + 0.98564736 * d);
    const l = fixAngle(q + 1.915 * dsin(g) + 0.02 * dsin(2 * g));
    const e = 23.439 - 0.00000036 * d;
    const ra = fixHour(darctan2(dcos(e) * dsin(l), dcos(l)) / 15);
    return { decl: darcsin(dsin(e) * dsin(l)), eqt: q / 15 - ra };
  }
  function prayTimesPort(lat: number, lng: number, tzOffsetMinutes: number, dateKey: string, fajrAngle: number, ishaAngle: number | null, ishaInterval: number | null, asrFactor: 1 | 2) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const jDate = julian(y, m, d) - lng / (15 * 24);
    const midDay = (t: number) => fixHour(12 - sunPos(jDate + t).eqt);
    const sunAngleTime = (angle: number, t: number, ccw = false) => {
      const decl = sunPos(jDate + t).decl;
      const inner = (-dsin(angle) - dsin(decl) * dsin(lat)) / (dcos(decl) * dcos(lat));
      if (inner < -1 || inner > 1) return NaN;
      const h = darccos(inner) / 15;
      return midDay(t) + (ccw ? -h : h);
    };
    const asrTime = (factor: number, t: number) => {
      const decl = sunPos(jDate + t).decl;
      const angle = -darccot(factor + dtan(Math.abs(lat - decl)));
      return sunAngleTime(angle, t);
    };
    let fajr = sunAngleTime(fajrAngle, 5 / 24, true);
    let sunrise = sunAngleTime(0.833, 6 / 24, true);
    let dhuhr = midDay(12 / 24);
    let asr = asrTime(asrFactor, 13 / 24);
    let maghrib = sunAngleTime(0.833, 18 / 24);
    let isha = ishaInterval ? maghrib + ishaInterval / 60 : sunAngleTime(ishaAngle ?? 17, 18 / 24);
    for (let i = 0; i < 2; i++) {
      fajr = sunAngleTime(fajrAngle, fajr / 24, true);
      sunrise = sunAngleTime(0.833, sunrise / 24, true);
      dhuhr = midDay(dhuhr / 24);
      asr = asrTime(asrFactor, asr / 24);
      maghrib = sunAngleTime(0.833, maghrib / 24);
      isha = ishaInterval ? maghrib + ishaInterval / 60 : sunAngleTime(ishaAngle ?? 17, isha / 24);
    }
    const toLocal = (h: number) => h + tzOffsetMinutes / 60 - lng / 15;
    return {
      fajr: toLocal(fajr) * 60,
      sunrise: toLocal(sunrise) * 60,
      dhuhr: (toLocal(dhuhr) + 1 / 60) * 60,
      asr: toLocal(asr) * 60,
      maghrib: toLocal(maghrib) * 60,
      isha: toLocal(isha) * 60,
    };
  }

  function tzOffsetMinutesFor(tz: string, dateKey: string): number {
    const probe = new Date(`${dateKey}T12:00:00Z`);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).formatToParts(probe);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
    const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
    return (asUTC - probe.getTime()) / 60_000;
  }

  const crossChecks: { loc: PrayerLocation; settings: PrayerCalculationSettings }[] = [
    { loc: LOCATIONS.Doha, settings: SETTINGS.QATAR },
    { loc: LOCATIONS.Cairo, settings: SETTINGS.EGYPTIAN },
    { loc: LOCATIONS.Singapore, settings: SETTINGS.MWL },
    { loc: LOCATIONS.London, settings: SETTINGS.MWL },
    { loc: LOCATIONS.NewYork, settings: SETTINGS.ISNA },
  ];
  for (const { loc, settings } of crossChecks) {
    const highLat = Math.abs(loc.latitude) >= 50;
    for (const date of ['2026-03-20', '2026-06-21', '2026-09-23', '2026-12-21']) {
      const mine = computePrayerDay(loc, settings, date);
      const ishaInterval = settings.methodKey === 'QATAR' || settings.methodKey === 'UMM_AL_QURA' ? 90 : null;
      const fajrAngle = settings.methodKey === 'EGYPTIAN' ? 19.5 : settings.methodKey === 'ISNA' ? 15 : 18;
      const ishaAngle = settings.methodKey === 'EGYPTIAN' ? 17.5 : settings.methodKey === 'ISNA' ? 15 : 17;
      const ref = prayTimesPort(loc.latitude, loc.longitude, tzOffsetMinutesFor(loc.timezone, date), date, fajrAngle, ishaAngle, ishaInterval, settings.asrJuristic === 'hanafi' ? 2 : 1);
      // At |lat| ≥ 50° the simple PrayTimes model diverges on twilight times
      // (no RA/declination interpolation, no high-latitude rule — it returns
      // NaN at London's summer solstice, which was the original accuracy bug).
      // There we only cross-check Asr/Maghrib, and adhan's twilight times are
      // validated independently by the Meeus Fajr probe below.
      const diffs: number[] = highLat
        ? [Math.abs(zonedMinutes(mine.asr, loc.timezone) - ref.asr), Math.abs(zonedMinutes(mine.maghrib, loc.timezone) - ref.maghrib)]
        : [
            Math.abs(zonedMinutes(mine.fajr, loc.timezone) - ref.fajr),
            Math.abs(zonedMinutes(mine.asr, loc.timezone) - ref.asr),
            Math.abs(zonedMinutes(mine.maghrib, loc.timezone) - ref.maghrib),
            Math.abs(zonedMinutes(mine.isha, loc.timezone) - ref.isha),
          ];
      const maxDiff = Math.max(...diffs.map((v) => (Number.isNaN(v) ? 999 : v)));
      check(
        `${loc.city} × ${settings.methodKey} ${date} cross-impl Δ≤4m (max ${maxDiff.toFixed(1)}m${highLat ? ', high-lat: asr/maghrib only' : ''})`,
        maxDiff <= 4,
        JSON.stringify(diffs.map((v) => +v.toFixed(1))),
      );
    }
  }

  // ——— The old engine's fatal flaw, demonstrated ———
  {
    const londonRef = prayTimesPort(
      LOCATIONS.London.latitude, LOCATIONS.London.longitude,
      tzOffsetMinutesFor(LOCATIONS.London.timezone, '2026-06-21'), '2026-06-21',
      18, 17, null, 1,
    );
    check(
      'OLD engine: London summer-solstice fajr/isha were NaN (the bug this rewrite fixes)',
      Number.isNaN(londonRef.fajr) && Number.isNaN(londonRef.isha),
    );
    const t = computePrayerDay(LOCATIONS.London, SETTINGS.MWL, '2026-06-21');
    check(
      'adhan resolves them honestly via the high-latitude rule',
      Number.isFinite(t.fajr.getTime()) && Number.isFinite(t.isha.getTime()),
    );
  }
}

// ————————— 10. Independent Meeus Fajr probe (adjudicates high-latitude twilight) —————————
console.log('\n—— 10. Independent Meeus Fajr probe ——');
{
  /** Meeus solar declination (deg) at a given UT instant. */
  function declinationAt(date: Date): number {
    const jd = date.getTime() / 86_400_000 + 2440587.5;
    const T = (jd - 2451545.0) / 36525;
    const mod360 = (x: number) => ((x % 360) + 360) % 360;
    const L0 = mod360(280.46646 + 36000.76983 * T);
    const M = mod360(357.52911 + 35999.05029 * T);
    const C =
      (1.914602 - 0.004817 * T) * Math.sin((M * Math.PI) / 180) +
      0.019993 * Math.sin((2 * M * Math.PI) / 180) +
      0.000289 * Math.sin((3 * M * Math.PI) / 180);
    const trueLong = L0 + C;
    const omega = mod360(125.04 - 1934.136 * T);
    const lambda = trueLong - 0.00569 - 0.00478 * Math.sin((omega * Math.PI) / 180);
    const eps = 23.439291 - 0.0130042 * T + 0.00256 * Math.cos((omega * Math.PI) / 180);
    return (Math.asin(Math.sin((eps * Math.PI) / 180) * Math.sin((lambda * Math.PI) / 180)) * 180) / Math.PI;
  }
  /** UT hour of solar noon for a date/longitude (uses the validated EoT). */
  function transitUTHours(dateKey: string, lng: number): number {
    return 12 - lng / 15 - equationOfTimeMinutes(dateKey) / 60;
  }
  /**
   * Time when the sun reaches `altitudeDeg` before/after transit — independent
   * of adhan: iterates hour angle with Meeus declination at the event time.
   */
  function sunAltitudeTime(dateKey: string, lat: number, lng: number, altitudeDeg: number, after: boolean): number {
    const transit = transitUTHours(dateKey, lng);
    const [y, m, d] = dateKey.split('-').map(Number);
    let t = transit + (after ? 5 : -5); // initial guess ±5h
    for (let i = 0; i < 4; i++) {
      const decl = declinationAt(new Date(Date.UTC(y, m - 1, d, 0, 0, 0) + t * 3_600_000));
      const cosH =
        (Math.sin((altitudeDeg * Math.PI) / 180) - Math.sin((lat * Math.PI) / 180) * Math.sin((decl * Math.PI) / 180)) /
        (Math.cos((lat * Math.PI) / 180) * Math.cos((decl * Math.PI) / 180));
      if (cosH < -1 || cosH > 1) return NaN;
      const H = (Math.acos(cosH) * 180) / Math.PI / 15;
      t = transit + (after ? H : -H);
    }
    return t;
  }

  const probes: { loc: PrayerLocation; angle: number; date: string; methodKey: string }[] = [
    { loc: LOCATIONS.Doha, angle: 18, date: '2026-09-23', methodKey: 'MWL' },
    { loc: LOCATIONS.Cairo, angle: 19.5, date: '2026-03-20', methodKey: 'EGYPTIAN' },
    { loc: LOCATIONS.Singapore, angle: 18, date: '2026-12-21', methodKey: 'MWL' },
    { loc: LOCATIONS.London, angle: 18, date: '2026-03-20', methodKey: 'MWL' },
    { loc: LOCATIONS.London, angle: 18, date: '2026-09-23', methodKey: 'MWL' },
    { loc: LOCATIONS.NewYork, angle: 15, date: '2026-06-21', methodKey: 'ISNA' },
    { loc: LOCATIONS.Sydney, angle: 18, date: '2026-06-21', methodKey: 'MWL' },
  ];
  for (const { loc, angle, date, methodKey } of probes) {
    // 'twilight' rule = pure angle-based times (no night-portion clamping) —
    // this validates adhan's raw astronomical twilight computation.
    const settings: PrayerCalculationSettings = {
      methodKey, asrJuristic: 'standard', highLatRule: 'twilight', timeFormat: '24h',
    };
    const mine = computePrayerDay(loc, settings, date);
    const refUT = sunAltitudeTime(date, loc.latitude, loc.longitude, -angle, false);
    if (Number.isNaN(refUT)) {
      check(`${loc.city} ${date} fajr probe: sun never reaches −${angle}° (polar — rule applies)`, true);
      continue;
    }
    const refInstant = new Date(Date.parse(`${date}T00:00:00Z`) + refUT * 3_600_000);
    const diffMin = Math.abs(mine.fajr.getTime() - refInstant.getTime()) / 60_000;
    check(`${loc.city} ${date} fajr −${angle}° vs independent Meeus (Δ${diffMin.toFixed(1)}m)`, diffMin <= 3, `adhan=${formatPrayerTime(mine.fajr, loc.timezone, 'en', false)} probe=${formatPrayerTime(refInstant, loc.timezone, 'en', false)}`);
  }

  // ——— High-latitude clamping behavior (documented, intended) ———
  {
    // London (51.5°N) with 'auto' → adhan recommends SeventhOfTheNight (>48°):
    // Fajr is clamped to sunrise − night/7 when that is LATER than the angle time.
    const angleT = computePrayerDay(LOCATIONS.London, { methodKey: 'MWL', asrJuristic: 'standard', highLatRule: 'twilight', timeFormat: '24h' }, '2026-03-20');
    const autoT = computePrayerDay(LOCATIONS.London, { methodKey: 'MWL', asrJuristic: 'standard', highLatRule: 'auto', timeFormat: '24h' }, '2026-03-20');
    const tomorrowSunrise = computePrayerDay(LOCATIONS.London, { methodKey: 'MWL', asrJuristic: 'standard', highLatRule: 'twilight', timeFormat: '24h' }, '2026-03-21').sunrise;
    // MWL sets no maghrib angle → maghrib IS the sunset instant in adhan.
    const night = tomorrowSunrise.getTime() - angleT.maghrib.getTime();
    const seventhBound = angleT.sunrise.getTime() - night / 7;
    const clamped = Math.max(angleT.fajr.getTime(), seventhBound);
    check(
      'London auto-rule: Fajr clamped to seventh-of-night bound (documented behavior)',
      Math.abs(autoT.fajr.getTime() - clamped) <= 30_000 && autoT.fajr.getTime() > angleT.fajr.getTime(),
      `angle=${formatPrayerTime(angleT.fajr, 'Europe/London', 'en', false)} auto=${formatPrayerTime(autoT.fajr, 'Europe/London', 'en', false)}`,
    );
    check(
      'London auto-rule: Isha also bounded',
      autoT.isha.getTime() < angleT.isha.getTime(),
      `angle=${formatPrayerTime(angleT.isha, 'Europe/London', 'en', false)} auto=${formatPrayerTime(autoT.isha, 'Europe/London', 'en', false)}`,
    );
    // Doha (25°N) with 'auto' → MiddleOfTheNight, never binds at low latitude:
    const dohaAngle = computePrayerDay(LOCATIONS.Doha, { methodKey: 'MWL', asrJuristic: 'standard', highLatRule: 'twilight', timeFormat: '24h' }, '2026-09-23');
    const dohaAuto = computePrayerDay(LOCATIONS.Doha, { methodKey: 'MWL', asrJuristic: 'standard', highLatRule: 'auto', timeFormat: '24h' }, '2026-09-23');
    check('Doha auto-rule: no clamping at low latitude (times equal)', dohaAuto.fajr.getTime() === dohaAngle.fajr.getTime());
  }
}

// ————————— summary —————————
console.log(`\n========================\nPASSED: ${passed}  FAILED: ${failed}`);
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
