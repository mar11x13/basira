'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/lib/store';
import { ArabicText, TransliterationText } from '@/components/shared/arabic-text';
import { TypeBadge } from '@/components/shared/source-card';
import { useIsMobile } from '@/hooks/use-device';
import type { SourceRecord } from '@/lib/types';
import { Bookmark as BookmarkIcon, Copy, Check, Share2 } from 'lucide-react';

// ============================================================================
// RecordDialog — the citation inspector. Tapping ANY citation anywhere in
// BASIRA opens this with the full auditable source metadata.
//
// Mobile-first: on phone-class viewports it renders as a bottom sheet (thumb
// reach, safe-area padding, drag-friendly); on tablet/desktop it stays a
// centered dialog. Same content, same honesty, both presentations.
// ============================================================================

function buildMeta(record: SourceRecord) {
  const meta: { label: string; value?: string | null }[] = [];
  if (record.sourceType === 'QURAN') {
    meta.push(
      { label: 'Surah', value: `${record.surahNumber} — ${record.surahNameEn}` },
      { label: 'Ayah', value: record.ayahEnd && record.ayahEnd !== record.ayahNumber ? `${record.ayahNumber}–${record.ayahEnd}` : String(record.ayahNumber ?? '') },
      { label: 'Arabic name', value: record.surahNameAr ?? undefined },
    );
  }
  if (record.collection) meta.push({ label: 'Collection', value: record.collection });
  if (record.book) meta.push({ label: 'Book', value: record.book });
  if (record.chapter) meta.push({ label: 'Chapter', value: record.chapter });
  if (record.hadithNumber != null) meta.push({ label: 'Hadith', value: String(record.hadithNumber) });
  else if (record.sourceType === 'HADITH') meta.push({ label: 'Hadith', value: 'Number pending verification' });
  if (record.narrator) meta.push({ label: 'Narrated by', value: record.narrator });
  if (record.grade) meta.push({ label: 'Grade', value: record.grade });
  if (record.scholar) meta.push({ label: 'Scholar / position', value: record.scholar });
  if (record.school) meta.push({ label: 'School', value: record.school });
  return meta;
}

export function RecordDialog() {
  const record = useApp((s) => s.inspecting);
  const closeRecord = useApp((s) => s.closeRecord);
  const toggleBookmark = useApp((s) => s.toggleBookmark);
  const bookmarked = useApp((s) => (record ? s.bookmarkSlugs.has(record.slug) : false));
  const isMobile = useIsMobile();
  const [copied, setCopied] = React.useState(false);
  const [shared, setShared] = React.useState(false);

  React.useEffect(() => {
    setCopied(false);
    setShared(false);
  }, [record?.slug]);

  if (!record) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${record.citation}\n\n${record.arabicText ? record.arabicText + '\n\n' : ''}${record.englishText}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — the button simply reports nothing */
    }
  };

  const share = async () => {
    const text = `${record.citation}\n\n${record.arabicText ? record.arabicText + '\n\n' : ''}${record.englishText}\n\n— via BASIRA (verified sources)`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: record.title, text });
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      } else {
        await copy();
      }
    } catch {
      /* user dismissed the share sheet — not an error */
    }
  };

  const meta = buildMeta(record);

  const headerBlock = (
    <div className="flex items-center gap-2 flex-wrap">
      <TypeBadge type={record.sourceType} />
      <Badge
        variant="outline"
        className={
          record.verificationStatus === 'VERIFIED'
            ? 'text-primary border-primary/40'
            : record.verificationStatus === 'DISPUTED'
              ? 'text-[hsl(12_60%_45%)] border-[hsl(12_60%_45%)]/40'
              : 'text-gold border-gold/40'
        }
      >
        {record.verificationStatus === 'VERIFIED'
          ? 'Verified reference'
          : record.verificationStatus === 'DISPUTED'
            ? 'Disputed / graded differently'
            : 'Reference pending verification'}
      </Badge>
    </div>
  );

  const actions = (
    <div className="flex gap-2 pt-1 flex-wrap">
      <Button variant="outline" size="sm" className="h-11 text-xs" onClick={copy}>
        {copied ? <Check className="h-4 w-4 ms-1 text-primary" /> : <Copy className="h-4 w-4 ms-1" />}
        {copied ? 'Copied' : 'Copy source'}
      </Button>
      <Button
        variant={bookmarked ? 'default' : 'outline'}
        size="sm"
        className="h-11 text-xs"
        onClick={() => toggleBookmark(record.slug ?? record.id)}
      >
        <BookmarkIcon className={`h-4 w-4 ms-1 ${bookmarked ? 'fill-current' : ''}`} />
        {bookmarked ? 'Saved' : 'Save'}
      </Button>
      <Button variant="outline" size="sm" className="h-11 text-xs" onClick={share}>
        {shared ? <Check className="h-4 w-4 ms-1 text-primary" /> : <Share2 className="h-4 w-4 ms-1" />}
        {shared ? 'Shared' : 'Share'}
      </Button>
    </div>
  );

  const bodyContent = (
    <div className="space-y-3">
      {record.arabicText && (
        <div className="rounded-lg bg-muted/60 p-3">
          <ArabicText text={record.arabicText} />
          <TransliterationText text={record.transliteration} className="mt-1" />
        </div>
      )}

      <p className="text-[0.95rem] leading-relaxed text-foreground/90">{record.englishText}</p>

      {record.explanation && (
        <div className="text-sm text-muted-foreground leading-relaxed border-t border-border/60 pt-3">
          <span className="font-semibold text-foreground/70 block mb-1 text-[0.7rem] uppercase tracking-wider">
            Explanation
          </span>
          {record.explanation}
          {record.practicalSteps?.length ? (
            <ol className="mt-2 list-decimal list-inside space-y-1 marker:text-gold">
              {record.practicalSteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          ) : null}
        </div>
      )}

      <Separator />

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {meta.map((m) =>
          m.value ? (
            <div key={m.label} className="flex flex-col">
              <dt className="text-muted-foreground/80 uppercase tracking-wider text-[0.62rem] font-semibold">{m.label}</dt>
              <dd className="text-foreground/85">{m.value}</dd>
            </div>
          ) : null
        )}
        <div className="flex flex-col col-span-2">
          <dt className="text-muted-foreground/80 uppercase tracking-wider text-[0.62rem] font-semibold">Translation</dt>
          <dd className="text-foreground/85">{record.translationSource}</dd>
        </div>
        {record.reviewer ? (
          <div className="flex flex-col col-span-2">
            <dt className="text-muted-foreground/80 uppercase tracking-wider text-[0.62rem] font-semibold">Reviewed by</dt>
            <dd className="text-foreground/85">
              {record.reviewer}
              {record.lastReviewedAt ? ` · ${new Date(record.lastReviewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
            </dd>
          </div>
        ) : null}
        {record.referenceNote ? (
          <div className="flex flex-col col-span-2">
            <dt className="text-muted-foreground/80 uppercase tracking-wider text-[0.62rem] font-semibold">Reference note</dt>
            <dd className="text-foreground/85 italic">{record.referenceNote}</dd>
          </div>
        ) : null}
      </dl>

      {actions}

      {record.topics.length ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {record.topics.slice(0, 8).map((t) => (
            <Badge key={t} variant="secondary" className="text-[0.65rem] font-normal">
              {t}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );

  // ————— Phone: bottom sheet (thumb-reachable, safe-area aware) —————
  if (isMobile) {
    return (
      <Sheet open={!!record} onOpenChange={(o) => !o && closeRecord()}>
        <SheetContent
          side="bottom"
          className="max-h-screen-safe overflow-y-auto scrollbar-soft scroll-momentum rounded-t-2xl pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2"
        >
          <div className="mx-auto mb-1 h-1.5 w-10 rounded-full bg-muted-foreground/30" aria-hidden />
          <SheetHeader className="pb-2 text-start">
            <SheetTitle className="font-display text-lg leading-snug text-start">{record.title}</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground text-start">{record.citationDetail}</SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <div className="mb-3">{headerBlock}</div>
            {bodyContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // ————— Tablet / desktop: centered dialog —————
  return (
    <Dialog open={!!record} onOpenChange={(o) => !o && closeRecord()}>
      <DialogContent className="max-w-lg max-h-screen-safe overflow-y-auto scrollbar-soft">
        <DialogHeader>
          {headerBlock}
          <DialogTitle className="font-display text-lg leading-snug text-left">{record.title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground text-left">{record.citationDetail}</DialogDescription>
        </DialogHeader>
        {bodyContent}
      </DialogContent>
    </Dialog>
  );
}
