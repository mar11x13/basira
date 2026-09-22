import { cookies } from 'next/headers';
import { createHash } from 'crypto';

const ADMIN_COOKIE = 'basira_admin';
const ADMIN_KEY = process.env.ADMIN_KEY ?? 'basira-admin-999';

export function hashKey(key: string): string {
  return createHash('sha256').update(`basira::${key}`).digest('hex');
}

export function isValidAdminKey(key: string): boolean {
  return key === ADMIN_KEY;
}

export function adminCookieValue(): string {
  return hashKey(ADMIN_KEY);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === adminCookieValue();
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE;
