'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';
import { ViewHeader, EmptyState } from '@/components/shared/view-header';
import { ArabicText, TransliterationText } from '@/components/shared/arabic-text';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { SourceRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Check,
  Info,
  Moon,
  MoonStar,
  Repeat,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
} from 'lucide-react';

// ============================================================================
// DhikrView — remembrance counters. Morning, evening, after-prayer and sleep
// dhikr. Repetition counts come ONLY from the sources — BASIRA never invents
// numbers; where none is narrated the dhikr is open-ended ("abundant", 33:41).
// ============================================================================

const DHIKR_TABS = [
  { key: 'morning', label: 'Morning', icon: Sunrise },
  { key: 'evening', label: 'Evening', icon: Sunset },
  { key: 'after-salah', label: 'After Salah', icon: MoonStar },
  { key: 'before-sleep', label: 'Before Sleep', icon: Moon },
  { key: 'general', label: 'General', icon: Sparkles },
] as const;

/**
 * The shared SourceRecord type does not yet declare `targetCount` (the DB
 * column exists on SourceText, but record-mapper.ts/types.ts have not been
 * extended — shared-file request noted in the worklog). Declaring the intended
 * shape locally keeps this view honest and forward-compatible.
 */
type DhikrRecord = SourceRecord & { targetCount?: number | null };

/**
 * Established repetition counts from BASIRA's verified seed dataset.
 * TEMPORARY client-side fallback used only while /api/content does not map
 * the `targetCount` column into its records. `record.targetCount` always
 * takes precedence once the API provides it; these values mirror the
 * reviewed database rows exactly and are always displayed together with the
 * record's own source citation.
 */
const ESTABLISHED_COUNTS: Record<string, number | null> = {
  'dhikr-me-sayyid-istighfar': 1,
  'dhikr-me-dominion': 1,
  'dhikr-me-perfect-words': 3,
  'dhikr-me-100': 100,
  'dhikr-as-istighfar': 3,
  'dhikr-as-tasbih33': 33,
  'dhikr-as-ayat-kursi': 1,
  'dhikr-as-law-hawla': 1,
  'dhikr-sleep-fatima': 33,
  'dhikr-sleep-ayat-kursi': 1,
  'dhikr-sleep-three-quls': 3,
  'dhikr-general-living': null,
  'dhikr-general-two-words': null,
};

/** Target count established by the source, or null when none is narrated. */
function establishedTarget(record: DhikrRecord): number | null {
  if (record.targetCount != null) return record.targetCount;
  const fallback = ESTABLISHED_COUNTS[record.slug];
  return fallback === undefined ? null : fallback;
}

function VerificationChip({ record }: { record: SourceRecord }) {
  if (record.verificationStatus === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-primary">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        Verified
      </span>
    );
  }
  if (record.verificationStatus === 'DISPUTED') {
    return (
      <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-[hsl(12_60%_45%)]">
        <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
        Scholars differ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-gold">
      <ShieldQuestion className="h-3.5 w-3.5" aria-hidden />
      Reference pending
    </span>
  );
}

// ————— The tap counter —————

const RING_R = 54;
const RING_CIRC = 2 * Math.PI * RING_R;
const SAVE_DEBOUNCE_MS = 800;
const LONG_PRESS_MS = 550;

function DhikrCounter({
  record,
  initialCount,
}: {
  record: DhikrRecord;
  initialCount: number;
}) {
  const { toast } = useToast();
  const openRecord = useApp((s) => s.openRecord);
  const target = establishedTarget(record);
  const [count, setCount] = React.useState(initialCount);
  const countRef = React.useRef(initialCount);
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = React.useRef(false);

  const post = (n: number) => {
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'dhikr', dhikrKey: record.slug, count: n }),
    }).catch(() => {
      /* offline — local count stands, will sync next visit */
    });
  };

  /** Coalesce rapid taps into one network save (~800ms after the last tap). */
  const persistDebounced = (n: number) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      post(n);
    }, SAVE_DEBOUNCE_MS);
  };

  // On unmount, flush any pending save so the last taps are never lost.
  React.useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        post(countRef.current);
      }
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  const tap = () => {
    const next = countRef.current + 1;
    countRef.current = next;
    setCount(next);
    persistDebounced(next);
  };

  const reset = () => {
    countRef.current = 0;
    setCount(0);
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    post(0);
  };

  const handlePointerDown = () => {
    longPressed.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressed.current = true;
      reset();
      toast({ title: 'Counter reset', description: `${record.title} — starting from zero again.` });
    }, LONG_PRESS_MS);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    // A completed long-press already reset the counter — swallow the click.
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    tap();
  };

  const complete = target != null && count >= target;
  const progress = target ? Math.min(count / target, 1) : 0;

  return (
    <article className="paper-card rounded-xl border border-border/80 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 space-y-3">
        {/* header */}
        <header className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold text-foreground leading-tight">{record.title}</h3>
            <p className="mt-1 flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground">
              <button
                onClick={() => openRecord(record)}
                className="font-medium text-foreground/70 hover:text-primary transition-colors text-left focus-ring rounded-sm"
                aria-label={`Inspect source: ${record.citation}`}
              >
                {record.citation}
              </button>
              <VerificationChip record={record} />
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => openRecord(record)}
            aria-label="Inspect full source"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
          </Button>
        </header>

        {/* text */}
        {record.arabicText ? <ArabicText text={record.arabicText} size="lg" /> : null}
        <TransliterationText text={record.transliteration} />
        <p className="text-sm text-foreground/90 leading-relaxed">{record.englishText}</p>

        {/* counter */}
        <div className="flex items-center gap-4 sm:gap-5 pt-1">
          <div className="relative shrink-0">
            <button
              type="button"
              onPointerDown={handlePointerDown}
              onPointerUp={cancelLongPress}
              onPointerLeave={cancelLongPress}
              onPointerCancel={cancelLongPress}
              onClick={handleClick}
              onContextMenu={(e) => e.preventDefault()}
              aria-label={`${record.title} counter: tap to add one, press and hold to reset`}
              className={cn(
                'relative flex h-24 w-24 sm:h-28 sm:w-28 flex-col items-center justify-center rounded-full',
                'bg-primary text-primary-foreground shadow-md select-none touch-none',
                'transition-transform duration-150 active:scale-90 focus-ring',
                complete && 'shadow-lg shadow-primary/30'
              )}
            >
              <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
                <circle
                  cx="60" cy="60" r={RING_R} fill="none"
                  stroke="currentColor" strokeWidth="4"
                  className="text-primary-foreground/25"
                />
                {target ? (
                  <circle
                    cx="60" cy="60" r={RING_R} fill="none"
                    style={{ stroke: 'var(--gold)' }}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRC}
                    strokeDashoffset={RING_CIRC * (1 - progress)}
                    className="transition-[stroke-dashoffset] duration-200"
                  />
                ) : null}
              </svg>
              <span className="relative flex flex-col items-center pointer-events-none">
                <span className="text-3xl sm:text-4xl font-bold tabular-nums leading-none" aria-live="polite">
                  <span key={count} className="animate-in zoom-in-75 duration-150 inline-block">
                    {count}
                  </span>
                </span>
                <span className="text-[0.6rem] uppercase tracking-wider opacity-80 mt-1">
                  {complete ? 'done' : 'tap'}
                </span>
              </span>
            </button>
            {target ? (
              <Badge
                className="absolute -top-1 -right-1 bg-gold text-gold-foreground font-bold rounded-full px-2 py-0.5 text-[0.7rem] shadow-sm border border-background"
                aria-hidden
              >
                ×{target}
              </Badge>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            {target ? (
              <>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Target <span className="font-semibold text-gold">×{target}</span>
                  <span className="mx-1 opacity-50">·</span>
                  <span className="font-medium text-foreground/70">{record.citation}</span>
                </p>
                {complete ? (
                  <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                    <Check className="h-4 w-4 shrink-0" aria-hidden />
                    Complete — may Allah accept it
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground tabular-nums">{count}</span>
                    <span> of {target}</span>
                    {count > 0 && target - count > 0 ? (
                      <span className="text-xs"> · {target - count} to go</span>
                    ) : null}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No fixed count is narrated — remember Allah abundantly (Qur’an 33:41).
                </p>
                <p className="text-sm text-muted-foreground">
                  Counted so far: <span className="font-semibold text-foreground tabular-nums">{count}</span>
                </p>
              </>
            )}
            <div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={reset}
                disabled={count === 0}
                aria-label={`Reset ${record.title} counter to zero`}
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>

        {/* context from the source */}
        {record.explanation ? (
          <p className="text-xs text-muted-foreground/90 leading-relaxed border-t border-border/60 pt-2.5">
            {record.explanation}
          </p>
        ) : null}
        {record.referenceNote ? (
          <p className="text-[0.7rem] italic text-gold leading-relaxed flex items-start gap-1.5">
            <ShieldQuestion className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
            {record.referenceNote}
          </p>
        ) : null}
      </div>
    </article>
  );
}

// ————— Per-tab panel —————

function DhikrTabPanel({ categoryKey }: { categoryKey: string }) {
  const [records, setRecords] = React.useState<DhikrRecord[] | null>(null);
  const [counts, setCounts] = React.useState<Record<string, number> | null>(null);

  React.useEffect(() => {
    let alive = true;
    setRecords(null);
    setCounts(null);
    fetch(`/api/content?type=DHIKR&category=${encodeURIComponent(categoryKey)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then((d: { items?: DhikrRecord[] }) => {
        if (alive) setRecords(d.items ?? []);
      })
      .catch(() => {
        if (alive) setRecords([]);
      });
    fetch('/api/progress')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then((d: { dhikr?: { today?: { dhikrKey: string; count: number }[] } }) => {
        if (!alive) return;
        const map: Record<string, number> = {};
        for (const row of d?.dhikr?.today ?? []) map[row.dhikrKey] = row.count;
        setCounts(map);
      })
      .catch(() => {
        if (alive) setCounts({});
      });
    return () => {
      alive = false;
    };
  }, [categoryKey]);

  const loading = records == null || counts == null;

  return (
    <div className="space-y-3">
      {loading ? (
        <div role="status" aria-busy="true" aria-label="Loading dhikr" className="space-y-3">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<Repeat className="h-8 w-8" aria-hidden />}
          title="No dhikr records in this set yet"
          hint="BASIRA only shows remembrance established in verified sources — nothing is invented to fill a list."
        />
      ) : (
        records.map((record) => (
          <DhikrCounter key={record.id} record={record} initialCount={counts[record.slug] ?? 0} />
        ))
      )}
    </div>
  );
}

export function DhikrView() {
  return (
    <div className="space-y-5">
      <ViewHeader
        title="Dhikr"
        titleAr="الذكر"
        description="Morning, evening, after-prayer and sleep remembrance. Repetition counts come from the sources — BASIRA never invents numbers."
      />

      <Tabs defaultValue="morning">
        <TabsList className="h-auto w-full justify-start overflow-x-auto scrollbar-soft flex-nowrap gap-0.5 p-1">
          {DHIKR_TABS.map(({ key, label, icon: Icon }) => (
            <TabsTrigger
              key={key}
              value={key}
              className="flex-none px-3 h-9 text-[0.8rem] gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {DHIKR_TABS.map(({ key }) => (
          <TabsContent key={key} value={key} className="mt-3">
            <DhikrTabPanel categoryKey={key} />
          </TabsContent>
        ))}
      </Tabs>

      {/* honest counting note */}
      <Card className="border-border/70">
        <CardContent className="p-4 flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Info className="h-[1.1rem] w-[1.1rem]" aria-hidden />
          </span>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Counts shown are only those established in the sources. Where no number is narrated, dhikr is{' '}
            <span className="font-medium text-foreground/80">“abundant”</span> (Qur’an 33:41). Your count is saved for
            today on this device only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
