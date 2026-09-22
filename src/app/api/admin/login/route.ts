import { NextResponse } from 'next/server';
import { isValidAdminKey, adminCookieValue, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const key = String(body.key ?? '');
    if (!isValidAdminKey(key)) {
      return NextResponse.json({ error: 'Incorrect admin key.' }, { status: 401 });
    }
    await db.auditLog.create({
      data: { action: 'LOGIN', entity: 'Admin', entityId: null, afterJson: JSON.stringify({ at: new Date().toISOString() }) },
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE_NAME, adminCookieValue(), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (e) {
    console.error('admin login error', e);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
