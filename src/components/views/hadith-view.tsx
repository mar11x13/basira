'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import { SourceCard } from '@/components/shared/source-card';
import { ViewHeader, SearchBar, EmptyState } from '@/components/shared/view-header';
import type { SourceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  ChevronDown,
  Loader2,
  RefreshCw,
  ScrollText,
  Search,
  SearchX,
} from 'lucide-react';

// ============================================================================
// HadithView — search & browse BASIRA's verified hadith records.
// Core collection: Sahih al-Bukhari. Honesty rules: numbering follows the
// Darussalam / sunnah.com English edition; unconfirmed numbers are shown as
// "reference pending" rather than guessed; no unverified results, ever.
// ============================================================================

interface ContentResponse {
  items: SourceRecord[];
  total: number;
}

const HADITH_TOPICS = [
  'Patience',
  'Salah',
  'Fasting',
  'Parents',
  'Kindness',
  'Repentance',
  'Jannah',
  'Ramadan',
  'Marriage',
  'Business',
  'Forgiveness',
  'Lying',
  'Sleep',
  'Knowledge',
  'Mercy',
] as const;

const COLLECTIONS = [
  'Sahih al-Bukhari',
  'Sahih Muslim',
  "Jami' at-Tirmidhi",
  'Sunan Abi Dawud',
  "Sunan an-Nasa'i",
  'Sunan Ibn Majah',
] as const;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: 'no-store', ...init });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Honest count: the search API caps returned items, so say "Showing X of Y" when that happens. */
function countLabel(shown: number, total: number): string {
  if (total > shown) return `Showing ${shown} of ${total}`;
  return `${shown}`;
}

function HadithSkeleton() {
  return (
    <div className="paper-card rounded-xl border border-border/80 p-4 space-y-3" aria-hidden>
      <Skeleton className="h-4 w-52" />
      <Skeleton className="h-6 w-11/12 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function HadithView() {
  const viewParams = useApp((s) => s.viewParams);

  // Initial state: honor viewParams.topic (deep link) or load the default feed.
  const [activeQuery, setActiveQuery] = React.useState<string | null>(() => {
    const t = useApp.getState().viewParams.topic;
    return typeof t === 'string' && t.trim() ? t.trim() : null;
  });
  const [activeTopic, setActiveTopic] = React.useState<string | null>(() => {
    const t = useApp.getState().viewParams.topic;
    if (typeof t !== 'string' || !t.trim()) return null;
    return HADITH_TOPICS.find((x) => x.toLowerCase() === t.trim().toLowerCase()) ?? null;
  });
  const [query, setQuery] = React.useState<string>(() => activeQuery ?? '');

  const [collection, setCollection] = React.useState<string>('all');
  const [items, setItems] = React.useState<SourceRecord[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);
  const [reloadTick, setReloadTick] = React.useState(0);
  const [aboutOpen, setAboutOpen] = React.useState(false);

  // Deep-link support if topic params arrive while mounted.
  const topicParam = typeof viewParams.topic === 'string' ? viewParams.topic : null;
  React.useEffect(() => {
    if (!topicParam || !topicParam.trim()) return;
    const label = HADITH_TOPICS.find((x) => x.toLowerCase() === topicParam.trim().toLowerCase()) ?? null;
    setActiveQuery(topicParam.trim());
    setActiveTopic(label);
    setQuery(topicParam.trim());
  }, [topicParam]);

  // Fetch: searched query, or the default verified feed on first load.
  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setFailed(false);
    void (async () => {
      const url = activeQuery
        ? `/api/content?type=HADITH&q=${encodeURIComponent(activeQuery)}&limit=40`
        : '/api/content?type=HADITH&limit=24';
      const res = await fetchJson<ContentResponse>(url);
      if (!alive) return;
      if (res) {
        setItems(res.items ?? []);
        setTotal(res.total ?? 0);
        setLoading(false);
      } else {
        setFailed(true);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeQuery, reloadTick]);

  const search = (q: string) => {
    const qq = q.trim();
    if (!qq) return;
    setActiveQuery(qq);
    setActiveTopic(null);
    setQuery(qq); // keep the searched text visible in the bar
    setCollection('all');
  };

  const toggleTopic = (label: string) => {
    if (activeTopic === label) {
      // Deselect → back to the default verified feed (text stays in the bar).
      setActiveTopic(null);
      setActiveQuery(null);
      setCollection('all');
      return;
    }
    setActiveTopic(label);
    setActiveQuery(label.toLowerCase());
    setQuery(label.toLowerCase());
    setCollection('all');
  };

  const collectionCounts = React.useMemo(() => {
    const m: Record<string, number> = {};
    for (const i of items) {
      if (i.collection) m[i.collection] = (m[i.collection] ?? 0) + 1;
    }
    return m;
  }, [items]);

  const filteredItems = React.useMemo(
    () => (collection === 'all' ? items : items.filter((i) => i.collection === collection)),
    [items, collection]
  );

  return (
    <div>
      <ViewHeader
        title="Hadith"
        titleAr="الحديث الشريف"
        description="Sayings and actions of the Prophet Muhammad ﷺ. BASIRA's core collection is Sahih al-Bukhari — the most rigorously authenticated book after the Qur'an — alongside other sound collections. Every record shows its citation and verification status."
        back
      />

      {/* ————— Search + topics ————— */}
      <section aria-label="Search hadith">
        <div className="flex gap-2">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={() => search(query)}
            placeholder={'Search hadith — try "patience", "kindness", "parents"…'}
            ariaLabel="Search verified hadith"
            className="flex-1"
          />
          <Button
            onClick={() => search(query)}
            disabled={!query.trim() || loading}
            className="h-11 px-5"
            aria-label="Search hadith"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Search className="h-4 w-4" aria-hidden />
            )}
            <span className="hidden sm:inline ml-2">Search</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4" role="group" aria-label="Hadith topics">
          {HADITH_TOPICS.map((t) => {
            const active = activeTopic === t;
            return (
              <button
                key={t}
                onClick={() => toggleTopic(t)}
                className={cn(
                  'min-h-11 px-4 rounded-full text-sm font-medium border transition-colors focus-ring',
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground'
                )}
                aria-pressed={active}
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>

      {/* ————— Collection filter ————— */}
      <section aria-label="Filter by collection" className="mt-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter results by hadith collection">
          <button
            onClick={() => setCollection('all')}
            className={cn(
              'min-h-11 px-3.5 rounded-full text-[0.8rem] font-medium border transition-colors focus-ring',
              collection === 'all'
                ? 'bg-gold text-gold-foreground border-gold shadow-sm'
                : 'bg-card text-muted-foreground border-border/80 hover:border-gold/50 hover:text-foreground'
            )}
            aria-pressed={collection === 'all'}
          >
            All collections ({items.length})
          </button>
          {COLLECTIONS.map((c) => {
            const active = collection === c;
            const count = collectionCounts[c] ?? 0;
            return (
              <button
                key={c}
                onClick={() => setCollection(active ? 'all' : c)}
                className={cn(
                  'min-h-11 px-3.5 rounded-full text-[0.8rem] font-medium border transition-colors focus-ring',
                  active
                    ? 'bg-gold text-gold-foreground border-gold shadow-sm'
                    : 'bg-card text-muted-foreground border-border/80 hover:border-gold/50 hover:text-foreground'
                )}
                aria-pressed={active}
              >
                {c} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* ————— Results ————— */}
      <section aria-label="Hadith results" className="mt-5">
        <p className="text-sm text-muted-foreground mb-3" role="status" aria-live="polite">
          {loading ? (
            'Loading…'
          ) : failed ? null : collection === 'all' ? (
            <>
              <span className="text-foreground font-semibold">{countLabel(items.length, total)}</span> hadith{' '}
              {activeQuery ? (
                <>
                  matching &ldquo;{activeQuery}&rdquo;
                </>
              ) : (
                <>from the verified database</>
              )}
            </>
          ) : (
            <>
              Showing <span className="text-foreground font-semibold">{filteredItems.length}</span> of {items.length}{' '}
              hadith from {collection}
            </>
          )}
        </p>

        {loading && (
          <div role="status" aria-busy="true" className="space-y-4">
            <span className="sr-only">Loading hadith…</span>
            <HadithSkeleton />
            <HadithSkeleton />
            <HadithSkeleton />
          </div>
        )}

        {!loading && failed && (
          <div className="text-center py-10 px-4">
            <p className="font-medium text-foreground/80">Could not load hadith</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
              Please check your connection and try again.
            </p>
            <Button onClick={() => setReloadTick((t) => t + 1)} variant="outline" className="h-11 px-5 mt-4">
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
              Try again
            </Button>
          </div>
        )}

        {!loading && !failed && filteredItems.length === 0 && items.length > 0 && (
          <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-4 text-sm text-foreground/90 leading-relaxed">
            <p>
              No hadith from <span className="font-semibold">{collection}</span> in the current results — BASIRA&apos;s
              verified database currently holds mostly Sahih al-Bukhari records. Switch back to{' '}
              <button onClick={() => setCollection('all')} className="text-primary font-medium underline underline-offset-2 focus-ring rounded-sm">
                All collections
              </button>{' '}
              to see everything found.
            </p>
          </div>
        )}

        {!loading && !failed && items.length === 0 && (
          <EmptyState
            icon={<SearchX className="h-10 w-10" aria-hidden />}
            title="No hadith matched in the verified database"
            hint="BASIRA will not show unverified results — try broader words, or pick one of the topic chips above."
          />
        )}

        {!loading && !failed && filteredItems.length > 0 && (
          <div className="space-y-4">
            {filteredItems.map((r) => (
              <SourceCard key={r.id} record={r} defaultOpen={false} />
            ))}
          </div>
        )}
      </section>

      {/* ————— About these collections ————— */}
      <section aria-label="About these hadith collections" className="mt-8">
        <Card className="paper-card border-border/80 overflow-hidden">
          <Collapsible open={aboutOpen} onOpenChange={setAboutOpen}>
            <CollapsibleTrigger asChild>
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 min-h-[56px] text-left hover:bg-muted/50 transition-colors focus-ring"
                aria-expanded={aboutOpen}
                aria-controls="about-collections-content"
              >
                <ScrollText className="h-5 w-5 text-gold shrink-0" aria-hidden />
                <span className="text-sm font-semibold text-foreground">About these collections</span>
                <ChevronDown
                  className={cn('ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200', aboutOpen && 'rotate-180')}
                  aria-hidden
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent id="about-collections-content" className="border-t border-border/60">
              <div className="px-4 py-4 space-y-4 text-sm text-muted-foreground leading-relaxed">
                <div>
                  <p className="font-semibold text-foreground mb-1">Sahih al-Bukhari — the core</p>
                  <p>
                    Compiled by Imam Muhammad al-Bukhari (194–256 AH), Sahih al-Bukhari is widely regarded by Muslim
                    scholars as the most rigorously authenticated hadith collection — the most authentic book after the
                    Qur&apos;an itself. BASIRA draws its core hadith dataset from it first, then from Sahih Muslim,
                    Jami&apos; at-Tirmidhi, Sunan Abi Dawud, Sunan an-Nasa&apos;i, and Sunan Ibn Majah.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">About the numbering</p>
                  <p>
                    Hadith numbers shown here follow the widely used English edition (Darussalam / sunnah.com).
                    Numbering conventions differ between editions: the same hadith can carry a different number in
                    another printing, and the same number can point to a different hadith. Always cite the collection
                    and book, not the number alone.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">&ldquo;Reference pending&rdquo; badges</p>
                  <p>
                    Where BASIRA could not reliably confirm a hadith&apos;s number, the record is deliberately shown
                    without one — labeled &ldquo;reference pending verification&rdquo; — rather than guessing. This is
                    an honesty feature, not an error.
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </section>
    </div>
  );
}
