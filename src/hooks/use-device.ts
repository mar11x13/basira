'use client';

import * as React from 'react';

// ============================================================================
// Device & viewport detection — capability-based, NOT device-model sniffing.
//
// Design rules (from the mobile-first engineering spec):
//  - Never branch on "if iPhone". A 390px Android and a 390px iPhone get the
//    same layout. Breakpoints follow AVAILABLE SPACE + INPUT CAPABILITY.
//  - User-agent is only used as a coarse signal for hybrid edge cases
//    (e.g. desktop-touchscreen laptops), never as the primary source.
//  - All hooks are SSR-safe: they render a desktop/tablet default first and
//    correct themselves after mount (no layout flash on the server render).
// ============================================================================

export type DeviceType = 'phone' | 'tablet' | 'desktop';
export type InputMode = 'touch' | 'mouse' | 'hybrid';
export type Orientation = 'portrait' | 'landscape';

function readSignals() {
  if (typeof window === 'undefined') {
    return {
      width: 1280,
      height: 800,
      deviceType: 'desktop' as DeviceType,
      inputMode: 'mouse' as InputMode,
      orientation: 'landscape' as Orientation,
      dpr: 1,
      isMobile: false,
      isTouch: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  // Pointer/hover capability (media queries level 4) — the honest signals.
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;
  const touchEvents = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Input mode: coarse+no-hover → touch; fine+hover+no-touch → mouse; both →
  // hybrid (touchscreen laptops report fine pointer + hover + touch events).
  const isTouch = coarsePointer || touchEvents;
  const inputMode: InputMode =
    isTouch && canHover && finePointer ? 'hybrid' : isTouch ? 'touch' : 'mouse';

  // Device class by AVAILABLE SPACE + INPUT CAPABILITY (not device models):
  //  - phone: any viewport narrower than the tablet band, OR a very short
  //    viewport (≤500px tall) which is a phone held in landscape.
  //  - tablet: tablet-band width, OR ≥1024px width on a touch-primary device
  //    (large tablets in landscape report desktop-class widths but no hover).
  //  - desktop: everything else — includes touchscreen laptops, which report
  //    fine pointer + hover and get the full desktop experience.
  let deviceType: DeviceType;
  if (height <= 500 || width < 768) {
    deviceType = 'phone';
  } else if (width < 1024 || (coarsePointer && !canHover)) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }

  return {
    width,
    height,
    deviceType,
    inputMode,
    orientation: (width >= height ? 'landscape' : 'portrait') as Orientation,
    dpr: window.devicePixelRatio || 1,
    isMobile: deviceType === 'phone',
    isTouch,
  };
}

/** Re-renders on resize/orientation change. Debounced via rAF (no scroll jank). */
function useSignals() {
  const [signals, setSignals] = React.useState(readSignals);

  React.useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSignals(readSignals()));
    };
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });
    // Correct once after mount (SSR default → real device).
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return signals;
}

/**
 * Full device signal bundle. Prefer CSS media queries for pure styling; use
 * this only when BEHAVIOR genuinely needs JS (modal vs bottom-sheet, keyboard
 * layout adjustments, virtualized lists…).
 */
export function useDeviceType() {
  const { deviceType, inputMode, orientation, dpr, isTouch } = useSignals();
  return React.useMemo(
    () => ({ deviceType, inputMode, orientation, dpr, isTouch }),
    [deviceType, inputMode, orientation, dpr, isTouch]
  );
}

/** True on phone-class viewports (short side is phone-sized). */
export function useIsMobile() {
  return useSignals().isMobile;
}

/** True on tablet-class viewports. */
export function useIsTablet() {
  return useSignals().deviceType === 'tablet';
}

/** True when the device has touch capability (includes hybrids). */
export function useIsTouchDevice() {
  return useSignals().isTouch;
}

/** Live viewport size (debounced by rAF). */
export function useViewportSize() {
  const { width, height } = useSignals();
  return { width, height };
}

/** Portrait / landscape, derived from live viewport aspect. */
export function useOrientation() {
  return useSignals().orientation;
}

/**
 * Virtual keyboard visibility — visualViewport-based, SSR-safe.
 * The keyboard is considered open when the visual viewport loses more than
 * ~15% of the layout viewport height (covers iOS & Android behaviors without
 * UA sniffing). Re-renders only on state FLIPS (not every resize tick) so
 * scrolling under an open keyboard stays cheap.
 */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vv = window.visualViewport!;
        const keyboardOpen = window.innerHeight - vv.height > window.innerHeight * 0.15;
        setVisible((prev) => (prev !== keyboardOpen ? keyboardOpen : prev));
      });
    };
    window.visualViewport.addEventListener('resize', update, { passive: true });
    window.visualViewport.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, []);

  return visible;
}

/** True when the user asks the OS for reduced motion. SSR-safe. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update, { passive: true });
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}
