'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';
import { ViewHeader, EmptyState } from '@/components/shared/view-header';
import { SourceCard } from '@/components/shared/source-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  PRAYER_KEYS,
  PRAYER_LABELS,
  PRAYER_METHODS,
  HIGH_LAT_RULES,
  countdownLabel,
  getMethod,
  MOSQUE_COMPARISON_NOTE,
  MOSQUE_COMPARISON_NOTE_AR,
  HIGH_LATITUDE_NOTE,
  HIGH_LATITUDE_NOTE_AR,
  type PrayerKey,
} from '@/lib/prayer/core';
import { usePrayerTimes } from '@/lib/prayer/store';
import { CityPicker, GeolocateButton } from '@/components/prayer/city-picker';
import { useT, useUiLanguage } from '@/lib/i18n';
import type { SourceRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  CloudSun,
  HandHeart,
  Info,
  Lightbulb,
  MapPin,
  MoonStar,
  RotateCw,
  ScrollText,
  Sun,
  SunMedium,
  Sunrise,
  Sunset,
  XCircle,
} from 'lucide-react';

// ============================================================================
// SalahView — prayer times (computed locally), how to pray, wudu & purity,
// gentle rulings, and missed prayer — with school differences shown
// respectfully, never flattened.
// ============================================================================

const SALAH_TABS = [
  { key: 'times', label: 'Prayer Times' },
  { key: 'how', label: 'How to Pray' },
  { key: 'wudu', label: 'Wudu & Purity' },
  { key: 'rulings', label: 'Mistakes & Rulings' },
  { key: 'missed', label: 'Missed Prayer' },
] as const;

// ————— data helpers —————

/** Fetch records by exact slug list (order preserved by the API). */
function useSlugFetch(slugs: string, enabled = true): SourceRecord[] | null {
  const [records, setRecords] = React.useState<SourceRecord[] | null>(null);
  React.useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setRecords(null);
    fetch(`/api/content?slugs=${encodeURIComponent(slugs)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then((d: { items?: SourceRecord[] }) => {
        if (alive) setRecords(d.items ?? []);
      })
      .catch(() => {
        if (alive) setRecords([]);
      });
    return () => {
      alive = false;
    };
  }, [slugs, enabled]);
  return records;
}

function findBySlug(records: SourceRecord[] | null, slug: string): SourceRecord | null {
  return records?.find((r) => r.slug === slug) ?? null;
}

// ————— shared presentation —————

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3.5">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary text-sm font-bold"
          >
            {i + 1}
          </span>
          <p className="min-w-0 flex-1 pt-1 text-sm text-foreground/85 leading-relaxed">{step}</p>
        </li>
      ))}
    </ol>
  );
}

function GuideCard({
  record,
  withSteps = true,
  className,
}: {
  record: SourceRecord;
  withSteps?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn('paper-card border-border/80', className)}>
      <CardContent className="p-4 sm:p-5 space-y-3.5">
        <h3 className="font-display text-lg font-semibold text-foreground leading-snug">{record.title}</h3>
        <p className="text-[0.95rem] text-foreground/90 leading-relaxed">{record.englishText}</p>
        {withSteps && record.practicalSteps?.length ? <StepList steps={record.practicalSteps} /> : null}
        {record.explanation ? (
          <div className="border-t border-border/60 pt-3 text-sm text-muted-foreground leading-relaxed">
            <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider text-foreground/60">
              Notes &amp; differences between schools
            </span>
            {record.explanation}
          </div>
        ) : null}
        {record.referenceNote ? (
          <p className="border-t border-border/40 pt-2.5 text-[0.7rem] italic leading-relaxed text-muted-foreground/80">
            {record.referenceNote}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SunnahHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      <ScrollText className="h-4 w-4 text-gold" aria-hidden />
      {children}
    </h3>
  );
}

function GuideSkeletons() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading guide" className="space-y-3">
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

// ————— Tab 1: Prayer Times —————

const SIX_TIMES: {
  key: PrayerKey;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  informational?: boolean;
}[] = [
  { key: 'fajr', icon: Sunrise },
  { key: 'sunrise', icon: Sun, informational: true },
  { key: 'dhuhr', icon: SunMedium },
  { key: 'asr', icon: CloudSun },
  { key: 'maghrib', icon: Sunset },
  { key: 'isha', icon: MoonStar },
];

function TimesTab() {
  const updateProfile = useApp((s) => s.updateProfile);
  const { toast } = useToast();
  const t = useT();
  const lang = useUiLanguage();
  const arabic = lang === 'ar';
  // ONE source of truth — the shared prayer store (computed post-hydration
  // by PrayerProvider). Nothing is calculated inside this component.
  const prayer = usePrayerTimes(arabic ? 'ar' : 'en');

  const labelFor = (k: PrayerKey) => (arabic ? PRAYER_LABELS[k].ar : PRAYER_LABELS[k].en);

  // ——— honest error state — never fabricated times ———
  if (prayer.status === 'error') {
    return (
      <Card className="paper-card border-border/80" role="alert">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className={cn('text-sm font-semibold text-foreground', arabic && 'font-arabic')}>{t('prayer.unavailable')}</p>
              <p className={cn('text-xs text-muted-foreground mt-1 leading-relaxed', arabic && 'font-arabic')}>{t('prayer.unavailableSub')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={prayer.retry} className="h-11 rounded-xl">
              <RotateCw className="h-4 w-4 me-2" aria-hidden /> {t('prayer.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ——— deterministic skeleton (this is also the SSR render — identical
  // markup on server and client, so hydration can never mismatch) ———
  if (!prayer.ready || !prayer.snapshot) {
    return (
      <div role="status" aria-busy="true" aria-label="Computing prayer times" className="space-y-3">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const { snapshot, next, current, msUntilNext, fmt } = prayer;
  const method = getMethod(snapshot.settings.methodKey);
  const location = snapshot.location;

  const onMethodChange = async (v: string) => {
    try {
      await updateProfile({ prayerMethod: v });
      toast({ title: t('prayer.methodUpdated'), description: arabic ? getMethod(v).nameAr : getMethod(v).name });
    } catch {
      toast({ title: t('prayer.methodSaveFailed'), variant: 'destructive' });
    }
  };

  const onAsrChange = (factor: 1 | 2) => {
    if ((factor === 2) === (snapshot.settings.asrJuristic === 'hanafi')) return;
    updateProfile({ asrFactor: factor }).catch(() => {
      toast({ title: t('prayer.asrSaveFailed'), variant: 'destructive' });
    });
  };

  const onHighLatChange = (v: string) => {
    if (v === snapshot.settings.highLatRule) return;
    updateProfile({ highLatRule: v }).catch(() => {
      toast({ title: t('prayer.saveFailed'), variant: 'destructive' });
    });
  };

  const onTimeFormatChange = (v: '12h' | '24h') => {
    if (v === snapshot.settings.timeFormat) return;
    updateProfile({ timeFormat: v }).catch(() => {
      toast({ title: t('prayer.saveFailed'), variant: 'destructive' });
    });
  };

  const clearLocation = () => {
    updateProfile({ clearLocation: true }).catch(() => {
      toast({ title: t('prayer.saveFailed'), variant: 'destructive' });
    });
  };

  const locationLabel = location.isDefault ? t('home.makkahDefault') : location.city || t('home.yourLocation');
  const coordsLabel = `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`;
  const selectedHighLat = HIGH_LAT_RULES.find((r) => r.key === snapshot.settings.highLatRule) ?? HIGH_LAT_RULES[0];
  const isHighLat = Math.abs(location.latitude) >= 48;

  return (
    <div className="space-y-4">
      {/* ————— Next prayer ————— */}
      <Card className="paper-card overflow-hidden border-border/80">
        <div className="pattern-khatim pattern-fade h-1.5 w-full" aria-hidden />
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
              <Clock className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-2 flex-wrap',
                  arabic && 'font-arabic tracking-normal'
                )}
              >
                {t('home.nextPrayer')}
                {next?.tomorrow ? <Badge variant="secondary" className="text-[0.6rem]">{t('home.tomorrow')}</Badge> : null}
              </p>
              {next ? (
                <p className={cn('font-display text-2xl sm:text-3xl font-semibold text-foreground leading-tight', arabic && 'font-arabic')}>
                  {labelFor(next.key)}
                  <span className="text-muted-foreground mx-1.5">·</span>
                  <span className="tabular-nums">{fmt(next.instant)}</span>
                </p>
              ) : (
                <p className="font-display text-2xl font-semibold text-foreground">{t('home.prayerTimes')}</p>
              )}
            </div>
            {msUntilNext != null ? (
              <div className="text-end shrink-0">
                <p className="text-2xl sm:text-3xl font-bold text-primary tabular-nums leading-none">
                  {countdownLabel(msUntilNext, arabic ? 'ar' : 'en')}
                </p>
                <p
                  className={cn(
                    'mt-1 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground',
                    arabic && 'font-arabic tracking-normal'
                  )}
                >
                  {t('home.remaining')}
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* ————— Today's times ————— */}
      <ul
        className="paper-card rounded-xl border border-border/80 overflow-hidden divide-y divide-border/60"
        role="list"
        aria-label={t('home.prayerTimes')}
      >
        {SIX_TIMES.map(({ key, icon: Icon, informational }) => {
          const isNext = next != null && next.key === key && !next.tomorrow;
          const isCurrent = current === key && !informational;
          return (
            <li key={key} className={cn('flex items-center gap-3 px-4 py-3 min-h-[44px]', isNext && 'bg-primary/10')}>
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  isNext ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                )}
              >
                <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm font-semibold text-foreground leading-tight', arabic && 'font-arabic')}>
                  {labelFor(key)}
                  <span className={cn('text-sm font-normal text-muted-foreground ms-2', !arabic && 'font-arabic')}>
                    {arabic ? PRAYER_LABELS[key].en : PRAYER_LABELS[key].ar}
                  </span>
                  {informational ? (
                    <Badge variant="secondary" className="ms-2 text-[0.6rem] align-middle">{t('prayer.informational')}</Badge>
                  ) : null}
                </p>
                {isNext && next ? (
                  <p className={cn('mt-0.5 text-xs text-primary', arabic && 'font-arabic')}>
                    {t('home.nextPrayer')} — {countdownLabel(msUntilNext ?? 0, arabic ? 'ar' : 'en')}
                  </p>
                ) : isCurrent ? (
                  <p className={cn('mt-0.5 text-xs text-primary/80', arabic && 'font-arabic')}>{t('prayer.inProgress')}</p>
                ) : null}
              </div>
              <p className={cn('shrink-0 text-base font-semibold tabular-nums', isNext ? 'text-primary' : 'text-foreground/90')}>
                {fmt(snapshot.times[key])}
              </p>
            </li>
          );
        })}
      </ul>

      {/* ————— Method, Asr, high latitude, time format ————— */}
      <Card className="border-border/80">
        <CardContent className="p-4 sm:p-5 space-y-5">
          <div className="space-y-2">
            <label htmlFor="prayer-method" className={cn('text-sm font-semibold text-foreground', arabic && 'font-arabic')}>
              {t('prayer.method')}
            </label>
            <Select value={snapshot.settings.methodKey} onValueChange={onMethodChange}>
              <SelectTrigger id="prayer-method" className="w-full h-11! rounded-xl" aria-label={t('prayer.method')}>
                <SelectValue placeholder={t('prayer.methodPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {PRAYER_METHODS.map((m) => (
                  <SelectItem key={m.key} value={m.key} className="py-2.5">
                    {arabic ? m.nameAr : m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className={cn('text-xs text-muted-foreground leading-relaxed', arabic && 'font-arabic')}>
              {arabic ? method.descriptionAr : method.description}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className={cn('text-sm font-semibold text-foreground', arabic && 'font-arabic')}>{t('prayer.asr')}</p>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('prayer.asr')}>
              <button
                type="button"
                role="radio"
                aria-checked={snapshot.settings.asrJuristic === 'standard'}
                onClick={() => onAsrChange(1)}
                className={cn(
                  'min-h-[52px] rounded-xl border px-3 py-2 text-start transition-colors focus-ring',
                  snapshot.settings.asrJuristic === 'standard'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground/80 hover:border-primary/40'
                )}
              >
                <span className={cn('block text-sm font-semibold', arabic && 'font-arabic')}>{t('prayer.asrStandard')}</span>
                <span className="block text-[0.7rem] leading-snug opacity-80">{t('prayer.asrStandardSub')}</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={snapshot.settings.asrJuristic === 'hanafi'}
                onClick={() => onAsrChange(2)}
                className={cn(
                  'min-h-[52px] rounded-xl border px-3 py-2 text-start transition-colors focus-ring',
                  snapshot.settings.asrJuristic === 'hanafi'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground/80 hover:border-primary/40'
                )}
              >
                <span className={cn('block text-sm font-semibold', arabic && 'font-arabic')}>{t('prayer.asrHanafi')}</span>
                <span className="block text-[0.7rem] leading-snug opacity-80">{t('prayer.asrHanafiSub')}</span>
              </button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <label htmlFor="prayer-highlat" className={cn('text-sm font-semibold text-foreground', arabic && 'font-arabic')}>
              {t('prayer.highLat')}
            </label>
            <Select value={snapshot.settings.highLatRule} onValueChange={onHighLatChange}>
              <SelectTrigger id="prayer-highlat" className="w-full h-11! rounded-xl" aria-label={t('prayer.highLat')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HIGH_LAT_RULES.map((r) => (
                  <SelectItem key={r.key} value={r.key} className="py-2.5">
                    {arabic ? r.nameAr : r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className={cn('text-xs text-muted-foreground leading-relaxed', arabic && 'font-arabic')}>
              {arabic ? selectedHighLat.descriptionAr : selectedHighLat.description}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className={cn('text-sm font-semibold text-foreground', arabic && 'font-arabic')}>{t('prayer.timeFormat')}</p>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('prayer.timeFormat')}>
              {(['12h', '24h'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={snapshot.settings.timeFormat === v}
                  onClick={() => onTimeFormatChange(v)}
                  className={cn(
                    'min-h-[44px] rounded-xl border px-3 py-2 text-sm font-medium transition-colors focus-ring',
                    snapshot.settings.timeFormat === v
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-foreground/80 hover:border-primary/40'
                  )}
                >
                  {v === '12h' ? `12 ${t('prayer.hour')}` : `24 ${t('prayer.hour')}`}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ————— Location ————— */}
      <Card className="border-border/80">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <p className={cn('text-sm font-semibold text-foreground', arabic && 'font-arabic')}>{t('prayer.location')}</p>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className={cn('truncate text-sm font-medium text-foreground', arabic && 'font-arabic')}>{locationLabel}</p>
              <p className="text-xs text-muted-foreground tabular-nums truncate">
                {coordsLabel} · {location.timezone}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CityPicker />
            <GeolocateButton />
          </div>
          {!location.isDefault ? (
            <Button
              variant="ghost"
              onClick={clearLocation}
              className="h-11 rounded-xl text-muted-foreground"
            >
              <XCircle className="h-4 w-4 me-2" aria-hidden /> {t('prayer.clearLocation')}
            </Button>
          ) : null}
          <p className={cn('text-xs text-muted-foreground leading-relaxed', arabic && 'font-arabic')}>
            {t('prayer.locationPrivacy')}
          </p>
        </CardContent>
      </Card>

      <p className={cn('flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed', arabic && 'font-arabic')}>
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
        {arabic ? MOSQUE_COMPARISON_NOTE_AR : MOSQUE_COMPARISON_NOTE}
      </p>
      {isHighLat ? (
        <p className={cn('flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed', arabic && 'font-arabic')}>
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
          {arabic ? HIGH_LATITUDE_NOTE_AR : HIGH_LATITUDE_NOTE}
        </p>
      ) : null}
    </div>
  );
}

// ————— Tab 2: How to Pray —————

function HowToTab() {
  const records = useSlugFetch('fiqh-how-to-pray,fiqh-prayer-times-overview,hadith-bukhari-631');
  const howTo = findBySlug(records, 'fiqh-how-to-pray');
  const overview = findBySlug(records, 'fiqh-prayer-times-overview');
  const hadith = findBySlug(records, 'hadith-bukhari-631');

  if (!records) return <GuideSkeletons />;
  if (!howTo && !overview) {
    return (
      <EmptyState
        icon={<MoonStar className="h-8 w-8" aria-hidden />}
        title="Guide unavailable"
        hint="The step-by-step prayer guide could not be loaded. Please try again in a moment."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-gold/40 bg-gold/5">
        <CardContent className="flex items-start gap-3 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Lightbulb className="h-[1.1rem] w-[1.1rem]" aria-hidden />
          </span>
          <p className="text-sm text-foreground/85 leading-relaxed">
            <span className="font-semibold text-foreground">Beginner note: </span>
            The five prayers differ only in rakʿah count — learn one, and you know them all.
          </p>
        </CardContent>
      </Card>

      {howTo ? <GuideCard record={howTo} /> : null}
      {overview ? <GuideCard record={overview} withSteps={false} /> : null}

      {hadith ? (
        <section aria-label="Related hadith" className="space-y-2">
          <SunnahHeading>From the Sunnah</SunnahHeading>
          <SourceCard record={hadith} defaultOpen />
        </section>
      ) : null}
    </div>
  );
}

// ————— Tab 3: Wudu & Purity —————

function WuduTab() {
  const records = useSlugFetch('fiqh-wudu-steps,fiqh-wudu-breaks,fiqh-ghusl,fiqh-tayammum,hadith-bukhari-164');
  const wuduSteps = findBySlug(records, 'fiqh-wudu-steps');
  const wuduBreaks = findBySlug(records, 'fiqh-wudu-breaks');
  const ghusl = findBySlug(records, 'fiqh-ghusl');
  const tayammum = findBySlug(records, 'fiqh-tayammum');
  const hadith = findBySlug(records, 'hadith-bukhari-164');

  if (!records) return <GuideSkeletons />;
  if (!wuduSteps && !wuduBreaks && !ghusl && !tayammum) {
    return (
      <EmptyState
        icon={<HandHeart className="h-8 w-8" aria-hidden />}
        title="Guide unavailable"
        hint="The purity guides could not be loaded. Please try again in a moment."
      />
    );
  }

  return (
    <div className="space-y-4">
      {wuduSteps ? <GuideCard record={wuduSteps} /> : null}

      {hadith ? (
        <section aria-label="Uthman's demonstration of wudu" className="space-y-2">
          <SunnahHeading>Uthman’s demonstration of wudu</SunnahHeading>
          <SourceCard record={hadith} />
        </section>
      ) : null}

      {wuduBreaks ? <GuideCard record={wuduBreaks} withSteps={false} /> : null}
      {ghusl ? <GuideCard record={ghusl} /> : null}
      {tayammum ? <GuideCard record={tayammum} withSteps={false} /> : null}
    </div>
  );
}

// ————— Tab 4: Mistakes & Rulings —————

function RulingsTab() {
  const records = useSlugFetch('fiqh-prayer-mistakes,fiqh-prayer-invalidators');
  const mistakes = findBySlug(records, 'fiqh-prayer-mistakes');
  const invalidators = findBySlug(records, 'fiqh-prayer-invalidators');

  const [witrOpen, setWitrOpen] = React.useState(false);
  const [handsOpen, setHandsOpen] = React.useState(false);
  const witrRecords = useSlugFetch('fiqh-witr-positions,hadith-abudawud-1416', witrOpen);
  const handsRecords = useSlugFetch('scholarly-hands-position', handsOpen);
  const witrGuide = findBySlug(witrRecords, 'fiqh-witr-positions');
  const witrHadith = findBySlug(witrRecords, 'hadith-abudawud-1416');
  const handsView = findBySlug(handsRecords, 'scholarly-hands-position');

  if (!records) return <GuideSkeletons />;

  return (
    <div className="space-y-4">
      {mistakes ? <GuideCard record={mistakes} /> : null}
      {invalidators ? <GuideCard record={invalidators} withSteps={false} /> : null}

      <section aria-label="Common questions" className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Common questions</h3>

        {/* Witr */}
        <Collapsible open={witrOpen} onOpenChange={setWitrOpen}>
          <CollapsibleTrigger
            className={cn(
              'flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-left',
              'border-primary/25 bg-primary/5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors focus-ring'
            )}
            aria-label="What about Witr differences? Expand for the answer"
          >
            What about Witr differences?
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 transition-transform', witrOpen && 'rotate-180')}
              aria-hidden
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-3">
            {witrRecords == null ? (
              <Skeleton className="h-40 rounded-xl" />
            ) : (
              <>
                {witrGuide ? <GuideCard record={witrGuide} withSteps={false} /> : null}
                {witrHadith ? <SourceCard record={witrHadith} /> : null}
              </>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Hands position */}
        <Collapsible open={handsOpen} onOpenChange={setHandsOpen}>
          <CollapsibleTrigger
            className={cn(
              'flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-left',
              'border-primary/25 bg-primary/5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors focus-ring'
            )}
            aria-label="Where to place the hands in prayer? Expand for the answer"
          >
            Where to place hands?
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 transition-transform', handsOpen && 'rotate-180')}
              aria-hidden
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-3">
            {handsRecords == null ? (
              <Skeleton className="h-40 rounded-xl" />
            ) : handsView ? (
              <SourceCard record={handsView} />
            ) : null}
          </CollapsibleContent>
        </Collapsible>
      </section>
    </div>
  );
}

// ————— Tab 5: Missed Prayer —————

function MissedTab() {
  const records = useSlugFetch('fiqh-missed-prayer,hadith-bukhari-597,hadith-bukhari-asr-warning');
  const guide = findBySlug(records, 'fiqh-missed-prayer');
  const mercyHadith = findBySlug(records, 'hadith-bukhari-597');
  const asrWarning = findBySlug(records, 'hadith-bukhari-asr-warning');

  if (!records) return <GuideSkeletons />;

  return (
    <div className="space-y-4">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <HandHeart className="h-[1.1rem] w-[1.1rem]" aria-hidden />
          </span>
          <p className="text-sm text-foreground/85 leading-relaxed">
            <span className="font-semibold text-foreground">Mercy first. </span>
            Forgetting is human — Islam’s answer is not guilt but a simple instruction: pray it as soon as you
            remember. For long-standing chronic cases, scholars differ respectfully, and BASIRA points you to them
            rather than inventing one blanket ruling.
          </p>
        </CardContent>
      </Card>

      {guide ? <GuideCard record={guide} withSteps={false} /> : null}

      {mercyHadith || asrWarning ? (
        <section aria-label="Related hadith" className="space-y-2">
          <SunnahHeading>From the Sunnah</SunnahHeading>
          {mercyHadith ? <SourceCard record={mercyHadith} defaultOpen /> : null}
          {asrWarning ? <SourceCard record={asrWarning} /> : null}
        </section>
      ) : null}
    </div>
  );
}

// ————— View —————

export function SalahView() {
  return (
    <div className="space-y-5">
      <ViewHeader
        title="Salah"
        titleAr="الصلاة"
        description="Learn prayer step by step — beginner-friendly, with the beautiful differences between schools shown respectfully."
      />

      <Tabs defaultValue="times">
        <TabsList className="h-auto w-full justify-start overflow-x-auto scrollbar-soft flex-nowrap gap-0.5 p-1">
          {SALAH_TABS.map(({ key, label }) => (
            <TabsTrigger key={key} value={key} className="flex-none px-3 h-11 text-[0.8rem]">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="times" className="mt-3">
          <TimesTab />
        </TabsContent>
        <TabsContent value="how" className="mt-3">
          <HowToTab />
        </TabsContent>
        <TabsContent value="wudu" className="mt-3">
          <WuduTab />
        </TabsContent>
        <TabsContent value="rulings" className="mt-3">
          <RulingsTab />
        </TabsContent>
        <TabsContent value="missed" className="mt-3">
          <MissedTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
