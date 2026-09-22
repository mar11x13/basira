'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import { useT, useUiLanguage } from '@/lib/i18n';
import { ViewHeader } from '@/components/shared/view-header';
import { TypeBadge } from '@/components/shared/source-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bookmark,
  BookOpen,
  HandHeart,
  ScrollText,
  Sparkles,
  Trash2,
  Library,
  BookUser,
  MoonStar,
  Repeat,
  ShieldCheck,
} from 'lucide-react';
import type { BookmarkItem, SourceType } from '@/lib/types';
import { SOURCE_TYPE_LABELS } from '@/lib/types';

// ============================================================================
// BookmarksView — your saved verses, hadith, and duas in one place.
// Bookmarks are personal: they belong to the anonymous session and can be
// removed at any time. Every entry keeps its full citation and verification
// status — saving never loosens BASIRA's sourcing rules.
// ============================================================================

const TYPE_ICON: Partial<Record<SourceType, React.ElementType>> = {
  QURAN: BookOpen,
  HADITH: ScrollText,
  DUA: HandHeart,
  DHIKR: Repeat,
  FIQH: MoonStar,
  GLOSSARY: Library,
  SEERAH: BookUser,
  SCHOLARLY: ShieldCheck,
  GENERAL: Sparkles,
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

function BookmarkRow({ item, onRemoved }: { item: BookmarkItem; onRemoved: (slug: string) => void }) {
  const r = item.record;
  const openRecordBySlug = useApp((s) => s.openRecordBySlug);
  const toggleBookmark = useApp((s) => s.toggleBookmark);
  const t = useT();
  const lang = useUiLanguage();
  const arabic = lang === 'ar';
  const [removing, setRemoving] = React.useState(false);
  const [justRemoved, setJustRemoved] = React.useState(false);

  const Icon = TYPE_ICON[r.sourceType] ?? Sparkles;

  const remove = async () => {
    if (removing) return;
    setRemoving(true);
    const stillSaved = await toggleBookmark(r.slug);
    setRemoving(false);
    if (stillSaved === false) {
      setJustRemoved(true);
      // Brief exit animation before the parent drops the row.
      window.setTimeout(() => onRemoved(r.slug), 240);
    }
  };

  return (
    <article
      className={cn(
        'paper-card rounded-xl border border-border/80 p-4 shadow-sm transition-all duration-200',
        justRemoved ? 'opacity-0 scale-[0.98] translate-x-2' : 'hover:shadow-md'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={r.sourceType} />
            {r.verificationStatus === 'VERIFIED' ? (
              <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-primary">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-gold">
                <Bookmark className="h-3.5 w-3.5" aria-hidden />
                {r.verificationStatus === 'DISPUTED' ? 'Disputed' : 'Reference pending'}
              </span>
            )}
          </div>

          <h3 className="mt-1.5 font-semibold text-foreground leading-snug">{r.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{r.citation}</p>

          {r.englishText && (
            <p className="text-sm text-foreground/85 leading-relaxed mt-2 line-clamp-2">{r.englishText}</p>
          )}

          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className={cn('h-10 px-4', arabic && 'font-arabic')}
              onClick={() => void openRecordBySlug(r.slug)}
            >
              <BookOpen className="h-4 w-4 me-1.5" aria-hidden />
              {t('common.inspectSource')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn('h-10 px-4 text-destructive hover:text-destructive', arabic && 'font-arabic')}
              onClick={() => void remove()}
              disabled={removing}
              aria-label={`${t('common.remove')} ${r.citation}`}
            >
              {removing ? (
                <span className="animate-pulse" aria-hidden>
                  {arabic ? 'جارٍ الإزالة…' : 'Removing…'}
                </span>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 me-1.5" aria-hidden />
                  {t('common.remove')}
                </>
              )}
            </Button>
            <span className="ms-auto text-[0.65rem] text-muted-foreground">
              {t('common.savedOn')} {formatDate(item.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyLibrary({ hasItems }: { hasItems: boolean }) {
  const setView = useApp((s) => s.setView);
  const lang = useUiLanguage();
  const arabic = lang === 'ar';
  return (
    <div className={cn('text-center py-12 px-4', arabic && 'font-arabic')}>
      <div className="mx-auto w-fit rounded-full bg-primary/8 p-4">
        <Bookmark className="h-9 w-9 text-primary/70" aria-hidden />
      </div>
      <p className={cn('mt-4 text-lg font-semibold text-foreground/85', !arabic && 'font-display')}>
        {hasItems
          ? arabic
            ? 'لا توجد محفوظات في هذا التصنيف'
            : 'No bookmarks in this filter'
          : arabic
            ? 'مكتبة محفوظاتك فارغة'
            : 'Your bookmark library is empty'}
      </p>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
        {hasItems
          ? arabic
            ? 'جرّب تصنيفًا آخر في الأعلى لرؤية بقية محفوظاتك.'
            : 'Try another type filter above to see the rest of your saved items.'
          : arabic
            ? 'اضغط أيقونة الحفظ على أي آية أو حديث أو دعاء لتجدها هنا. كل ما تحفظه يبقى بمرجعه الكامل وحالة توثيقه.'
            : 'Tap the bookmark icon on any verse, hadith, or dua to save it here. Everything you save keeps its full citation and verification status.'}
      </p>
      {!hasItems && (
        <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
          <Button variant="outline" className="h-11 px-5" onClick={() => setView('quran')}>
            <BookOpen className="h-4 w-4 me-2" aria-hidden />
            {arabic ? 'تصفّح القرآن' : 'Explore the Qur\u2019an'}
          </Button>
          <Button variant="outline" className="h-11 px-5" onClick={() => setView('hadith')}>
            <ScrollText className="h-4 w-4 me-2" aria-hidden />
            {arabic ? 'تصفّح الأحاديث' : 'Browse hadith'}
          </Button>
          <Button variant="outline" className="h-11 px-5" onClick={() => setView('dua')}>
            <HandHeart className="h-4 w-4 me-2" aria-hidden />
            {arabic ? 'ابحث عن دعاء' : 'Find a dua'}
          </Button>
        </div>
      )}
    </div>
  );
}

export function BookmarksView() {
  const bookmarks = useApp((s) => s.bookmarks);
  const profile = useApp((s) => s.profile);
  const booted = useApp((s) => s.booted);
  const t = useT();
  const lang = useUiLanguage();
  const arabic = lang === 'ar';

  // The store loads bookmarks on boot; while booting show skeletons so a
  // logged library never flashes as "empty" first.
  const [filter, setFilter] = React.useState<'ALL' | SourceType>('ALL');
  const [removed, setRemoved] = React.useState<string[]>([]);

  const items = React.useMemo(
    () => bookmarks.filter((b) => !removed.includes(b.record.slug)),
    [bookmarks, removed]
  );

  const types = React.useMemo(() => {
    const counts = new Map<SourceType, number>();
    for (const b of items) counts.set(b.record.sourceType, (counts.get(b.record.sourceType) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filtered = React.useMemo(
    () => (filter === 'ALL' ? items : items.filter((b) => b.record.sourceType === filter)),
    [items, filter]
  );

  return (
    <div>
      <ViewHeader
        title={arabic ? 'المحفوظات' : 'Bookmarks'}
        titleAr={arabic ? undefined : 'المحفوظات'}
        description={
          arabic
            ? 'آياتك وأحاديثك وأدعيتك المحفوظة — تُحفظ في هذه الجلسة المجهولة. كل عنصرٍ محفوظ يبقى بمرجعه وحالة توثيقه.'
            : `Your saved verses, hadith, duas and more — kept in this anonymous session${
                profile?.displayName ? `, ${profile.displayName}` : ''
              }. Every saved item keeps its citation and verification status.`
        }
      />

      {/* ——— Summary line ——— */}
      <p className={cn('text-sm text-muted-foreground mb-4', arabic && 'font-arabic')} role="status" aria-live="polite">
        {booted && items.length > 0 ? (
          arabic ? (
            <>
              <span className="font-semibold text-foreground">{items.length}</span> عنصر محفوظ
            </>
          ) : (
            <>
              <span className="font-semibold text-foreground">{items.length}</span> saved{' '}
              {items.length === 1 ? 'item' : 'items'}
              {types.length > 1 && (
                <>
                  {' '}
                  — {types.map(([ty, n]) => `${n} ${SOURCE_TYPE_LABELS[ty] ?? ty}`).join(' · ')}
                </>
              )}
            </>
          )
        ) : booted && items.length === 0 ? null : (
          'Loading your bookmarks…'
        )}
      </p>

      {/* ——— Type filters ——— */}
      {types.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Filter bookmarks by type">
          <button
            onClick={() => setFilter('ALL')}
            className={cn(
              'min-h-11 px-4 rounded-full text-sm font-medium border transition-colors focus-ring',
              filter === 'ALL'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground'
            )}
            aria-pressed={filter === 'ALL'}
          >
            All · {items.length}
          </button>
          {types.map(([t, n]) => {
            const active = filter === t;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  'min-h-11 px-4 rounded-full text-sm font-medium border transition-colors focus-ring',
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground'
                )}
                aria-pressed={active}
              >
                {SOURCE_TYPE_LABELS[t] ?? t} · {n}
              </button>
            );
          })}
        </div>
      )}

      {/* ——— List ——— */}
      {!booted ? (
        <div role="status" aria-busy="true" className="space-y-3">
          <span className="sr-only">Loading bookmarks…</span>
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyLibrary hasItems={items.length > 0} />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <BookmarkRow
              key={b.id}
              item={b}
              onRemoved={(slug) => setRemoved((prev) => [...prev, slug])}
            />
          ))}
        </div>
      )}

      {/* ——— Honest note ——— */}
      {items.length > 0 && (
        <p className={cn('mt-6 text-center text-[0.68rem] text-muted-foreground leading-relaxed max-w-md mx-auto', arabic && 'font-arabic')}>
          {arabic
            ? 'المحفوظات تُحفظ في هذه الجلسة المجهولة فقط. حذف بياناتك من الإعدادات (الخصوصية) يزيلها نهائيًا — لا شيء يُشارك ولا يُباع.'
            : 'Bookmarks live in this anonymous session only. Deleting your data in Settings (Privacy) removes them permanently — nothing is shared or sold.'}
        </p>
      )}
    </div>
  );
}
