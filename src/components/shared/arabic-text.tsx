'use client';

import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';

// ============================================================================
// ArabicText — RTL, Amiri typography, toggled by the user's profile.
// ============================================================================

export function ArabicText({
  text,
  className,
  size = 'base',
}: {
  text: string;
  className?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
}) {
  const showArabic = useApp((s) => s.profile?.showArabic !== false);
  if (!text || !showArabic) return null;
  const sizes = {
    sm: 'text-lg',
    base: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };
  return (
    <p
      dir="rtl"
      lang="ar"
      className={cn(
        'font-arabic text-center leading-[2.1] text-foreground/95 py-2 selection:bg-primary/20',
        sizes[size],
        className
      )}
    >
      {text}
    </p>
  );
}

export function TransliterationText({ text, className }: { text?: string | null; className?: string }) {
  const showTranslit = useApp((s) => s.profile?.showTranslit === true);
  if (!text || !showTranslit) return null;
  return (
    <p className={cn('text-sm italic text-muted-foreground text-center', className)}>{text}</p>
  );
}
