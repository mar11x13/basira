import { NextResponse } from 'next/server';
import {
  computePrayerDay,
  computePrayerSnapshot,
  deriveNextPrayer,
  formatPrayerTime,
  getMethod,
  isValidTimezone,
  zonedDateKey,
  resolveMethodKey,
  resolvePrayerLocation,
  resolvePrayerSettings,
  PRAYER_METHODS,
  MOSQUE_COMPARISON_NOTE,
  type PrayerLocation,
  type PrayerKey,
} from '@/lib/prayer/core';
import { getOrCreateSession } from '@/lib/session';

// ============================================================================
// GET /api/prayer-times — server-side prayer computation (adhan engine).
//
// The app itself computes locally on the client (offline-capable, no network
// needed). This route exists for QA/verification and for consumers that need
// a server-computed snapshot: it is fully timezone-correct — the location's
// IANA zone drives both the calendar date and the displayed wall-clock times,
// never the server's own timezone.
//
// Query params (all optional — profile defaults are used otherwise):
//   lat, lng     — coordinates
//   tz           — IANA timezone of the prayer location (e.g. Asia/Qatar)
//   date         — YYYY-MM-DD calendar date in that timezone
//   method       — registry method key (legacy keys normalized)
//   asr          — 1 (standard) | 2 (Hanafi)
//   highlat      — auto | middle | seventh | twilight
//   format       — 12h | 24h
// ============================================================================

export const dynamic = 'force-dynamic';

const PRAYER_KEY_ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { profile } = await getOrCreateSession();

    const qLat = url.searchParams.get('lat');
    const qLng = url.searchParams.get('lng');
    const qTz = url.searchParams.get('tz');
    const qDate = url.searchParams.get('date');
    const qMethod = url.searchParams.get('method');
    const qAsr = url.searchParams.get('asr');
    const qHighLat = url.searchParams.get('highlat');
    const qFormat = url.searchParams.get('format');

    // Resolve the prayer location: explicit query params, else saved profile,
    // else the deterministic default (Makkah). Never the server's location.
    let location: PrayerLocation;
    if (qLat != null && qLng != null && !Number.isNaN(Number(qLat)) && !Number.isNaN(Number(qLng))) {
      const tz = qTz && isValidTimezone(qTz) ? qTz : null;
      location = {
        latitude: Number(qLat),
        longitude: Number(qLng),
        timezone: tz ?? (profile.locationTimezone && isValidTimezone(profile.locationTimezone) ? profile.locationTimezone : 'UTC'),
        city: profile.locationName ?? null,
        country: null,
        isDefault: false,
      };
    } else {
      location = resolvePrayerLocation(
        profile ? { ...profile, locationLat: profile.locationLat, locationLng: profile.locationLng } : null,
        qTz && isValidTimezone(qTz) ? qTz : null,
      );
    }

    const methodKey = resolveMethodKey(qMethod ?? profile.prayerMethod ?? 'MWL');
    const asrJuristic = (qAsr === '2' || (!qAsr && profile.asrFactor === 2) ? 'hanafi' : 'standard') as 'standard' | 'hanafi';
    const highLatRule = qHighLat ?? profile.highLatRule ?? 'auto';
    const timeFormat = (qFormat ?? profile.timeFormat ?? '12h') === '24h' ? '24h' : '12h';

    // Single authoritative date: the calendar date in the location's timezone.
    const now = new Date();
    const dateKey = qDate && /^\d{4}-\d{2}-\d{2}$/.test(qDate) ? qDate : zonedDateKey(location.timezone, now).key;

    const times = computePrayerDay(location, { methodKey, asrJuristic, highLatRule, timeFormat }, dateKey);

    // Next prayer relative to the server's now (for QA/verification only —
    // the client derives its own next prayer from its live clock).
    const tomorrowTimes = computePrayerDay(location, { methodKey, asrJuristic, highLatRule, timeFormat }, nextDateKey(dateKey));
    const snapshot = { location, settings: { methodKey, asrJuristic, highLatRule, timeFormat }, dateKey, times, tomorrowFajr: tomorrowTimes.fajr };
    const next = deriveNextPrayer(snapshot, now);

    const formatted: Record<PrayerKey, string> = {
      fajr: formatPrayerTime(times.fajr, location.timezone, 'en', timeFormat === '12h'),
      sunrise: formatPrayerTime(times.sunrise, location.timezone, 'en', timeFormat === '12h'),
      dhuhr: formatPrayerTime(times.dhuhr, location.timezone, 'en', timeFormat === '12h'),
      asr: formatPrayerTime(times.asr, location.timezone, 'en', timeFormat === '12h'),
      maghrib: formatPrayerTime(times.maghrib, location.timezone, 'en', timeFormat === '12h'),
      isha: formatPrayerTime(times.isha, location.timezone, 'en', timeFormat === '12h'),
    };

    return NextResponse.json({
      date: dateKey,
      timezone: location.timezone,
      location: {
        lat: location.latitude,
        lng: location.longitude,
        name: location.city,
      },
      method: methodKey,
      methodName: getMethod(methodKey).name,
      asrFactor: asrJuristic === 'hanafi' ? 2 : 1,
      highLatRule,
      timeFormat,
      times: formatted,
      next: next
        ? {
            key: next.key,
            time: formatPrayerTime(next.instant, location.timezone, 'en', timeFormat === '12h'),
            tomorrow: next.tomorrow,
            minutesUntil: Math.max(0, Math.round((next.instant.getTime() - now.getTime()) / 60_000)),
          }
        : null,
      methods: PRAYER_METHODS.map((m) => ({ key: m.key, name: m.name, description: m.description })),
      note: MOSQUE_COMPARISON_NOTE,
      source: 'BASIRA local calculation — adhan (Batoul Apps) astronomical library',
    });
  } catch (e) {
    console.error('prayer times error', e);
    return NextResponse.json(
      { error: 'Could not compute prayer times', note: 'The calculation failed for the given location, date and settings.' },
      { status: 500 },
    );
  }
}

function nextDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const next = new Date(y, m - 1, d + 1, 12, 0, 0, 0);
  const py = next.getFullYear();
  const pm = String(next.getMonth() + 1).padStart(2, '0');
  const pd = String(next.getDate()).padStart(2, '0');
  return `${py}-${pm}-${pd}`;
}
