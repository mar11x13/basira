'use client';

import * as React from 'react';
import { SourceCard, TypeBadge } from '@/components/shared/source-card';
import { ViewHeader, SearchBar, EmptyState } from '@/components/shared/view-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { SourceType, SearchResult } from '@/lib/types';
import { AlertTriangle, Compass, RotateCcw, SearchX } from 'lucide-react';

// ============================================================================
// SearchView — honest search across BASIRA's verified source database.
// Only verified records are ever shown; zero results are stated plainly.
// ============================================================================

const TYPE_FILTERS: { key: SourceType; label: string }[] = [
  { key: 'QURAN', label: "Qur'an" },
  { key: 'HADITH', label: 'Hadith' },
  { key: 'DUA', label: 'Dua' },
  { key: 'DHIKR', label: 'Dhikr' },
  { key: 'FIQH', label: 'Fiqh' },
  { key: 'GLOSSARY', label: 'Glossary' },
  { key: 'SEERAH', label: 'Seerah' },
  { key: 'SCHOLARLY', label: 'Scholarly' },
  { key: 'GENERAL', label: 'General' },
];

const TOPIC_CHIPS = [
  'patience',
  'anxiety',
  'wudu',
  'salah',
  'ramadan',
  'parents',
  'forgiveness',
  'jannah',
  'kindness',
  'tawbah',
  'marriage',
  'business',
];

function chipClass(active: boolean): string {
  return cn(
    'min-h-11 cursor-pointer rounded-full border px-4 py-2 text-[0.82rem] font-medium leading-snug transition-colors focus-ring',
    active
      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
      : 'border-border/70 bg-card text-foreground/75 hover:border-primary/40 hover:text-primary'
  );
}

function ResultsSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-7">
      <span className="sr-only">Searching verified sources…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-5 w-44 rounded-lg" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function SearchError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5" role="alert">
      <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <p className="flex-1 text-sm leading-relaxed text-foreground/90">{message}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="min-h-11 shrink-0 rounded-lg px-4"
        >
          <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyQueryExplainer({ onTopic }: { onTopic: (topic: string) => void }) {
  return (
    <Card className="paper-card overflow-hidden border-border/80">
      <div className="pattern-khatim pattern-fade h-1.5 w-full" aria-hidden />
      <CardContent className="p-5 text-center sm:p-7">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="h-7 w-7" aria-hidden />
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold text-foreground">What can I search?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          BASIRA&apos;s database of verified sources: the Qur&apos;an, hadith from Sahih al-Bukhari and
          other authentic collections, duas for daily situations, dhikr remembrances, practical fiqh
          guides, glossary terms, stories from the Seerah, and scholarly views. Nothing unverifiable
          is ever shown as a result.
        </p>
        <div className="ornament-line mx-auto my-5 max-w-xs" aria-hidden />
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Try a topic
        </p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Suggested topics">
          {TOPIC_CHIPS.map((topic) => (
            <li key={topic}>
              <button type="button" onClick={() => onTopic(topic)} className={chipClass(false)}>
                {topic}
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function SearchView() {
  const [query, setQuery] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [activeTypes, setActiveTypes] = React.useState<SourceType[]>([]);
  const [result, setResult] = React.useState<SearchResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const runSearch = React.useCallback(async (q: string, types: SourceType[]) => {
    const trimmed = q.trim();
    abortRef.current?.abort();
    if (!trimmed) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: trimmed });
      if (types.length > 0) params.set('types', types.join(','));
      const res = await fetch(`/api/search?${params.toString()}`, {
        signal: ctrl.signal,
        cache: 'no-store',
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `Search failed (status ${res.status}).`);
      }
      const data = (await res.json()) as SearchResult;
      setResult(data);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setResult(null);
      setError(e instanceof Error ? e.message : 'Search failed — please try again.');
    } finally {
      if (abortRef.current === ctrl) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  }, []);

  // debounce typing ~250ms
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), 250);
    return () => window.clearTimeout(t);
  }, [query]);

  // re-run search when the debounced query or the type filters change
  React.useEffect(() => {
    void runSearch(debounced, activeTypes);
  }, [debounced, activeTypes, runSearch]);

  // cancel any pending request when leaving the view
  React.useEffect(() => () => abortRef.current?.abort(), []);

  const toggleType = (key: SourceType) => {
    setActiveTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const submitSearch = () => setDebounced(query); // Enter = search immediately
  const runTopic = (topic: string) => {
    setQuery(topic);
    setDebounced(topic);
  };

  const retrySearch = () => void runSearch(debounced, activeTypes);

  return (
    <div className="space-y-5">
      <ViewHeader
        title="Search"
        titleAr="بحث"
        back
        description="Search BASIRA's verified source database — every result carries its exact reference and verification status."
      />

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={submitSearch}
        autoFocus
        placeholder="Search the Qur'an, hadith, duas, dhikr, fiqh & terms…"
        ariaLabel="Search verified sources"
      />

      {/* ————— type filters (multi-select; empty selection = All) ————— */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter results by source type">
        <button
          type="button"
          onClick={() => setActiveTypes([])}
          aria-pressed={activeTypes.length === 0}
          className={chipClass(activeTypes.length === 0)}
        >
          All
        </button>
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => toggleType(f.key)}
            aria-pressed={activeTypes.includes(f.key)}
            className={chipClass(activeTypes.includes(f.key))}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ————— results ————— */}
      {loading ? (
        <ResultsSkeleton />
      ) : error ? (
        <SearchError message={error} onRetry={retrySearch} />
      ) : result ? (
        result.total === 0 ? (
          <EmptyState
            icon={<SearchX className="h-10 w-10" />}
            title="No verified sources matched."
            hint="BASIRA never shows unverified results — try different words like ‘patience’, ‘wudu’, ‘forgiveness’."
          />
        ) : (
          <div className="space-y-7">
            <p className="text-sm text-muted-foreground" role="status">
              <span className="font-semibold tabular-nums text-primary">{result.total}</span>{' '}
              verified {result.total === 1 ? 'result' : 'results'}
            </p>
            {result.groups.map((group) => (
              <section key={group.sourceType} aria-labelledby={`group-${group.sourceType}`}>
                <header className="mb-3 flex flex-wrap items-center gap-2.5">
                  <h2
                    id={`group-${group.sourceType}`}
                    className="font-display text-lg font-semibold text-foreground"
                  >
                    {group.label}
                  </h2>
                  <TypeBadge type={group.sourceType} />
                  <Badge variant="secondary" className="tabular-nums">
                    {group.items.length}
                  </Badge>
                  <div className="ornament-line hidden flex-1 sm:block" aria-hidden />
                </header>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <SourceCard key={item.id} record={item} compact />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        <EmptyQueryExplainer onTopic={runTopic} />
      )}
    </div>
  );
}
