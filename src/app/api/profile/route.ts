import { NextResponse } from 'next/server';
import { getOrCreateSession, toProfile, deleteAllUserData } from '@/lib/session';
import { db } from '@/lib/db';

const MADHHABS = new Set(['HANAFI', 'SHAFII', 'MALIKI', 'HANBALI']);
const METHODS = new Set(['MWL', 'ISNA', 'EGYPT', 'MAKKAH', 'KARACHI']);
const LANGS = new Set(['en', 'ar', 'bilingual']);

export async function PATCH(req: Request) {
  try {
    const { sid } = await getOrCreateSession();
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (typeof body.displayName === 'string') data.displayName = body.displayName.slice(0, 60) || null;
    if (body.madhhab === null || body.madhhab === '') data.madhhab = null;
    else if (typeof body.madhhab === 'string' && MADHHABS.has(body.madhhab)) data.madhhab = body.madhhab;
    if (typeof body.language === 'string' && LANGS.has(body.language)) data.language = body.language;
    if (typeof body.showArabic === 'boolean') data.showArabic = body.showArabic;
    if (typeof body.showTranslit === 'boolean') data.showTranslit = body.showTranslit;
    if (typeof body.beginnerMode === 'boolean') data.beginnerMode = body.beginnerMode;
    if (typeof body.translationPref === 'string') data.translationPref = body.translationPref.slice(0, 40);
    if (typeof body.prayerMethod === 'string' && METHODS.has(body.prayerMethod)) data.prayerMethod = body.prayerMethod;
    if (body.asrFactor === 1 || body.asrFactor === 2) data.asrFactor = body.asrFactor;
    if (typeof body.locationLat === 'number' && typeof body.locationLng === 'number') {
      data.locationLat = body.locationLat;
      data.locationLng = body.locationLng;
    }
    if (body.clearLocation === true) {
      data.locationLat = null;
      data.locationLng = null;
      data.locationName = null;
    }
    if (typeof body.locationName === 'string') data.locationName = body.locationName.slice(0, 120) || null;
    for (const k of ['notifyPrayer', 'notifyQuran', 'notifyDhikr', 'notifyFriday', 'onboarded'] as const) {
      if (typeof body[k] === 'boolean') data[k] = body[k];
    }

    const updated = await db.userProfile.update({ where: { sid }, data });
    return NextResponse.json({ profile: toProfile(updated) });
  } catch (e) {
    console.error('profile patch error', e);
    return NextResponse.json({ error: 'Could not save settings' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { profile } = await getOrCreateSession();
    await deleteAllUserData(profile.id);
    return NextResponse.json({ ok: true, message: 'All personal data deleted. Your anonymous session record was removed.' });
  } catch (e) {
    console.error('profile delete error', e);
    return NextResponse.json({ error: 'Could not delete data' }, { status: 500 });
  }
}
