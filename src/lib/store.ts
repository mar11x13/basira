'use client';

import { create } from 'zustand';
import type { Profile, SourceRecord, BookmarkItem } from '@/lib/types';

// ============================================================================
// BASIRA app store — client-side navigation + session state.
// The app is a single visible route ("/"); views are sections switched here.
// ============================================================================

export type ViewKey =
  | 'home'
  | 'onboarding'
  | 'quran'
  | 'hadith'
  | 'ask'
  | 'dua'
  | 'dhikr'
  | 'salah'
  | 'seerah'
  | 'calendar'
  | 'learn'
  | 'glossary'
  | 'bookmarks'
  | 'search'
  | 'settings'
  | 'admin';

export interface ViewParams {
  [key: string]: unknown;
}

export interface DailyData {
  date?: string;
  verse: SourceRecord | null;
  hadith: SourceRecord | null;
  dua: SourceRecord | null;
}

interface AppState {
  view: ViewKey;
  viewParams: ViewParams;
  booted: boolean;

  profile: Profile | null;
  bookmarks: BookmarkItem[];
  bookmarkSlugs: Set<string>;

  inspecting: SourceRecord | null;
  online: boolean;

  daily: DailyData | null;

  setView: (view: ViewKey, params?: ViewParams) => void;
  boot: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (patch: Record<string, unknown>) => Promise<void>;
  deleteAllData: () => Promise<void>;

  loadBookmarks: () => Promise<void>;
  toggleBookmark: (recordIdOrSlug: string) => Promise<boolean>;
  isBookmarked: (record: SourceRecord) => boolean;

  openRecord: (record: SourceRecord) => void;
  openRecordBySlug: (slug: string) => Promise<void>;
  closeRecord: () => void;

  loadDaily: (force?: boolean) => Promise<void>;
  setOnline: (online: boolean) => void;
}

const DAILY_CACHE_KEY = 'basira:daily';
const PROGRESS_CACHE_KEY = 'basira:progress-cache';

export const useApp = create<AppState>((set, get) => ({
  view: 'home',
  viewParams: {},
  booted: false,

  profile: null,
  bookmarks: [],
  bookmarkSlugs: new Set<string>(),

  inspecting: null,
  online: true,

  daily: null,

  setView: (view, params = {}) => {
    set({ view, viewParams: params });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0 });
    }
  },

  boot: async () => {
    if (get().booted) return;
    set({ booted: true });
    // offline cache first (instant paint)
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(DAILY_CACHE_KEY);
        if (cached) set({ daily: JSON.parse(cached) });
      } catch {
        /* ignore corrupt cache */
      }
    }
    await Promise.all([get().refreshSession(), get().loadBookmarks(), get().loadDaily()]);
    const profile = get().profile;
    if (profile && !profile.onboarded) set({ view: 'onboarding' });
  },

  refreshSession: async () => {
    try {
      const res = await fetch('/api/session', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        set({ profile: data.profile });
      }
    } catch {
      /* offline — keep cached */
    }
  },

  updateProfile: async (patch) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = await res.json();
        set({ profile: data.profile });
      } else {
        const err = await res.json().catch(() => ({ error: 'Could not save' }));
        throw new Error(err.error);
      }
    } catch (e) {
      if (e instanceof Error && e.message !== 'Failed to fetch') throw e;
      // offline: apply locally, will sync next time
      set((s) => ({ profile: s.profile ? { ...s.profile, ...patch } as Profile : s.profile }));
    }
  },

  deleteAllData: async () => {
    try {
      await fetch('/api/profile', { method: 'DELETE' });
    } catch {
      /* offline */
    }
    localStorage.removeItem(DAILY_CACHE_KEY);
    localStorage.removeItem(PROGRESS_CACHE_KEY);
    set({ bookmarks: [], bookmarkSlugs: new Set(), profile: null });
    await get().refreshSession();
  },

  loadBookmarks: async () => {
    try {
      const res = await fetch('/api/bookmarks', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        set({
          bookmarks: data.items ?? [],
          bookmarkSlugs: new Set((data.items ?? []).map((b: BookmarkItem) => b.record.slug)),
        });
      }
    } catch {
      /* offline */
    }
  },

  toggleBookmark: async (recordIdOrSlug) => {
    const record = get().bookmarks.find((b) => b.record.slug === recordIdOrSlug)?.record;
    const wasSaved = get().bookmarkSlugs.has(recordIdOrSlug);
    // optimistic update
    set((s) => {
      const next = new Set(s.bookmarkSlugs);
      if (wasSaved) next.delete(recordIdOrSlug);
      else next.add(recordIdOrSlug);
      return { bookmarkSlugs: next };
    });
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId: recordIdOrSlug }),
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.removed && data.id) {
          if (record) {
            // fast path: we already hold the record — add it locally
            set((s) => ({
              bookmarks: [
                { id: data.id, createdAt: new Date().toISOString(), note: null, record },
                ...s.bookmarks.filter((b) => b.record.slug !== recordIdOrSlug),
              ],
            }));
          } else {
            // record not cached (new bookmark toggled from a rendered card):
            // re-sync the whole list from the server so the count and the
            // bookmarks view stay truthful.
            await get().loadBookmarks();
          }
        } else if (data.removed) {
          set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.record.slug !== recordIdOrSlug) }));
        }
        return !wasSaved;
      }
      throw new Error('bookmark failed');
    } catch {
      // rollback on failure
      set((s) => {
        const next = new Set(s.bookmarkSlugs);
        if (wasSaved) next.add(recordIdOrSlug);
        else next.delete(recordIdOrSlug);
        return { bookmarkSlugs: next };
      });
      return wasSaved;
    }
  },

  isBookmarked: (record) => get().bookmarkSlugs.has(record.slug ?? record.id),

  openRecord: (record) => set({ inspecting: record }),

  openRecordBySlug: async (slug) => {
    try {
      const res = await fetch(`/api/content/${encodeURIComponent(slug)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        set({ inspecting: data.record });
      }
    } catch {
      /* offline */
    }
  },

  closeRecord: () => set({ inspecting: null }),

  loadDaily: async (force = false) => {
    const today = new Date().toISOString().slice(0, 10);
    const cached = get().daily;
    if (!force && cached && cached.date === today) return;
    try {
      const res = await fetch('/api/daily', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        set({ daily: { date: data.date, verse: data.verse, hadith: data.hadith, dua: data.dua } });
        try {
          localStorage.setItem(DAILY_CACHE_KEY, JSON.stringify({ date: data.date, verse: data.verse, hadith: data.hadith, dua: data.dua }));
        } catch {
          /* storage full — fine */
        }
      }
    } catch {
      /* offline — daily cache already set at boot */
    }
  },

  setOnline: (online) => set({ online }),
}));
