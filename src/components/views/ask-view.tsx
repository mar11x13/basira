'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import { SourceCard, CitationChip } from '@/components/shared/source-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { SourceRecord, AskResponse } from '@/lib/types';
import {
  AlertTriangle,
  BookOpen,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
} from 'lucide-react';

// ============================================================================
// AskView — BASIRA's centerpiece: retrieval-grounded Q&A with inspectable
// citations. Conversation state lives in this component, with a light
// module-level memory so switching sections mid-conversation keeps the thread.
// ============================================================================

const SUGGESTED_QUESTIONS = [
  'How do I pray Fajr?',
  'What breaks wudu?',
  'How do I make tawbah (repentance)?',
  'What does Islam teach about being good to my parents?',
  'What should I do if I missed a Salah?',
  'What are the Sunnahs of Friday?',
  'How can I become closer to Allah?',
  'What does Islam say about lying?',
  'What should I read before sleeping?',
  'What is the dua for entering the home?',
  "What does the Qur'an say about patience?",
  "What does the Qur'an say about anxiety?",
];

interface Turn {
  id: string;
  question: string;
  response: AskResponse | null;
  error: string | null;
}

/** Module-level memory — survives section switches (single-page app). */
let conversationMemory: { turns: Turn[]; input: string; loading: boolean } | null = null;

function restoreConversation(): { turns: Turn[]; input: string } {
  const mem = conversationMemory;
  if (!mem) return { turns: [], input: '' };
  const wasLoading = mem.loading;
  return {
    turns: mem.turns.map((t) =>
      wasLoading && t.response === null && !t.error
        ? {
            ...t,
            error: 'This answer was interrupted before it finished. Tap "Try again" to re-ask BASIRA.',
          }
        : t
    ),
    input: mem.input,
  };
}

// ————————————————— markdown-lite answer rendering —————————————————
// Supports: ### h3, #### h4, - bullets, 1. numbered items, **bold**,
// and [S#] citation tokens rendered as inspectable CitationChips.

type Block =
  | { kind: 'h3' | 'h4' | 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: { num: number; text: string }[] }
  | { kind: 'quote'; lines: string[] };

function parseBlocks(answer: string): Block[] {
  const blocks: Block[] = [];
  let list: Extract<Block, { kind: 'ul' | 'ol' }> | null = null;
  let quote: Extract<Block, { kind: 'quote' }> | null = null;
  const flush = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
    if (quote) {
      blocks.push(quote);
      quote = null;
    }
  };
  for (const rawLine of answer.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue; // blank lines do not split a list apart
    if (line.startsWith('#### ')) {
      flush();
      blocks.push({ kind: 'h4', text: line.slice(5) });
      continue;
    }
    if (line.startsWith('### ')) {
      flush();
      blocks.push({ kind: 'h3', text: line.slice(4) });
      continue;
    }
    if (line.startsWith('>')) {
      if (!quote) {
        flush();
        quote = { kind: 'quote', lines: [] };
      }
      quote.lines.push(line.replace(/^>\s?/, ''));
      continue;
    }
    if (line.startsWith('- ')) {
      if (quote) {
        blocks.push(quote);
        quote = null;
      }
      if (!list || list.kind !== 'ul') {
        flush();
        list = { kind: 'ul', items: [] };
      }
      list.items.push(line.slice(2));
      continue;
    }
    const ordered = line.match(/^(\d+)\. +(.*)$/);
    if (ordered) {
      if (quote) {
        blocks.push(quote);
        quote = null;
      }
      if (!list || list.kind !== 'ol') {
        flush();
        list = { kind: 'ol', items: [] };
      }
      list.items.push({ num: Number(ordered[1]), text: ordered[2] });
      continue;
    }
    flush();
    blocks.push({ kind: 'p', text: line });
  }
  flush();
  return blocks;
}

/** Tokenize a single line into text / <strong> / <em> / CitationChip pieces. */
function renderInline(
  text: string,
  sources: SourceRecord[],
  openRecord: (record: SourceRecord) => void
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|\[S(\d+)\]/g;
  let cursor = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > cursor) nodes.push(text.slice(cursor, m.index));
    if (m[1]) {
      nodes.push(
        <strong key={key++} className="font-semibold text-foreground">
          {m[1].slice(2, -2)}
        </strong>
      );
    } else if (m[2]) {
      nodes.push(
        <em key={key++} className="italic">
          {m[2].slice(1, -1)}
        </em>
      );
    } else if (m[3]) {
      const n = Number(m[3]);
      const record = sources[n - 1]; // sources[i] corresponds to [S{i+1}]
      nodes.push(
        <CitationChip
          key={key++}
          index={n}
          record={record}
          onClick={(r) => {
            if (r) openRecord(r);
          }}
        />
      );
    }
    cursor = m.index + m[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function AnswerBody({ answer, sources }: { answer: string; sources: SourceRecord[] }) {
  const openRecord = useApp((s) => s.openRecord);
  const blocks = React.useMemo(() => parseBlocks(answer), [answer]);
  const inline = React.useCallback(
    (text: string) => renderInline(text, sources, openRecord),
    [sources, openRecord]
  );
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        if (b.kind === 'h3') {
          return (
            <h3 key={i} className="pt-1 font-display text-lg font-semibold leading-snug text-foreground">
              {inline(b.text)}
            </h3>
          );
        }
        if (b.kind === 'h4') {
          return (
            <h4 key={i} className="font-display text-[0.95rem] font-semibold leading-snug text-foreground/90">
              {inline(b.text)}
            </h4>
          );
        }
        if (b.kind === 'quote') {
          return (
            <blockquote
              key={i}
              className="space-y-2 rounded-r-lg border-l-2 border-gold/60 bg-gold/5 py-2.5 pl-4 pr-3"
            >
              {b.lines.map((line, j) => (
                <p key={j} className="text-[0.9rem] italic leading-relaxed text-foreground/85">
                  {inline(line)}
                </p>
              ))}
            </blockquote>
          );
        }
        if (b.kind === 'ul') {
          return (
            <ul key={i} className="list-none space-y-1.5">
              {b.items.map((item, j) => (
                <li key={j} className="flex gap-2.5 leading-relaxed text-foreground/90">
                  <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                  <span>{inline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.kind === 'ol') {
          return (
            <ol key={i} className="list-none space-y-1.5">
              {b.items.map((item, j) => (
                <li key={j} className="flex gap-2.5 leading-relaxed text-foreground/90">
                  <span
                    className="mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.62rem] font-semibold tabular-nums text-primary"
                    aria-hidden
                  >
                    {item.num}
                  </span>
                  <span>{inline(item.text)}</span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="leading-relaxed text-foreground/90">
            {inline(b.text)}
          </p>
        );
      })}
    </div>
  );
}

// ————————————————— verification banner (No-Hallucination Mode) —————————————————

function VerificationBanner({ verification }: { verification: AskResponse['verification'] }) {
  const { status, notice } = verification;
  if (status === 'OK') {
    return (
      <p
        className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/8 px-3.5 py-2.5"
        role="status"
      >
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span className="text-[0.78rem] font-medium leading-relaxed text-primary">
          {notice ?? 'All citations verified against the source database.'}
        </span>
      </p>
    );
  }
  if (status === 'PARTIAL') {
    return (
      <p
        className="flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3.5 py-2.5"
        role="status"
      >
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
        <span className="text-[0.78rem] font-medium leading-relaxed text-gold">
          {notice ?? 'Some citations could not be fully verified — please read them with care.'}
        </span>
      </p>
    );
  }
  return (
    <p
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-2.5"
      role="alert"
    >
      <ShieldX className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
      <span className="text-[0.78rem] font-medium leading-relaxed text-destructive">
        {notice ?? 'BASIRA could not verify this answer against its sources — treat it with caution.'}
      </span>
    </p>
  );
}

// ————————————————— calm loading state —————————————————

function ThinkingCard() {
  const [seconds, setSeconds] = React.useState(0);
  React.useEffect(() => {
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <article
      className="paper-card rounded-xl border border-border/80 p-5 shadow-sm"
      role="status"
      aria-busy="true"
      aria-label="BASIRA is checking its sources"
    >
      <div className="flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5 animate-pulse" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-medium leading-snug text-foreground">BASIRA is checking its sources…</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            retrieving verified records before answering
            <span className="ml-1.5 tabular-nums text-muted-foreground/70" aria-hidden>
              · {seconds}s
            </span>
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-2.5 sm:pl-[3.75rem]">
        <Skeleton className="h-3.5 w-11/12 rounded-full" />
        <Skeleton className="h-3.5 w-full rounded-full" />
        <Skeleton className="h-3.5 w-7/12 rounded-full" />
      </div>
      <p className="mt-4 text-[0.7rem] italic leading-relaxed text-muted-foreground/75">
        Grounded answers take a moment — BASIRA reads each source before it writes.
      </p>
    </article>
  );
}

// ————————————————— pieces —————————————————

function UserBubble({ question }: { question: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-3 text-[0.95rem] leading-relaxed text-primary-foreground shadow-sm sm:max-w-[75%]">
        {question}
      </p>
    </div>
  );
}

function AnswerCard({ response }: { response: AskResponse }) {
  return (
    <article className="paper-card overflow-hidden rounded-xl border border-border/80 shadow-sm">
      <div className="pattern-khatim h-1.5 w-full opacity-70" aria-hidden />
      <div className="space-y-4 p-4 sm:p-5">
        <header className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <p className="font-display text-sm font-semibold tracking-wide text-foreground/85">BASIRA</p>
        </header>

        <AnswerBody answer={response.answer} sources={response.sources} />

        {/* groundingError note: when the AI service is unreachable the API
            returns verification.status OK with an honest notice, and the
            answer body itself explains it — no duplicated banner needed. */}
        <VerificationBanner verification={response.verification} />

        {response.sources.length > 0 && (
          <section aria-label="Sources for this answer" className="space-y-3 pt-1">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-3.5 w-3.5 text-gold" aria-hidden />
              <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Sources · {response.sources.length}
              </h3>
              <div className="ornament-line flex-1" aria-hidden />
            </div>
            <div className="space-y-3">
              {response.sources.map((s) => (
                <SourceCard key={s.id} record={s} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <article className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:p-5" role="alert">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive sm:mt-0.5" aria-hidden />
        <p className="flex-1 text-sm leading-relaxed text-foreground/90">{message}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="min-h-11 shrink-0 rounded-lg px-4"
        >
          <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden />
          Try again
        </Button>
      </div>
    </article>
  );
}

function Hero({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <section className="pt-4 text-center sm:pt-8">
      <div className="relative mx-auto w-fit">
        <div className="pattern-khatim absolute -inset-5 rounded-full opacity-60" aria-hidden />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg sm:h-20 sm:w-20">
          <Sparkles className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden />
        </span>
      </div>
      <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        Ask <span className="text-primary">BASIRA</span>
      </h1>
      <p className="mt-1.5 font-arabic text-2xl text-gold" lang="ar" dir="rtl">
        اسأل بصيرة
      </p>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Answers grounded only in verified sources — Qur&apos;an, Sahih al-Bukhari, and authentic
        collections. Every citation is inspectable; if BASIRA cannot verify something, it says so.
      </p>
      <div className="ornament-line mx-auto mt-6 max-w-sm" aria-hidden />
      <div className="mt-6">
        <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Try asking
        </p>
        <ul className="flex flex-wrap justify-center gap-2" aria-label="Suggested questions">
          {SUGGESTED_QUESTIONS.map((q) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => onAsk(q)}
                className="min-h-11 max-w-full rounded-full border border-border/70 bg-card px-4 py-2 text-left text-[0.82rem] font-medium leading-snug text-foreground/80 shadow-sm transition-colors hover:border-primary/40 hover:text-primary focus-ring"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ————————————————— main view —————————————————

export function AskView() {
  const viewParams = useApp((s) => s.viewParams);
  const profile = useApp((s) => s.profile);
  const updateProfile = useApp((s) => s.updateProfile);
  const { toast } = useToast();

  const restored = React.useMemo(restoreConversation, []);
  const [turns, setTurns] = React.useState<Turn[]>(restored.turns);
  const [input, setInput] = React.useState(restored.input);
  const [loading, setLoading] = React.useState(false);

  const loadingRef = React.useRef(false);
  const idRef = React.useRef(0);
  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const endRef = React.useRef<HTMLDivElement>(null);
  const autoAskedRef = React.useRef<string | null>(null);

  // persist conversation so section switches keep the thread
  React.useEffect(() => {
    conversationMemory = { turns, input, loading };
  }, [turns, input, loading]);

  const submit = React.useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || loadingRef.current) return;
      loadingRef.current = true;
      const id = `turn-${Date.now()}-${idRef.current++}`;
      setTurns((prev) => [...prev, { id, question, response: null, error: null }]);
      setInput('');
      setLoading(true);
      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            beginnerMode: useApp.getState().profile?.beginnerMode ?? false,
            madhhab: useApp.getState().profile?.madhhab ?? null,
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          const message =
            data?.error ?? `BASIRA could not complete the request (status ${res.status}). Please try again.`;
          setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, error: message } : t)));
          toast({ title: 'No answer received', description: message, variant: 'destructive' });
        } else {
          const data = (await res.json()) as AskResponse;
          setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, response: data } : t)));
        }
      } catch {
        const message =
          "Could not reach BASIRA's servers — please check your connection and try again.";
        setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, error: message } : t)));
        toast({ title: 'Connection problem', description: message, variant: 'destructive' });
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [toast]
  );

  // prefill + auto-submit once when arriving with viewParams.question
  React.useEffect(() => {
    const q = typeof viewParams?.question === 'string' ? viewParams.question.trim() : '';
    if (q && autoAskedRef.current !== q) {
      autoAskedRef.current = q;
      void submit(q);
    }
  }, [viewParams, submit]);

  // auto-scroll only when the reader is already near the bottom
  React.useEffect(() => {
    if (turns.length === 0) return;
    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 320;
    if (!nearBottom) return;
    const t = window.setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
    return () => window.clearTimeout(t);
  }, [turns, loading]);

  // textarea auto-grow
  React.useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const retry = (turn: Turn) => {
    setTurns((prev) => prev.filter((t) => t.id !== turn.id));
    void submit(turn.question);
  };

  const startFresh = () => {
    setTurns([]);
    setInput('');
  };

  const toggleBeginner = (checked: boolean) => {
    void updateProfile({ beginnerMode: checked }).catch((e: unknown) => {
      toast({
        title: 'Could not save preference',
        description: e instanceof Error ? e.message : 'Please try again.',
        variant: 'destructive',
      });
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void submit(input);
    }
  };

  const hasConversation = turns.length > 0 || loading;

  return (
    <div className="space-y-5">
      {!hasConversation ? (
        <Hero onAsk={(q) => void submit(q)} />
      ) : (
        <>
          <header className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h1 className="font-display text-xl font-semibold text-foreground">Ask BASIRA</h1>
              <span className="font-arabic text-base text-muted-foreground" lang="ar" dir="rtl">
                اسأل بصيرة
              </span>
            </div>
            {turns.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={startFresh}
                className="min-h-11 rounded-lg px-3 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden />
                Start fresh
              </Button>
            )}
          </header>
          <div className="ornament-line" aria-hidden />
        </>
      )}

      {/* ————— conversation ————— */}
      <div
        className={cn('space-y-6', turns.length > 0 && 'pb-36 lg:pb-28')}
        role="log"
        aria-label="Conversation with BASIRA"
        aria-live="polite"
      >
        {turns.map((turn) => (
          <div key={turn.id} className="space-y-3.5">
            <UserBubble question={turn.question} />
            {turn.response ? (
              <AnswerCard response={turn.response} />
            ) : turn.error ? (
              <ErrorCard message={turn.error} onRetry={() => retry(turn)} />
            ) : null}
          </div>
        ))}
        {loading && <ThinkingCard />}
      </div>

      <div ref={endRef} aria-hidden />

      {/* ————— composer (stays available for follow-ups; pinned only once a
          conversation exists, so it never covers the suggestion chips) ————— */}
      <div
        className={cn(
          'z-20',
          turns.length > 0 && 'sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] lg:bottom-6'
        )}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(input);
          }}
          aria-label="Ask BASIRA a question"
          className="overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-lg shadow-foreground/5 backdrop-blur-md"
        >
          <div className="flex items-end gap-2 p-2.5">
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              enterKeyHint="send"
              placeholder="Ask anything — BASIRA answers only from verified sources…"
              aria-label="Your question for BASIRA"
              className="scrollbar-soft max-h-40 min-h-11 flex-1 resize-none overflow-y-auto rounded-xl bg-transparent px-3 py-2.5 text-[0.95rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              aria-label="Send question to BASIRA"
              className="h-11 w-11 shrink-0 rounded-xl"
            >
              <Sparkles className="h-5 w-5" aria-hidden />
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border/60 px-3 py-1">
            <label
              htmlFor="ask-beginner"
              className="flex min-h-11 cursor-pointer select-none items-center gap-2.5"
            >
              <Switch
                id="ask-beginner"
                checked={profile?.beginnerMode ?? false}
                onCheckedChange={toggleBeginner}
              />
              <span className="text-[0.78rem] leading-snug text-muted-foreground">
                <span className="font-semibold text-foreground/80">Beginner Mode</span> — simple
                explanations
              </span>
            </label>
            <div className="flex items-center gap-2.5">
              {profile?.madhhab ? (
                <Badge
                  variant="outline"
                  className="border-border/70 text-[0.62rem] font-medium text-muted-foreground"
                >
                  Madhhab · {profile.madhhab}
                </Badge>
              ) : null}
              <span className="hidden text-[0.65rem] text-muted-foreground/70 sm:inline">
                Enter ↵ send · Shift+Enter new line
              </span>
            </div>
          </div>
        </form>
        <p className="mt-2.5 px-2 text-center text-[0.68rem] leading-relaxed text-muted-foreground/75">
          For personal rulings (marriage, divorce, inheritance, finance, abuse, medical), BASIRA
          provides general guidance and recommends a qualified scholar.
        </p>
      </div>
    </div>
  );
}
