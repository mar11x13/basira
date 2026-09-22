import { db } from './db';
import type { SourceText } from '@prisma/client';

// ============================================================================
// API helpers — cached source-database access (local memory cache, no extra
// middleware; refreshed on a short TTL and invalidated on admin changes).
// ============================================================================

let cache: { rows: SourceText[]; at: number } | null = null;
let invalidated = false;
const TTL = 30_000;

export function invalidateSourceCache() {
  invalidated = true;
}

export async function getActiveSources(): Promise<SourceText[]> {
  if (!invalidated && cache && Date.now() - cache.at < TTL) return cache.rows;
  const rows = await db.sourceText.findMany({
    where: { active: true, sourceStatus: { not: 'DISABLED' } },
    orderBy: [{ surahNumber: 'asc' }, { ayahNumber: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  cache = { rows, at: Date.now() };
  invalidated = false;
  return rows;
}

export function json<T>(data: T, init?: ResponseInit) {
  return Response.json(data, init);
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function serverError(message = 'Something went wrong on our side. Please try again.') {
  return Response.json({ error: message }, { status: 500 });
}
