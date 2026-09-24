'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';
import { useT, useUiLanguage } from '@/lib/i18n';
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
  Bookmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  { key: 'quran', labelKey: 'nav.quran', icon: BookOpen },
  { key: 'hadith', labelKey: 'nav.hadith', icon: ScrollText },
  { key: 'dua', labelKey: 'nav.dua', icon: HandHeart },
  { key: 'dhikr', labelKey: 'nav.dhikr', icon: Repeat },
  { key: 'salah', labelKey: 'nav.salah', icon: MoonStar },
  { key: 'seerah', labelKey: 'nav.seerah', icon: BookUser },
  { key: 'calendar', labelKey: 'nav.calendar', icon: CalendarDays },
  { key: 'learn', labelKey: 'nav.learn', icon: GraduationCap },
] as const;

const MORE_ACTIONS = [{ key: 'bookmarks', labelKey: 'nav.bookmarks', icon: Bookmark }] as const;

function greeting(t: (k: string) => string): { salam: string; sub: string } {
  const h = new Date().getHours();
  if (h < 5) return { salam: t('home.lateNight'), sub: t('home.lateNightSub') };
  if (h < 12) return { salam: t('home.morning'), sub: t('home.morningSub') };
  if (h < 17) return { salam: t('home.afternoon'), sub: t('home.afternoonSub') };
  return { salam: t('home.evening'), sub: t('home.eveningSub') };
}

/** Arabic names for the five prayers + sunrise (used in RTL mode). */
const PRAYER_LABELS_AR: Record<string, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

function PrayerStrip() {
  const profile = useApp((s) => s.profile);
  const setView = useApp((s) => s.setView);
  const t = useT();
  const lang = useUiLanguage();
  const arabic = lang === 'ar';
  const [now, setNow] = React.useState(() => new Date());

  const labelFor = (k: string) => (arabic ? (PRAYER_LABELS_AR[k] ?? prayerLabel(k)) : prayerLabel(k));

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
    // Battery-conscious ticking: only tick while the page is visible; resync
    // immediately when it becomes visible again (so the countdown is never
    // stale after the user returns from another tab/app).
    const tick = () => setNow(new Date());
    let t: number | undefined;
    const start = () => {
      if (t == null) t = window.setInterval(tick, 30_000);
    };
    const stop = () => {
      if (t != null) {
        clearInterval(t);
        t = undefined;
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        tick();
        start();
      }
    };
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Time-aware cell styling: passed prayers rest dimmed, the next prayer glows.
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const minutesOf = (label: string) => {
    const m = label.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
    if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  };

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
                    {t('home.nextPrayer')}
                    {next.tomorrow ? ` (${t('home.tomorrow')})` : ''}
                  </p>
                  <p className={cn('font-display text-xl font-semibold text-foreground leading-tight', arabic && 'font-arabic')}>
                    {arabic && next.key ? (PRAYER_LABELS_AR[next.key] ?? next.name) : next.name} · {next.time}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t('home.prayerTimes')}</p>
              )}
            </div>
          </div>
          <div className="text-end">
            {next && (
              <>
                <p className="text-2xl font-bold text-primary tabular-nums leading-none">
                  {minutesUntilLabel(next.minutesUntil)}
                </p>
                <p className="text-[0.65rem] text-muted-foreground mt-1 uppercase tracking-wider">{t('home.remaining')}</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-6 gap-1 text-center" role="list" aria-label={t('home.prayerTimes')}>
          {PRAYER_ORDER.map((k) => {
            const isNext = next?.key === k && !next.tomorrow;
            const isInfo = k === 'sunrise';
            const mins = minutesOf(times[k]);
            const hasPassed = !isNext && mins != null && mins <= nowMinutes;
            return (
              <div
                key={k}
                role="listitem"
                className={cn(
                  'rounded-lg py-1.5 px-0.5 transition-all duration-500',
                  isNext
                    ? 'bg-primary text-primary-foreground shadow-md scale-[1.03]'
                    : isInfo
                      ? 'bg-muted/40'
                      : 'bg-muted/70',
                  hasPassed && !isInfo && 'opacity-55'
                )}
              >
                <p
                  className={cn(
                    'text-[0.6rem] font-semibold tracking-wide',
                    isNext ? 'text-primary-foreground/90' : 'text-muted-foreground',
                    arabic ? 'font-arabic' : 'uppercase'
                  )}
                >
                  {labelFor(k)}
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
              ? profile.locationName || t('home.yourLocation')
              : t('home.makkahDefault')}
            <span className="mx-1 opacity-50">·</span>
            {getMethod(profile?.prayerMethod ?? 'MWL').name}
          </p>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary px-2" onClick={() => setView('salah')}>
            {t('home.prayerGuide')} <ChevronRight className="h-3.5 w-3.5 ms-0.5 rtl:rotate-180" />
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
  const t = useT();
  const lang = useUiLanguage();
  const [hijri, setHijri] = React.useState<HijriResult | null>(null);
  const [recent, setRecent] = React.useState<{ id: string; question: string }[]>([]);
  const [reading, setReading] = React.useState<{ surahNumber: number; lastAyah: number }[]>([]);
  const g = greeting(t);
  const arabicUi = lang === 'ar';

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
      <section className={cn('text-center sm:text-start', arabicUi && 'font-arabic')}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className={cn('text-3xl sm:text-4xl font-semibold text-foreground', arabicUi ? 'leading-[1.9]' : 'font-display')}>
              {arabicUi ? (
                <>
                  السلام <span className="text-primary">عليكم</span>
                </>
              ) : (
                <>
                  Assalamu <span className="text-primary">Alaikum</span>
                </>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {g.salam}
              {profile?.displayName ? `, ${profile.displayName}` : ''} — {g.sub}
            </p>
          </div>
          {hijri && (
            <div className="text-sm text-muted-foreground sm:text-end">
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
        className={cn(
          'w-full group relative overflow-hidden rounded-xl bg-primary text-primary-foreground p-5 sm:p-6 shadow-md hover:shadow-lg transition-all focus-ring',
          arabicUi ? 'text-start font-arabic' : 'text-start'
        )}
        aria-label={t('home.askTitle')}
      >
        <div className="pattern-khatim absolute inset-0 opacity-30" aria-hidden />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/15 shrink-0">
            <Sparkles className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className={cn('text-xl font-semibold leading-tight', !arabicUi && 'font-display')}>{t('home.askTitle')}</p>
            <p className="text-sm text-primary-foreground/85 mt-0.5">{t('home.askSub')}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 opacity-70 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" aria-hidden />
        </div>
      </button>

      {/* ————— Daily content ————— */}
      <section aria-label={arabicUi ? 'المحتوى اليومي' : 'Daily content'} className="space-y-4">
        {daily?.verse ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className={cn('text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground', arabicUi && 'font-arabic tracking-normal')}>{t('home.ayahOfDay')}</h2>
              <Badge variant="secondary" className="text-[0.6rem]">{t('home.quranBadge')}</Badge>
            </div>
            <SourceCard record={daily.verse} defaultOpen={false} />
          </div>
        ) : (
          <Skeleton className="h-44 rounded-xl" />
        )}

        {daily?.hadith ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className={cn('text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground', arabicUi && 'font-arabic tracking-normal')}>{t('home.hadithOfDay')}</h2>
              <Badge variant="secondary" className="text-[0.6rem]">{t('home.sahihBadge')}</Badge>
            </div>
            <SourceCard record={daily.hadith} />
          </div>
        ) : (
          <Skeleton className="h-36 rounded-xl" />
        )}

        {daily?.dua ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className={cn('text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground', arabicUi && 'font-arabic tracking-normal')}>{t('home.duaOfDay')}</h2>
              <Badge variant="secondary" className="text-[0.6rem]">{t('home.sunnahBadge')}</Badge>
            </div>
            <SourceCard record={daily.dua} />
          </div>
        ) : null}
      </section>

      {/* ————— Quick actions ————— */}
      <section aria-label={arabicUi ? 'إجراءات سريعة' : 'Quick actions'}>
        <h2 className={cn('text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3', arabicUi && 'font-arabic tracking-normal')}>{t('home.explore')}</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map(({ key, labelKey, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border/70 bg-card p-3 hover:border-primary/40 hover:shadow-sm transition-all focus-ring"
              aria-label={t(labelKey)}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/8 text-primary group-hover:bg-primary/15 transition-colors">
                <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden />
              </span>
              <span className={cn('text-[0.7rem] font-medium text-foreground/85', arabicUi && 'font-arabic')}>{t(labelKey)}</span>
            </button>
          ))}
        </div>
        {MORE_ACTIONS.length > 0 && (
          <div className="mt-2.5 grid grid-cols-4 gap-2.5">
            {MORE_ACTIONS.map(({ key, labelKey, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className="group flex flex-col items-center gap-2 rounded-xl border border-gold/40 bg-gold/8 p-3 hover:border-gold/60 hover:shadow-sm transition-all focus-ring"
                aria-label={t(labelKey)}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold group-hover:bg-gold/25 transition-colors">
                  <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden />
                </span>
                <span className={cn('text-[0.7rem] font-medium text-foreground/85', arabicUi && 'font-arabic')}>{t(labelKey)}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ————— Continue reading + recent questions ————— */}
      {(reading.length > 0 || recent.length > 0) && (
        <section className="grid sm:grid-cols-2 gap-4">
          {reading.length > 0 && (
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className={cn('text-sm font-semibold text-foreground/80 flex items-center gap-2', arabicUi && 'font-arabic')}>
                  <BookOpen className="h-4 w-4 text-primary" aria-hidden /> {t('home.continueReading')}
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
                      {arabicUi ? `سورة ${r.surahNumber}` : `Surah ${r.surahNumber}`} · {t('home.surahLastAyah')} {r.lastAyah}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" aria-hidden />
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
          {recent.length > 0 && (
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className={cn('text-sm font-semibold text-foreground/80 flex items-center gap-2', arabicUi && 'font-arabic')}>
                  <Sparkles className="h-4 w-4 text-primary" aria-hidden /> {t('home.recentlyAsked')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {recent.slice(0, 3).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setView('ask', { question: q.question })}
                    className="w-full text-start text-sm text-foreground/80 hover:text-primary rounded-lg px-3 py-2 hover:bg-muted/70 transition-colors focus-ring line-clamp-1"
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
