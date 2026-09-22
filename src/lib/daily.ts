// ============================================================================
// BASIRA — deterministic daily content rotation (same content all day,
// changes at midnight, no randomness so server & client agree).
// ============================================================================

import type { SourceText } from '@prisma/client';
import { mapRecord } from './record-mapper';

export function dayIndex(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

export function pickDaily(rows: SourceText[], sourceType: string, date = new Date()): SourceText | null {
  const pool = rows.filter((r) => r.sourceType === sourceType && r.active && r.sourceStatus === 'ACTIVE');
  if (!pool.length) return null;
  const idx = dayIndex(date) % pool.length;
  return pool[idx] ?? null;
}

export { mapRecord };
