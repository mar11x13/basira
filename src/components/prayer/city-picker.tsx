'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';
import { useT, useUiLanguage } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { CITY_PRESETS, CITY_REGIONS, type CityPreset } from '@/lib/prayer/cities';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Loader2, LocateFixed, MapPin } from 'lucide-react';

// ============================================================================
// CityPicker — manual location selection from curated city presets.
// Saving a city stores precise coordinates AND its IANA timezone, so prayer
// times are calculated for the SELECTED location (not the device's zone).
// ============================================================================

export function CityPicker({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const updateProfile = useApp((s) => s.updateProfile);
  const profile = useApp((s) => s.profile);
  const { toast } = useToast();
  const t = useT();
  const lang = useUiLanguage();
  const arabic = lang === 'ar';

  const currentCityId = (() => {
    if (profile?.locationLat == null || profile?.locationLng == null) return null;
    return CITY_PRESETS.find(
      (c) => Math.abs(c.lat - profile.locationLat!) < 0.02 && Math.abs(c.lng - profile.locationLng!) < 0.02,
    )?.id ?? null;
  })();

  const onSelect = async (city: CityPreset) => {
    setOpen(false);
    try {
      await updateProfile({
        locationLat: city.lat,
        locationLng: city.lng,
        locationName: arabic ? `${city.cityAr}، ${city.countryAr}` : `${city.city}, ${city.country}`,
        locationTimezone: city.timezone,
      });
      toast({
        title: arabic ? 'تم تحديث الموقع' : 'Location updated',
        description: arabic
          ? `أوقات الصلاة الآن تُحسب لـ${city.cityAr} (${city.timezone}).`
          : `Prayer times are now calculated for ${city.city} (${city.timezone}).`,
      });
    } catch {
      toast({
        title: arabic ? 'تعذّر حفظ الموقع' : 'Could not save location',
        description: arabic ? 'حاول مرة أخرى بعد قليل.' : 'Please try again in a moment.',
        variant: 'destructive',
      });
    }
  };

  const byRegion = React.useMemo(() => {
    const groups = new Map<CityPreset['region'], CityPreset[]>();
    for (const c of CITY_PRESETS) {
      const arr = groups.get(c.region) ?? [];
      arr.push(c);
      groups.set(c.region, arr);
    }
    return [...groups.entries()];
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('h-11 rounded-xl font-normal justify-between', className)}
        >
          <span className="flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate text-start">
              {currentCityId
                ? (() => {
                    const c = CITY_PRESETS.find((x) => x.id === currentCityId)!;
                    return arabic ? c.cityAr : c.city;
                  })()
                : t('prayer.chooseCity')}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60 rtl:rotate-180" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(22rem,calc(100vw-2rem))] p-0" align="start">
        <Command>
          <CommandInput placeholder={t('prayer.searchCity')} className="h-11" />
          <CommandList className="max-h-72">
            <CommandEmpty>{t('prayer.noCity')}</CommandEmpty>
            {byRegion.map(([region, cities]) => (
              <CommandGroup key={region} heading={arabic ? CITY_REGIONS[region].ar : CITY_REGIONS[region].en}>
                {cities.map((city) => (
                  <CommandItem
                    key={city.id}
                    value={`${city.city} ${city.country} ${city.cityAr} ${city.countryAr}`}
                    onSelect={() => void onSelect(city)}
                    className="min-h-[44px] aria-selected:bg-primary/10"
                  >
                    <Check className={cn('h-4 w-4 shrink-0 me-2', currentCityId === city.id ? 'opacity-100' : 'opacity-0')} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className={cn('block truncate text-sm', arabic && 'font-arabic')}>
                        {arabic ? city.cityAr : city.city}
                        <span className="text-muted-foreground font-normal ms-1.5">
                          {arabic ? city.countryAr : city.country}
                        </span>
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// GeolocateButton — browser geolocation, saved WITH the device's IANA zone
// (GPS coordinates + physical presence ⇒ device zone matches the location).
// Permission is only requested on explicit tap, never on page load.
// ============================================================================

export function GeolocateButton({ className }: { className?: string }) {
  const updateProfile = useApp((s) => s.updateProfile);
  const { toast } = useToast();
  const [locating, setLocating] = React.useState(false);
  const lang = useUiLanguage();
  const arabic = lang === 'ar';

  const locate = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      toast({
        title: arabic ? 'الموقع غير متاح' : 'Location unavailable',
        description: arabic ? 'هذا المتصفح لا يدعم تحديد الموقع.' : 'This browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          let deviceTz: string | null = null;
          try {
            deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
          } catch {
            deviceTz = null;
          }
          await updateProfile({
            locationLat: Number(pos.coords.latitude.toFixed(5)),
            locationLng: Number(pos.coords.longitude.toFixed(5)),
            locationName: arabic ? 'موقعي الحالي' : 'My location',
            ...(deviceTz ? { locationTimezone: deviceTz } : {}),
          });
          toast({
            title: arabic ? 'تم تحديث الموقع' : 'Location updated',
            description: arabic
              ? 'أوقات الصلاة الآن تُحسب بإحداثياتك الدقيقة.'
              : 'Prayer times now use your precise coordinates.',
          });
        } catch {
          toast({
            title: arabic ? 'تعذّر حفظ الموقع' : 'Could not save location',
            variant: 'destructive',
          });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast({
          title: arabic ? 'لم يُمنح إذن الموقع' : 'Location permission denied',
          description: arabic
            ? 'يمكنك اختيار مدينة يدويًا بدلًا من ذلك.'
            : 'You can choose a city manually instead.',
          variant: 'destructive',
        });
      },
      { timeout: 10_000, maximumAge: 600_000 },
    );
  };

  return (
    <Button onClick={locate} disabled={locating} variant="outline" className={cn('h-11 rounded-xl', className)}>
      {locating ? <Loader2 className="h-4 w-4 me-2 animate-spin" aria-hidden /> : <LocateFixed className="h-4 w-4 me-2" aria-hidden />}
      {locating ? (arabic ? 'جارٍ التحديد…' : 'Locating…') : arabic ? 'استخدم موقعي' : 'Use my location'}
    </Button>
  );
}

