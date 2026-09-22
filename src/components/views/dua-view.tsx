'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';
import { ViewHeader, EmptyState } from '@/components/shared/view-header';
import { SourceCard } from '@/components/shared/source-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { SourceRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  AlarmClock,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  CloudLightning,
  CloudRain,
  DoorClosed,
  DoorOpen,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Info,
  Landmark,
  LifeBuoy,
  Moon,
  MoonStar,
  Plane,
  ShieldCheck,
  Sparkles,
  Sunrise,
  Sunset,
  Users,
  Utensils,
} from 'lucide-react';

// ============================================================================
// DuaView — supplications for every situation, organized by category.
// Every record renders through SourceCard: Sunnah-sourced duas show their
// collection; general permissible duas are clearly labeled as such.
// ============================================================================

interface DuaCategory {
  key: string;
  label: string;
  ar: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

const DUA_CATEGORIES: DuaCategory[] = [
  { key: 'morning', label: 'Morning', ar: 'الصباح', desc: 'Begin the day with remembrance.', icon: Sunrise },
  { key: 'evening', label: 'Evening', ar: 'المساء', desc: 'End the day with remembrance.', icon: Sunset },
  { key: 'before-sleeping', label: 'Before Sleeping', ar: 'قبل النوم', desc: 'Sunnah duas at bedtime.', icon: Moon },
  { key: 'after-waking', label: 'After Waking', ar: 'الاستيقاظ', desc: 'Gratitude for a new day.', icon: AlarmClock },
  { key: 'before-eating', label: 'Before Eating', ar: 'قبل الطعام', desc: 'Barakah before meals.', icon: Utensils },
  { key: 'after-eating', label: 'After Eating', ar: 'بعد الطعام', desc: 'Praise after meals.', icon: CheckCircle },
  { key: 'entering-home', label: 'Entering Home', ar: 'دخول المنزل', desc: 'Greet and bless your home.', icon: DoorOpen },
  { key: 'leaving-home', label: 'Leaving Home', ar: 'الخروج من المنزل', desc: 'Place your trust in Allah.', icon: DoorClosed },
  { key: 'travel', label: 'Travel', ar: 'السفر', desc: 'For every journey.', icon: Plane },
  { key: 'fear', label: 'Fear & Anxiety', ar: 'الخوف', desc: 'Refuge and calm for the heart.', icon: CloudLightning },
  { key: 'difficulty', label: 'Difficulty', ar: 'الشدة', desc: 'Relief in hardship.', icon: LifeBuoy },
  { key: 'forgiveness', label: 'Forgiveness', ar: 'الاستغفار', desc: 'Seeking Allah’s pardon.', icon: HandHeart },
  { key: 'parents', label: 'For Parents', ar: 'الوالدان', desc: 'Mercy for those who raised you.', icon: Users },
  { key: 'study', label: 'Study & Knowledge', ar: 'طلب العلم', desc: 'Increase in knowledge.', icon: GraduationCap },
  { key: 'illness', label: 'Illness', ar: 'المرض', desc: 'Shifa and patience.', icon: HeartPulse },
  { key: 'rain', label: 'Rain & Storms', ar: 'المطر', desc: 'At rainfall and weather.', icon: CloudRain },
  { key: 'masjid', label: 'The Masjid', ar: 'المسجد', desc: 'Entering and leaving.', icon: Landmark },
  { key: 'salah', label: 'Around Salah', ar: 'الصلاة', desc: 'Duas around the prayer.', icon: MoonStar },
  { key: 'ramadan', label: 'Ramadan', ar: 'رمضان', desc: 'Nights and days of Ramadan.', icon: CalendarDays },
  { key: 'general', label: 'General', ar: 'عام', desc: 'For every moment of life.', icon: Sparkles },
];

export function DuaView() {
  const viewParams = useApp((s) => s.viewParams);

  // Deep-link support: setView('dua', { category: 'morning' }) opens straight
  // into that category. Read once at mount (lazy initializer).
  const [category, setCategory] = React.useState<string | null>(() => {
    const cat = viewParams?.category;
    return typeof cat === 'string' && DUA_CATEGORIES.some((c) => c.key === cat) ? cat : null;
  });

  const [items, setItems] = React.useState<SourceRecord[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const cacheRef = React.useRef(new Map<string, SourceRecord[]>());

  React.useEffect(() => {
    if (!category) {
      setItems(null);
      return;
    }
    const cached = cacheRef.current.get(category);
    if (cached) {
      setItems(cached);
      return;
    }
    let alive = true;
    setLoading(true);
    setItems(null);
    fetch(`/api/content?category=${encodeURIComponent(category)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then((data: { items?: SourceRecord[] }) => {
        if (!alive) return;
        const list = data.items ?? [];
        cacheRef.current.set(category, list);
        setItems(list);
      })
      .catch(() => {
        if (alive) setItems([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [category]);

  const activeCategory = DUA_CATEGORIES.find((c) => c.key === category) ?? null;

  return (
    <div className="space-y-5">
      <ViewHeader
        title="Dua Library"
        titleAr="الأدعية"
        description="Supplications for every situation — Sunnah duas show their source; general permissible duas are clearly labeled as such."
      />

      {activeCategory ? (
        /* ————— Category list view ————— */
        <section aria-label={`${activeCategory.label} duas`} className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-11 px-3 -ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => setCategory(null)}
              aria-label="Back to all dua categories"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              All categories
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                <activeCategory.icon className="h-[1.1rem] w-[1.1rem]" aria-hidden />
              </span>
              <h2 className="font-display text-xl font-semibold text-foreground leading-tight">
                {activeCategory.label}
                <span className="font-arabic text-base text-muted-foreground ml-2">{activeCategory.ar}</span>
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading duas">
              <Skeleton className="h-36 rounded-xl" />
              <Skeleton className="h-36 rounded-xl" />
              <Skeleton className="h-36 rounded-xl" />
            </div>
          ) : items == null ? null : items.length === 0 ? (
            <EmptyState
              icon={<HandHeart className="h-8 w-8" aria-hidden />}
              title="No duas found here yet"
              hint="This category has no records in BASIRA's verified library yet. Try another category — or ask BASIRA and every citation will be checked."
            />
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {items.length} {items.length === 1 ? 'supplication' : 'supplications'} · Sunnah-sourced and general
              </p>
              <div className="space-y-3">
                {items.map((record) => (
                  <SourceCard
                    key={record.id}
                    record={record}
                    defaultOpen={record.sourceType === 'DUA'}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        /* ————— Category grid view ————— */
        <>
          <section aria-label="How BASIRA labels duas">
            <Card className="paper-card border-border/80">
              <CardContent className="p-4 sm:p-5 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  How BASIRA labels duas
                </h2>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="h-[1.1rem] w-[1.1rem]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Sunnah-sourced dua</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                      Shows its collection and book — e.g., “Sahih al-Bukhari, Book of Invocations” — with the exact
                      hadith number when BASIRA could confirm it.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Info className="h-[1.1rem] w-[1.1rem]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">General permissible dua</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                      No collection is shown, because none is narrated for it — it is not a specifically narrated
                      Sunnah dua. Supplicating in your own words is always permissible, so BASIRA labels these clearly
                      instead of attaching a made-up source.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section aria-label="Dua categories">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
              Choose a situation
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {DUA_CATEGORIES.map(({ key, label, ar, desc, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={cn(
                    'paper-card group flex flex-col items-start gap-2 rounded-xl border border-border/70 p-4 text-left',
                    'min-h-[44px] hover:border-primary/40 hover:shadow-md transition-all focus-ring'
                  )}
                  aria-label={`Show ${label} duas`}
                >
                  <span className="flex items-center gap-2 min-w-0 w-full">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground leading-tight">{label}</span>
                      <span className="block font-arabic text-sm text-muted-foreground leading-snug" dir="rtl" lang="ar">
                        {ar}
                      </span>
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{desc}</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-label="A note on labels" className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
            <Badge variant="secondary" className="text-[0.6rem] shrink-0 mt-0.5">Note</Badge>
            <p>
              Every card below carries its verification badge — verified, reference pending, or scholars differ — so
              you always know exactly what you are reciting and where it comes from.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
