import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { getActiveSources } from '@/lib/api-helpers';
import { retrieveForAI } from '@/lib/search';
import { mapRecord } from '@/lib/record-mapper';
import { buildSourceContext, verifyAnswer, safetyCheck, SYSTEM_PROMPT } from '@/lib/ai';
import { getOrCreateSession } from '@/lib/session';
import { db } from '@/lib/db';
import type { SourceRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: Request) {
  const started = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const question = String(body.question ?? '').trim().slice(0, 1200);
    const beginnerMode = body.beginnerMode === true;
    const madhhab = typeof body.madhhab === 'string' ? body.madhhab : null;

    if (!question) return NextResponse.json({ error: 'Please type a question first.' }, { status: 400 });

    // ——— 1. Safety / moderation pre-check ———
    const safeNotice = safetyCheck(question);
    if (safeNotice) {
      return NextResponse.json({
        questionId: 'safety',
        answer: safeNotice,
        sources: [],
        verification: { status: 'OK', notice: 'This response follows BASIRA\'s safety guidance policy.' },
      });
    }

    // ——— 2. Retrieval from the verified source database (grounding) ———
    const rows = await getActiveSources();
    const retrieved = retrieveForAI(rows, question, 14);
    const records: SourceRecord[] = retrieved.map(mapRecord);
    const { text: sourceContext, map: sourceMap } = buildSourceContext(records);

    if (records.length === 0) {
      const honest = [
        'I could not find matching sources in BASIRA\'s verified database for this question.',
        '',
        'Rather than answer from memory — which risks attributing something to the Qur\'an or the Prophet ﷺ without a verifiable reference — BASIRA only answers when it can ground the answer in its checked sources.',
        '',
        'You could try rephrasing (for example, mention a topic like patience, salah, wudu, fasting, parents, or forgiveness), or browse the Qur\'an, Hadith, and Dua sections directly. For a personal religious ruling, a qualified local scholar is always the right address.',
      ].join('\n');
      return NextResponse.json({
        questionId: 'no-sources',
        answer: honest,
        sources: [],
        verification: { status: 'FAILED', notice: 'No verified sources matched the question, so no answer was generated.' },
      });
    }

    // ——— 3. Build the grounded prompt ———
    let system = SYSTEM_PROMPT.replace('{SOURCES}', sourceContext);
    if (beginnerMode) {
      system +=
        '\n\nBEGINNER MODE IS ON: define every Islamic term in simple parentheses on first use, keep sentences short, and assume no prior knowledge.';
    }
    if (madhhab) {
      system += `\n\nThe user prefers to follow the ${madhhab} school. Where that school has a stated position on an issue present in the sources, present it, while remaining respectful of the other recognized schools.`;
    } else {
      system += '\n\nThe user has no madhhab preference. Where recognized schools differ, present the major positions side by side, respectfully.';
    }

    const userMessage = `The user's question: ${question}\n\nAnswer using ONLY the numbered sources [S1]…[S${records.length}] provided. Cite them with their tokens. If something is not in the sources, say you could not verify it in BASIRA's source database.`;

    // ——— 4. Call the LLM (backend-only z-ai-web-dev-sdk) ———
    let rawAnswer: string | null = null;
    let groundingError: string | undefined;
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: system },
          { role: 'user', content: userMessage },
        ],
        thinking: { type: 'disabled' },
      });
      rawAnswer = completion.choices?.[0]?.message?.content ?? null;
      if (!rawAnswer || !rawAnswer.trim()) throw new Error('Empty response from model');
    } catch (err) {
      console.error('LLM error', err);
      groundingError =
        'BASIRA\'s AI service could not be reached, so no AI answer was generated. Instead, here are the verified sources BASIRA retrieved for your question — you can read them directly, and every reference is checked.';
    }

    // ——— 5. Fallback: retrieval-only answer (honest, never fabricated) ———
    if (groundingError || !rawAnswer) {
      const sourceLines = records
        .slice(0, 8)
        .map((r, i) => `${i + 1}. ${r.citation} — ${r.englishText.slice(0, 240)}${r.englishText.length > 240 ? '…' : ''}`)
        .join('\n\n');
      const answer = [groundingError ?? 'Verified sources for your question:', '', sourceLines].join('\n');
      const log = await db.questionLog.create({
        data: {
          userId: null,
          question,
          answer,
          sourcesJson: JSON.stringify(records.map((r) => ({ slug: r.slug, citation: r.citation }))),
          verification: 'OK',
          reviewStatus: 'UNREVIEWED',
        },
      });
      return NextResponse.json({
        questionId: log.id,
        answer,
        sources: records,
        verification: { status: 'OK', notice: 'Showing retrieved verified sources directly (AI service unavailable).' },
        groundingError,
      });
    }

    // ——— 6. Verification pass (No Hallucination Mode) ———
    const verification = verifyAnswer(rawAnswer, sourceMap);

    // Return ALL retrieved records in [S#] order so client-side citation chips
    // map S{i} → sources[i-1] correctly (the answer text cites by token index).
    const { profile } = await getOrCreateSession().catch(() => ({ profile: null }) as { profile: null });
    const log = await db.questionLog.create({
      data: {
        userId: profile?.id ?? null,
        question,
        answer: verification.cleanAnswer,
        sourcesJson: JSON.stringify(records.map((r) => ({ slug: r.slug, citation: r.citation }))),
        verification: verification.status,
        reviewStatus: 'UNREVIEWED',
      },
    });

    return NextResponse.json({
      questionId: log.id,
      answer: verification.cleanAnswer,
      sources: records,
      verification: {
        status: verification.status,
        notice: verification.notice,
      },
      tookMs: Date.now() - started,
    });
  } catch (e) {
    console.error('ask error', e);
    return NextResponse.json(
      { error: 'BASIRA could not complete this request. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
