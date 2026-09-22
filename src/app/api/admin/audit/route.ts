import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '80', 10) || 80, 300);
    const rows = await db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
    return NextResponse.json({
      items: rows.map((r) => ({
        id: r.id,
        action: r.action,
        entity: r.entity,
        entityId: r.entityId,
        before: r.beforeJson ? safeParse(r.beforeJson) : null,
        after: r.afterJson ? safeParse(r.afterJson) : null,
        createdAt: r.createdAt.toISOString(),
      })),
      note: 'Every knowledge-base modification is recorded here — an immutable audit trail.',
    });
  } catch (e) {
    console.error('audit error', e);
    return NextResponse.json({ error: 'Could not load audit trail' }, { status: 500 });
  }
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
