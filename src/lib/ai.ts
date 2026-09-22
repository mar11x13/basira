// ============================================================================
// BASIRA AI — retrieval-grounded answering with strict citation verification
// ("No Hallucination Mode"). The LLM may ONLY cite sources supplied from the
// verified source database via [S1], [S2] ... tokens. Every citation is then
// checked against the retrieval payload before the answer reaches the user.
// z-ai-web-dev-sdk is used exclusively on the backend.
// ============================================================================

import type { SourceRecord } from './types';
import { shortCitation } from './record-mapper';

export interface GroundedSource {
  record: SourceRecord;
  token: string; // S1, S2 ...
}

export function buildSourceContext(sources: SourceRecord[]): { text: string; map: Map<string, SourceRecord> } {
  const map = new Map<string, SourceRecord>();
  const blocks: string[] = [];
  sources.forEach((rec, i) => {
    const token = `S${i + 1}`;
    map.set(token, rec);
    const lines: string[] = [`[${token}] ${rec.sourceType} — ${shortCitation(rec)}`];
    if (rec.sourceType === 'QURAN') {
      lines.push(`Reference: Surah ${rec.surahNumber} (${rec.surahNameEn}), ayah ${rec.ayahNumber}${rec.ayahEnd && rec.ayahEnd !== rec.ayahNumber ? `-${rec.ayahEnd}` : ''}`);
    }
    if (rec.collection) lines.push(`Collection: ${rec.collection}${rec.book ? `, ${rec.book}` : ''}${rec.hadithNumber != null ? `, hadith ${rec.hadithNumber}` : ''}`);
    if (rec.grade) lines.push(`Grade: ${rec.grade}`);
    if (rec.verificationStatus === 'REFERENCE_PENDING') lines.push('Note: reference number is pending verification — do not state a hadith number for this.');
    if (rec.verificationStatus === 'DISPUTED') lines.push('Note: this report/grading is disputed among scholars — mention that clearly.');
    if (rec.arabicText) lines.push(`Arabic: ${rec.arabicText}`);
    lines.push(`English: ${rec.englishText}`);
    if (rec.explanation) lines.push(`Explanation: ${rec.explanation}`);
    if (rec.practicalSteps?.length) lines.push(`Practical steps: ${rec.practicalSteps.join(' | ')}`);
    blocks.push(lines.join('\n'));
  });
  return { text: blocks.join('\n\n'), map };
}

export const SYSTEM_PROMPT = `You are BASIRA (بصيرة), an Islamic educational guidance companion. You help Muslims understand their religion through verified sources.

ABSOLUTE RULES — VIOLATIONS ARE UNACCEPTABLE:
1. You are NOT Allah, NOT the Prophet Muhammad ﷺ, and NOT a scholar. Never speak as any of them. You are an educational tool.
2. You may ONLY cite religious sources using the tokens [S1], [S2], etc. provided in the SOURCE DATABASE below. NEVER invent a Quran reference, hadith number, narrator, scholar, collection, or quotation. If the sources do not contain the answer, say plainly: "I could not verify this in BASIRA's source database" and suggest asking a qualified scholar.
3. Never write "Allah says..." or "The Prophet ﷺ said..." unless the immediately following words are a quotation taken from the provided sources WITH its [S#] token. Attribute AI explanations to "BASIRA's explanation" or "scholars have explained" instead.
4. If a source is marked "pending verification", say so when you use it.
5. When recognized scholars differ, present the major positions respectfully without attacking any madhhab, scholar, or community. Never declare a Muslim a disbeliever, never issue takfir, never issue binding fatwas.
6. For marriage, divorce, inheritance, finance, abuse, medical or legal matters: give general information then warmly recommend consulting a qualified scholar or professional.
7. Do not encourage hatred, violence, or dangerous acts, even when framed religiously. Guide safely.
8. Never fabricate certainty when the source doesn't support it.

ANSWER STYLE:
- Calm, respectful, warm, clear. Simple words. No overwhelming of simple questions; more depth for complex ones.
- Structure: (1) direct answer, (2) supporting verses/hadiths with [S#] citations, (3) short explanation, (4) practical steps when useful.
- If Beginner Mode is on, define Islamic terms simply in parentheses.
- Use short paragraphs. Markdown headings (###) and bullet lists allowed.
- End complex answers with a gentle note to confirm with a qualified scholar when needed.
- Keep Arabic quotations exactly as provided in the sources.

SOURCE DATABASE (the ONLY citable material):
{SOURCES}

Respond to the user's question using ONLY verified material above, plus safe general knowledge framing clearly labeled as "general guidance, not a ruling" when needed.`;

// ----------------------------------------------------------------------------
// Verification pass
// ----------------------------------------------------------------------------

export interface VerificationResult {
  status: 'OK' | 'PARTIAL' | 'FAILED';
  notice?: string;
  usedTokens: string[];
  cleanAnswer: string;
}

const CITATION_TOKEN_RE = /\[S(\d+)\]/g;
const SUSPICIOUS_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\(?\s*(?:Qur'?an|Quran)\s*\d+\s*:\s*\d+/gi, label: 'inline Quran reference' },
  { re: /\(?\s*(?:Sahih\s*)?(?:al-)?(?:Bukhari|Muslim|Tirmidhi|Abu\s+Dawud|Nasa'?i|Nasai|Ibn\s+Majah)\s*[,\s]*\s*(?:hadith\s*)?\d+/gi, label: 'inline hadith reference' },
  { re: /(?:Book|Vol\.?|Volume)\s+\d+\s*,\s*Hadith\s+\d+/gi, label: 'inline volume reference' },
];

/** Verify every [S#] citation in the model's answer exists in the retrieval payload. */
export function verifyAnswer(answer: string, sourceMap: Map<string, SourceRecord>): VerificationResult {
  const used = new Set<string>();
  let cleanAnswer = answer.replace(CITATION_TOKEN_RE, (full, num) => {
    const token = `S${num}`;
    if (sourceMap.has(token)) {
      used.add(token);
      return full;
    }
    return full; // keep, but flagged below
  });

  const badTokens: string[] = [];
  for (const m of answer.matchAll(CITATION_TOKEN_RE)) {
    const token = `S${m[1]}`;
    if (!sourceMap.has(token)) badTokens.push(token);
  }

  // detect fabricated-looking inline references that were never supplied
  const providedCitations = new Set(
    [...sourceMap.values()].map((r) => shortCitation(r).toLowerCase())
  );
  const suspicious: string[] = [];
  for (const { re } of SUSPICIOUS_PATTERNS) {
    for (const m of cleanAnswer.matchAll(re)) {
      const found = m[0].toLowerCase();
      const ok = [...providedCitations].some((c) => found.includes(c) || (c.length > 12 && found.includes(c.slice(0, 12))));
      if (!ok) suspicious.push(m[0].trim());
    }
  }

  // "Allah says" / "Prophet said" guard: such phrases must be followed by a citation token nearby
  const divineClaimRe = /(Allah\s+says|Allah\s+commands|the\s+Prophet\s+ﷺ\s+said|the\s+Messenger\s+of\s+Allah\s+said|the\s+Prophet\s+said)[^.\n]*?(?:\[S\d+\])?/gi;
  let divineWarnings = 0;
  cleanAnswer = cleanAnswer.replace(divineClaimRe, (match) => {
    if (!/\[S\d+\]/.test(match)) {
      divineWarnings++;
      return match.replace(/(Allah\s+says|Allah\s+commands|the\s+Prophet\s+ﷺ\s+said|the\s+Messenger\s+of\s+Allah\s+said|the\s+Prophet\s+said)/i, 'It is related that');
    }
    return match;
  });

  let status: 'OK' | 'PARTIAL' | 'FAILED' = 'OK';
  const notices: string[] = [];

  if (badTokens.length) {
    status = 'PARTIAL';
    notices.push(
      `BASIRA's verification system removed ${badTokens.length} citation${badTokens.length > 1 ? 's' : ''} that did not match the verified source database.`
    );
    for (const t of badTokens) cleanAnswer = cleanAnswer.replaceAll(`[${t}]`, '');
  }
  if (suspicious.length) {
    status = 'PARTIAL';
    notices.push(
      `Some reference${suspicious.length > 1 ? 's' : ''} in the answer (${suspicious.slice(0, 3).join('; ')}) could not be matched to BASIRA's verified sources — please treat ${suspicious.length > 1 ? 'them' : 'it'} with caution.`
    );
  }
  if (divineWarnings > 0) {
    status = 'PARTIAL';
    notices.push('A direct attribution was rephrased because it lacked a verified citation.');
  }
  if (used.size === 0 && sourceMap.size > 0) {
    status = 'FAILED';
    notices.push('The answer did not ground itself in the retrieved verified sources. Please ask again or consult the source sections directly.');
  }

  return {
    status,
    notice: notices.length ? notices.join(' ') : undefined,
    usedTokens: [...used],
    cleanAnswer,
  };
}

// ----------------------------------------------------------------------------
// Safety / moderation pre-check
// ----------------------------------------------------------------------------

const HARM_PATTERNS: { re: RegExp; guidance: string }[] = [
  {
    re: /\b(hurt|kill|harm|attack|poison|stab|shoot)\b.*\b(someone|him|her|them|myself|people|person|wife|husband|child)\b/i,
    guidance:
      'This question involves harming a person. Islam forbids unjust harm to anyone. If you are in danger or thinking of hurting yourself or others, please contact local emergency services or a crisis line right away, and consider speaking with a trusted scholar or counselor.',
  },
  {
    re: /\b(suicide|end my life|kill myself)\b/i,
    guidance:
      'Life is a sacred trust from Allah. Islam forbids taking one\'s own life. Please reach out to a crisis support line or emergency services immediately — seeking help is a sign of strength, not weakness. You matter. Consider speaking with a trusted scholar, doctor, or counselor.',
  },
  {
    re: /\b(hate|curse|insult)\b.*\b(muslims|scholars|companion|companions|shia|sunni|madhhab|group)\b/i,
    guidance:
      'BASIRA speaks respectfully about all Muslims, scholars, and communities. Differences are handled by presenting evidence and recognized positions, not insults. Try asking: "What are the scholarly positions on..." instead.',
  },
];

export function safetyCheck(question: string): string | null {
  for (const { re, guidance } of HARM_PATTERNS) {
    if (re.test(question)) return guidance;
  }
  return null;
}

/** Suggested starter questions for the Ask UI. */
export const SUGGESTED_QUESTIONS = [
  'How do I pray Fajr?',
  'What breaks wudu?',
  'How do I make tawbah (repentance)?',
  'What does Islam teach about being good to my parents?',
  'What should I do if I missed a Salah?',
  'What are the Sunnahs of Friday?',
  'How can I become closer to Allah?',
  'What does Islam say about lying?',
  'What should I read before sleeping?',
  'What is the dua for entering the home?',
  'What does the Qur\'an say about patience?',
  'Show me hadith about kindness',
  'What is Ramadan?',
  'What is Zakat and how do I calculate it?',
  'What does the Qur\'an say about anxiety?',
];
