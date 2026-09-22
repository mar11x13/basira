'use client';

import * as React from 'react';
import { SourceCard } from '@/components/shared/source-card';
import { ViewHeader, EmptyState } from '@/components/shared/view-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { SourceRecord } from '@/lib/types';
import { BookOpen, Check, HandHeart, Landmark, Moon, Mountain, RefreshCw, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// SeerahView — the Prophet's ﷺ life as an honest, sourced vertical timeline.
// Grouped by era; each event renders through SourceCard so its citation,
// verification badge, and explanation are always one tap away.
// ============================================================================

interface EraDef {
  key: string;
  title: string;
  titleAr: string;
  range: string;
  chipFallback: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ERAS: EraDef[] = [
  {
    key: 'early-makkah',
    title: 'Early Life in Makkah',
    titleAr: 'النشأة في مكة',
    range: 'c. 570 – 595 CE',
    chipFallback: 'Makkah · early years',
    icon: Moon,
  },
  {
    key: 'revelation',
    title: 'The Revelation',
    titleAr: 'الوحي',
    range: '610 CE',
    chipFallback: 'The Revelation',
    icon: BookOpen,
  },
  {
    key: 'makkah-period',
    title: 'Years in Makkah',
    titleAr: 'سنوات الدعوة',
    range: '610 – 619 CE',
    chipFallback: 'Makkah period',
    icon: Mountain,
  },
  {
    key: 'madinah-period',
    title: 'The Madinah Period',
    titleAr: 'العهد المدني',
    range: '622 – 630 CE',
    chipFallback: 'Madinah',
    icon: Landmark,
  },
  {
    key: 'final-days',
    title: 'The Final Days',
    titleAr: 'الأيام الأخيرة',
    range: '10 – 11 AH · 632 CE',
    chipFallback: 'Final days',
    icon: HandHeart,
  },
];

/**
 * Chronological order within eras, from the verified seed dataset. The content
 * API does not expose `sortOrder`, so this map keeps the timeline in order;
 * records unknown to it keep their API order at the end of their era.
 */
const CHRONOLOGICAL_SLUGS = [
  'seerah-birth',
  'seerah-aminah',
  'seerah-al-amin',
  'seerah-first-revelation',
  'seerah-persecution',
  'seerah-year-of-sorrow',
  'seerah-hijra',
  'seerah-badr',
  'seerah-uhud-trench',
  'seerah-hudaybiyyah',
  'seerah-conquest',
  'seerah-farewell',
];
const CHRONO = new Map(CHRONOLOGICAL_SLUGS.map((slug, i) => [slug, i]));

/** Extract a year/era chip from a title like "Birth of the Prophet ﷺ (c. 570 CE, Makkah)". */
function parseYearChip(title: string): string | null {
  const match = title.match(/\(([^()]*\b(?:CE|AH)\b[^()]*)\)/i);
  return match ? match[1].trim() : null;
}

/** The display title without the year parenthetical (it becomes the timeline chip). */
function displayTitle(title: string, chip: string | null): string {
  if (!chip) return title;
  const stripped = title
    .replace(`(${chip})`, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[—–-]\s*$/, '')
    .trim();
  return stripped || title;
}

/** Horizontal position of the timeline rail (mobile ~20px, slightly wider on desktop). */
const RAIL_X = 'left-[11px] sm:left-[15px]';

export function SeerahView() {
  const [items, setItems] = React.useState<SourceRecord[] | null>(null);
  const [error, setError] = React.useState(false);

  const load = React.useCallback(() => {
    setError(false);
    fetch('/api/content?type=SEERAH')
      .then((r) => {
        if (!r.ok) throw new Error('load failed');
        return r.json();
      })
      .then((d) => setItems(Array.isArray(d.items) ? d.items : []))
      .catch(() => setError(true));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const eras = React.useMemo(() => {
    if (!items) return [];
    const rank = new Map(ERAS.map((e, i) => [e.key, i]));
    const sorted = [...items].sort((a, b) => {
      const eraA = rank.get(a.category ?? '') ?? 90;
      const eraB = rank.get(b.category ?? '') ?? 90;
      if (eraA !== eraB) return eraA - eraB;
      return (CHRONO.get(a.slug) ?? 500) - (CHRONO.get(b.slug) ?? 500);
    });
    const groups = ERAS.map((era) => ({
      era,
      records: sorted.filter((r) => (r.category ?? '') === era.key),
    }));
    const known = new Set(ERAS.map((e) => e.key));
    const others = sorted.filter((r) => !known.has(r.category ?? ''));
    if (others.length > 0) {
      groups.push({
        era: {
          key: '__other',
          title: 'Further Reports',
          titleAr: 'روايات أخرى',
          range: '',
          chipFallback: 'Seerah',
          icon: BookOpen,
        },
        records: others,
      });
    }
    return groups.filter((g) => g.records.length > 0);
  }, [items]);

  return (
    <div className="space-y-6">
      <ViewHeader
        back
        title="Seerah — The Prophet's Life"
        titleAr="السيرة النبوية"
        description="The life of Prophet Muhammad ﷺ from trusted reports. Each event shows its source; disputed reports are labeled — BASIRA never invents history."
      />

      {/* ————— Scope & honesty principle ————— */}
      <Card className="paper-card overflow-hidden border-border/80">
        <div className="pattern-khatim pattern-fade h-1.5 w-full" aria-hidden />
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-2.5">
              <h2 className="font-display text-lg font-semibold text-foreground">An honest narration</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                From the birth in Makkah to the farewell pilgrimage — this timeline follows the classical
                biography (Ibn Ishaq / Ibn Hisham) alongside the Qur&apos;an and Sahih al-Bukhari &amp; Muslim.
              </p>
              <ul className="space-y-1.5 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>Every event below shows its exact source — each citation can be inspected.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>Disputed or weaker reports are labeled as such — never silently mixed in.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>BASIRA never invents history: what cannot be sourced is simply not written.</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ————— Timeline ————— */}
      {error ? (
        <div className="text-center py-6">
          <EmptyState
            icon={<RefreshCw className="h-8 w-8" aria-hidden />}
            title="Could not load the Seerah timeline"
            hint="Your connection may have dropped. BASIRA never fabricates content, so nothing is shown without its source — please try again."
          />
          <Button variant="outline" size="lg" className="mt-1 rounded-xl" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
            Try again
          </Button>
        </div>
      ) : !items ? (
        <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading the Seerah timeline">
          <Skeleton className="h-32 rounded-xl" />
          <div className="space-y-7 pl-9">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      ) : eras.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-9 w-9" aria-hidden />}
          title="The Seerah records are being prepared"
          hint="Verified events will appear here as soon as they pass BASIRA's review."
        />
      ) : (
        <div className="relative">
          {/* the rail */}
          <div
            aria-hidden
            className={cn(
              'absolute top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-primary/25 to-transparent',
              RAIL_X
            )}
          />
          <div className="space-y-9 sm:space-y-10">
            {eras.map(({ era, records }) => {
              const Icon = era.icon;
              return (
                <section key={era.key} aria-labelledby={`seerah-era-${era.key}`}>
                  <header className={cn('relative pl-9 sm:pl-12 pb-4')}>
                    <span
                      aria-hidden
                      className={cn(
                        'absolute top-0.5 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm',
                        RAIL_X
                      )}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <h2
                        id={`seerah-era-${era.key}`}
                        className="font-display text-xl font-semibold text-foreground leading-tight"
                      >
                        {era.title}
                      </h2>
                      <span className="font-arabic text-base text-muted-foreground">{era.titleAr}</span>
                    </div>
                    {era.range && (
                      <p className="mt-0.5 text-xs tracking-wide text-muted-foreground/90">{era.range}</p>
                    )}
                  </header>

                  <ol className="space-y-6">
                    {records.map((record) => {
                      const chip = parseYearChip(record.title);
                      const heading = displayTitle(record.title, chip);
                      return (
                        <li key={record.slug} className="relative pl-9 sm:pl-12">
                          <span
                            aria-hidden
                            className={cn(
                              'absolute top-[5px] -translate-x-1/2 h-[9px] w-[9px] rounded-full bg-primary ring-4 ring-primary/15',
                              RAIL_X
                            )}
                          />
                          <div className="space-y-1.5 sm:max-w-2xl">
                            <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[0.62rem] font-semibold tracking-wide text-gold">
                              {chip ?? era.chipFallback}
                            </span>
                            <h3 className="font-display text-base sm:text-lg font-semibold text-foreground leading-snug">
                              {heading}
                            </h3>
                          </div>
                          <SourceCard record={record} compact className="mt-2.5 sm:max-w-2xl" />
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
