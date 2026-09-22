import { cn } from '@/lib/utils';

// ============================================================================
// BASIRA brand mark — an eight-pointed star (khatim) with an open crescent:
// guidance, clarity, and light. Pure SVG: crisp, offline, no dependencies.
// ============================================================================

export function LogoMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      role="img"
      aria-label="BASIRA logo"
    >
      <rect width="64" height="64" rx="14" className="fill-primary" />
      {/* eight-pointed star lattice */}
      <g className="stroke-primary-foreground/25" strokeWidth="1.6">
        <rect x="17" y="17" width="30" height="30" />
        <rect x="17" y="17" width="30" height="30" transform="rotate(45 32 32)" />
      </g>
      {/* crescent */}
      <path
        d="M41 15.5a17 17 0 1 0 0 33 20.5 20.5 0 1 1 0-33z"
        className="fill-primary-foreground"
      />
      {/* star of guidance */}
      <path
        d="M45.5 29l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z"
        className="fill-primary-foreground"
      />
    </svg>
  );
}

export function LogoWord({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={34} />
      <div className="leading-none">
        <div className="font-display text-[1.45rem] font-semibold tracking-[0.08em] text-foreground">
          BASIRA
        </div>
        <div className="font-arabic text-[0.95rem] text-muted-foreground -mt-0.5">بصيرة</div>
      </div>
    </div>
  );
}

/** Full splash lockup used in onboarding. */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-3 text-center', className)}>
      <LogoMark size={64} />
      <div>
        <div className="font-display text-4xl font-semibold tracking-[0.12em] text-foreground">BASIRA</div>
        <div className="font-arabic text-2xl text-muted-foreground mt-1">بَصِيرَة</div>
      </div>
      <div className="ornament-line w-40" />
      <p className="text-sm text-muted-foreground max-w-xs">
        Insight &amp; clear understanding — verified Islamic guidance with traceable sources.
      </p>
    </div>
  );
}
