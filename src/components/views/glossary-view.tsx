'use client';

import * as React from 'react';
import { SourceCard } from '@/components/shared/source-card';
import { ViewHeader, SearchBar, EmptyState } from '@/components/shared/view-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { SourceRecord } from '@/lib/types';
import { BookOpen, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// GlossaryView — Islamic terms explained simply (the backbone of Beginner
// Mode). Client-side search + category chips; each term renders through
// SourceCard so its Arabic, definition, explanation, and verification status
// stay consistent with the rest of BASIRA.
// ============================================================================

const CATEGORY_ORDER = [
  'worship',
  'purity',
  'sources',
  'fiqh',
  'aqeedah',
  'hereafter',
  'time',
  'history',
  'finance',
  'spirituality',
];

const CATEGORY_LABELS: Record<string, string> = {
  worship: 'Worship',
  purity: 'Purity',
  sources: 'Sources',
  fiqh: 'Fiqh',
  aqeedah: 'Aqeedah',
  hereafter: 'Hereafter',
  time: 'Time & Seasons',
  history: 'History',
  finance: 'Finance',
  spirituality: 'Spirituality',
};

function categoryLabel(category: string | null | undefined): string {
  const c = (category ?? '').trim().toLowerCase();
  if (!c) return 'Term';
  return CATEGORY_LABELS[c] ?? c.charAt(0).toUpperCase() + c.slice(1);
}

function normalizedCategory(record: SourceRecord): string {
  return (record.category ?? '').trim().toLowerCase();
}

export function GlossaryView() {
  const [items, setItems] = React.useState<SourceRecord[] | null>(null);
  const [query, setQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [error, setError] = React.useState(false);

  const load = React.useCallback(() => {
    setError(false);
    fetch('/api/content?type=GLOSSARY')
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

  /** 'all' + every category present in the data (preferred order first, extras after). */
  const categories = React.useMemo(() => {
    const present = new Set((items ?? []).map(normalizedCategory).filter(Boolean));
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
    const extras = [...present].filter((c) => !CATEGORY_ORDER.includes(c));
    return ['all', ...ordered, ...extras];
  }, [items]);

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const record of items ?? []) {
      const c = normalizedCategory(record) || 'other';
      map.set(c, (map.get(c) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter((record) => {
      if (activeCategory !== 'all' && normalizedCategory(record) !== activeCategory) return false;
      if (!q) return true;
      return (
        record.title.toLowerCase().includes(q) ||
        record.englishText.toLowerCase().includes(q) ||
        (record.explanation ?? '').toLowerCase().includes(q) ||
        record.topics.some((t) => t.toLowerCase().includes(q)) ||
        record.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [items, query, activeCategory]);

  return (
    <div className="space-y-5">
      <ViewHeader
        back
        title="Islamic Glossary"
        titleAr="المعجم"
        description="Islamic terms explained simply — the backbone of Beginner Mode."
      />

      {error ? (
        <div className="text-center py-8">
          <EmptyState
            icon={<RotateCcw className="h-8 w-8" aria-hidden />}
            title="Could not load the glossary"
            hint="Your connection may have dropped — please try again."
          />
          <Button variant="outline" size="lg" className="mt-1 rounded-xl" onClick={load}>
            <RotateCcw className="h-4 w-4 me-2" aria-hidden />
            Try again
          </Button>
        </div>
      ) : !items ? (
        <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading glossary terms">
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-9 w-2/3 rounded-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search terms — try 'wudu', 'zakat', 'tawhid'"
            ariaLabel="Search glossary terms"
          />

          {/* ————— Category chips ————— */}
          <div
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-soft"
            role="group"
            aria-label="Filter terms by category"
          >
            {categories.map((category) => {
              const isActive = activeCategory === category;
              const count = category === 'all' ? items.length : (counts.get(category) ?? 0);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={isActive}
                  className={cn(
                    'h-9 shrink-0 rounded-full border px-3.5 text-xs font-semibold transition-colors focus-ring',
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border/80 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  )}
                >
                  {category === 'all'
                    ? `All (${count})`
                    : `${categoryLabel(category)} (${count})`}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center">
              <EmptyState
                icon={<BookOpen className="h-9 w-9" aria-hidden />}
                title="No terms matched"
                hint="Try 'wudu', 'zakat', 'tawhid' — or clear the search and browse by category."
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-1 rounded-xl"
                onClick={() => {
                  setQuery('');
                  setActiveCategory('all');
                }}
              >
                <RotateCcw className="h-3.5 w-3.5 me-1.5" aria-hidden />
                Clear search
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                Showing {filtered.length} of {items.length} terms
              </p>
              <div className="grid items-start gap-4 sm:grid-cols-2">
                {filtered.map((term) => (
                  <div key={term.slug} className="min-w-0">
                    <div className="mb-1.5 flex items-baseline justify-between gap-2 px-0.5">
                      <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
                        {term.title}
                      </h3>
                      <span className="shrink-0 text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground/80">
                        {categoryLabel(term.category)}
                      </span>
                    </div>
                    <SourceCard record={term} />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
