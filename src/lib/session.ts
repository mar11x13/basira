import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { db } from './db';
import type { Profile } from './types';
import type { UserProfile } from '@prisma/client';

const COOKIE_NAME = 'basira_sid';
const ONE_YEAR = 60 * 60 * 24 * 365;

export function toProfile(p: UserProfile): Profile {
  return {
    id: p.id,
    displayName: p.displayName,
    madhhab: p.madhhab,
    language: p.language,
    showArabic: p.showArabic,
    showTranslit: p.showTranslit,
    beginnerMode: p.beginnerMode,
    translationPref: p.translationPref,
    prayerMethod: p.prayerMethod,
    asrFactor: p.asrFactor,
    locationLat: p.locationLat,
    locationLng: p.locationLng,
    locationName: p.locationName,
    notifyPrayer: p.notifyPrayer,
    notifyQuran: p.notifyQuran,
    notifyDhikr: p.notifyDhikr,
    notifyFriday: p.notifyFriday,
    onboarded: p.onboarded,
  };
}

/**
 * Returns the current anonymous session + profile. Creates both when missing.
 * The profile is deliberately minimal (privacy-first design).
 */
export async function getOrCreateSession(): Promise<{ sid: string; profile: UserProfile }> {
  const store = await cookies();
  let sid = store.get(COOKIE_NAME)?.value;

  if (!sid || !/^[a-f0-9-]{10,}$/i.test(sid)) {
    sid = randomUUID();
  }

  let profile = await db.userProfile.findUnique({ where: { sid } });
  if (!profile) {
    profile = await db.userProfile.create({ data: { sid } });
  }
  return { sid, profile };
}

/** Ensure a fresh cookie is attached to a response (used by /api/session). */
export function withSessionCookie<T>(res: NextResponse<T>, sid: string): NextResponse<T> {
  res.cookies.set(COOKIE_NAME, sid, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_YEAR,
  });
  return res;
}

/** Delete all personal data for the current session (privacy requirement). */
export async function deleteAllUserData(userId: string) {
  await db.bookmark.deleteMany({ where: { userId } });
  await db.readingProgress.deleteMany({ where: { userId } });
  await db.dhikrProgress.deleteMany({ where: { userId } });
  await db.lessonProgress.deleteMany({ where: { userId } });
  await db.questionLog.deleteMany({ where: { userId } });
  await db.userProfile.delete({ where: { id: userId } });
}
