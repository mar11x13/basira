import { NextResponse } from 'next/server';
import { toHijri, formatHijri, HIJRI_METHOD_NOTE, upcomingEvents, ramadanInfo } from '@/lib/hijri';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const h = toHijri(now);
    return NextResponse.json({
      gregorian: now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      hijri: formatHijri(now),
      hijriDay: h.day,
      hijriMonth: h.month,
      hijriMonthName: h.monthName,
      hijriYear: h.year,
      methodNote: HIJRI_METHOD_NOTE,
      events: upcomingEvents(now, 8),
      ramadan: ramadanInfo(now),
    });
  } catch (e) {
    console.error('hijri error', e);
    return NextResponse.json({ error: 'Could not compute Hijri date' }, { status: 500 });
  }
}
