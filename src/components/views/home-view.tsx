'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';
import { useT, useUiLanguage } from '@/lib/i18n';
import { SourceCard } from '@/components/shared/source-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { usePrayerTimes } from '@/lib/prayer/store';
import { PRAYER_KEYS, PRAYER_LABELS, countdownLabel, getMethod, type PrayerKey } from '@/lib/prayer/core';
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
  AlertTriangle,
  RotateCw,
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
  // NOTE: only ever called inside an effect (post-hydration) — the initial
  // render shows a deterministic placeholder so server HTML === client HTML.
  const h = new Date().getHours();
  if (h < 5) return { salam: t('home.lateNight'), sub: t('home.lateNightSub') };
  if (h < 12) return { salam: t('home.morning'), sub: t('home.morningSub') };
  if (h < 17) return { salam: t('home.afternoon'), sub: t('home.afternoonSub') };
  return { salam: t('home.evening'), sub: t('home.eveningSub') };
}

/** Arabic names for the five prayers + sunrise (stable mapping — never runtime-translated). */
const PRAYER_LABELS_AR: Record<string, string> = Object.fromEntries(
  PRAYER_KEYS.map((k) => [k, PRAYER_LABELS[k].ar]),
);

// ————— deterministic shimmer primitives (identical on server & client) —————

function ShimmerBar({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted/70', className)} aria-hidden />;
}

function PrayerStripSkeleton() {
  // Same card geometry as the live strip: layout never shifts when the live
  // data lands. Contains NO time/location text → nothing to mismatch.
  return (
    <Card className="paper-card overflow-hidden border-border/80">
      <div className="pattern-khatim pattern-fade h-1.5 w-full" aria-hidden />
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
              <Clock className="h-5 w-5" aria-hidden />
            </span>
            <div className="space-y-2">
              <ShimmerBar className="h-3.5 w-20" />
              <ShimmerBar className="h-6 w-44 max-w-full" />
            </div>
          </div>
          <div className="space-y-2 text-end">
            <ShimmerBar className="h-8 w-20" />
            <ShimmerBar className="h-2.5 w-14 ms-auto" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-6 gap-1" aria-hidden>
          {PRAYER_KEYS.map((k) => (
            <div key={k} className="rounded-lg bg-muted/70 py-1.5 px-0.5 space-y-1.5">
              <ShimmerBar className="h-2.5 w-full rounded-sm" />
              <ShimmerBar className="h-3 w-full rounded-sm" />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <ShimmerBar className="h-3.5 w-52 max-w-[60%]" />
          <span className="h-11" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}

function PrayerStrip() {
  const setView = useApp((s) => s.setView);
  const t = useT();
  const lang = useUiLanguage();
  const arabic = lang === 'ar';
  // ONE source of truth: the shared prayer store (computed post-hydration by
  // PrayerProvider — never during SSR, so the initial render is identical on
  // both sides).
  const prayer = usePrayerTimes(arabic ? 'ar' : 'en');

  const labelFor = (k: PrayerKey) => (arabic ? PRAYER_LABELS_AR[k] : PRAYER_LABELS[k].en);

  if (prayer.status === 'error') {
    return (
      <Card className="paper-card overflow-hidden border-border/80" role="alert">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{t('prayer.unavailable')}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t('prayer.unavailableSub')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={prayer.retry} className="h-11 rounded-xl">
              <RotateCw className="h-4 w-4 me-2" aria-hidden /> {t('prayer.retry')}
            </Button>
            <Button variant="outline" onClick={() => setView('salah')} className="h-11 rounded-xl">
              <MapPin className="h-4 w-4 me-2" aria-hidden /> {t('prayer.locationSettings')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prayer.ready || !prayer.snapshot) {
    return <PrayerStripSkeleton />;
  }

  const { snapshot, next, current, msUntilNext, fmt } = prayer;

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
                    {labelFor(next.key)} · {fmt(next.instant)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t('home.prayerTimes')}</p>
              )}
            </div>
          </div>
          <div className="text-end">
            {msUntilNext != null && (
              <>
                <p className="text-2xl font-bold text-primary tabular-nums leading-none">
                  {countdownLabel(msUntilNext, arabic ? 'ar' : 'en')}
                </p>
                <p className="text-[0.65rem] text-muted-foreground mt-1 uppercase tracking-wider">{t('home.remaining')}</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-6 gap-1 text-center" role="list" aria-label={t('home.prayerTimes')}>
          {PRAYER_KEYS.map((k) => {
            const isNext = next?.key === k && !next.tomorrow;
            const isInfo = k === 'sunrise';
            const timeText = fmt(snapshot.times[k]).replace(/\s?(AM|PM|ص|م)/, '');
            const passed = !isNext && current != null && PRAYER_KEYS.indexOf(k) <= PRAYER_KEYS.indexOf(current) && k !== 'sunrise';
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
                  passed && 'opacity-55'
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
                  {timeText}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[0.68rem] text-muted-foreground flex items-center gap-1 min-w-0">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">
              {snapshot.location.isDefault
                ? t('home.makkahDefault')
                : snapshot.location.city || t('home.yourLocation')}
              <span className="mx-1 opacity-50">·</span>
              {arabic ? getMethod(snapshot.settings.methodKey).nameAr : getMethod(snapshot.settings.methodKey).name}
            </span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-11 px-3 text-xs text-primary rounded-lg"
            onClick={() => setView('salah')}
          >
            {t('home.prayerGuide')} <ChevronRight className="h-3.5 w-3.5 ms-0.5 rtl:rotate-180" aria-hidden />
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
  // Time-aware greeting — computed ONLY after hydration (a render-time
  // new Date() here would differ between server and client → hydration
  // mismatch). Initial render: deterministic non-breaking placeholder.
  const [g, setG] = React.useState<{ salam: string; sub: string } | null>(null);
  const arabicUi = lang === 'ar';

  React.useEffect(() => {
    setG(greeting(t));
  }, [t]);

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
            <p className="text-sm text-muted-foreground mt-1 min-h-[1.25rem]" aria-live="polite">
              {g ? (
                <>
                  {g.salam}
                  {profile?.displayName ? `, ${profile.displayName}` : ''} — {g.sub}
                </>
              ) : (
                '\u00A0'
              )}
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
