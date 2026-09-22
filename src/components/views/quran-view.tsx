'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import { SourceCard } from '@/components/shared/source-card';
import { ArabicText } from '@/components/shared/arabic-text';
import { ViewHeader, SearchBar, EmptyState } from '@/components/shared/view-header';
import { SURAHS, getSurah, QURAN_INTEGRATION_NOTE, ayahAudioUrl, RECITER_NOTE, type SurahMeta } from '@/lib/surahs';
import { useToast } from '@/hooks/use-toast';
import type { SourceRecord } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  CloudOff,
  Headphones,
  Info,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Search,
  SearchX,
  Square,
  Tags,
  Volume2,
} from 'lucide-react';

// ============================================================================
// QuranView — Read (full mushaf via integration layer) · Topics · Search.
// Accuracy before speed: the reader labels its data source honestly, and the
// topic/search tabs only surface BASIRA's verified, checked records.
// ============================================================================

interface ContentResponse {
  items: SourceRecord[];
  total: number;
}

interface ReaderAyah {
  numberInSurah: number;
  arabic: string;
  translation: string;
  excerptOnly?: boolean;
  slug?: string | null;
}

type SurahStatus = 'external' | 'cached' | 'local-curated';

interface SurahResponse {
  surah: SurahMeta;
  ayahs: ReaderAyah[];
  translationSource: string;
  status: SurahStatus;
  source: string;
  note: string;
}

const QURAN_TOPICS = [
  'patience',
  'anxiety',
  'prayer',
  'fasting',
  'parents',
  'forgiveness',
  'repentance',
  'mercy',
  'jannah',
  'knowledge',
  'kindness',
  'marriage',
  'business',
  'dhikr',
  'gratitude',
  'hope',
  'death',
  'purpose',
  'trial',
  'guidance',
];

const SEARCH_SUGGESTIONS = ['patience', 'anxiety', 'parents', 'forgiveness', 'mercy', 'purpose'];

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

function ResultSkeleton() {
  return (
    <div className="paper-card rounded-xl border border-border/80 p-4 space-y-3" aria-hidden>
      <Skeleton className="h-4 w-44" />
      <Skeleton className="h-7 w-11/12 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

function LoadingList({ label }: { label: string }) {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <span className="sr-only">{label}</span>
      <ResultSkeleton />
      <ResultSkeleton />
      <ResultSkeleton />
    </div>
  );
}

function ErrorState({ onRetry, what }: { onRetry: () => void; what: string }) {
  return (
    <div className="text-center py-10 px-4">
      <p className="font-medium text-foreground/80">Could not load {what}</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
        Please check your connection and try again.
      </p>
      <Button onClick={onRetry} variant="outline" className="h-11 px-5 mt-4">
        <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
        Try again
      </Button>
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Read tab · Surah browser
// ————————————————————————————————————————————————————————————————

function SurahBrowser({ progress, onOpen }: { progress: Record<number, number>; onOpen: (n: number) => void }) {
  const [filter, setFilter] = React.useState('');

  const q = filter.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!q) return SURAHS;
    return SURAHS.filter(
      (s) =>
        String(s.number) === q ||
        s.transliteration.toLowerCase().includes(q) ||
        s.english.toLowerCase().includes(q)
    );
  }, [q]);

  const startedCount = Object.keys(progress).length;

  return (
    <section aria-label="Surah browser">
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          type="search"
          placeholder="Filter surahs — number, name, or meaning (e.g. 2, Maryam, light)"
          aria-label="Filter the surah list"
          className="pl-10 h-11 rounded-xl bg-card border-border/80"
        />
      </div>

      {startedCount > 0 && (
        <p className="text-xs text-muted-foreground mb-2 px-1">
          You have reading progress in {startedCount} {startedCount === 1 ? 'surah' : 'surahs'} — look for the
          <span className="text-primary font-medium"> Continue </span>
          chip.
        </p>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-10 w-10" aria-hidden />}
          title="No surah matches that filter"
          hint="Try a number (1–114), a name like &ldquo;Yusuf&rdquo;, or a meaning like &ldquo;light&rdquo;."
        />
      ) : (
        <ul
          className="max-h-[26rem] sm:max-h-[32rem] overflow-y-auto scrollbar-soft rounded-xl border border-border/70 bg-card/60 divide-y divide-border/60"
          aria-label="All surahs"
        >
          {filtered.map((s) => {
            const lastAyah = progress[s.number];
            return (
              <li key={s.number}>
                <button
                  onClick={() => onOpen(s.number)}
                  className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 min-h-[60px] text-left hover:bg-muted/70 active:bg-muted transition-colors focus-ring"
                  aria-label={`Open surah ${s.number}: ${s.transliteration} — ${s.english}, ${s.place}, ${s.ayahs} ayahs${
                    lastAyah ? `, continue from ayah ${lastAyah}` : ''
                  }`}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold tabular-nums"
                    aria-hidden
                  >
                    {s.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-semibold text-foreground leading-tight">{s.transliteration}</span>
                      <span className="text-xs text-muted-foreground">{s.english}</span>
                    </span>
                    <span className="block text-[0.7rem] text-muted-foreground mt-0.5">
                      {s.place} · {s.ayahs} {s.ayahs === 1 ? 'ayah' : 'ayahs'}
                    </span>
                  </span>
                  {typeof lastAyah === 'number' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-[0.65rem] font-semibold px-2.5 py-1 border border-primary/25 shrink-0">
                      <BookmarkCheck className="h-3 w-3 shrink-0" aria-hidden />
                      <span className="sm:hidden">{lastAyah}</span>
                      <span className="hidden sm:inline">Continue · ayah {lastAyah}</span>
                    </span>
                  )}
                  <span className="font-arabic text-xl sm:text-2xl text-foreground/90 shrink-0" dir="rtl" lang="ar">
                    {s.arabic}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
        <Info className="h-4 w-4 text-gold shrink-0 mt-0.5" aria-hidden />
        <p className="text-xs text-muted-foreground leading-relaxed">{QURAN_INTEGRATION_NOTE}</p>
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Read tab · Surah reader (in-component sub-view)
// ————————————————————————————————————————————————————————————————

const STATUS_LABEL: Record<SurahStatus, string> = {
  external: 'Full surah · external dataset',
  cached: 'Full surah · cached locally',
  'local-curated': 'Curated ayahs only',
};

// —————————————————————————————————————————————————————————————————
// Surah reader · audio recitation ——————————————————————————————
// One shared <audio> element per reader module: the Quran reader is the
// only place that recites, and a single element guarantees overlapping
// ayahs can never play at once. Held at module scope (not in a ref) so it
// is a plain singleton, outside React's render data flow.
// —————————————————————————————————————————————————————————————————

let readerAudioEl: HTMLAudioElement | null = null;
function getReaderAudio(): HTMLAudioElement {
  if (!readerAudioEl) readerAudioEl = new Audio();
  return readerAudioEl;
}

function stopReaderAudio() {
  if (!readerAudioEl) return;
  readerAudioEl.pause();
  readerAudioEl.removeAttribute('src');
  readerAudioEl.load();
}

function SurahReader({
  surahNumber,
  lastRead,
  onBack,
  onProgress,
}: {
  surahNumber: number;
  lastRead?: number;
  onBack: () => void;
  onProgress: (surahNumber: number, lastAyah: number) => void;
}) {
  const { toast } = useToast();
  const toggleBookmark = useApp((s) => s.toggleBookmark);
  const openRecordBySlug = useApp((s) => s.openRecordBySlug);
  const bookmarkSlugs = useApp((s) => s.bookmarkSlugs);

  const [data, setData] = React.useState<SurahResponse | null>(null);
  const [state, setState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [reloadTick, setReloadTick] = React.useState(0);
  const [marking, setMarking] = React.useState<number | null>(null);

  // ————— Audio recitation state (mirrors the shared <audio> element) —————
  const audioCurrentRef = React.useRef<number | null>(null);
  const [audioCurrent, setAudioCurrent] = React.useState<number | null>(null);
  const [audioPlaying, setAudioPlaying] = React.useState(false);
  const [audioLoading, setAudioLoading] = React.useState(false);

  const setAudio = (ayah: number | null) => {
    audioCurrentRef.current = ayah;
    setAudioCurrent(ayah);
  };

  const stopAudio = React.useCallback(() => {
    stopReaderAudio();
    audioCurrentRef.current = null;
    setAudioCurrent(null);
    setAudioPlaying(false);
    setAudioLoading(false);
  }, []);

  const playAyah = React.useCallback(
    (ayah: number) => {
      const url = ayahAudioUrl(surahNumber, ayah);
      if (!url) {
        toast({
          title: 'Recitation unavailable for this ayah',
          description: 'BASIRA could not resolve a recitation reference, so no audio will play rather than a wrong one.',
        });
        return;
      }
      const el = getReaderAudio();
      setAudio(ayah);
      setAudioLoading(true);
      el.src = url;
      const played = el.play();
      if (played) {
        played
          .then(() => setAudioPlaying(true))
          .catch(() => setAudioPlaying(true)) // autoplay of direct .play() after user gesture resolves
          .finally(() => setAudioLoading(false));
      } else {
        setAudioLoading(false);
      }
    },
    [surahNumber, toast]
  );

  const toggleAudio = () => {
    const el = readerAudioEl;
    if (!el || audioCurrent == null) return;
    if (el.paused) {
      void el.play().then(() => setAudioPlaying(true));
    } else {
      el.pause();
      setAudioPlaying(false);
    }
  };

  // Auto-advance to the next ayah when one finishes; stop at the surah's end.
  React.useEffect(() => {
    const el = getReaderAudio();
    const onEnded = () => {
      const cur = audioCurrentRef.current;
      if (cur == null || !data) {
        setAudioPlaying(false);
        return;
      }
      const idx = data.ayahs.findIndex((a) => a.numberInSurah === cur);
      const next = idx >= 0 ? data.ayahs[idx + 1] : undefined;
      if (next) {
        const url = ayahAudioUrl(surahNumber, next.numberInSurah);
        if (url) {
          setAudio(next.numberInSurah);
          el.src = url;
          void el.play().catch(() => undefined);
          return;
        }
      }
      // end of surah → stop cleanly
      el.pause();
      el.removeAttribute('src');
      setAudio(null);
      setAudioPlaying(false);
    };
    const onError = () => {
      setAudioPlaying(false);
      setAudio(null);
      toast({
        title: 'Recitation could not be loaded',
        description: 'The external audio service could not be reached — no audio plays rather than a wrong recitation. You can still read the ayah.',
      });
    };
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
    };
  }, [data, surahNumber, toast]);

  // Scroll the playing ayah into view as it advances.
  React.useEffect(() => {
    if (audioCurrent == null) return;
    const target = document.getElementById(`ayah-${surahNumber}-${audioCurrent}`);
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    }
  }, [audioCurrent, surahNumber]);

  // Stop audio when leaving the reader / switching surahs.
  React.useEffect(() => {
    stopAudio();
    return stopAudio;
  }, [stopAudio, surahNumber]);

  React.useEffect(() => {
    let alive = true;
    setState('loading');
    void (async () => {
      const res = await fetchJson<SurahResponse>(`/api/quran/surah/${surahNumber}`);
      if (!alive) return;
      if (res && Array.isArray(res.ayahs)) {
        setData(res);
        setState('ready');
      } else {
        setState('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, [surahNumber, reloadTick]);

  // After loading, jump to the last-read ayah (or the top of the surah header).
  React.useEffect(() => {
    if (state !== 'ready') return;
    const lastReadEl = typeof lastRead === 'number' ? document.getElementById(`ayah-${surahNumber}-${lastRead}`) : null;
    const target = lastReadEl ?? document.getElementById(`surah-top-${surahNumber}`);
    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: lastReadEl ? 'center' : 'start' });
      });
    }
  }, [state, surahNumber]);

  const markLastRead = async (ayah: number) => {
    if (marking !== null) return;
    setMarking(ayah);
    const res = await fetchJson<{ ok: boolean }>('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'reading', surahNumber, lastAyah: ayah }),
    });
    setMarking(null);
    if (res?.ok) {
      onProgress(surahNumber, ayah);
      toast({
        title: 'Reading position saved',
        description: `Last read: ${getSurah(surahNumber)?.transliteration ?? `Surah ${surahNumber}`} · ayah ${ayah}.`,
      });
    } else {
      toast({
        title: 'Could not save reading position',
        description: 'Please check your connection and try again.',
      });
    }
  };

  const surahMeta = data?.surah ?? getSurah(surahNumber);

  return (
    <section aria-label={`Surah ${surahNumber} reader`}>
      {/* Reader toolbar */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <Button
          variant="ghost"
          onClick={onBack}
          className="h-11 px-3 -ml-2 text-muted-foreground hover:text-foreground"
          aria-label="Back to the surah list"
        >
          <ChevronLeft className="h-5 w-5 mr-1" aria-hidden />
          All surahs
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          {typeof lastRead === 'number' && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 border border-border/60 rounded-full px-3 py-2">
              <BookmarkCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
              Last read: ayah {lastRead}
            </span>
          )}
          {state === 'ready' && data && data.ayahs.length > 0 && (
            <Button
              variant={audioCurrent != null ? 'default' : 'outline'}
              size="sm"
              className="h-11 px-4"
              onClick={() => (audioCurrent != null ? toggleAudio() : playAyah(data.ayahs[0]?.numberInSurah ?? 1))}
              aria-label={audioCurrent != null ? 'Pause the recitation' : `Listen to ${surahMeta?.transliteration ?? 'this surah'} — recitation by Mishary Rashid Alafasy`}
            >
              {audioCurrent != null && audioPlaying ? (
                <Pause className="h-4 w-4 mr-1.5" aria-hidden />
              ) : (
                <Headphones className="h-4 w-4 mr-1.5" aria-hidden />
              )}
              {audioCurrent != null ? (audioPlaying ? 'Pause recitation' : 'Resume') : 'Listen'}
            </Button>
          )}
        </div>
      </div>

      {state === 'loading' && (
        <div role="status" aria-busy="true" className="space-y-4">
          <span className="sr-only">Loading surah…</span>
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      )}

      {state === 'error' && (
        <ErrorState what={`surah ${surahNumber}`} onRetry={() => setReloadTick((t) => t + 1)} />
      )}

      {state === 'ready' && data && surahMeta && (
        <>
          {/* Surah header card */}
          <Card className="paper-card overflow-hidden border-border/80 mb-5">
            <div className="pattern-khatim pattern-fade h-1.5 w-full" aria-hidden />
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
                Surah {surahMeta.number} of 114
              </p>
              <h2
                id={`surah-top-${surahNumber}`}
                className="font-arabic text-4xl sm:text-5xl text-foreground leading-[1.7] my-3"
                dir="rtl"
                lang="ar"
              >
                {surahMeta.arabic}
              </h2>
              <p className="font-display text-xl sm:text-2xl font-semibold text-foreground">{surahMeta.transliteration}</p>
              <p className="text-sm text-muted-foreground italic mt-0.5">{surahMeta.english}</p>
              <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
                  {surahMeta.place}
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
                  {surahMeta.ayahs} {surahMeta.ayahs === 1 ? 'ayah' : 'ayahs'}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    data.status === 'local-curated' ? 'border-gold/50 text-gold' : 'border-primary/30 text-primary'
                  )}
                >
                  {STATUS_LABEL[data.status]}
                </Badge>
              </div>
              <p className="text-[0.68rem] text-muted-foreground mt-4 leading-relaxed">
                Translation: {data.translationSource}
                {data.source ? ` · ${data.source}` : ''}
              </p>
              <p className="text-[0.62rem] text-muted-foreground/80 mt-1.5 leading-relaxed max-w-xl mx-auto">{RECITER_NOTE}</p>
            </CardContent>
          </Card>

          {data.status === 'local-curated' && (
            <Alert className="mb-5 border-gold/40 bg-gold/10">
              <CloudOff className="h-4 w-4 text-gold" aria-hidden />
              <AlertTitle className="text-foreground">Only BASIRA&apos;s curated ayahs are available right now</AlertTitle>
              <AlertDescription>{data.note}</AlertDescription>
            </Alert>
          )}

          {data.ayahs.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-10 w-10" aria-hidden />}
              title="No curated ayahs for this surah yet"
              hint="The external Quran dataset could not be reached and BASIRA has not curated this surah yet. Try the Topics tab — every ayah there is verified."
            />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {data.ayahs.map((a) => {
                const isLastRead = lastRead === a.numberInSurah;
                const bookmarked = a.slug ? bookmarkSlugs.has(a.slug) : false;
                const isPlayingAyah = audioCurrent === a.numberInSurah;
                return (
                  <article
                    key={a.numberInSurah}
                    id={`ayah-${surahNumber}-${a.numberInSurah}`}
                    className={cn(
                      'paper-card rounded-xl border p-4 sm:p-5 transition-all duration-300',
                      isPlayingAyah
                        ? 'border-primary/60 shadow-lg ring-1 ring-primary/30'
                        : isLastRead
                          ? 'border-primary/50 shadow-md'
                          : 'border-border/80 shadow-sm hover:shadow-md'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums border transition-colors',
                            isPlayingAyah
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-primary/10 text-primary border-primary/25'
                          )}
                          aria-hidden
                        >
                          {a.numberInSurah}
                        </span>
                        {isPlayingAyah && (
                          <span className="flex items-center gap-1 text-[0.65rem] font-semibold text-primary uppercase tracking-wide" aria-hidden>
                            <Volume2 className="h-3.5 w-3.5" />
                            {audioLoading ? 'Loading…' : audioPlaying ? 'Reciting' : 'Paused'}
                          </span>
                        )}
                      </span>
                      <span className="sr-only">Ayah {a.numberInSurah}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => (isPlayingAyah ? toggleAudio() : playAyah(a.numberInSurah))}
                          className={cn(
                            'h-11 w-11 p-0',
                            isPlayingAyah ? 'text-primary hover:text-primary' : 'text-muted-foreground hover:text-foreground'
                          )}
                          aria-label={
                            isPlayingAyah
                              ? audioPlaying
                                ? `Pause recitation of ayah ${a.numberInSurah}`
                                : `Resume recitation of ayah ${a.numberInSurah}`
                              : `Play recitation of ayah ${a.numberInSurah} — Mishary Rashid Alafasy`
                          }
                        >
                          {isPlayingAyah && audioLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : isPlayingAyah && audioPlaying ? (
                            <Pause className="h-4 w-4" aria-hidden />
                          ) : (
                            <Play className="h-4 w-4" aria-hidden />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void markLastRead(a.numberInSurah)}
                          disabled={marking !== null}
                          className={cn(
                            'h-11 px-3 text-xs',
                            isLastRead ? 'text-primary hover:text-primary' : 'text-muted-foreground hover:text-foreground'
                          )}
                          aria-label={`Set ayah ${a.numberInSurah} as your last read position`}
                        >
                          {marking === a.numberInSurah ? (
                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden />
                          ) : (
                            <BookmarkCheck
                              className={cn('h-4 w-4 mr-1.5', isLastRead && 'fill-primary/20')}
                              aria-hidden
                            />
                          )}
                          <span className="hidden sm:inline">{isLastRead ? 'Last read' : 'Set as last read'}</span>
                          <span className="sm:hidden">{isLastRead ? 'Last' : 'Mark'}</span>
                        </Button>
                      </div>
                    </div>

                    <ArabicText text={a.arabic} size="lg" />
                    <p className="text-foreground/90 text-[0.95rem] leading-relaxed">{a.translation}</p>

                    {a.excerptOnly && (
                      <p className="text-xs italic text-muted-foreground mt-2">
                        Excerpt of the ayah, marked with an ellipsis — read the full verse in a printed mushaf.
                      </p>
                    )}

                    {a.slug && (
                      <footer className="mt-3 pt-3 border-t border-border/60 flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-11 px-4"
                          onClick={() => void toggleBookmark(a.slug!)}
                          aria-pressed={bookmarked}
                          aria-label={bookmarked ? 'Remove this ayah from bookmarks' : 'Bookmark this ayah'}
                        >
                          <Bookmark className={cn('h-4 w-4 mr-1.5', bookmarked && 'fill-current text-gold')} aria-hidden />
                          {bookmarked ? 'Saved' : 'Save'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-11 px-4 text-muted-foreground hover:text-foreground"
                          onClick={() => void openRecordBySlug(a.slug!)}
                          aria-label="Inspect the verified source record for this ayah"
                        >
                          <BookOpen className="h-4 w-4 mr-1.5" aria-hidden />
                          View source
                        </Button>
                        <span className="ml-auto text-[0.65rem] text-muted-foreground">Curated &amp; verified</span>
                      </footer>
                    )}
                  </article>
                );
              })}

              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">
                  End of {surahMeta.transliteration} · {surahMeta.ayahs} {surahMeta.ayahs === 1 ? 'ayah' : 'ayahs'}
                </p>
                <div className="ornament-line mt-3" />
              </div>
            </div>
          )}
        </>
      )}

      {/* ————— Sticky recitation player (fixed above the mobile nav) ————— */}
      {audioCurrent != null && surahMeta && (
        <div
          className="fixed left-0 right-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] lg:bottom-5 z-40 px-3 sm:px-4 animate-in slide-in-from-bottom-3 fade-in duration-300"
          role="region"
          aria-label="Recitation player"
        >
          <div className="max-w-4xl mx-auto">
            <div className="paper-card flex items-center gap-2.5 rounded-2xl border border-primary/30 shadow-lg px-3.5 py-2.5 backdrop-blur-md bg-card/95">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                {audioLoading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden />
                ) : audioPlaying ? (
                  <Volume2 className="h-4.5 w-4.5" aria-hidden />
                ) : (
                  <Headphones className="h-4.5 w-4.5" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground leading-tight truncate">
                  {surahMeta.transliteration} · Ayah {audioCurrent}
                  <span className="text-muted-foreground font-normal"> of {data?.ayahs.length ?? surahMeta.ayahs}</span>
                </p>
                <p className="text-[0.65rem] text-muted-foreground truncate">
                  Mishary Rashid Alafasy · islamic.network CDN
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full shrink-0"
                onClick={toggleAudio}
                aria-label={audioPlaying ? 'Pause recitation' : 'Resume recitation'}
              >
                {audioPlaying ? <Pause className="h-4.5 w-4.5" aria-hidden /> : <Play className="h-4.5 w-4.5" aria-hidden />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full shrink-0 text-muted-foreground hover:text-destructive"
                onClick={stopAudio}
                aria-label="Stop recitation"
              >
                <Square className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Topics tab
// ————————————————————————————————————————————————————————————————

function TopicPanel() {
  const [topic, setTopic] = React.useState<string>('patience');
  const [items, setItems] = React.useState<SourceRecord[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);
  const [reloadTick, setReloadTick] = React.useState(0);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setFailed(false);
    void (async () => {
      const res = await fetchJson<ContentResponse>(
        `/api/content?type=QURAN&topic=${encodeURIComponent(topic)}&limit=60`
      );
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
  }, [topic, reloadTick]);

  return (
    <section aria-label="Quran topics">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a topic">
        {QURAN_TOPICS.map((t) => {
          const active = topic === t;
          return (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={cn(
                'min-h-11 px-4 rounded-full text-sm font-medium border transition-colors focus-ring capitalize',
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

      <div className="mt-5">
        <p className="text-sm text-muted-foreground mb-3 capitalize" role="status" aria-live="polite">
          {loading ? (
            'Loading…'
          ) : failed ? null : (
            <>
              <span className="text-foreground font-semibold">{countLabel(items.length, total)}</span> verified{' '}
              {items.length === 1 ? 'ayah' : 'ayahs'} about {topic}
            </>
          )}
        </p>

        {loading && <LoadingList label={`Loading ayahs about ${topic}…`} />}
        {!loading && failed && <ErrorState what={`ayahs about ${topic}`} onRetry={() => setReloadTick((t) => t + 1)} />}
        {!loading && !failed && items.length === 0 && (
          <EmptyState
            icon={<BookOpen className="h-10 w-10" aria-hidden />}
            title="No curated ayahs for this topic yet"
            hint="BASIRA only shows verified records and has not curated this topic yet — try another topic."
          />
        )}
        {!loading && !failed && items.length > 0 && (
          <div className="space-y-4">
            {items.map((r) => (
              <SourceCard key={r.id} record={r} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Search tab
// ————————————————————————————————————————————————————————————————

function SearchPanel() {
  const [query, setQuery] = React.useState('');
  const [submitted, setSubmitted] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<SourceRecord[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [reloadTick, setReloadTick] = React.useState(0);

  React.useEffect(() => {
    if (!submitted) return;
    let alive = true;
    setLoading(true);
    setFailed(false);
    void (async () => {
      const res = await fetchJson<ContentResponse>(
        `/api/content?type=QURAN&q=${encodeURIComponent(submitted)}&limit=60`
      );
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
  }, [submitted, reloadTick]);

  const runSearch = (q: string) => {
    const qq = q.trim();
    if (!qq) return;
    setSubmitted(qq);
  };

  return (
    <section aria-label="Search the verified Quran collection">
      <div className="flex gap-2">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={() => runSearch(query)}
          autoFocus
          placeholder="Search verified ayahs — e.g. patience, anxiety, parents"
          ariaLabel="Search verified Quran ayahs"
          className="flex-1"
        />
        <Button
          onClick={() => runSearch(query)}
          disabled={!query.trim() || loading}
          className="h-11 px-5"
          aria-label="Search"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Search className="h-4 w-4" aria-hidden />}
          <span className="hidden sm:inline ml-2">Search</span>
        </Button>
      </div>

      {!query.trim() && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Try searching for:</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested searches">
            {SEARCH_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s);
                  runSearch(s);
                }}
                className="min-h-11 px-4 rounded-full text-sm font-medium border border-border/80 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors focus-ring capitalize"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {submitted && (
        <div className="mt-5">
          <p className="text-sm text-muted-foreground mb-3" role="status" aria-live="polite">
            {loading ? (
              'Searching…'
            ) : failed ? null : (
              <>
                <span className="text-foreground font-semibold">{countLabel(items.length, total)}</span> verified{' '}
                {items.length === 1 ? 'ayah' : 'ayahs'} matching &ldquo;{submitted}&rdquo;
              </>
            )}
          </p>

          {loading && <LoadingList label="Searching ayahs…" />}
          {!loading && failed && <ErrorState what="search results" onRetry={() => setReloadTick((t) => t + 1)} />}
          {!loading && !failed && items.length === 0 && (
            <EmptyState
              icon={<SearchX className="h-10 w-10" aria-hidden />}
              title="No verified ayahs matched"
              hint="Try different words (e.g. &ldquo;patience&rdquo;, &ldquo;anxiety&rdquo;, &ldquo;parents&rdquo;) — BASIRA only searches its checked collection, never guesses."
            />
          )}
          {!loading && !failed && items.length > 0 && (
            <div className="space-y-4">
              {items.map((r) => (
                <SourceCard key={r.id} record={r} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Main view
// ————————————————————————————————————————————————————————————————

export function QuranView() {
  const viewParams = useApp((s) => s.viewParams);
  const [openSurah, setOpenSurah] = React.useState<number | null>(null);
  const [progress, setProgress] = React.useState<Record<number, number>>({});

  // Reading progress ("Continue reading") — fetched once on mount.
  React.useEffect(() => {
    let alive = true;
    void (async () => {
      const data = await fetchJson<{ reading: { surahNumber: number; lastAyah: number }[] }>('/api/progress');
      if (!alive || !data?.reading) return;
      const map: Record<number, number> = {};
      for (const r of data.reading) {
        if (typeof r?.surahNumber === 'number' && typeof r?.lastAyah === 'number') {
          map[r.surahNumber] = r.lastAyah;
        }
      }
      setProgress(map);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Deep-link from Home ("Continue reading") → open the reader directly.
  const surahParam = typeof viewParams.surah === 'number' ? viewParams.surah : undefined;
  React.useEffect(() => {
    if (typeof surahParam === 'number' && surahParam >= 1 && surahParam <= 114) {
      setOpenSurah(surahParam);
    }
  }, [surahParam]);

  const recordProgress = (surahNumber: number, lastAyah: number) => {
    setProgress((p) => ({ ...p, [surahNumber]: lastAyah }));
  };

  return (
    <div>
      <ViewHeader
        title="Qur'an"
        titleAr="القرآن الكريم"
        description="Read the full Qur'an with translation, explore verified ayahs by topic, or search BASIRA's checked collection — every result shows its source."
        back
      />

      <Tabs defaultValue="read">
        <TabsList className="h-11 grid grid-cols-3 w-full max-w-md rounded-xl" aria-label="Quran sections">
          <TabsTrigger value="read" className="text-sm">
            <BookOpen className="h-4 w-4" aria-hidden />
            Read
          </TabsTrigger>
          <TabsTrigger value="topics" className="text-sm">
            <Tags className="h-4 w-4" aria-hidden />
            Topics
          </TabsTrigger>
          <TabsTrigger value="search" className="text-sm">
            <Search className="h-4 w-4" aria-hidden />
            Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="read" className="mt-4">
          {openSurah === null ? (
            <SurahBrowser progress={progress} onOpen={(n) => setOpenSurah(n)} />
          ) : (
            <SurahReader
              key={openSurah}
              surahNumber={openSurah}
              lastRead={progress[openSurah]}
              onBack={() => setOpenSurah(null)}
              onProgress={recordProgress}
            />
          )}
        </TabsContent>

        <TabsContent value="topics" className="mt-4">
          <TopicPanel />
        </TabsContent>

        <TabsContent value="search" className="mt-4">
          <SearchPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
