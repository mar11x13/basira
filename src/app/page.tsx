'use client';

import { useEffect } from 'react';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/app-shell';
import { HomeView } from '@/components/views/home-view';
import { OnboardingView } from '@/components/views/onboarding-view';
import { QuranView } from '@/components/views/quran-view';
import { HadithView } from '@/components/views/hadith-view';
import { AskView } from '@/components/views/ask-view';
import { DuaView } from '@/components/views/dua-view';
import { DhikrView } from '@/components/views/dhikr-view';
import { SalahView } from '@/components/views/salah-view';
import { SeerahView } from '@/components/views/seerah-view';
import { CalendarView } from '@/components/views/calendar-view';
import { LearnView } from '@/components/views/learn-view';
import { GlossaryView } from '@/components/views/glossary-view';
import { BookmarksView } from '@/components/views/bookmarks-view';
import { SearchView } from '@/components/views/search-view';
import { SettingsView } from '@/components/views/settings-view';
import { AdminView } from '@/components/views/admin-view';

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
