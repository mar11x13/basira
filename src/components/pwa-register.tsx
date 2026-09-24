'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';
import { useUiLanguage, useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

// ============================================================================
// PwaRegister — registers the service worker and surfaces a TASTEFUL install
// prompt. Prompting rules (never spam):
//  - only after the beforeinstallprompt event actually fired,
//  - only from the 2nd visit onwards (localStorage visit counter),
//  - only when not previously dismissed,
//  - never on top of onboarding.
// ============================================================================

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const VISITS_KEY = 'basira:visits';
const DISMISS_KEY = 'basira:install-dismissed';

export function PwaRegister() {
  const [installEvent, setInstallEvent] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const view = useApp((s) => s.view);
  const lang = useUiLanguage();
  const t = useT();

  // Register the service worker.
  React.useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* SW unavailable (e.g. unsupported context) — app works normally */
      });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true, passive: true });
  }, []);

  // Count visits (session-scoped increment).
  React.useEffect(() => {
    try {
      const n = Number(localStorage.getItem(VISITS_KEY) ?? '0') + 1;
      localStorage.setItem(VISITS_KEY, String(n));
    } catch {
      /* private mode */
    }
  }, []);

  // Capture the install invitation.
  React.useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault(); // stop the browser's own minimal prompt
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  // Decide whether to show our prompt (deferred + dismissible + never during onboarding).
  React.useEffect(() => {
    if (!installEvent) return;
    let dismissed = false;
    let visits = 1;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === '1';
      visits = Number(localStorage.getItem(VISITS_KEY) ?? '1');
    } catch {
      /* private mode — defaults */
    }
    if (dismissed || visits < 2 || view === 'onboarding') return;
    const timer = window.setTimeout(() => setShowPrompt(true), 12_000); // gentle delay
    return () => window.clearTimeout(timer);
  }, [installEvent, view]);

  const dismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    setShowPrompt(false);
    try {
      await installEvent?.prompt();
    } catch {
      /* user or browser cancelled */
    }
  };

  if (!showPrompt) return null;

  const ar = lang === 'ar';

  return (
    <div
      className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] lg:bottom-6 z-40 px-3 sm:px-4 animate-in slide-in-from-bottom-3 fade-in duration-300"
      role="dialog"
      aria-label={ar ? 'تثبيت تطبيق بصيرة' : 'Install BASIRA'}
    >
      <div className="max-w-md mx-auto paper-card rounded-2xl border border-gold/40 shadow-lg px-4 py-3 backdrop-blur-md bg-card/95 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Download className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {ar ? 'ثبّت بصيرة على جهازك' : 'Install BASIRA on your device'}
          </p>
          <p className="text-xs text-muted-foreground leading-snug">
            {ar
              ? 'قراءة أسرع ووضع يشبه التطبيق، مع عمل أوفلاين للمحتوى المحفوظ.'
              : t('install.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" className="h-11 px-4" onClick={() => void install()}>
            {ar ? 'تثبيت' : 'Install'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 text-muted-foreground hover:text-foreground"
            onClick={dismiss}
            aria-label={ar ? 'ليس الآن' : 'Not now'}
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
