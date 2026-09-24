'use client';

import * as React from 'react';

// ============================================================================
// Reader display preferences — Arabic text size + translation visibility for
// the Qur'an reader. Device-local (localStorage), instant, and SSR-safe:
// reading comfort is a screen-level preference, not account data, so it is
// never sent to the server (privacy by default).
// ============================================================================

export interface ReaderPrefs {
  /** 0 = base · 1 = large · 2 = larger · 3 = largest */
  arabicSize: 0 | 1 | 2 | 3;
  showTranslation: boolean;
}

const READER_PREFS_KEY = 'basira:reader-prefs';
const DEFAULT_PREFS: ReaderPrefs = { arabicSize: 1, showTranslation: true };

function load(): ReaderPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(READER_PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<ReaderPrefs>;
    return {
      arabicSize:
        parsed.arabicSize === 0 || parsed.arabicSize === 1 || parsed.arabicSize === 2 || parsed.arabicSize === 3
          ? parsed.arabicSize
          : DEFAULT_PREFS.arabicSize,
      showTranslation: typeof parsed.showTranslation === 'boolean' ? parsed.showTranslation : true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function useReaderPrefs() {
  const [prefs, setPrefs] = React.useState<ReaderPrefs>(DEFAULT_PREFS);

  // Hydrate from localStorage after mount (keeps SSR output stable).
  React.useEffect(() => {
    setPrefs(load());
  }, []);

  const update = React.useCallback((patch: Partial<ReaderPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(READER_PREFS_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable (private mode) — preference lives in memory */
      }
      return next;
    });
  }, []);

  const cycleSize = React.useCallback(
    (direction: 1 | -1) => {
      setPrefs((prev) => {
        const nextSize = Math.min(3, Math.max(0, prev.arabicSize + direction)) as ReaderPrefs['arabicSize'];
        const next = { ...prev, arabicSize: nextSize };
        try {
          localStorage.setItem(READER_PREFS_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    []
  );

  return { prefs, update, cycleSize };
}

/** Maps the 4-step pref to ArabicText's size ladder (3 gets a custom class). */
export const READER_ARABIC_SIZES: { size: 'base' | 'lg' | 'xl' | 'custom'; className?: string }[] = [
  { size: 'base' },
  { size: 'lg' },
  { size: 'xl' },
  { size: 'custom', className: 'text-4xl sm:text-5xl' },
];
