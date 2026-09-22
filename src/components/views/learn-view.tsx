'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';
import { SourceCard } from '@/components/shared/source-card';
import { ViewHeader, EmptyState } from '@/components/shared/view-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { LearningPath, Lesson, SourceRecord } from '@/lib/types';
import {
  BookMarked,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  HeartHandshake,
  Library,
  MoonStar,
  RefreshCw,
  Scale,
  ScrollText,
  Sparkles,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// LearnView — structured, self-paced learning paths. Progress is saved per
// user via /api/progress; deliberately no streaks, points, or leaderboards.
// Navigation (paths → path → lesson) is in-component state.
// ============================================================================

const PATH_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'moon-star': MoonStar,
  'book-open': BookOpen,
  scroll: ScrollText,
  library: Library,
  'book-marked': BookMarked,
  scale: Scale,
  'heart-handshake': HeartHandshake,
  sun: Sun,
  sparkles: Sparkles,
};

const LEVEL_STYLES: Record<LearningPath['level'], string> = {
  Beginner: 'border-primary/30 bg-primary/10 text-primary',
  Intermediate: 'border-gold/45 bg-gold/10 text-gold',
  Advanced: 'border-[hsl(335_30%_45%)]/35 bg-[hsl(335_40%_50%)]/10 text-[hsl(335_30%_40%)] dark:text-[hsl(335_50%_74%)]',
};

function lessonKey(pathId: string, lessonId: string): string {
  return `${pathId}::${lessonId}`;
}

export function LearnView() {
  const [paths, setPaths] = React.useState<LearningPath[] | null>(null);
  const [done, setDone] = React.useState<Set<string>>(new Set());
  const [openPathId, setOpenPathId] = React.useState<string | null>(null);
  const [openLessonId, setOpenLessonId] = React.useState<string | null>(null);
  const [error, setError] = React.useState(false);
  const viewParams = useApp((s) => s.viewParams);
  const { toast } = useToast();

  const load = React.useCallback(() => {
    setError(false);
    fetch('/api/learn')
      .then((r) => {
        if (!r.ok) throw new Error('load failed');
        return r.json();
      })
      .then(
        (d: {
          paths?: LearningPath[];
          progress?: { pathId: string; lessonId: string; completed: boolean }[];
        }) => {
          setPaths(d.paths ?? []);
          setDone(
            new Set(
              (d.progress ?? [])
                .filter((p) => p.completed)
                .map((p) => lessonKey(p.pathId, p.lessonId))
            )
          );
        }
      )
      .catch(() => setError(true));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  // Deep-link support: setView('learn', { pathId }) opens that path directly.
  React.useEffect(() => {
    const pid = viewParams?.pathId;
    if (paths && typeof pid === 'string' && paths.some((p) => p.id === pid)) {
      setOpenPathId(pid);
      setOpenLessonId(null);
    }
  }, [paths, viewParams]);

  const toggleLesson = React.useCallback(
    async (pathId: string, lessonId: string, completed: boolean) => {
      const key = lessonKey(pathId, lessonId);
      // optimistic update
      setDone((prev) => {
        const next = new Set(prev);
        if (completed) next.add(key);
        else next.delete(key);
        return next;
      });
      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: 'lesson', pathId, lessonId, completed }),
        });
        if (!res.ok) throw new Error('save failed');
        if (completed) {
          toast({ title: 'Lesson completed', description: 'May Allah accept it from you.' });
        }
      } catch {
        // rollback on failure
        setDone((prev) => {
          const next = new Set(prev);
          if (completed) next.delete(key);
          else next.add(key);
          return next;
        });
        toast({
          title: 'Could not save progress',
          description: 'Please check your connection and try again.',
        });
      }
    },
    [toast]
  );

  const openPath = paths?.find((p) => p.id === openPathId) ?? null;

  return (
    <div className="space-y-6">
      <ViewHeader
        back
        title="Learning Paths"
        titleAr="مسارات التعلم"
        description="Structured, self-paced Islamic learning — from your first prayer to deeper sciences. Progress is yours alone: no leaderboards, no competition — just you and Allah."
      />

      {error ? (
        <div className="text-center py-8">
          <EmptyState
            icon={<RefreshCw className="h-8 w-8" aria-hidden />}
            title="Could not load the learning paths"
            hint="Your connection may have dropped — please try again."
          />
          <Button variant="outline" size="lg" className="mt-1 rounded-xl" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
            Try again
          </Button>
        </div>
      ) : !paths ? (
        <div className="space-y-5" role="status" aria-busy="true" aria-label="Loading learning paths">
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        </div>
      ) : openPath ? (
        <PathDetail
          path={openPath}
          done={done}
          openLessonId={openLessonId}
          onOpenLesson={setOpenLessonId}
          onToggle={toggleLesson}
          onBack={() => {
            setOpenPathId(null);
            setOpenLessonId(null);
          }}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {paths.map((path) => {
              const Icon = PATH_ICONS[path.icon] ?? BookOpen;
              const total = path.lessons.length;
              const completed = path.lessons.filter((l) => done.has(lessonKey(path.id, l.id))).length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const finished = total > 0 && completed === total;
              return (
                <button
                  key={path.id}
                  type="button"
                  onClick={() => {
                    setOpenPathId(path.id);
                    setOpenLessonId(null);
                  }}
                  className="paper-card group rounded-xl border border-border/80 bg-card p-4 sm:p-5 text-left shadow-sm overflow-hidden transition-all hover:border-primary/40 hover:shadow-md focus-ring"
                  aria-label={`Open learning path: ${path.title}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <Badge
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold',
                        LEVEL_STYLES[path.level] ?? LEVEL_STYLES.Beginner
                      )}
                    >
                      {path.level}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
                    <h3 className="font-display text-lg font-semibold text-foreground leading-snug">
                      {path.title}
                    </h3>
                    {path.titleAr && (
                      <span className="font-arabic text-base text-muted-foreground">{path.titleAr}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{path.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>
                      {total} lesson{total === 1 ? '' : 's'}
                    </span>
                    <span className={cn('font-semibold tabular-nums', finished && 'text-primary')}>
                      {completed}/{total} completed
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className="mt-2 h-1.5"
                    aria-label={`Progress: ${completed} of ${total} lessons completed`}
                  />
                </button>
              );
            })}
          </div>
          <p className="flex items-center justify-center gap-1.5 flex-wrap pt-1 text-center text-xs text-muted-foreground">
            <HeartHandshake className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
            Religious learning is worship — BASIRA deliberately has no streaks, points, or leaderboards.
          </p>
        </>
      )}
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Path detail — lesson list with inline lesson panels
// ————————————————————————————————————————————————————————————————

function PathDetail({
  path,
  done,
  openLessonId,
  onOpenLesson,
  onToggle,
  onBack,
}: {
  path: LearningPath;
  done: Set<string>;
  openLessonId: string | null;
  onOpenLesson: (lessonId: string | null) => void;
  onToggle: (pathId: string, lessonId: string, completed: boolean) => Promise<void>;
  onBack: () => void;
}) {
  const Icon = PATH_ICONS[path.icon] ?? BookOpen;
  const total = path.lessons.length;
  const completed = path.lessons.filter((l) => done.has(lessonKey(path.id, l.id))).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section aria-label={`Learning path: ${path.title}`} className="space-y-5">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-9 px-2 text-muted-foreground hover:text-foreground"
          onClick={onBack}
          aria-label="Back to all learning paths"
        >
          <ChevronLeft className="h-4 w-4 mr-1" aria-hidden />
          All paths
        </Button>
      </div>

      <header className="paper-card rounded-xl border border-border/80 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground leading-tight">
                  {path.title}
                </h2>
                {path.titleAr && (
                  <span className="font-arabic text-lg text-muted-foreground">{path.titleAr}</span>
                )}
              </div>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground leading-relaxed">
                {path.description}
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold',
              LEVEL_STYLES[path.level] ?? LEVEL_STYLES.Beginner
            )}
          >
            {path.level}
          </Badge>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {completed} of {total} lesson{total === 1 ? '' : 's'} completed
          </span>
          <span className="font-semibold tabular-nums text-foreground/70">{pct}%</span>
        </div>
        <Progress
          value={pct}
          className="mt-1.5 h-1.5"
          aria-label={`Path progress: ${completed} of ${total} lessons completed`}
        />
      </header>

      <ol className="space-y-2.5">
        {path.lessons.map((lesson, index) => {
          const key = lessonKey(path.id, lesson.id);
          const isDone = done.has(key);
          const isOpen = openLessonId === lesson.id;
          return (
            <li key={lesson.id}>
              <div
                className={cn(
                  'flex items-stretch overflow-hidden rounded-xl border bg-card transition-colors',
                  isOpen ? 'border-primary/40 shadow-sm' : 'border-border/80'
                )}
              >
                <button
                  type="button"
                  className="flex min-h-[3.25rem] flex-1 items-center gap-3 p-3.5 text-left focus-ring"
                  onClick={() => onOpenLesson(isOpen ? null : lesson.id)}
                  aria-expanded={isOpen}
                  aria-controls={`lesson-panel-${lesson.id}`}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      isDone ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}
                    aria-hidden
                  >
                    {isDone ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-snug text-foreground">{lesson.title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {lesson.summary}
                    </span>
                  </span>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                      isOpen && 'rotate-90'
                    )}
                    aria-hidden
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void onToggle(path.id, lesson.id, !isDone);
                  }}
                  className="flex w-14 shrink-0 items-center justify-center border-l border-border/70 transition-colors focus-ring"
                  aria-pressed={isDone}
                  aria-label={
                    isDone
                      ? `Mark "${lesson.title}" as not completed`
                      : `Mark "${lesson.title}" as completed`
                  }
                >
                  <CircleCheck
                    className={cn(
                      'h-5 w-5',
                      isDone ? 'text-primary' : 'text-muted-foreground/40 hover:text-primary/70'
                    )}
                    aria-hidden
                  />
                </button>
              </div>
              {isOpen && (
                <LessonPanel path={path} lesson={lesson} index={index} isDone={isDone} onToggle={onToggle} />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Lesson panel — summary, optional content blocks, sourced records,
// and the "Mark as complete" toggle
// ————————————————————————————————————————————————————————————————

function LessonPanel({
  path,
  lesson,
  index,
  isDone,
  onToggle,
}: {
  path: LearningPath;
  lesson: Lesson;
  index: number;
  isDone: boolean;
  onToggle: (pathId: string, lessonId: string, completed: boolean) => Promise<void>;
}) {
  const [records, setRecords] = React.useState<SourceRecord[] | null>(null);
  const [recordsError, setRecordsError] = React.useState(false);

  React.useEffect(() => {
    const slugs = lesson.recordSlugs ?? [];
    if (slugs.length === 0) {
      setRecords([]);
      setRecordsError(false);
      return;
    }
    let cancelled = false;
    setRecords(null);
    setRecordsError(false);
    fetch(`/api/content?slugs=${slugs.map(encodeURIComponent).join(',')}`)
      .then((r) => {
        if (!r.ok) throw new Error('load failed');
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setRecords(Array.isArray(d.items) ? d.items : []);
      })
      .catch(() => {
        if (!cancelled) setRecordsError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lesson.id, lesson.recordSlugs]);

  return (
    <div
      id={`lesson-panel-${lesson.id}`}
      className="mb-1 ml-4 mt-2 space-y-4 rounded-xl border border-border/70 border-l-2 border-l-primary/50 bg-muted/30 p-4 sm:ml-6 sm:p-5"
    >
      <div className="space-y-1">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Lesson {index + 1}
        </p>
        <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{lesson.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{lesson.summary}</p>
      </div>

      {lesson.contentBlocks && lesson.contentBlocks.length > 0 && (
        <div className="space-y-3">
          {lesson.contentBlocks.map((block, i) => (
            <section key={i} className="rounded-lg border border-border/60 bg-card p-3.5">
              {block.heading && (
                <h4 className="mb-1 font-display text-sm font-semibold text-foreground/85">
                  {block.heading}
                </h4>
              )}
              <p className="text-sm leading-relaxed text-foreground/85">{block.body}</p>
            </section>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {records === null && !recordsError && (
          <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading lesson sources">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        )}
        {recordsError && (
          <p className="text-sm italic text-muted-foreground">
            The sources for this lesson could not be loaded — please close and reopen the lesson to try
            again.
          </p>
        )}
        {records?.map((record) => (
          <SourceCard key={record.slug} record={record} defaultOpen />
        ))}
        {records?.length === 0 && (
          <p className="text-sm italic text-muted-foreground">
            This lesson&apos;s source list is being prepared — BASIRA only shows verified texts, so nothing
            is invented to fill the gap.
          </p>
        )}
      </div>

      <Button
        type="button"
        size="lg"
        variant={isDone ? 'outline' : 'default'}
        className="h-11 w-full rounded-xl font-semibold sm:w-auto"
        onClick={() => {
          void onToggle(path.id, lesson.id, !isDone);
        }}
        aria-pressed={isDone}
      >
        {isDone ? (
          <>
            <Check className="h-4 w-4 mr-2" aria-hidden />
            Completed — tap to undo
          </>
        ) : (
          <>
            <CircleCheck className="h-4 w-4 mr-2" aria-hidden />
            Mark as complete
          </>
        )}
      </Button>
    </div>
  );
}
