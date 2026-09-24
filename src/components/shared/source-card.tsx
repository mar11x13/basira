'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/store';
import { ArabicText, TransliterationText } from '@/components/shared/arabic-text';
import type { SourceRecord, SourceType, VerificationStatus } from '@/lib/types';
import { SOURCE_TYPE_LABELS } from '@/lib/types';
import {
  BookOpen,
  Bookmark as BookmarkIcon,
  Check,
  ChevronDown,
  Copy,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================================================
// SourceCard — BASIRA's trust unit. Every verse, hadith, dua, and view
// renders through this component: type badge, exact citation, verification
// status, Arabic, translation, explanation, actions.
// ============================================================================

const TYPE_STYLES: Record<SourceType, string> = {
  QURAN: 'bg-primary text-primary-foreground',
  HADITH: 'bg-gold text-gold-foreground',
  DUA: 'bg-[hsl(12_38%_46%)] text-white',
  DHIKR: 'bg-[hsl(140_28%_34%)] text-white',
  FIQH: 'bg-[hsl(28_32%_40%)] text-white',
  GLOSSARY: 'bg-secondary text-secondary-foreground border border-border',
  SEERAH: 'bg-[hsl(190_30%_30%)] text-white',
  SCHOLARLY: 'bg-[hsl(335_18%_38%)] text-white',
  GENERAL: 'bg-muted text-muted-foreground border border-border',
};

export function TypeBadge({ type, className }: { type: SourceType; className?: string }) {
  return (
    <Badge className={cn('font-semibold tracking-wide uppercase text-[0.62rem] rounded-md px-2 py-0.5', TYPE_STYLES[type] ?? TYPE_STYLES.GENERAL, className)}>
      {SOURCE_TYPE_LABELS[type] ?? type}
    </Badge>
  );
}

function VerificationBadge({ status, note }: { status: VerificationStatus; note?: string | null }) {
  if (status === 'VERIFIED') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Verified
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-64 text-xs">
          This reference was checked against BASIRA&apos;s verified source database.
        </TooltipContent>
      </Tooltip>
    );
  }
  if (status === 'DISPUTED') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-[hsl(12_60%_45%)]">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
            Scholars differ — see note
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-64 text-xs">
          {note ?? 'This report or its grading is debated among scholars. Read the explanation for the honest breakdown.'}
        </TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-gold">
          <ShieldQuestion className="h-3.5 w-3.5" aria-hidden />
          Reference pending
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64 text-xs">
        The text is from an authentic source, but BASIRA has not fully confirmed the reference number — it is deliberately shown as pending rather than guessed.
      </TooltipContent>
    </Tooltip>
  );
}

export function SourceCard({
  record,
  compact = false,
  defaultOpen = false,
  className,
  onCitationClick,
}: {
  record: SourceRecord;
  compact?: boolean;
  defaultOpen?: boolean;
  className?: string;
  onCitationClick?: (record: SourceRecord) => void;
}) {
  const toggleBookmark = useApp((s) => s.toggleBookmark);
  const bookmarked = useApp((s) => s.bookmarkSlugs.has(record.slug));
  const openRecord = useApp((s) => s.openRecord);
  const [expanded, setExpanded] = React.useState(defaultOpen);
  const [copied, setCopied] = React.useState(false);

  const copyCitation = async () => {
    const text =
      record.sourceType === 'QURAN'
        ? `"${record.englishText}" — Qur'an ${record.surahNumber}:${record.ayahNumber}${record.ayahEnd && record.ayahEnd !== record.ayahNumber ? `-${record.ayahEnd}` : ''} (${record.surahNameEn})`
        : `"${record.englishText}" — ${record.citation}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <article
      className={cn(
        'paper-card rounded-xl border border-border/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden',
        className
      )}
    >
      {/* header */}
      <header className="px-4 pt-3.5 pb-2.5 flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <TypeBadge type={record.sourceType} />
          <button
            onClick={() => (onCitationClick ? onCitationClick(record) : openRecord(record))}
            className="tap-area text-sm font-semibold text-foreground hover:text-primary transition-colors text-start leading-snug focus-ring rounded-sm"
            aria-label={`Inspect source: ${record.citation}`}
          >
            {record.citation}
          </button>
        </div>
        <VerificationBadge status={record.verificationStatus} note={record.referenceNote} />
      </header>

      {/* body */}
      <div className="px-4 pb-3.5 space-y-2">
        {record.arabicText ? (
          <ArabicText text={record.arabicText} size={compact ? 'sm' : 'base'} />
        ) : null}
        <TransliterationText text={record.transliteration} />

        <p className={cn('text-foreground/90 leading-relaxed', compact ? 'text-[0.92rem]' : 'text-[0.95rem]')}>
          {record.englishText}
        </p>

        {record.excerptOnly && (
          <p className="text-xs text-muted-foreground italic">
            Excerpt of the ayah — marked with an ellipsis; read the full ayah in the reader.
          </p>
        )}

        {record.explanation && (expanded || defaultOpen) && (
          <div className="text-sm text-muted-foreground leading-relaxed border-t border-border/60 pt-2.5 mt-1">
            <span className="font-semibold text-foreground/70 block mb-1 text-[0.7rem] uppercase tracking-wider">
              Explanation
            </span>
            {record.explanation}
            {record.practicalSteps?.length ? (
              <ol className="mt-2 list-decimal list-inside space-y-1 marker:text-gold">
                {record.practicalSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            ) : null}
            {record.referenceNote && (
              <p className="mt-2 text-xs italic opacity-90">{record.referenceNote}</p>
            )}
          </div>
        )}

        {/* actions */}
        <div className="flex items-center gap-1 pt-1 flex-wrap">
          {record.explanation ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-11 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
            >
              <ChevronDown className={cn('h-3.5 w-3.5 me-1 transition-transform', expanded && 'rotate-180')} />
              {expanded ? 'Less' : 'Explanation'}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            className="h-11 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={copyCitation}
          >
            {copied ? <Check className="h-3.5 w-3.5 me-1 text-primary" /> : <Copy className="h-3.5 w-3.5 me-1" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-11 px-2.5 text-xs ms-auto',
              bookmarked ? 'text-gold hover:text-gold' : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => toggleBookmark(record.slug ?? record.id)}
            aria-label={bookmarked ? 'Remove bookmark' : 'Save to bookmarks'}
            aria-pressed={bookmarked}
          >
            <BookmarkIcon className={cn('h-3.5 w-3.5 me-1', bookmarked && 'fill-current')} />
            {bookmarked ? 'Saved' : 'Save'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-11 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => (onCitationClick ? onCitationClick(record) : openRecord(record))}
            aria-label="Inspect full source"
          >
            <BookOpen className="h-3.5 w-3.5 me-1" />
            Source
          </Button>
        </div>
      </div>
    </article>
  );
}

/** Small inline citation chip used inside AI answers ([S1]…). */
export function CitationChip({
  index,
  record,
  onClick,
}: {
  index: number;
  record?: SourceRecord;
  onClick?: (record?: SourceRecord) => void;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onClick?.(record)}
            className="inline-flex items-center mx-0.5 align-baseline rounded-full border border-primary/40 bg-primary/10 text-primary text-[0.7rem] font-semibold px-2 min-h-7 leading-none hover:bg-primary/20 transition-colors focus-ring"
            aria-label={`Source ${index}: ${record?.citation ?? 'unverified'}`}
          >
            S{index}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-72 text-xs">
          {record ? (
            <span className="font-semibold">{record.citation}</span>
          ) : (
            'Citation not matched — treat with caution'
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
