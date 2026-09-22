'use client';

import * as React from 'react';
import { ViewHeader, EmptyState } from '@/components/shared/view-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookUser,
  HandHeart,
  Info,
  Landmark,
  Moon,
  MoonStar,
  RefreshCw,
  Sparkles,
  Star,
  Sunset,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// CalendarView — today's Hijri date, upcoming Islamic occasions, and Ramadan
// status. Calculated (Umm al-Qura) dates always carry the honest moon-sighting
// caveat from the API; nothing is presented as more certain than it is.
// ============================================================================

interface CalendarEvent {
  key: string;
  name: string;
  hijriDate: string;
  expectedGregorian: string;
  note: string;
}

interface RamadanInfo {
  inRamadan: boolean;
  daysIntoRamadan: number;
  estimatedRemaining: number | null;
  hijriYear: number;
}

interface HijriData {
  gregorian: string;
  hijri: string;
  hijriDay: number;
  hijriMonth: number;
  hijriMonthName: string;
  hijriYear: number;
  methodNote: string;
  events: CalendarEvent[];
  ramadan: RamadanInfo;
}

/** Local Arabic month-name map (API provides the English month name). */
const ARABIC_MONTHS = [
  'المحرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

const MONTHS_EN = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

const EVENT_META: Record<string, { icon: React.ComponentType<{ className?: string }>; nameAr?: string }> = {
  'new-year': { icon: Sparkles, nameAr: 'رأس السنة الهجرية' },
  ashura: { icon: Moon, nameAr: 'عاشوراء' },
  mawlid: { icon: BookUser, nameAr: 'المولد النبوي' },
  'isra-miraj': { icon: Star, nameAr: 'الإسراء والمعراج' },
  'ramadan-start': { icon: Sunset, nameAr: 'بداية رمضان' },
  'eid-fitr': { icon: MoonStar, nameAr: 'عيد الفطر' },
  arafah: { icon: Landmark, nameAr: 'يوم عرفة' },
  'eid-adha': { icon: HandHeart, nameAr: 'عيد الأضحى' },
};

const FALLBACK_EVENT_META = { icon: MoonStar };

/** Parse "5 January 2027" (en-GB) into a whole-day difference from today, local time. */
function daysUntil(expectedGregorian: string): number | null {
  const match = expectedGregorian.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!match) return null;
  const month = MONTHS_EN.indexOf(match[2].toLowerCase());
  if (month < 0) return null;
  const target = new Date(Number(match[3]), month, Number(match[1]));
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function countdownLabel(days: number | null): string | null {
  if (days == null) return null;
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `in ${days} days`;
}

export function CalendarView() {
  const [data, setData] = React.useState<HijriData | null>(null);
  const [error, setError] = React.useState(false);

  const load = React.useCallback(() => {
    setError(false);
    fetch('/api/hijri')
      .then((r) => {
        if (!r.ok) throw new Error('load failed');
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      <ViewHeader
        back
        title="Islamic Calendar"
        titleAr="التقويم الهجري"
        description="Today's Hijri date and the blessed occasions of the Islamic year — with the honesty that months begin by local moon sighting."
      />

      {error ? (
        <div className="text-center py-8">
          <EmptyState
            icon={<RefreshCw className="h-8 w-8" aria-hidden />}
            title="Could not load the calendar"
            hint="Your connection may have dropped — please try again."
          />
          <Button variant="outline" size="lg" className="mt-1 rounded-xl" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
            Try again
          </Button>
        </div>
      ) : !data ? (
        <div className="space-y-5" role="status" aria-busy="true" aria-label="Loading the Islamic calendar">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* ————— Today ————— */}
          <Card className="paper-card overflow-hidden border-border/80">
            <div className="pattern-khatim pattern-fade h-2 w-full" aria-hidden />
            <CardContent className="p-5 sm:p-6 text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Today
              </p>
              <p className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
                {data.hijriDay} {data.hijriMonthName} {data.hijriYear}{' '}
                <span className="text-primary">AH</span>
              </p>
              <p className="mt-2 font-arabic text-xl sm:text-2xl text-primary" dir="rtl" lang="ar">
                {data.hijriDay} {ARABIC_MONTHS[data.hijriMonth - 1] ?? ''} {data.hijriYear} هـ
              </p>
              <div className="ornament-line mx-auto mt-4 max-w-xs" />
              <p className="mt-3 text-sm text-muted-foreground">{data.gregorian}</p>
            </CardContent>
          </Card>

          {/* ————— Moon-sighting honesty note ————— */}
          <Alert
            role="note"
            className="rounded-xl border-gold/40 bg-gold/10 [&>svg]:text-gold"
          >
            <Info className="h-4 w-4" aria-hidden />
            <AlertTitle className="text-sm font-semibold text-foreground">Moon-sighting note</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">{data.methodNote}</AlertDescription>
          </Alert>

          {/* ————— Ramadan status ————— */}
          {data.ramadan?.inRamadan && (
            <Card className="overflow-hidden border-primary/30 bg-primary/5">
              <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sunset className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold text-foreground leading-snug">
                    Ramadan {data.ramadan.hijriYear} AH is here
                  </h3>
                  <p className="mt-0.5 text-sm text-foreground/80 leading-relaxed">
                    Day {data.ramadan.daysIntoRamadan} of Ramadan
                    {data.ramadan.estimatedRemaining != null && data.ramadan.estimatedRemaining > 0
                      ? ` — approximately ${data.ramadan.estimatedRemaining} day${
                          data.ramadan.estimatedRemaining === 1 ? '' : 's'
                        } remaining until Eid, in shaa Allah`
                      : ' — the month may end with tonight\'s sighting'}
                    .
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Ramadan&apos;s start and end are confirmed by local moon sighting, so these counts are
                    estimates — please follow your local mosque.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ————— Upcoming events ————— */}
          <section aria-labelledby="upcoming-events-heading">
            <h2
              id="upcoming-events-heading"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3"
            >
              Upcoming occasions
            </h2>
            <ul className="space-y-3">
              {data.events.map((event) => {
                const meta = EVENT_META[event.key] ?? FALLBACK_EVENT_META;
                const Icon = meta.icon;
                const label = countdownLabel(daysUntil(event.expectedGregorian));
                return (
                  <li key={`${event.key}-${event.hijriDate}`}>
                    <Card className="paper-card border-border/80">
                      <CardContent className="p-4 flex items-start gap-3.5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="min-w-0">
                              <h3 className="font-display text-base font-semibold text-foreground leading-snug">
                                {event.name}
                              </h3>
                              {meta.nameAr && (
                                <p className="font-arabic text-sm text-muted-foreground" dir="rtl" lang="ar">
                                  {meta.nameAr}
                                </p>
                              )}
                            </div>
                            {label && (
                              <span
                                className={cn(
                                  'inline-flex shrink-0 items-center rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1',
                                  'text-[0.65rem] font-semibold tracking-wide text-gold'
                                )}
                              >
                                {label}
                              </span>
                            )}
                          </div>
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground/80">{event.hijriDate}</span>
                            <span className="mx-1.5 opacity-50" aria-hidden>
                              ·
                            </span>
                            expected {event.expectedGregorian}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground/90">
                            {event.note}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
