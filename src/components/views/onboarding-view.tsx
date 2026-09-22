'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { LogoLockup } from '@/components/brand/logo';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  ScrollText,
  ShieldCheck,
  Search,
  Sparkles,
  Lock,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const SLIDES = [
  {
    icon: null,
    title: '',
    custom: 'lockup',
  },
  {
    icon: BookOpen,
    title: 'What BASIRA is',
    body: [
      'An educational Islamic companion built around one principle: accuracy before answering quickly.',
      'Its knowledge is stored in a curated database of the Qur\'an, authentic hadith (Sahih al-Bukhari at the core), duas, dhikr, and fiqh explanations — audited and reviewable.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'How citations work',
    body: [
      'Every religious claim carries a traceable source: "Sahih al-Bukhari, Book of Belief, Hadith 13" or "Qur\'an 2:286 — Al-Baqarah."',
      'Tap any citation to inspect the full record — collection, book, narrator, grade, and review status.',
      'If BASIRA cannot verify something, it says so plainly. It never invents a verse, hadith, or scholar.',
    ],
  },
  {
    icon: Search,
    title: 'Search and ask',
    body: [
      'Search naturally: "hadith about patience", "verses about forgiveness", "what breaks wudu".',
      'Or use Ask BASIRA — AI answers grounded only in the verified source database, with a verification badge on every reply.',
      'Where recognized scholars differ, BASIRA shows the positions respectfully — never one invented "universal" answer.',
    ],
  },
  {
    icon: Lock,
    title: 'Your privacy',
    body: [
      'No account, no email, no tracking. Your profile is an anonymous session you can delete in one tap from Settings.',
      'Bookmarks, progress, and questions stay yours alone. Your religious activity data is never sold or shared — it barely exists.',
    ],
  },
  {
    icon: HeartHandshake,
    title: 'One honest note',
    body: [
      'BASIRA is an educational tool — not a fatwa service, and never a replacement for qualified scholars.',
      'For marriage, divorce, inheritance, finance, abuse, or medical decisions, BASIRA will point you to general knowledge and to the right human help.',
      'May Allah make this a source of light for you.',
    ],
  },
];

export function OnboardingView() {
  const updateProfile = useApp((s) => s.updateProfile);
  const setView = useApp((s) => s.setView);
  const [step, setStep] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  const finish = async () => {
    setSaving(true);
    try {
      await updateProfile({ onboarded: true });
    } finally {
      setSaving(false);
      setView('home');
    }
  };

  const slide = SLIDES[step];
  const Icon = slide.icon;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-md">
        {/* progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-8" aria-label={`Step ${step + 1} of ${SLIDES.length}`}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all focus-ring',
                i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-border'
              )}
            />
          ))}
        </div>

        <div className="paper-card rounded-2xl border border-border/70 p-7 sm:p-9 shadow-sm text-center">
          {slide.custom === 'lockup' ? (
            <LogoLockup />
          ) : (
            <>
              {Icon && (
                <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-7 w-7" aria-hidden />
                </span>
              )}
              <h2 className="font-display text-2xl font-semibold text-foreground">{slide.title}</h2>
              <div className="ornament-line mt-3 mb-5 mx-auto w-24" />
              <div className="space-y-3 text-left">
                {slide.body!.map((p, i) => (
                  <p key={i} className="text-[0.92rem] text-foreground/85 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? finish() : setStep((s) => s - 1))}
            className="text-muted-foreground"
            disabled={saving}
          >
            {step === 0 ? (
              'Skip'
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </>
            )}
          </Button>
          <Button onClick={() => (step === SLIDES.length - 1 ? finish() : setStep((s) => s + 1))} disabled={saving} className="min-w-28">
            {step === SLIDES.length - 1 ? (
              saving ? 'Entering…' : 'Begin'
            ) : (
              <>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
