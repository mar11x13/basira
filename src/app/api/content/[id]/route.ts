import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapRecord } from '@/lib/record-mapper';

export const dynamic = 'force-dynamic';

// GET /api/content/[id] — accepts either the DB id or the stable slug.
// This is the citation-inspection endpoint: tapping a citation opens this.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const row = await db.sourceText.findFirst({
      where: { OR: [{ id }, { slug: id }], active: true },
    });
    if (!row || row.sourceStatus === 'DISABLED') {
      return NextResponse.json(
        { error: 'Source not found or disabled. It may have been removed after scholarly review.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ record: mapRecord(row) });
  } catch (e) {
    console.error('content/[id] error', e);
    return NextResponse.json({ error: 'Could not load source' }, { status: 500 });
  }
}
