'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';
import { usePrayerStore } from '@/lib/prayer/store';

// ============================================================================
// PrayerProvider — the single engine driver, mounted ONCE inside the AppShell.
//
// Responsibilities (all post-hydration, inside effects — never during render):
//  1. Recompute the schedule whenever the profile (location / method / Asr /
//     high-latitude / time-format) changes — including the initial load.
//  2. A 30-second ticker (paused while the tab is hidden, resynced on return)
//     that feeds the countdown and detects date rollover in the prayer
//     location's timezone (midnight → next day's Fajr).
//  3. An offline fallback: if the session/profile could not be loaded, compute
//     with the deterministic default (Makkah) and label it honestly.
// ============================================================================

const OFFLINE_PROFILE_FALLBACK_MS = 3500;
const TICK_INTERVAL_MS = 30_000;

export function PrayerProvider() {
  const recompute = usePrayerStore((s) => s.recompute);
  const tick = usePrayerStore((s) => s.tick);

  React.useEffect(() => {
    let deviceTz: string | null = null;
    try {
      deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
    } catch {
      deviceTz = null;
    }

    // ——— 1. profile-driven recomputes ———
    recompute(useApp.getState().profile, deviceTz);
    const unsub = useApp.subscribe((s, prev) => {
      if (s.profile !== prev.profile) recompute(s.profile, deviceTz);
    });

    // ——— 3. offline / slow-session fallback ———
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    if (!useApp.getState().profile) {
      fallbackTimer = setTimeout(() => {
        if (!useApp.getState().profile) recompute(null, deviceTz);
      }, OFFLINE_PROFILE_FALLBACK_MS);
    }

    // ——— 2. visibility-paused ticker ———
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (interval == null) interval = setInterval(tick, TICK_INTERVAL_MS);
    };
    const stop = () => {
      if (interval != null) {
        clearInterval(interval);
        interval = undefined;
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        tick(); // immediate resync — the countdown is never stale after returning
        start();
      }
    };
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      unsub();
      if (fallbackTimer != null) clearTimeout(fallbackTimer);
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [recompute, tick]);

  return null;
}
