'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/store';
import { Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// ViewHeader — consistent, accessible page headers with optional search.
// ============================================================================

export function ViewHeader({
  title,
  titleAr,
  description,
  back,
  children,
  className,
}: {
  title: string;
  titleAr?: string;
  description?: string;
  back?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  const setView = useApp((s) => s.setView);
  return (
    <header className={cn('mb-5', className)}>
      <div className="flex items-start gap-3">
        {back && (
          <Button
            variant="ghost"
            size="icon"
            className="mt-1 -ml-2 text-muted-foreground"
            onClick={() => setView('home')}
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground leading-tight">{title}</h1>
            {titleAr && <span className="font-arabic text-xl text-muted-foreground">{titleAr}</span>}
          </div>
          {description && <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="ornament-line mt-4" />
      {children}
    </header>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  onSubmit,
  autoFocus,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <form
      className={cn('relative', className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      role="search"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={ariaLabel ?? placeholder}
        className="pl-10 h-11 rounded-xl bg-card border-border/80 focus-visible:ring-primary/40"
      />
    </form>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="text-center py-12 px-4">
      {icon && <div className="mx-auto mb-3 text-muted-foreground/60 w-fit">{icon}</div>}
      <p className="font-medium text-foreground/80">{title}</p>
      {hint && <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">{hint}</p>}
    </div>
  );
}
