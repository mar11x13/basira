'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';
import { ViewHeader } from '@/components/shared/view-header';
import { useToast } from '@/hooks/use-toast';
import { PRAYER_METHODS, getMethod } from '@/lib/prayer-times';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  User,
  SlidersHorizontal,
  MoonStar,
  BellRing,
  ShieldCheck,
  Info,
  MapPin,
  Loader2,
  Trash2,
  Compass,
  LocateFixed,
  XCircle,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// SettingsView — every preference auto-saves against the anonymous session.
// Sections: profile · preferences · prayer · reminders · privacy · about.
// ============================================================================

const MADHHAB_OPTIONS = [
  { value: 'NONE', label: 'No preference' },
  { value: 'HANAFI', label: 'Hanafi' },
  { value: 'SHAFII', label: "Shafi'i" },
  { value: 'MALIKI', label: 'Maliki' },
  { value: 'HANBALI', label: 'Hanbali' },
] as const;

const TEXT_SIZE_OPTIONS = [
  { value: 'DEFAULT', label: 'Default' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'Extra large' },
] as const;

type TextSize = (typeof TEXT_SIZE_OPTIONS)[number]['value'];

const ABOUT_SOURCE_TYPES = ['QURAN', 'HADITH', 'DUA', 'DHIKR', 'FIQH', 'GLOSSARY', 'SEERAH', 'SCHOLARLY', 'GENERAL'] as const;
const ABOUT_SOURCE_LABELS: Record<(typeof ABOUT_SOURCE_TYPES)[number], (n: number) => string> = {
  QURAN: (n) => `${n} Qur'an ayah${n === 1 ? '' : 's'}`,
  HADITH: (n) => `${n} hadith`,
  DUA: (n) => `${n} dua${n === 1 ? '' : 's'}`,
  DHIKR: (n) => `${n} dhikr`,
  FIQH: (n) => `${n} fiqh guide${n === 1 ? '' : 's'}`,
  GLOSSARY: (n) => `${n} glossary term${n === 1 ? '' : 's'}`,
  SEERAH: (n) => `${n} seerah event${n === 1 ? '' : 's'}`,
  SCHOLARLY: (n) => `${n} scholarly view${n === 1 ? '' : 's'}`,
  GENERAL: (n) => `${n} general guide${n === 1 ? '' : 's'}`,
};

/** One settings section card with a consistent icon + heading. */
function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="paper-card border-border/80 overflow-hidden">
      <div className="pattern-khatim pattern-fade h-1 w-full" aria-hidden />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-lg font-display font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            {icon}
          </span>
          {title}
        </CardTitle>
        {description ? <CardDescription className="leading-relaxed">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

/** A switch row: whole label area is clickable (44px+ touch target). */
function SwitchRow({
  id,
  label,
  hint,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <Label
          htmlFor={id}
          className="text-sm font-medium leading-snug cursor-pointer"
        >
          {label}
        </Label>
        {hint ? <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p> : null}
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="cursor-pointer data-[state=checked]:bg-primary"
        aria-label={label}
      />
    </div>
  );
}

export function SettingsView() {
  const profile = useApp((s) => s.profile);
  const updateProfile = useApp((s) => s.updateProfile);
  const deleteAllData = useApp((s) => s.deleteAllData);
  const setView = useApp((s) => s.setView);
  const { toast } = useToast();

  // ---- shared save helper: optimistic store update + toast ---------------
  const save = React.useCallback(
    async (patch: Record<string, unknown>, note?: string) => {
      try {
        await updateProfile(patch);
        toast({ title: 'Saved', description: note ?? undefined });
      } catch (e) {
        toast({
          title: 'Could not save',
          description: e instanceof Error ? e.message : 'Please try again in a moment.',
          variant: 'destructive',
        });
      }
    },
    [updateProfile, toast]
  );

  // ---- display name (debounced ~600ms) -----------------------------------
  const [nameDraft, setNameDraft] = React.useState('');
  const [nameTouched, setNameTouched] = React.useState(false);
  const profileName = profile?.displayName ?? '';

  React.useEffect(() => {
    if (!nameTouched) setNameDraft(profileName);
  }, [profileName, nameTouched]);

  React.useEffect(() => {
    if (!nameTouched) return;
    const t = setTimeout(() => {
      const next = nameDraft.trim().slice(0, 60);
      if (next !== profileName) {
        void save({ displayName: next }, next ? 'Display name updated.' : 'Display name cleared — you are anonymous again.');
      }
    }, 600);
    return () => clearTimeout(t);
  }, [nameDraft, nameTouched, profileName, save]);

  const commitName = () => {
    const next = nameDraft.trim().slice(0, 60);
    if (nameTouched && next !== profileName) {
      void save({ displayName: next }, next ? 'Display name updated.' : 'Display name cleared — you are anonymous again.');
    }
  };

  // ---- text size (localStorage + html[data-text-size]) -------------------
  const [textSize, setTextSize] = React.useState<TextSize>('DEFAULT');

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem('basira:text-size');
      const v: TextSize = saved === 'large' || saved === 'xlarge' ? saved : 'DEFAULT';
      setTextSize(v);
      document.documentElement.dataset.textSize = v === 'DEFAULT' ? '' : v;
    } catch {
      /* storage unavailable */
    }
  }, []);

  const applyTextSize = (v: TextSize) => {
    setTextSize(v);
    document.documentElement.dataset.textSize = v === 'DEFAULT' ? '' : v;
    try {
      if (v === 'DEFAULT') window.localStorage.removeItem('basira:text-size');
      else window.localStorage.setItem('basira:text-size', v);
    } catch {
      /* storage unavailable */
    }
    toast({ title: 'Saved', description: 'Text size updated for this device.' });
  };

  // ---- location -----------------------------------------------------------
  const [locating, setLocating] = React.useState(false);

  const locateMe = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      toast({
        title: 'Location unavailable',
        description: 'This browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void save(
          {
            locationLat: Number(pos.coords.latitude.toFixed(5)),
            locationLng: Number(pos.coords.longitude.toFixed(5)),
            locationName: 'My location',
          },
          'Location saved — prayer times now use your position.'
        ).finally(() => setLocating(false));
      },
      () => {
        setLocating(false);
        toast({
          title: 'Location unavailable',
          description:
            'Permission was denied, or your position could not be found. Prayer times keep using the default (Makkah).',
          variant: 'destructive',
        });
      },
      { timeout: 12_000, maximumAge: 600_000 }
    );
  };

  // ---- browser notification permission ------------------------------------
  const [perm, setPerm] = React.useState<'unsupported' | NotificationPermission>('unsupported');
  const [permBusy, setPermBusy] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) setPerm(Notification.permission);
  }, []);

  const anyReminderOn =
    !!profile?.notifyPrayer || !!profile?.notifyQuran || !!profile?.notifyDhikr || !!profile?.notifyFriday;

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    setPermBusy(true);
    try {
      const result = await Notification.requestPermission();
      setPerm(result);
      toast({
        title: result === 'granted' ? 'Browser notifications on' : 'Browser notifications not enabled',
        description:
          result === 'granted'
            ? 'BASIRA can now show gentle reminders while the app is open.'
            : result === 'denied'
              ? 'Permission was denied. You can re-enable it later in your browser site settings.'
              : 'You dismissed the request — you can ask again any time.',
        variant: result === 'granted' ? undefined : 'destructive',
      });
    } finally {
      setPermBusy(false);
    }
  };

  // ---- delete all data -----------------------------------------------------
  const [deleting, setDeleting] = React.useState(false);

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      await deleteAllData();
      toast({ title: 'All personal data deleted', description: 'Restarting BASIRA with a fresh anonymous session…' });
      setTimeout(() => window.location.reload(), 700);
    } catch {
      setDeleting(false);
      toast({
        title: 'Could not delete',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // ---- about: source totals ------------------------------------------------
  const [totals, setTotals] = React.useState<Partial<Record<(typeof ABOUT_SOURCE_TYPES)[number], number>> | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        ABOUT_SOURCE_TYPES.map(async (t) => {
          try {
            const res = await fetch(`/api/content?type=${t}&limit=1`, { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              return [t, typeof data.total === 'number' ? data.total : 0] as const;
            }
          } catch {
            /* offline — show 0 */
          }
          return [t, 0] as const;
        })
      );
      if (!cancelled) setTotals(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const booted = !!profile;
  const selectedMethod = getMethod(profile?.prayerMethod ?? 'MWL');
  const locationLabel =
    profile?.locationLat != null
      ? profile.locationName || `Coordinates ${profile.locationLat.toFixed(2)}, ${profile.locationLng?.toFixed(2) ?? '?'}`
      : 'Makkah (default)';

  return (
    <div>
      <ViewHeader
        title="Settings"
        titleAr="الإعدادات"
        description="Your preferences for this anonymous session. Every change saves automatically — no account needed."
      />

      <div className="space-y-6">
        {/* ————— Profile ————— */}
        <SectionCard
          icon={<User className="h-4.5 w-4.5" aria-hidden />}
          title="Profile"
          description="A name is entirely optional — BASIRA works fully without it."
        >
          <div className="space-y-2">
            <Label htmlFor="display-name" className="text-sm font-medium">
              Display name
            </Label>
            {booted ? (
              <Input
                id="display-name"
                value={nameDraft}
                onChange={(e) => {
                  setNameTouched(true);
                  setNameDraft(e.target.value.slice(0, 60));
                }}
                onBlur={commitName}
                placeholder="Anonymous — your name is optional"
                className="h-11 rounded-xl bg-card"
                autoComplete="off"
                maxLength={60}
              />
            ) : (
              <Skeleton className="h-11 w-full rounded-xl" />
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">
              No email, no account — this profile is an anonymous session.
            </p>
          </div>
        </SectionCard>

        {/* ————— Preferences ————— */}
        <SectionCard
          icon={<SlidersHorizontal className="h-4.5 w-4.5" aria-hidden />}
          title="Reading preferences"
          description="How BASIRA presents sacred texts and explanations to you."
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="madhhab-select" className="text-sm font-medium">
                Madhhab (school of thought)
              </Label>
              {booted ? (
                <Select
                  value={profile?.madhhab ?? 'NONE'}
                  onValueChange={(v) =>
                    void save(
                      { madhhab: v === 'NONE' ? null : v },
                      v === 'NONE' ? 'Showing all schools side by side.' : 'Answers will tailor how positions are presented.'
                    )
                  }
                >
                  <SelectTrigger id="madhhab-select" className="w-full h-11 rounded-xl bg-card">
                    <SelectValue placeholder="Choose a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {MADHHAB_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Skeleton className="h-11 w-full rounded-xl" />
              )}
              <p className="text-xs text-muted-foreground leading-relaxed">
                Optional. BASIRA respects all four schools; this only tailors how answers present positions. &ldquo;No
                preference&rdquo; shows them side by side.
              </p>
            </div>

            <Separator />

            <div className="divide-y divide-border/60 -my-1">
              <SwitchRow
                id="pref-arabic"
                label="Show Arabic text"
                hint="Display the original Arabic alongside translations."
                checked={!!profile?.showArabic}
                disabled={!booted}
                onCheckedChange={(v) => void save({ showArabic: v })}
              />
              <SwitchRow
                id="pref-translit"
                label="Show transliteration"
                hint="Roman-letter pronunciation guides under the Arabic."
                checked={!!profile?.showTranslit}
                disabled={!booted}
                onCheckedChange={(v) => void save({ showTranslit: v })}
              />
              <SwitchRow
                id="pref-beginner"
                label="Beginner Mode"
                hint="Simple explanations and defined terms — great if you are new to Islam."
                checked={!!profile?.beginnerMode}
                disabled={!booted}
                onCheckedChange={(v) => void save({ beginnerMode: v }, v ? 'Beginner Mode on — explanations stay simple.' : 'Beginner Mode off.')}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="text-size-select" className="text-sm font-medium">
                Text size
              </Label>
              <Select value={textSize} onValueChange={(v) => applyTextSize(v as TextSize)}>
                <SelectTrigger id="text-size-select" className="w-full h-11 rounded-xl bg-card">
                  <SelectValue placeholder="Choose text size" />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_SIZE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enlarges all text across BASIRA on this device — easier on the eyes.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ————— Prayer ————— */}
        <SectionCard
          icon={<MoonStar className="h-4.5 w-4.5" aria-hidden />}
          title="Prayer times"
          description="BASIRA computes times locally on your device — nothing is sent anywhere."
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="method-select" className="text-sm font-medium">
                Calculation method
              </Label>
              {booted ? (
                <Select value={profile?.prayerMethod ?? 'MWL'} onValueChange={(v) => void save({ prayerMethod: v }, 'Calculation method updated.')}>
                  <SelectTrigger id="method-select" className="w-full h-11 rounded-xl bg-card">
                    <SelectValue placeholder="Choose a method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRAYER_METHODS.map((m) => (
                      <SelectItem key={m.key} value={m.key}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Skeleton className="h-11 w-full rounded-xl" />
              )}
              <p className="text-xs text-muted-foreground leading-relaxed">{selectedMethod.description}</p>
            </div>

            <Separator />

            <fieldset className="space-y-2.5">
              <legend className="text-sm font-medium">Asr calculation</legend>
              <RadioGroup
                value={String(profile?.asrFactor === 2 ? 2 : 1)}
                onValueChange={(v) => void save({ asrFactor: v === '2' ? 2 : 1 }, 'Asr calculation updated.')}
                className="gap-3"
              >
                <label
                  htmlFor="asr-standard"
                  className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3.5 cursor-pointer hover:border-primary/40 transition-colors min-h-[44px]"
                >
                  <RadioGroupItem value="1" id="asr-standard" className="mt-0.5" />
                  <span className="text-sm leading-snug">
                    <span className="font-medium block">Standard — Shafi&apos;i, Maliki, Hanbali</span>
                    <span className="text-xs text-muted-foreground">Shadow equals 1 (factor 1)</span>
                  </span>
                </label>
                <label
                  htmlFor="asr-hanafi"
                  className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3.5 cursor-pointer hover:border-primary/40 transition-colors min-h-[44px]"
                >
                  <RadioGroupItem value="2" id="asr-hanafi" className="mt-0.5" />
                  <span className="text-sm leading-snug">
                    <span className="font-medium block">Hanafi</span>
                    <span className="text-xs text-muted-foreground">Shadow equals 2 (factor 2)</span>
                  </span>
                </label>
              </RadioGroup>
            </fieldset>

            <Separator />

            <div className="space-y-2.5">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" aria-hidden />
                Location
              </p>
              <p className="text-sm text-foreground/85" aria-live="polite">
                {booted ? locationLabel : <Skeleton className="h-5 w-40" />}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="default"
                  className="h-11 rounded-xl"
                  onClick={locateMe}
                  disabled={locating || !booted}
                >
                  {locating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden /> : <LocateFixed className="h-4 w-4 mr-2" aria-hidden />}
                  {locating ? 'Locating…' : 'Use my location'}
                </Button>
                <Button
                  variant="ghost"
                  size="default"
                  className="h-11 rounded-xl text-muted-foreground"
                  onClick={() => void save({ clearLocation: true }, 'Location cleared — using Makkah (default).')}
                  disabled={!booted || profile?.locationLat == null}
                >
                  <XCircle className="h-4 w-4 mr-2" aria-hidden />
                  Clear location
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Coordinates stay in your anonymous profile and are only used to compute prayer times locally.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ————— Reminders ————— */}
        <SectionCard
          icon={<BellRing className="h-4.5 w-4.5" aria-hidden />}
          title="Gentle reminders"
          description="Gentle, optional reminders — never guilt-based. A kind nudge, not pressure."
        >
          <div className="space-y-4">
            <div className="divide-y divide-border/60 -my-1">
              <SwitchRow
                id="rem-prayer"
                label="Prayer reminders"
                hint="A soft heads-up before each prayer time."
                checked={!!profile?.notifyPrayer}
                disabled={!booted}
                onCheckedChange={(v) => void save({ notifyPrayer: v })}
              />
              <SwitchRow
                id="rem-quran"
                label="Daily Qur'an reminder"
                hint="One reminder a day for your reading habit."
                checked={!!profile?.notifyQuran}
                disabled={!booted}
                onCheckedChange={(v) => void save({ notifyQuran: v })}
              />
              <SwitchRow
                id="rem-dhikr"
                label="Dhikr reminders"
                hint="Occasional moments to remember Allah through the day."
                checked={!!profile?.notifyDhikr}
                disabled={!booted}
                onCheckedChange={(v) => void save({ notifyDhikr: v })}
              />
              <SwitchRow
                id="rem-friday"
                label="Friday reminder"
                hint="A weekly note to read Surah al-Kahf and prepare for Jumu'ah."
                checked={!!profile?.notifyFriday}
                disabled={!booted}
                onCheckedChange={(v) => void save({ notifyFriday: v })}
              />
            </div>

            {anyReminderOn && (
              <div className="rounded-xl border border-border/70 bg-muted/40 p-3.5 space-y-2.5" role="region" aria-label="Browser notification status">
                {perm === 'unsupported' ? (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This browser does not support notifications — reminders will only appear inside BASIRA.
                  </p>
                ) : perm === 'granted' ? (
                  <p className="text-xs text-primary font-medium flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                    Browser notifications enabled.
                  </p>
                ) : perm === 'denied' ? (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Notification permission was denied in this browser. You can re-enable it in your browser&apos;s site
                    settings — reminders will otherwise show only inside BASIRA.
                  </p>
                ) : (
                  <Button
                    variant="outline"
                    size="default"
                    className="h-11 rounded-xl w-full sm:w-auto"
                    onClick={() => void requestPermission()}
                    disabled={permBusy}
                  >
                    {permBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden /> : <BellRing className="h-4 w-4 mr-2" aria-hidden />}
                    Enable browser notifications
                  </Button>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground leading-relaxed">
              Reminders fire while a BASIRA tab is open (browser limitation — this is a web app, not a background
              service).
            </p>
          </div>
        </SectionCard>

        {/* ————— Privacy ————— */}
        <SectionCard
          icon={<ShieldCheck className="h-4.5 w-4.5" aria-hidden />}
          title="Privacy"
          description="BASIRA was built privacy-first: minimal data, full delete."
        >
          <div className="space-y-4">
            <ul className="text-sm text-foreground/85 leading-relaxed space-y-1.5 list-none">
              <li className="flex gap-2">
                <Badge variant="secondary" className="shrink-0 mt-0.5 h-5 rounded-md text-[0.62rem] uppercase tracking-wide">
                  Session
                </Badge>
                <span>You are an anonymous session — no email, no account, no sign-up.</span>
              </li>
              <li className="flex gap-2">
                <Badge variant="secondary" className="shrink-0 mt-0.5 h-5 rounded-md text-[0.62rem] uppercase tracking-wide">
                  Stored
                </Badge>
                <span>Bookmarks, learning progress and your asked questions are stored server-side against the anonymous session id — nothing else.</span>
              </li>
              <li className="flex gap-2">
                <Badge variant="secondary" className="shrink-0 mt-0.5 h-5 rounded-md text-[0.62rem] uppercase tracking-wide">
                  Never
                </Badge>
                <span>No tracking, no analytics profiling, no data selling — ever.</span>
              </li>
            </ul>

            <Separator />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Deleting removes your profile, bookmarks, progress and question history permanently. The app restarts
                fresh, as if you had just arrived.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="default" className="h-11 rounded-xl shrink-0">
                    <Trash2 className="h-4 w-4 mr-2" aria-hidden />
                    Delete all my data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md rounded-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">Delete all your data?</AlertDialogTitle>
                    <AlertDialogDescription className="leading-relaxed">
                      This permanently erases your anonymous profile, bookmarks, learning progress and question
                      history. It cannot be undone — you will restart with a fresh anonymous session.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="h-11 rounded-xl">Keep my data</AlertDialogCancel>
                    <AlertDialogAction
                      className={cn('h-11 rounded-xl bg-destructive text-white hover:bg-destructive/90')}
                      onClick={(e) => {
                        e.preventDefault(); // keep dialog open while working
                        void handleDeleteAll();
                      }}
                      disabled={deleting}
                    >
                      {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4 mr-2" aria-hidden />}
                      {deleting ? 'Deleting…' : 'Yes, delete everything'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </SectionCard>

        {/* ————— About ————— */}
        <SectionCard
          icon={<Info className="h-4.5 w-4.5" aria-hidden />}
          title="About BASIRA"
          description="بصيرة — insight, clear seeing."
        >
          <div className="space-y-4">
            <p className="text-sm text-foreground/85 leading-relaxed">
              BASIRA is an <strong>educational tool</strong>, not a scholar or a fatwa service. It carefully cites the
              Qur&apos;an and authentic hadith, marks anything unverified as unverified, and presents differences
              between the schools respectfully. For complex or personal matters, please consult a qualified scholar.
            </p>

            <div className="rounded-xl border border-border/70 bg-muted/40 p-3.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" aria-hidden />
                Knowledge base today
              </p>
              {totals ? (
                <p className="text-sm text-foreground/85 leading-relaxed" aria-live="polite">
                  {ABOUT_SOURCE_TYPES.map((t) => ABOUT_SOURCE_LABELS[t](totals[t] ?? 0)).join(' · ')}
                </p>
              ) : (
                <Skeleton className="h-5 w-full max-w-md" />
              )}
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Every reference is stored with a verification status and an audit trail.
              </p>
            </div>

            <Button
              variant="outline"
              size="default"
              className="h-11 rounded-xl"
              onClick={() => setView('admin')}
            >
              <Compass className="h-4 w-4 mr-2 text-gold" aria-hidden />
              Admin panel
            </Button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
