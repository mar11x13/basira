// ============================================================================
// BASIRA — Hijri calendar helpers.
// Uses Intl Umm al-Qura when available, with a transparent note that
// calculated dates can differ from local moon sighting.
// ============================================================================

export const HIJRI_MONTHS = [
  'Muharram',
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Ula',
  'Jumada al-Akhirah',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhul-Qa'dah",
  'Dhul-Hijjah',
];

export interface HijriParts {
  day: number;
  month: number; // 1-12
  monthName: string;
  year: number;
}

const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});

const monthFmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
  month: 'long',
});

/** Convert a Gregorian Date to Hijri parts (Umm al-Qura based). */
export function toHijri(date: Date): HijriParts {
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);
  const month = get('month');
  return {
    day: get('day'),
    month,
    monthName: HIJRI_MONTHS[month - 1] ?? monthFmt.format(date),
    year: get('year'),
  };
}

export function formatHijri(date: Date): string {
  const h = toHijri(date);
  return `${h.day} ${h.monthName} ${h.year} AH`;
}

export const HIJRI_METHOD_NOTE =
  'This Hijri date is calculated using the Umm al-Qura calendar. The beginning of an Islamic month is confirmed by local moon sighting, so the date may differ by a day in your country. Please confirm with your local mosque.';

export interface IslamicEventDef {
  key: string;
  name: string;
  nameAr?: string;
  hMonth: number;
  hDay: number;
  note: string;
}

export const ISLAMIC_EVENTS: IslamicEventDef[] = [
  { key: 'new-year', name: 'Islamic New Year (1 Muharram)', hMonth: 1, hDay: 1, note: 'Start of the Hijri year.' },
  { key: 'ashura', name: "Day of 'Ashura (10 Muharram)", hMonth: 1, hDay: 10, note: 'Recommended fasting day; the exact date follows local moon sighting.' },
  { key: 'mawlid', name: "Mawlid an-Nabi (12 Rabi' al-Awwal)", hMonth: 3, hDay: 12, note: 'Commemorated by many Muslims; observance differs between communities.' },
  { key: 'isra-miraj', name: "Isra' & Mi'raj (27 Rajab)", hMonth: 7, hDay: 27, note: 'Traditional date; scholars differ on the exact date of the night journey.' },
  { key: 'ramadan-start', name: 'Start of Ramadan (1 Ramadan)', hMonth: 9, hDay: 1, note: 'Confirmed by moon sighting; calculated date is an expectation only.' },
  { key: 'eid-fitr', name: 'Eid al-Fitr (1 Shawwal)', hMonth: 10, hDay: 1, note: 'After 29/30 days of Ramadan; confirmed by local moon sighting.' },
  { key: 'arafah', name: 'Day of Arafah (9 Dhul-Hijjah)', hMonth: 12, hDay: 9, note: 'The great day of Hajj; recommended fasting for those not on Hajj.' },
  { key: 'eid-adha', name: 'Eid al-Adha (10 Dhul-Hijjah)', hMonth: 12, hDay: 10, note: 'The Festival of Sacrifice; continues with the days of Tashriq.' },
];

/** Find expected Gregorian dates for upcoming Islamic events within ~400 days. */
export function upcomingEvents(today: Date, limit = 8): {
  key: string;
  name: string;
  hijriDate: string;
  expectedGregorian: string;
  note: string;
}[] {
  const results: {
    key: string;
    name: string;
    hijriDate: string;
    expectedGregorian: string;
    note: string;
    sortTime: number;
  }[] = [];
  const seen = new Set<string>();
  const cursor = new Date(today.getTime());
  for (let i = 0; i < 400 && results.length < limit; i++) {
    cursor.setDate(cursor.getDate() + 1);
    const h = toHijri(cursor);
    for (const ev of ISLAMIC_EVENTS) {
      if (h.month === ev.hMonth && h.day === ev.hDay) {
        const dedupe = `${ev.key}-${h.year}`;
        if (!seen.has(dedupe)) {
          seen.add(dedupe);
          results.push({
            key: ev.key,
            name: ev.name,
            hijriDate: `${ev.hDay} ${HIJRI_MONTHS[ev.hMonth - 1]} ${h.year} AH`,
            expectedGregorian: cursor.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            note: ev.note,
            sortTime: cursor.getTime(),
          });
        }
      }
    }
  }
  return results.sort((a, b) => a.sortTime - b.sortTime).slice(0, limit);
}

/** Ramadan-specific info for the current Hijri year. */
export function ramadanInfo(today: Date) {
  const h = toHijri(today);
  const inRamadan = h.month === 9;
  const daysIntoRamadan = inRamadan ? h.day : 0;
  const ramadanLength = 29; // 29 or 30, decided by sighting
  return {
    inRamadan,
    daysIntoRamadan,
    estimatedRemaining: inRamadan ? Math.max(ramadanLength - h.day, 0) : null,
    hijriYear: h.year,
  };
}
