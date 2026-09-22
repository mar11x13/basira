import { NextResponse } from 'next/server';
import { getOrCreateSession, withSessionCookie, toProfile } from '@/lib/session';

export async function GET() {
  try {
    const { sid, profile } = await getOrCreateSession();
    const res = NextResponse.json({ profile: toProfile(profile) });
    return withSessionCookie(res, sid);
  } catch (e) {
    console.error('session error', e);
    return NextResponse.json({ error: 'Could not create session' }, { status: 500 });
  }
}
