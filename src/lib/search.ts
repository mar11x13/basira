// ============================================================================
// BASIRA search — natural-language-friendly keyword engine with synonym
// expansion + relevance scoring. ALWAYS grounded in real DB records.
// ============================================================================

import type { SourceText } from '@prisma/client';
import { mapRecord } from './record-mapper';
import type { SourceRecord, SearchGroup } from './types';
import { SOURCE_TYPE_LABELS } from './types';

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'of', 'in', 'on', 'at', 'to', 'for', 'with',
  'and', 'or', 'but', 'if', 'then', 'than', 'so', 'do', 'does', 'did', 'what', 'which', 'who', 'whom',
  'how', 'why', 'when', 'where', 'can', 'could', 'should', 'would', 'will', 'shall', 'may', 'might',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'my', 'your', 'his', 'her', 'our', 'their',
  'about', 'tell', 'show', 'find', 'give', 'please', 'any', 'some', 'there', 'this', 'that', 'these',
  'those', 'from', 'by', 'as', 'also', 'into', 'upon', 'verses', 'verse', 'saying', 'sayings',
  'hadiths', 'hadith', 'duas', 'dua', 'quran', "qur'an", 'islam', 'islamic', 'muslim', 'muslims',
  'does', 'make', 'made', 'get', 'got', 'need', 'want', 'know', 'best', 'good',
]);

/** Topic synonyms — expands natural language to canonical topic keywords. */
const SYNONYMS: Record<string, string[]> = {
  patience: ['patience', 'patient', 'sabr', 'perseverance', 'endure', 'endurance', 'hardship', 'difficulty', 'trial', 'trials', 'calamity', 'test', 'tests', 'affliction'],
  anxiety: ['anxiety', 'anxious', 'worry', 'worried', 'stress', 'stressed', 'fear', 'afraid', 'panic', 'peace', 'calm', 'restlessness', 'heart', 'comfort'],
  prayer: ['prayer', 'prayers', 'salah', 'salat', 'pray', 'namaz', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jumuah', 'friday', 'khushu', 'worship'],
  fasting: ['fasting', 'fast', 'sawm', 'ramadan', 'siyam'],
  ramadan: ['ramadan', 'fasting', 'fast', 'laylat', 'qadr', 'tarawih', 'iftar', 'suhur'],
  parents: ['parents', 'parent', 'mother', 'father', 'mom', 'mum', 'dad', 'family', 'relatives', 'kin', 'mother', 'obedience'],
  kindness: ['kindness', 'kind', 'gentle', 'gentleness', 'mercy', 'merciful', 'compassion', 'good', 'character', 'manners', 'adab', 'politeness', 'smile'],
  repentance: ['repentance', 'repent', 'tawbah', 'tauba', 'forgiveness', 'forgive', 'sin', 'sins', 'istighfar', 'astaghfirullah', 'sorry', 'regret'],
  forgiveness: ['forgiveness', 'forgive', 'pardon', 'repentance', 'tawbah', 'mercy', 'istighfar', 'sin', 'sins'],
  jannah: ['jannah', 'paradise', 'heaven', 'garden', 'gardens', 'reward', 'hereafter', 'afterlife', 'eternal'],
  jahannam: ['jahannam', 'hell', 'fire', 'punishment', 'punish', 'warning'],
  marriage: ['marriage', 'marry', 'spouse', 'wife', 'wives', 'husband', 'nikah', 'family', 'tranquility', 'couple'],
  business: ['business', 'trade', 'trading', 'commerce', 'buying', 'selling', 'seller', 'buyer', 'merchant', 'cheating', 'honest', 'dealings', 'money', 'transaction'],
  lying: ['lying', 'lie', 'lies', 'falsehood', 'dishonesty', 'truth', 'truthful', 'trustworthy', 'hypocrite', 'deception'],
  dua: ['dua', 'supplication', 'invoke', 'asking', 'ask', 'call', 'prayer'],
  dhikr: ['dhikr', 'zhikr', 'remembrance', 'remember', 'tasbih', 'glorify', 'subhanallah', 'alhamdulillah', 'allahuakbar'],
  knowledge: ['knowledge', 'learn', 'learning', 'study', 'student', 'teach', 'teacher', 'scholar', 'science', 'understanding'],
  sleep: ['sleep', 'sleeping', 'bed', 'night', 'before sleeping', 'insomnia', 'rest'],
  morning: ['morning', 'dawn', 'fajr', 'daybreak', 'after waking'],
  evening: ['evening', 'night', 'asr', 'maghrib'],
  eating: ['eating', 'eat', 'food', 'meal', 'drink', 'dining', 'before eating', 'after eating'],
  travel: ['travel', 'traveling', 'journey', 'trip', 'flight', 'safar'],
  illness: ['illness', 'sick', 'sickness', 'disease', 'health', 'patient', 'cure', 'healing', 'pain', 'medicine'],
  rain: ['rain', 'raining', 'weather', 'storm', 'thunder'],
  masjid: ['masjid', 'mosque', 'masjid', 'jumuah'],
  seerah: ['seerah', 'sirah', 'prophet', 'muhammad', 'biography', 'life', 'makkah', 'madinah', 'hijra', 'mecca'],
  wudu: ['wudu', 'ablution', 'purity', 'purification', 'wash', 'taharah'],
  ghusl: ['ghusl', 'bath', 'janaba', 'major purification'],
  zakat: ['zakat', 'zakah', 'charity', 'sadaqah', 'giving', 'poor', 'needy', 'spending'],
  tawhid: ['tawhid', 'tawheed', 'oneness', 'monotheism', 'shirk', 'allah', 'worship', 'aqeedah', 'creed', 'belief', 'iman', 'faith'],
  children: ['children', 'child', 'kids', 'sons', 'daughters', 'offspring', 'family'],
  anger: ['anger', 'angry', 'rage', 'forgiveness', 'temper', 'restrain'],
  gratitude: ['gratitude', 'grateful', 'thankful', 'shukr', 'praise', 'alhamdulillah'],
  death: ['death', 'die', 'dying', 'grave', 'hereafter', 'afterlife', 'akhirah'],
  guidance: ['guidance', 'guidance', 'guide', 'hidayah', 'straight path', 'lost'],
  hope: ['hope', 'despair', 'sadness', 'depression', 'grief', 'sorrow', 'consolation', 'ease', 'relief'],
  fitrah: ['fitrah', 'nature', 'disposition', 'innate'],
};

/** Normalize a raw query into canonical expanded keyword tokens. */
export function expandQuery(q: string): { tokens: string[]; matchedTopics: string[] } {
  const raw = q.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').split(/\s+/).filter(Boolean);
  const tokens = new Set<string>();
  const matchedTopics = new Set<string>();

  for (const w of raw) {
    if (!STOPWORDS.has(w) && w.length > 1) tokens.add(w);
    for (const [topic, syns] of Object.entries(SYNONYMS)) {
      if (syns.includes(w) || topic === w) {
        matchedTopics.add(topic);
        for (const s of syns.slice(0, 6)) tokens.add(s);
      }
    }
    // stemming-lite: fast/fasting, pray/prayer(s)
    if (w.endsWith('s')) tokens.add(w.slice(0, -1));
  }

  // multi-word phrases
  const joined = raw.join(' ');
  const phrases: [RegExp, string][] = [
    [/before sleep|at bedtime/, 'sleep'],
    [/after waking|wake up|woke up/, 'morning'],
    [/before eating|before meal/, 'eating'],
    [/after eating|after meal/, 'eating'],
    [/entering (the )?(home|house)/, 'entering home'],
    [/leaving (the )?(home|house)/, 'leaving home'],
    [/what breaks wudu|breaks wudu|break wudu/, 'wudu'],
    [/how (do|to) pray|learn(ing)? (to )?pray|teach me (how )?to pray/, 'prayer'],
    [/closer to allah|near to allah|come closer/, 'dhikr'],
    [/missed salah|missed prayer|forgot prayer/, 'prayer'],
    [/good to my parents|rights of parents|serve parents/, 'parents'],
  ];
  for (const [re, topic] of phrases) {
    if (re.test(joined)) {
      matchedTopics.add(topic);
      tokens.add(topic);
    }
  }

  return { tokens: [...tokens], matchedTopics: [...matchedTopics] };
}

function scoreRecord(r: SourceText, tokens: string[], matchedTopics: string[], rawQ: string): number {
  const title = r.title.toLowerCase();
  const english = r.englishText.toLowerCase();
  const explanation = (r.explanation ?? '').toLowerCase();
  const translit = (r.transliteration ?? '').toLowerCase();
  const topicStr = r.topics.toLowerCase();
  const keywordStr = r.keywords.toLowerCase();
  const arabic = r.arabicText ?? '';

  let score = 0;
  for (const t of matchedTopics) {
    if (topicStr.includes(t)) score += 12;
    if (keywordStr.includes(t)) score += 8;
  }
  for (const token of tokens) {
    if (token.length < 3) continue;
    if (title.includes(token)) score += 6;
    if (topicStr.includes(token)) score += 5;
    if (keywordStr.includes(token)) score += 4;
    if (english.includes(token)) score += 2;
    if (explanation.includes(token)) score += 1;
    if (translit.includes(token)) score += 2;
    if (arabic.includes(rawQ.trim())) score += 20;
  }

  // direct phrase match in text
  const phrase = rawQ.trim().toLowerCase();
  if (phrase.length > 6) {
    if (english.includes(phrase)) score += 8;
    if (title.includes(phrase)) score += 12;
  }

  // small source-hierarchy boost: Quran and authentic hadith rank higher on ties
  // (only applied to records that already matched something — never inflates
  // nonsense queries into results)
  const baseScore = score;
  if (baseScore > 0) {
    if (r.sourceType === 'QURAN') score += 2;
    if (r.sourceType === 'HADITH') score += 1.5;
  }

  // penalize disabled/flagged
  if (!r.active || r.sourceStatus !== 'ACTIVE') score -= 50;

  return score;
}

export function rankRecords(
  rows: SourceText[],
  query: string,
  opts: { types?: string[]; limit?: number } = {}
): { groups: SearchGroup[]; total: number } {
  const { tokens, matchedTopics } = expandQuery(query);
  const rawQ = query.toLowerCase();
  const scored = rows
    .filter((r) => r.active && r.sourceStatus === 'ACTIVE')
    .filter((r) => (opts.types?.length ? opts.types.includes(r.sourceType) : true))
    .map((r) => ({ r, score: scoreRecord(r, tokens, matchedTopics, rawQ) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.limit ?? 40);

  const byType = new Map<string, SourceRecord[]>();
  for (const s of scored) {
    const list = byType.get(s.r.sourceType) ?? [];
    if (list.length < 12) list.push(mapRecord(s.r));
    byType.set(s.r.sourceType, list);
  }

  const order = ['QURAN', 'HADITH', 'DUA', 'DHIKR', 'FIQH', 'SCHOLARLY', 'SEERAH', 'GLOSSARY', 'GENERAL'];
  const groups: SearchGroup[] = [];
  for (const t of order) {
    const items = byType.get(t);
    if (items?.length) {
      groups.push({ sourceType: t as SearchGroup['sourceType'], label: SOURCE_TYPE_LABELS[t as keyof typeof SOURCE_TYPE_LABELS], items });
    }
  }
  return { groups, total: scored.length };
}

/** Retrieve top records across the whole source database (for AI grounding). */
export function retrieveForAI(rows: SourceText[], question: string, k = 12): SourceText[] {
  const { tokens, matchedTopics } = expandQuery(question);
  const rawQ = question.toLowerCase();
  return rows
    .filter((r) => r.active && r.sourceStatus === 'ACTIVE')
    .map((r) => ({ r, score: scoreRecord(r, tokens, matchedTopics, rawQ) }))
    .filter((s) => s.score > 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.r);
}
