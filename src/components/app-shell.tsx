'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useApp, type ViewKey } from '@/lib/store';
import { LogoWord } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RecordDialog } from '@/components/shared/record-dialog';
import { useTheme } from 'next-themes';
import {
  Home,
  BookOpen,
  ScrollText,
  Sparkles,
  HandHeart,
  Repeat,
  MoonStar,
  BookUser,
  CalendarDays,
  GraduationCap,
  Library,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  WifiOff,
  ChevronRight,
} from 'lucide-react';

const NAV: { key: ViewKey; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'home', label: 'Home', icon: Home, desc: 'Your daily Muslim companion' },
  { key: 'quran', label: "Qur'an", icon: BookOpen, desc: 'Read, search, and reflect' },
  { key: 'hadith', label: 'Hadith', icon: ScrollText, desc: 'Sahih al-Bukhari & more' },
  { key: 'ask', label: 'Ask BASIRA', icon: Sparkles, desc: 'Grounded answers with sources' },
  { key: 'dua', label: 'Dua', icon: HandHeart, desc: 'Supplications by situation' },
  { key: 'dhikr', label: 'Dhikr', icon: Repeat, desc: 'Remembrance with counters' },
  { key: 'salah', label: 'Salah', icon: MoonStar, desc: 'Learn to pray, step by step' },
  { key: 'seerah', label: 'Seerah', icon: BookUser, desc: 'Life of the Prophet ﷺ' },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays, desc: 'Hijri dates & events' },
  { key: 'learn', label: 'Learn', icon: GraduationCap, desc: 'Structured learning paths' },
  { key: 'glossary', label: 'Glossary', icon: Library, desc: 'Islamic terms simplified' },
  { key: 'settings', label: 'Settings', icon: Settings, desc: 'Preferences & privacy' },
];

const BOTTOM_NAV: ViewKey[] = ['home', 'quran', 'ask', 'hadith'];

function NavButton({
  item,
  active,
  onClick,
  compact,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-ring',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className={cn('h-[1.15rem] w-[1.15rem] shrink-0', active && 'text-primary')} aria-hidden />
      <span className="truncate">{item.label}</span>
      {!compact && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity" aria-hidden />}
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const view = useApp((s) => s.view);
  const setView = useApp((s) => s.setView);
  const online = useApp((s) => s.online);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    const update = () => useApp.getState().setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const activeItem = NAV.find((n) => n.key === view);
  const moreItems = NAV.filter((n) => !BOTTOM_NAV.includes(n.key));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ————— Desktop sidebar ————— */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border/70 bg-sidebar z-40">
        <div className="px-5 pt-6 pb-4">
          <button onClick={() => setView('home')} className="focus-ring rounded-lg" aria-label="BASIRA home">
            <LogoWord />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-soft px-3 pb-4 space-y-0.5" aria-label="Main navigation">
          {NAV.map((item) => (
            <NavButton key={item.key} item={item} active={view === item.key} onClick={() => setView(item.key)} />
          ))}
          <NavButton
            item={{ key: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Knowledge base review' }}
            active={view === 'admin'}
            onClick={() => setView('admin')}
          />
        </nav>
        <div className="px-5 py-4 border-t border-border/60 text-[0.68rem] text-muted-foreground leading-relaxed">
          Educational tool · not a fatwa service.
          <br />
          Complex matters → qualified scholars.
        </div>
      </aside>

      {/* ————— Header ————— */}
      <header
        className={cn(
          'sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/60',
          'lg:pl-64'
        )}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          {/* mobile logo */}
          <button onClick={() => setView('home')} className="lg:hidden focus-ring rounded-lg" aria-label="BASIRA home">
            <LogoWord />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-foreground">{activeItem?.label ?? 'BASIRA'}</p>
            <p className="text-xs text-muted-foreground">{activeItem?.desc}</p>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {!online && (
              <span className="flex items-center gap-1.5 text-xs text-gold font-medium px-2.5 py-1.5 rounded-full bg-gold/10 border border-gold/30">
                <WifiOff className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">Offline — cached content</span>
                <span className="sm:hidden">Offline</span>
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('search')}
              aria-label="Search BASIRA"
              className="text-muted-foreground hover:text-foreground"
            >
              <Search className="h-[1.15rem] w-[1.15rem]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle dark mode"
              className="text-muted-foreground hover:text-foreground"
            >
              {mounted && theme === 'dark' ? <Sun className="h-[1.15rem] w-[1.15rem]" /> : <Moon className="h-[1.15rem] w-[1.15rem]" />}
            </Button>
          </div>
        </div>
      </header>

      {/* ————— Main ————— */}
      <main className="flex-1 lg:pl-64">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-32 lg:pb-16 w-full">{children}</div>
      </main>

      {/* ————— Footer (sticky to bottom, pushed naturally on overflow) ————— */}
      <footer className="mt-auto lg:pl-64 border-t border-border/60 bg-card/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 text-center lg:text-left">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl mx-auto lg:mx-0">
            <span className="font-semibold text-foreground/70">BASIRA</span> is an educational Islamic guidance tool.
            It is not Allah, not the Prophet Muhammad ﷺ, and not a scholar — and never speaks as any of them.
            Answers are grounded in a curated source database (Qur&apos;an; Sahih al-Bukhari and other authentic
            collections) with citations you can inspect. For rulings on your personal circumstances — marriage,
            divorce, inheritance, finance, abuse, or medical matters — please consult a qualified scholar.
          </p>
          <p className="text-[0.65rem] text-muted-foreground/70 mt-2.5">
            Hadith numbering follows the widely used English edition (Darussalam / sunnah.com) and may differ in other editions.
            Translations: BASIRA Simple English rendering (public domain) · Full Qur&apos;an reading: Pickthall (1930, public domain) via alquran.cloud integration.
          </p>
        </div>
      </footer>

      {/* ————— Mobile bottom navigation ————— */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/92 backdrop-blur-md border-t border-border/60 pb-[env(safe-area-inset-bottom)]"
        aria-label="Bottom navigation"
      >
        <div className="grid grid-cols-5 h-16 items-stretch">
          {BOTTOM_NAV.map((key) => {
            const item = NAV.find((n) => n.key === key)!;
            const Icon = item.icon;
            const active = view === key;
            const center = key === 'ask';
            return (
              <button
                key={key}
                onClick={() => setView(key)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-[0.62rem] font-medium transition-colors focus-ring',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
              >
                {center ? (
                  <span
                    className={cn(
                      'flex items-center justify-center rounded-full h-9 w-9 -mt-4 shadow-md transition-all',
                      active ? 'bg-primary text-primary-foreground' : 'bg-primary/90 text-primary-foreground'
                    )}
                  >
                    <Icon className="h-[1.15rem] w-[1.15rem]" />
                  </span>
                ) : (
                  <Icon className="h-[1.2rem] w-[1.2rem]" aria-hidden />
                )}
                <span className={cn(center && 'mt-0.5')}>{item.label}</span>
              </button>
            );
          })}

          {/* More sheet */}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-[0.62rem] font-medium transition-colors focus-ring',
                  moreItems.some((m) => m.key === view) ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-label="More sections"
              >
                <Menu className="h-[1.2rem] w-[1.2rem]" aria-hidden />
                More
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
              <SheetHeader className="pb-2">
                <SheetTitle className="font-display text-left">Explore BASIRA</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2 px-4 pb-6">
                {moreItems.map((item) => (
                  <NavButton
                    key={item.key}
                    item={item}
                    compact
                    active={view === item.key}
                    onClick={() => {
                      setView(item.key);
                      setMoreOpen(false);
                    }}
                  />
                ))}
                <NavButton
                  item={{ key: 'admin', label: 'Admin', icon: ShieldCheck, desc: '' }}
                  compact
                  active={view === 'admin'}
                  onClick={() => {
                    setView('admin');
                    setMoreOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* ————— Global citation inspector ————— */}
      <RecordDialog />
    </div>
  );
}
