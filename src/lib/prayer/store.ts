'use client';

// ============================================================================
// BASIRA prayer store — the ONE source of truth for all prayer state.
//
// Hydration-safety design:
//  - Initial state is fully deterministic ({ status: 'idle', snapshot: null,
//    nowMs: null }). The server render and the client's first render both
//    render the deterministic skeleton. No time, location or timezone value
//    is ever read during rendering.
//  - ALL computation happens inside effects (PrayerProvider mounts once in
//    the AppShell after hydration): profile-driven recompute + a 30-second
//    visibility-paused ticker.
//  - The schedule is only recomputed when the calendar date (in the prayer
//    location's timezone), the location or the calculation settings change.
//    The countdown is derived from the live ticker — never from a stale SSR
//    value.
// ============================================================================

import { create } from 'zustand';
import type { Profile } from '@/lib/types';
import {
  computePrayerSnapshot,
  deriveCurrentPrayer,
  deriveNextPrayer,
  formatPrayerTime,
  zonedDateKey,
  resolvePrayerLocation,
  resolvePrayerSettings,
  type PrayerSnapshot,
  type NextPrayer,
  type PrayerKey,
  type UiLang,
} from '@/lib/prayer/core';

export type PrayerStatus = 'idle' | 'ready' | 'error';

interface PrayerStoreState {
  status: PrayerStatus;
  snapshot: PrayerSnapshot | null;
  /** live client clock (ms epoch) — null until the first post-hydration tick */
  nowMs: number | null;
  error: string | null;

  /** last inputs, kept so the midnight-rollover recompute is self-contained */
  inputProfile: Profile | null;
  deviceTz: string | null;

  tick: () => void;
  recompute: (profile: Profile | null, deviceTz: string | null) => void;
}

export const usePrayerStore = create<PrayerStoreState>((set, get) => ({
  status: 'idle',
  snapshot: null,
  nowMs: null,
  error: null,
  inputProfile: null,
  deviceTz: null,

  recompute: (profile, deviceTz) => {
    try {
      const location = resolvePrayerLocation(profile, deviceTz);
      const settings = resolvePrayerSettings(profile);
      const snapshot = computePrayerSnapshot(location, settings, new Date());
      set({ snapshot, status: 'ready', error: null, inputProfile: profile, deviceTz, nowMs: Date.now() });
    } catch (e) {
      set({
        status: 'error',
        snapshot: null,
        error: e instanceof Error ? e.message : 'Prayer times could not be computed.',
        inputProfile: profile,
        deviceTz,
      });
    }
  },

  tick: () => {
    const now = new Date();
    const { snapshot, inputProfile, deviceTz } = get();
    set({ nowMs: now.getTime() });
    if (!snapshot) return;
    // Midnight (or any date) rollover in the prayer location's timezone:
    // recompute the schedule so "next prayer" flips to today's Fajr.
    const key = zonedDateKey(snapshot.location.timezone, now).key;
    if (key !== snapshot.dateKey) {
      get().recompute(inputProfile, deviceTz);
    }
  },
}));

// ---------------------------------------------------------------------------
// Consumer hook — everything the UI needs, derived from the single snapshot.
// `lang` only affects formatting (explicit locale), never the calculation.
// ---------------------------------------------------------------------------

export interface UsePrayerTimesResult {
  status: PrayerStatus;
  ready: boolean;
  error: string | null;
  snapshot: PrayerSnapshot | null;
  next: NextPrayer | null;
  current: PrayerKey | null;
  /** ms from the live clock to the next prayer (never derived during SSR) */
  msUntilNext: number | null;
  /** format an instant in the prayer location's timezone + chosen 12/24h */
  fmt: (instant: Date) => string;
  hour12: boolean;
  retry: () => void;
}

export function usePrayerTimes(lang: UiLang): UsePrayerTimesResult {
  const status = usePrayerStore((s) => s.status);
  const snapshot = usePrayerStore((s) => s.snapshot);
  const nowMs = usePrayerStore((s) => s.nowMs);
  const error = usePrayerStore((s) => s.error);
  const recompute = usePrayerStore((s) => s.recompute);

  const ready = status === 'ready' && snapshot != null && nowMs != null;
  const now = nowMs != null ? new Date(nowMs) : null;
  const next = snapshot && now ? deriveNextPrayer(snapshot, now) : null;
  const current = snapshot && now ? deriveCurrentPrayer(snapshot, now) : null;
  const msUntilNext = next && now ? next.instant.getTime() - now.getTime() : null;
  const hour12 = snapshot ? snapshot.settings.timeFormat === '12h' : true;

  const fmt = (instant: Date): string =>
    snapshot ? formatPrayerTime(instant, snapshot.location.timezone, lang, hour12) : '';

  const retry = () => recompute(usePrayerStore.getState().inputProfile, usePrayerStore.getState().deviceTz);

  return { status, ready, error, snapshot, next, current, msUntilNext, fmt, hour12, retry };
}
