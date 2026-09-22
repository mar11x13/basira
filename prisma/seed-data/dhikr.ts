import type { SeedRecord } from './shared';

// ============================================================================
// DHIKR — the remembrance counter library. Categories: morning, evening,
// after-salah, before-sleep, general. Target counts are shown ONLY where an
// authentic source establishes a number — BASIRA never invents repetitions.
// ============================================================================

const V = { sourceType: 'DHIKR', verificationStatus: 'VERIFIED', reviewer: 'BASIRA Editorial Review', lastReviewedAt: '2025-01-15' } as const;
const PND = { sourceType: 'DHIKR', verificationStatus: 'REFERENCE_PENDING', reviewer: 'BASIRA Editorial Review', lastReviewedAt: '2025-01-15' } as const;
const DSP = { sourceType: 'DHIKR', verificationStatus: 'DISPUTED', reviewer: 'BASIRA Editorial Review', lastReviewedAt: '2025-01-15' } as const;

export const DHIKR_SEED: SeedRecord[] = [
  // ————— MORNING & EVENING —————
  {
    slug: 'dhikr-me-sayyid-istighfar', title: 'Sayyid al-Istighfar', category: 'morning,evening',
    collection: 'Sahih al-Bukhari', book: 'Book of Invocations', hadithNumber: 6306, targetCount: 1,
    arabicText: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ… فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
    englishText: 'The master of istighfar (see full text in the Dua library). One time in the morning and one in the evening.',
    explanation: 'Whoever says it with certainty in the morning and dies before evening is of the people of Paradise (Bukhari 6306).',
    topics: 'dhikr, morning, evening, forgiveness', keywords: 'sayyid istighfar, morning, evening, forgiveness', ...V,
  },
  {
    slug: 'dhikr-me-dominion', title: 'Morning/evening dominion dhikr', category: 'morning,evening',
    collection: 'Sahih Muslim', book: 'Book of Remembrance of Allah', hadithNumber: 2723, targetCount: 1,
    arabicText: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ…',
    englishText: 'We have entered the morning/evening and all dominion belongs to Allah… (full text in the Dua library).',
    explanation: 'Morning and evening, said once — with the dua for the good of the day and refuge from its evil.',
    topics: 'dhikr, morning, evening', keywords: 'dominion, kingdom, morning, evening', ...V,
  },
  {
    slug: 'dhikr-me-perfect-words', title: 'Refuge in Allah\'s perfect words', category: 'evening,morning',
    collection: 'Sahih Muslim', book: 'Book of Remembrance of Allah', hadithNumber: 2708, targetCount: 3,
    arabicText: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    englishText: 'I seek refuge in the perfect words of Allah from the evil of what He created.',
    explanation: 'Three times in the evening — no harm that night (Muslim 2708). Morning application is reported in other collections.',
    topics: 'dhikr, protection, evening, morning', keywords: 'refuge, protection, evening, three', ...V,
  },
  {
    slug: 'dhikr-me-100', title: 'SubhanAllahi wa bihamdihi — 100', category: 'morning,evening,general',
    collection: 'Sahih al-Bukhari', book: 'Book of Invocations', hadithNumber: 6405, targetCount: 100,
    arabicText: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    englishText: 'Glory be to Allah and praise be to Him.',
    explanation: 'One hundred times daily — sins wiped even if like the foam of the sea (Bukhari 6405).',
    topics: 'dhikr, morning, evening, forgiveness', keywords: 'hundred, tasbih, subhanallah', ...V,
  },

  // ————— AFTER SALAH —————
  {
    slug: 'dhikr-as-istighfar', title: 'Istighfar x3 after prayer', category: 'after-salah',
    collection: 'Sahih Muslim', book: 'Book of Prayer', hadithNumber: 591, targetCount: 3,
    arabicText: 'أَسْتَغْفِرُ اللَّهَ',
    englishText: 'Astaghfirullah — I seek Allah\'s forgiveness.',
    explanation: 'Three times immediately after the taslim, followed by "Allahumma antas-Salamu…" (Muslim 591).',
    topics: 'dhikr, after-salah, forgiveness', keywords: 'after prayer, istighfar, three', ...V,
  },
  {
    slug: 'dhikr-as-tasbih33', title: 'The 33-33-33-1 suite after prayer', category: 'after-salah',
    collection: 'Sahih Muslim', book: 'Book of Prayer', hadithNumber: 597, targetCount: 33,
    arabicText: 'سُبْحَانَ اللَّهِ (٣٣) / الْحَمْدُ لِلَّهِ (٣٣) / اللَّهُ أَكْبَرُ (٣٣) / لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ… (١)',
    englishText: 'SubhanAllah 33 times, Alhamdulillah 33 times, Allahu Akbar 33 times — then complete one hundred: "There is no god but Allah alone, with no partner; to Him belong the kingdom and all praise, and He is able to do all things."',
    explanation: 'Muslim 597: whoever does this after each prayer, his sins are forgiven even if like the foam of the sea. Use the counter for each of the three sets.',
    topics: 'dhikr, after-salah, tasbih', keywords: '33, after prayer, hundred, tasbih, subhanallah', ...V,
  },
  {
    slug: 'dhikr-as-ayat-kursi', title: 'Ayat al-Kursi after prayer', category: 'after-salah',
    collection: 'Reported by an-Nasa\'i (\'Amal al-Yawm wal-Laylah) and at-Tabarani', hadithNumber: null, targetCount: 1,
    referenceNote: 'Not in the six core collections; graded sahih by some scholars (al-Albani) and weak by others — BASIRA labels it DISPUTED so you can decide with knowledge.',
    arabicText: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ… (البقرة ٢٥٥)',
    englishText: 'Recite Ayat al-Kursi (Qur\'an 2:255) after each obligatory prayer.',
    explanation: 'Per the disputed report: "nothing prevents him from entering Paradise except death." The recitation of the Qur\'an itself is undeniably rewarding — the grade applies to the specific reward wording.',
    topics: 'dhikr, after-salah, protection', keywords: 'ayat kursi, after prayer, protection', ...DSP,
  },
  {
    slug: 'dhikr-as-law-hawla', title: 'After prayer: la hawla wa la quwwata illa billah',
    category: 'after-salah',
    collection: 'Sahih al-Bukhari', book: 'Book of the Call to Prayer (Adhan)', hadithNumber: 844, targetCount: 1,
    arabicText: 'لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ',
    englishText: 'There is no power and no might except by Allah.',
    explanation: 'Part of the after-prayer dhikr of Bukhari 844 ("La ilaha illallah wahdahu la sharika lah… Allahumma la mani\'a lima a\'tayt…"). A phrase the Prophet ﷺ described as one of the treasures of Paradise (reported in Bukhari and Muslim).',
    topics: 'dhikr, after-salah', keywords: 'hawl, quwwa, power, might, after prayer', ...V,
  },

  // ————— BEFORE SLEEP —————
  {
    slug: 'dhikr-sleep-fatima', title: 'The Fatimah tasbih before sleep', category: 'before-sleep',
    collection: 'Sahih al-Bukhari', hadithNumber: null, targetCount: 33,
    referenceNote: 'Commonly numbered 5361-5362 in the standard edition; BASIRA shows no single number.',
    arabicText: 'سُبْحَانَ اللَّهِ (٣٣) / الْحَمْدُ لِلَّهِ (٣٣) / اللَّهُ أَكْبَرُ (٣٤)',
    englishText: 'SubhanAllah 33 times, Alhamdulillah 33 times, Allahu Akbar 34 times — before sleeping.',
    explanation: 'Taught to Fatimah and Ali instead of a servant: "better than a servant for you." Ali said he never left it. Note the final set here is 34 (not 33 as after prayer).',
    topics: 'dhikr, before-sleep', keywords: 'fatima, sleep, 33, 34, tasbih', ...PND,
  },
  {
    slug: 'dhikr-sleep-ayat-kursi', title: 'Ayat al-Kursi before sleep', category: 'before-sleep',
    collection: 'Sahih al-Bukhari', book: 'Book of the Virtues of the Qur\'an', hadithNumber: 2311, targetCount: 1,
    arabicText: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ… (البقرة ٢٥٥)',
    englishText: 'Recite Ayat al-Kursi (Qur\'an 2:255) upon lying down.',
    explanation: 'A guardian from Allah remains over you and no shaytan approaches until morning (Bukhari 2311).',
    topics: 'dhikr, before-sleep, protection', keywords: 'ayat kursi, sleep, protection, guardian', ...V,
  },
  {
    slug: 'dhikr-sleep-three-quls', title: 'The three surahs before sleep', category: 'before-sleep',
    collection: 'Sahih al-Bukhari', book: 'Book of the Virtues of the Qur\'an', hadithNumber: 5017, targetCount: 3,
    arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ / قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ / قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    englishText: 'Recite Surah al-Ikhlas, al-Falaq and an-Nas into cupped palms, blow gently, and wipe over yourself — three times.',
    explanation: 'The nightly routine of the Prophet ﷺ (Bukhari 5017).',
    topics: 'dhikr, before-sleep, protection', keywords: 'three quls, sleep, protection', ...V,
  },

  // ————— GENERAL —————
  {
    slug: 'dhikr-general-living', title: 'Remembering Allah — the living and the dead', category: 'general',
    collection: 'Sahih al-Bukhari', book: 'Book of Invocations', hadithNumber: 6407, targetCount: null,
    arabicText: 'مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لاَ يَذْكُرُ رَبَّهُ مَثْلُ الْحَيِّ وَالْمَيِّتِ',
    englishText: 'The one who remembers his Lord and the one who does not are like the living and the dead. (No fixed count — remember Allah abundantly, Qur\'an 33:41.)',
    explanation: 'Dhikr without a fixed number: say it walking, waiting, commuting. "O you who believe, remember Allah abundantly" (33:41).',
    topics: 'dhikr, general, remembrance', keywords: 'remember, living, dead, abundant', ...V,
  },
  {
    slug: 'dhikr-general-two-words', title: 'The two words beloved to the Most Merciful', category: 'general',
    collection: 'Sahih al-Bukhari', hadithNumber: 6682, targetCount: null,
    arabicText: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    englishText: 'SubhanAllahi wa bihamdih, SubhanAllahil-\'Adhim. (No fixed count — "abundantly".)',
    explanation: 'Light on the tongue, heavy on the scales (Bukhari 6682).',
    topics: 'dhikr, general, tasbih', keywords: 'two words, tasbih, scales', ...V,
  },
];
