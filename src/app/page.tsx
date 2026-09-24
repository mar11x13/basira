'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/app-shell';
import { HomeView } from '@/components/views/home-view';
import { OnboardingView } from '@/components/views/onboarding-view';

// ============================================================================
// BASIRA single-route app: all views are client sections. Heavy views are
// code-split via next/dynamic so a phone's first load only ships what the
// first screen needs (home + onboarding + ask entry point). Each lazy view
// mounts into a stable, layout-shift-free skeleton.
// ============================================================================

function ViewSkeleton() {
  return (
    <div className="space-y-4 pt-2" aria-hidden>
      <div className="h-8 w-40 rounded-lg bg-muted/70 animate-pulse" />
      <div className="h-4 w-64 rounded bg-muted/50 animate-pulse" />
      <div className="paper-card rounded-xl border border-border/80 p-5 space-y-3">
        <div className="h-5 w-32 rounded bg-muted/60 animate-pulse" />
        <div className="h-20 w-full rounded bg-muted/40 animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-muted/40 animate-pulse" />
      </div>
      <div className="paper-card rounded-xl border border-border/80 p-5 space-y-3">
        <div className="h-5 w-24 rounded bg-muted/60 animate-pulse" />
        <div className="h-16 w-full rounded bg-muted/40 animate-pulse" />
      </div>
    </div>
  );
}

const withSkeleton = <P extends object>(load: () => Promise<{ default: React.ComponentType<P> }>) =>
  dynamic(load, { loading: () => <ViewSkeleton /> });

// Primary navigation views (bottom nav) — eager: they are one tap away.
import { QuranView } from '@/components/views/quran-view';
import { HadithView } from '@/components/views/hadith-view';
import { AskView } from '@/components/views/ask-view';

// Secondary views — code-split. The view files use named exports, so each
// loader maps the module to the default-export shape next/dynamic expects.
const DuaView = withSkeleton(() => import('@/components/views/dua-view').then((m) => ({ default: m.DuaView })));
const DhikrView = withSkeleton(() => import('@/components/views/dhikr-view').then((m) => ({ default: m.DhikrView })));
const SalahView = withSkeleton(() => import('@/components/views/salah-view').then((m) => ({ default: m.SalahView })));
const SeerahView = withSkeleton(() => import('@/components/views/seerah-view').then((m) => ({ default: m.SeerahView })));
const CalendarView = withSkeleton(() => import('@/components/views/calendar-view').then((m) => ({ default: m.CalendarView })));
const LearnView = withSkeleton(() => import('@/components/views/learn-view').then((m) => ({ default: m.LearnView })));
const GlossaryView = withSkeleton(() => import('@/components/views/glossary-view').then((m) => ({ default: m.GlossaryView })));
const BookmarksView = withSkeleton(() => import('@/components/views/bookmarks-view').then((m) => ({ default: m.BookmarksView })));
const SearchView = withSkeleton(() => import('@/components/views/search-view').then((m) => ({ default: m.SearchView })));
const SettingsView = withSkeleton(() => import('@/components/views/settings-view').then((m) => ({ default: m.SettingsView })));
const AdminView = withSkeleton(() => import('@/components/views/admin-view').then((m) => ({ default: m.AdminView })));

export default function Page() {
  const boot = useApp((s) => s.boot);
  const view = useApp((s) => s.view);

  useEffect(() => {
    void boot();
  }, [boot]);

  return (
    <AppShell>
      {view === 'home' && <HomeView />}
      {view === 'onboarding' && <OnboardingView />}
      {view === 'quran' && <QuranView />}
      {view === 'hadith' && <HadithView />}
      {view === 'ask' && <AskView />}
      {view === 'dua' && <DuaView />}
      {view === 'dhikr' && <DhikrView />}
      {view === 'salah' && <SalahView />}
      {view === 'seerah' && <SeerahView />}
      {view === 'calendar' && <CalendarView />}
      {view === 'learn' && <LearnView />}
      {view === 'glossary' && <GlossaryView />}
      {view === 'bookmarks' && <BookmarksView />}
      {view === 'search' && <SearchView />}
      {view === 'settings' && <SettingsView />}
      {view === 'admin' && <AdminView />}
    </AppShell>
  );
}
