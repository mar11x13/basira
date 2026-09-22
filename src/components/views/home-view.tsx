'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';
import { SourceCard } from '@/components/shared/source-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { computePrayerTimes, nextPrayer, minutesUntilLabel, prayerLabel, PRAYER_ORDER, getMethod } from '@/lib/prayer-times';
import type { HijriResult } from '@/lib/types';
import {
  Sparkles,
  BookOpen,
  ScrollText,
  HandHeart,
  Repeat,
  MoonStar,
  BookUser,
  CalendarDays,
  GraduationCap,
  ChevronRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  { key: 'quran', label: "Qur'an", icon: BookOpen },
  { key: 'hadith', label: 'Hadith', icon: ScrollText },
  { key: 'dua', label: 'Dua', icon: HandHeart },
  { key: 'dhikr', label: 'Dhikr', icon: Repeat },
  { key: 'salah', label: 'Salah', icon: MoonStar },
  { key: 'seerah', label: 'Seerah', icon: BookUser },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'learn', label: 'Learn', icon: GraduationCap },
] as const;

function greeting(): { salam: string; sub: string } {
  const h = new Date().getHours();
  if (h < 5) return { salam: 'Peace be with you', sub: 'A blessed late night — may your sleep be rest.' };
  if (h < 12) return { salam: 'Good morning', sub: 'May your morning be filled with light.' };
  if (h < 17) return { salam: 'Good afternoon', sub: 'May your afternoon be blessed.' };
  return { salam: 'Good evening', sub: 'May your evening bring tranquility.' };
}

function PrayerStrip() {
  const profile = useApp((s) => s.profile);
  const setView = useApp((s) => s.setView);
  const [now, setNow] = React.useState(() => new Date());

  const times = React.useMemo(
    () =>
      computePrayerTimes({
        lat: profile?.locationLat ?? 21.4225,
        lng: profile?.locationLng ?? 39.8262,
        timezoneOffsetMinutes: -new Date().getTimezoneOffset(),
        method: profile?.prayerMethod ?? 'MWL',
        asrFactor: (profile?.asrFactor === 2 ? 2 : 1) as 1 | 2,
      }),
    [profile?.locationLat, profile?.locationLng, profile?.prayerMethod, profile?.asrFactor]
  );

  const next = React.useMemo(() => nextPrayer(times, now), [times, now]);

  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <Card className="paper-card overflow-hidden border-border/80">
      <div className="pattern-khatim pattern-fade h-1.5 w-full" aria-hidden />
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
              <Clock className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              {next ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Next prayer
                    {next.tomorrow ? ' (tomorrow)' : ''}
                  </p>
                  <p className="font-display text-xl font-semibold text-foreground leading-tight">
                    {next.name} · {next.time}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Prayer times</p>
              )}
            </div>
          </div>
          <div className="text-right">
            {next && (
              <>
                <p className="text-2xl font-bold text-primary tabular-nums leading-none">
                  {minutesUntilLabel(next.minutesUntil)}
                </p>
                <p className="text-[0.65rem] text-muted-foreground mt-1 uppercase tracking-wider">remaining</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-6 gap-1 text-center" role="list" aria-label="Today's prayer times">
          {PRAYER_ORDER.map((k) => {
            const isNext = next?.key === k && !next.tomorrow;
            const isInfo = k === 'sunrise';
            return (
              <div
                key={k}
                role="listitem"
                className={cn(
                  'rounded-lg py-1.5 px-0.5 transition-colors',
                  isNext ? 'bg-primary text-primary-foreground shadow-sm' : isInfo ? 'bg-muted/40' : 'bg-muted/70'
                )}
              >
                <p className={cn('text-[0.6rem] font-semibold uppercase tracking-wide', isNext ? 'text-primary-foreground/90' : 'text-muted-foreground')}>
                  {prayerLabel(k)}
                </p>
                <p className={cn('text-[0.72rem] font-semibold tabular-nums mt-0.5', isInfo && 'opacity-70', isNext ? 'text-primary-foreground' : 'text-foreground/85')}>
                  {times[k].replace(/ (AM|PM)/, '')}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[0.68rem] text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" aria-hidden />
            {profile?.locationLat != null
              ? profile.locationName || 'Your location'
              : 'Makkah (default) — set your location in Settings'}
            <span className="mx-1 opacity-50">·</span>
            {getMethod(profile?.prayerMethod ?? 'MWL').name}
          </p>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary px-2" onClick={() => setView('salah')}>
            Prayer guide <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function HomeView() {
  const daily = useApp((s) => s.daily);
  const profile = useApp((s) => s.profile);
  const setView = useApp((s) => s.setView);
  const [hijri, setHijri] = React.useState<HijriResult | null>(null);
  const [recent, setRecent] = React.useState<{ id: string; question: string }[]>([]);
  const [reading, setReading] = React.useState<{ surahNumber: number; lastAyah: number }[]>([]);
  const g = greeting();

  React.useEffect(() => {
    fetch('/api/hijri')
      .then((r) => r.json())
      .then(setHijri)
      .catch(() => {});
    fetch('/api/progress')
      .then((r) => r.json())
      .then((d) => {
        setRecent(d.questions ?? []);
        setReading(d.reading ?? []);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      {/* ————— Greeting ————— */}
      <section className="text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
              Assalamu <span className="text-primary">Alaikum</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {g.salam}
              {profile?.displayName ? `, ${profile.displayName}` : ''} — {g.sub}
            </p>
          </div>
          {hijri && (
            <div className="text-sm text-muted-foreground sm:text-right">
              <p className="font-medium text-foreground/80">{hijri.hijri}</p>
              <p className="text-xs">{hijri.gregorian}</p>
            </div>
          )}
        </div>
        <div className="ornament-line mt-4" />
      </section>

      {/* ————— Next prayer ————— */}
      <PrayerStrip />

      {/* ————— Ask BASIRA CTA ————— */}
      <button
        onClick={() => setView('ask')}
        className="w-full group relative overflow-hidden rounded-xl bg-primary text-primary-foreground p-5 sm:p-6 text-left shadow-md hover:shadow-lg transition-all focus-ring"
        aria-label="Ask BASIRA a question"
      >
        <div className="pattern-khatim absolute inset-0 opacity-30" aria-hidden />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/15 shrink-0">
            <Sparkles className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-semibold leading-tight">Ask BASIRA</p>
            <p className="text-sm text-primary-foreground/85 mt-0.5">
              Grounded answers from verified sources — every citation inspectable.
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 opacity-70 group-hover:translate-x-1 transition-transform" aria-hidden />
        </div>
      </button>

      {/* ————— Daily content ————— */}
      <section aria-label="Daily content" className="space-y-4">
        {daily?.verse ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Ayah of the day</h2>
              <Badge variant="secondary" className="text-[0.6rem]">Qur&apos;an</Badge>
            </div>
            <SourceCard record={daily.verse} defaultOpen={false} />
          </div>
        ) : (
          <Skeleton className="h-44 rounded-xl" />
        )}

        {daily?.hadith ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Hadith of the day</h2>
              <Badge variant="secondary" className="text-[0.6rem]">Sahih sources</Badge>
            </div>
            <SourceCard record={daily.hadith} />
          </div>
        ) : (
          <Skeleton className="h-36 rounded-xl" />
        )}

        {daily?.dua ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Dua of the day</h2>
              <Badge variant="secondary" className="text-[0.6rem]">Sunnah-sourced</Badge>
            </div>
            <SourceCard record={daily.dua} />
          </div>
        ) : null}
      </section>

      {/* ————— Quick actions ————— */}
      <section aria-label="Quick actions">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">Explore</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border/70 bg-card p-3 hover:border-primary/40 hover:shadow-sm transition-all focus-ring"
              aria-label={label}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/8 text-primary group-hover:bg-primary/15 transition-colors">
                <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden />
              </span>
              <span className="text-[0.7rem] font-medium text-foreground/85">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ————— Continue reading + recent questions ————— */}
      {(reading.length > 0 || recent.length > 0) && (
        <section className="grid sm:grid-cols-2 gap-4">
          {reading.length > 0 && (
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" aria-hidden /> Continue reading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {reading.slice(0, 3).map((r) => (
                  <button
                    key={r.surahNumber}
                    onClick={() => setView('quran', { surah: r.surahNumber })}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted/70 transition-colors focus-ring"
                  >
                    <span className="text-foreground/85">
                      Surah {r.surahNumber} · last read ayah {r.lastAyah}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
          {recent.length > 0 && (
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" aria-hidden /> Recently asked
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {recent.slice(0, 3).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setView('ask', { question: q.question })}
                    className="w-full text-left text-sm text-foreground/80 hover:text-primary rounded-lg px-3 py-2 hover:bg-muted/70 transition-colors focus-ring line-clamp-1"
                  >
                    {q.question}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
