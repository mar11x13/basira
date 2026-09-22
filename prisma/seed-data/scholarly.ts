import type { SeedRecord } from './shared';

// ============================================================================
// SCHOLARLY VIEWS — recognized positions and differences of opinion,
// presented respectfully with attribution. Never as fatwas. Plus GENERAL
// records for guidance that is clearly NOT a religious ruling.
// ============================================================================

const SV = { sourceType: 'SCHOLARLY', verificationStatus: 'VERIFIED', reviewer: 'BASIRA Editorial Review', lastReviewedAt: '2025-01-15' } as const;
const GV = { sourceType: 'GENERAL', verificationStatus: 'VERIFIED', reviewer: 'BASIRA Editorial Review', lastReviewedAt: '2025-01-15' } as const;

export const SCHOLARLY_SEED: SeedRecord[] = [
  {
    slug: 'scholarly-madhhab-overview', title: 'The four madhhabs — an overview',
    category: 'fiqh-schools',
    scholar: 'Classical juristic tradition (educational summary)', school: null,
    englishText: 'Four schools of Sunni jurisprudence developed from the generation after the companions, each named for its founding imam: the Hanafi school (Imam Abu Hanifa, d. 767 CE — widespread in Turkey, the Balkans, Central & South Asia, Egypt); the Maliki school (Imam Malik ibn Anas, d. 795 CE — North & West Africa); the Shafi\'i school (Imam ash-Shafi\'i, d. 820 CE — East Africa, Southeast Asia, parts of the Middle East); and the Hanbali school (Imam Ahmad ibn Hanbal, d. 855 CE — the Arabian peninsula).',
    explanation: 'The schools share the Qur\'an and Sunnah as supreme sources and agree on the vast majority of rulings; their differences mostly concern details of derivation and interpretation — a diversity the tradition itself framed as a mercy. Each school\'s classical manuals were refined over centuries by its scholars. BASIRA presents all four with equal respect; your profile keeps "no preference" by default.',
    referenceNote: 'Educational summary of the classical tradition — not a fatwa. Details of any school\'s positions should be confirmed with qualified scholars of that school.',
    topics: 'madhhab, fiqh, differences, schools', keywords: 'hanafi, maliki, shafii, hanbali, school, jurisprudence', ...SV,
  },
  {
    slug: 'scholarly-differences-intro', title: 'Why scholars differ — and how BASIRA handles it',
    category: 'fiqh-schools',
    scholar: 'Usul al-fiqh tradition (educational summary)', school: null,
    englishText: 'Legitimate juristic differences (ikhtilaf) arise from honest scholarly effort: a narration reaching one jurist and not another, differing interpretations of a text\'s scope, different weightings of companion practice, or differing methods of weighing conflicting evidence. The tradition treats validated differences with respect — "the mujtahid who is correct has two rewards; the one who errs has one" (agreed upon).',
    explanation: 'BASIRA\'s editorial rule mirrors the tradition: when recognized scholars have differed on an issue, BASIRA says so clearly, presents the major positions with attribution, and never attacks any school, scholar, or community. Where a single authenticated position dominates, BASIRA states it with its source. Where evidence is weak or disputed, BASIRA labels it — accuracy before answering quickly.',
    referenceNote: 'Educational explanation of usul al-fiqh (legal methodology) — not a ruling.',
    topics: 'differences, fiqh, methodology, usul', keywords: 'ikhtilaf, difference, scholarly disagreement, methodology', ...SV,
  },
  {
    slug: 'scholarly-hands-position', title: 'Where to place the hands in prayer',
    category: 'salah-detail',
    scholar: 'Positions attributed to the recognized schools', school: null,
    englishText: 'A famous, minor, respectful difference: The Shafi\'i and Hanbali schools place the right hand over the left upon the chest. The classical Hanafi manuals place them below the navel. A Hanafi narration supports the chest as well; Malik\'s school transmitted letting the arms hang (a minority position within it, with other narrations supporting clasping).',
    explanation: 'Each school cites its narrations from the companions — early Muslims themselves varied in this. Scholars of every school affirm the validity of the others\' prayer. Practically: follow the way you were taught (or your local mosque), and know that the matter is from the appreciated details, not the essence.',
    referenceNote: 'Educational summary of the four schools\' standard positions; consult each school\'s manuals/scholars for their evidence chains.',
    topics: 'prayer, salah, differences, fiqh', keywords: 'hands, chest, navel, fold, position, prayer', ...SV,
  },
  {
    slug: 'scholarly-ameen', title: 'Saying "Amin" aloud or silently',
    category: 'salah-detail',
    scholar: 'Positions attributed to the recognized schools', school: null,
    englishText: 'After the Fatihah in audible prayers: the Shafi\'i and Hanbali schools say "Amin" aloud with the imam; the Hanafi and Maliki schools say it silently. Each derives from narrations of the companions\' practice and the hadith "When the imam says Amin, say Amin" (agreed upon, Bukhari 780 / Muslim 410 — the hadith itself is common ground).',
    explanation: 'A classic illustration that one hadith can yield two sound understandings. Neither side questions the other\'s prayer — the difference is in the recitation chapters (audible vs. silent) they each harmonize it with.',
    referenceNote: 'Educational summary of the four schools\' positions; consult their manuals for details.',
    topics: 'prayer, salah, differences, fatihah', keywords: 'ameen, amin, aloud, silent, fatihah', ...SV,
  },
  {
    slug: 'scholarly-touching-women-wudu', title: 'Does touching a woman break wudu?',
    category: 'purity-detail',
    scholar: 'Positions attributed to the recognized schools', school: null,
    englishText: 'The Shafi\'i school holds that direct skin contact with a marriageable woman nullifies wudu, reading the Qur\'anic phrase "or you have touched women" (4:43) literally. The Hanafi, Maliki, and Hanbali schools hold it does not break wudu, understanding the Qur\'anic phrase (per its context and usage) as a euphemism for marital relations.',
    explanation: 'All positions are anchored in taking the Qur\'an seriously — differently. The scholars of each school consider the others\' derivation legitimate. If unsure which to follow, your madhhab-of-following or a trusted local scholar is the natural reference — BASIRA deliberately presents both rather than an invented unanimity.',
    referenceNote: 'Educational summary of the classical positions on Qur\'an 4:43 — not a ruling on your state of purity.',
    topics: 'wudu, purity, differences, fiqh', keywords: 'touch, women, wudu breaks, purity, 4:43', ...SV,
  },
  {
    slug: 'general-complex-matters', title: 'When a question needs a qualified scholar',
    category: 'guidance',
    englishText: 'Some matters are too consequential for an educational app to settle definitively: marriage and divorce proceedings, inheritance divisions, serious financial disputes, abuse in the family, criminal matters, medical end-of-life decisions, and cases of an unusual or emergency nature. For these, BASIRA provides general knowledge — and a clear recommendation to involve a qualified scholar and, where relevant, the appropriate professional.',
    explanation: 'This is a design principle, not a disclaimer for form\'s sake: the Qur\'an itself commands "Ask the people of knowledge if you do not know" (16:43 — its authentic anchoring). BASIRA\'s Ask feature flags such topics automatically in its answers.',
    referenceNote: 'General guidance — clearly not a religious ruling.',
    topics: 'guidance, scholars, complex matters, advice', keywords: 'scholar, consult, complex, marriage, divorce, inheritance, abuse, medical', ...GV,
  },
  {
    slug: 'general-app-identity', title: 'What BASIRA is — and what it is not',
    category: 'guidance',
    englishText: 'BASIRA is an educational Islamic guidance tool: a curated library of the Qur\'an, authentic hadith (Sahih al-Bukhari at its core), duas, dhikr, fiqh explanations, and an AI assistant that answers ONLY from its verified source database with transparent citations. BASIRA is not Allah, not the Prophet Muhammad ﷺ, and not a scholar — and never speaks as any of them.',
    explanation: 'Every religious claim in BASIRA aims to carry a traceable source; anything unverifiable is labeled as such. For rulings on your personal situation, a qualified local scholar remains the authority — BASIRA is the companion that helps you arrive prepared.',
    referenceNote: 'General guidance — clearly not a religious ruling.',
    topics: 'guidance, about, identity, trust', keywords: 'about basira, what is basira, educational, trust, identity', ...GV,
  },
];
