'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useApp, type ViewKey } from '@/lib/store';
import { LogoWord } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RecordDialog } from '@/components/shared/record-dialog';
import { PrayerProvider } from '@/components/prayer/prayer-provider';
import { useTheme } from 'next-themes';
import { useT, navLabel, useUiLanguage, useDocumentDirection } from '@/lib/i18n';
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
  Bookmark,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  WifiOff,
  ChevronRight,
  Languages,
} from 'lucide-react';

// Nav items carry i18n KEYS (not strings) — resolved per language at render.
const NAV: { key: ViewKey; labelKey: string; descKey: string; icon: React.ElementType }[] = [
  { key: 'home', labelKey: 'nav.home', descKey: 'nav.home.desc', icon: Home },
  { key: 'quran', labelKey: 'nav.quran', descKey: 'nav.quran.desc', icon: BookOpen },
  { key: 'hadith', labelKey: 'nav.hadith', descKey: 'nav.hadith.desc', icon: ScrollText },
  { key: 'ask', labelKey: 'nav.ask', descKey: 'nav.ask.desc', icon: Sparkles },
  { key: 'dua', labelKey: 'nav.dua', descKey: 'nav.dua.desc', icon: HandHeart },
  { key: 'dhikr', labelKey: 'nav.dhikr', descKey: 'nav.dhikr.desc', icon: Repeat },
  { key: 'salah', labelKey: 'nav.salah', descKey: 'nav.salah.desc', icon: MoonStar },
  { key: 'seerah', labelKey: 'nav.seerah', descKey: 'nav.seerah.desc', icon: BookUser },
  { key: 'calendar', labelKey: 'nav.calendar', descKey: 'nav.calendar.desc', icon: CalendarDays },
  { key: 'learn', labelKey: 'nav.learn', descKey: 'nav.learn.desc', icon: GraduationCap },
  { key: 'glossary', labelKey: 'nav.glossary', descKey: 'nav.glossary.desc', icon: Library },
  { key: 'bookmarks', labelKey: 'nav.bookmarks', descKey: 'nav.bookmarks.desc', icon: Bookmark },
  { key: 'settings', labelKey: 'nav.settings', descKey: 'nav.settings.desc', icon: Settings },
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
  const lang = useUiLanguage();
  const t = useT();
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-ring',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
        lang === 'ar' && 'text-start'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className={cn('h-[1.15rem] w-[1.15rem] shrink-0', active && 'text-primary')} aria-hidden />
      <span className="truncate">{navLabel(item.labelKey, lang)}</span>
      {!compact && <ChevronRight className="ms-auto h-3.5 w-3.5 opacity-0 transition-opacity rtl:rotate-180" aria-hidden />}
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const view = useApp((s) => s.view);
  const setView = useApp((s) => s.setView);
  const online = useApp((s) => s.online);
  const bookmarkCount = useApp((s) => s.bookmarks.length);
  const { theme, setTheme } = useTheme();
  const t = useT();
  const lang = useUiLanguage();
  const dir = useDocumentDirection();
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
    <div dir={dir} className="min-h-screen flex flex-col bg-background">
      {/* The single prayer engine driver — computes after hydration only */}
      <PrayerProvider />
      {/* ————— Desktop sidebar ————— */}
      <aside className="hidden lg:flex fixed inset-y-0 start-0 w-64 flex-col border-e border-border/70 bg-sidebar z-40">
        <div className="px-5 pt-6 pb-4">
          <button onClick={() => setView('home')} className="focus-ring rounded-lg" aria-label={t('shell.home')}>
            <LogoWord />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-soft px-3 pb-4 space-y-0.5" aria-label={lang === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}>
          {NAV.map((item) => (
            <NavButton key={item.key} item={item} active={view === item.key} onClick={() => setView(item.key)} />
          ))}
          <NavButton
            item={{ key: 'admin', labelKey: 'nav.admin', descKey: 'nav.admin.desc', icon: ShieldCheck }}
            active={view === 'admin'}
            onClick={() => setView('admin')}
          />
        </nav>
        <div className="px-5 py-4 border-t border-border/60 text-[0.68rem] text-muted-foreground leading-relaxed text-start">
          {t('shell.educationalTool')}
          <br />
          {t('shell.complexMatters')}
        </div>
      </aside>

      {/* ————— Header ————— */}
      <header
        className={cn(
          'sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/60',
          'lg:ps-64'
        )}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          {/* mobile logo */}
          <button onClick={() => setView('home')} className="lg:hidden focus-ring rounded-lg" aria-label={t('shell.home')}>
            <LogoWord />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-foreground">
              {activeItem ? navLabel(activeItem.labelKey, lang) : 'BASIRA'}
            </p>
            <p className="text-xs text-muted-foreground">{activeItem ? t(activeItem.descKey) : ''}</p>
          </div>

          <div className="ms-auto flex items-center gap-1.5">
            {!online && (
              <span className="flex items-center gap-1.5 text-xs text-gold font-medium px-2.5 py-1.5 rounded-full bg-gold/10 border border-gold/30">
                <WifiOff className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">{t('shell.offline')}</span>
                <span className="sm:hidden">{t('shell.offlineShort')}</span>
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('bookmarks')}
              aria-label={`${t('shell.bookmarks')}${bookmarkCount > 0 ? ` — ${bookmarkCount} ${t('shell.bookmarksSaved')}` : ''}`}
              className="relative h-11 w-11 text-muted-foreground hover:text-foreground"
            >
              <Bookmark className="h-[1.15rem] w-[1.15rem]" />
              {bookmarkCount > 0 && (
                <span
                  className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold text-gold-foreground text-[0.58rem] font-bold px-1 tabular-nums"
                  aria-hidden
                >
                  {bookmarkCount > 99 ? '99+' : bookmarkCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const next = lang === 'en' ? 'ar' : lang === 'ar' ? 'bilingual' : 'en';
                void useApp.getState().updateProfile({ language: next });
              }}
              aria-label={
                lang === 'ar'
                  ? 'تبديل لغة الواجهة'
                  : lang === 'bilingual'
                    ? 'Switch interface language (currently bilingual)'
                    : 'Switch interface language (currently English)'
              }
              title="English · العربية · ثنائي"
              className="relative h-11 w-11 text-muted-foreground hover:text-foreground"
            >
              <Languages className="h-[1.15rem] w-[1.15rem]" />
              {lang !== 'en' && (
                <span
                  className="absolute -bottom-0.5 -end-0.5 rounded-full bg-primary text-primary-foreground text-[0.5rem] font-bold px-1 leading-[0.9rem]"
                  aria-hidden
                >
                  {lang === 'ar' ? 'ع' : 'EN+ع'}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('search')}
              aria-label={t('shell.search')}
              className="h-11 w-11 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-[1.15rem] w-[1.15rem]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={lang === 'ar' ? 'تبديل الوضع الليلي' : 'Toggle dark mode'}
              className="h-11 w-11 text-muted-foreground hover:text-foreground"
            >
              {mounted && theme === 'dark' ? <Sun className="h-[1.15rem] w-[1.15rem]" /> : <Moon className="h-[1.15rem] w-[1.15rem]" />}
            </Button>
          </div>
        </div>
      </header>

      {/* ————— Main ————— */}
      <main className="flex-1 lg:ps-64">
        {/* key={view} replays a gentle entrance transition on every section switch */}
        <div
          key={view}
          className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-32 lg:pb-16 w-full animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {children}
        </div>
      </main>

      {/* ————— Footer (sticky to bottom, pushed naturally on overflow) ————— */}
      <footer className="mt-auto lg:ps-64 border-t border-border/60 bg-card/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 text-center lg:text-start">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl mx-auto lg:mx-0">
            {t('footer.line1')}
          </p>
          <p className="text-[0.65rem] text-muted-foreground/70 mt-2.5">{t('footer.line2')}</p>
        </div>
      </footer>

      {/* ————— Mobile bottom navigation ————— */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/92 backdrop-blur-md border-t border-border/60 pb-[env(safe-area-inset-bottom)]"
        aria-label={lang === 'ar' ? 'التنقل السفلي' : 'Bottom navigation'}
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
                aria-label={navLabel(item.labelKey, lang)}
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
                <span className={cn(center && 'mt-0.5')}>{navLabel(item.labelKey, lang)}</span>
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
                aria-label={lang === 'ar' ? 'أقسام أكثر' : 'More sections'}
              >
                <Menu className="h-[1.2rem] w-[1.2rem]" aria-hidden />
                {t('nav.more')}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
              <SheetHeader className="pb-2">
                <SheetTitle className={cn('font-display', lang === 'ar' ? 'text-start font-arabic' : 'text-left')}>
                  {t('nav.exploreSheet')}
                </SheetTitle>
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
                  item={{ key: 'admin', labelKey: 'nav.admin', descKey: 'nav.admin.desc', icon: ShieldCheck }}
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
