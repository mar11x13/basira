import { NextResponse } from 'next/server';
import { computePrayerTimes, getMethod, PRAYER_METHODS } from '@/lib/prayer-times';
import { getOrCreateSession, toProfile } from '@/lib/session';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { profile } = await getOrCreateSession();

    let lat = url.searchParams.get('lat') ? parseFloat(url.searchParams.get('lat')!) : profile.locationLat;
    let lng = url.searchParams.get('lng') ? parseFloat(url.searchParams.get('lng')!) : profile.locationLng;
    const tz = url.searchParams.get('tz') ? parseInt(url.searchParams.get('tz')!, 10) : -new Date().getTimezoneOffset();
    const method = url.searchParams.get('method') ?? profile.prayerMethod ?? 'MWL';
    const asr = url.searchParams.get('asr') ? (parseInt(url.searchParams.get('asr')!, 10) as 1 | 2) : ((profile.asrFactor === 2 ? 2 : 1) as 1 | 2);
    const dateStr = url.searchParams.get('date');

    if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
      // default: Makkah al-Mukarramah
      lat = 21.4225;
      lng = 39.8262;
    }

    // normalize tz to JS-style offset (UTC - local)
    const tzMinutes = url.searchParams.has('tz') ? -tz : -new Date().getTimezoneOffset();

    const date = dateStr ? new Date(dateStr + 'T12:00:00') : new Date();
    const times = computePrayerTimes({
      date,
      lat,
      lng,
      timezoneOffsetMinutes: tzMinutes,
      method,
      asrFactor: asr,
    });

    return NextResponse.json({
      times,
      location: { lat, lng, name: profile.locationName ?? null },
      method: getMethod(method),
      asrFactor: asr,
      methods: PRAYER_METHODS,
      calculationNote: 'Prayer times are calculated locally with a standard astronomical algorithm. High-latitude locations and local conventions can shift times slightly — confirm with your local mosque.',
      source: 'BASIRA local calculation (offline-capable)',
    });
  } catch (e) {
    console.error('prayer times error', e);
    return NextResponse.json({ error: 'Could not compute prayer times' }, { status: 500 });
  }
}
