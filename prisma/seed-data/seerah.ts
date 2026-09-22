import type { SeedRecord } from './shared';

// ============================================================================
// SEERAH — the life of the Prophet Muhammad ﷺ. Classical sources cited per
// event (Ibn Ishaq/Ibn Hisham; Sahih al-Bukhari/Muslim where applicable).
// No invented details; disputed reports are labeled.
// ============================================================================

const S = { sourceType: 'SEERAH', verificationStatus: 'VERIFIED', reviewer: 'BASIRA Editorial Review', lastReviewedAt: '2025-01-15' } as const;

const IBN_ISHAQ = 'Ibn Ishaq / Ibn Hisham, as-Sirah an-Nabawiyyah (classical biography, 8th century)';

export const SEERAH_SEED: SeedRecord[] = [
  {
    slug: 'seerah-birth', title: 'Birth of the Prophet ﷺ (c. 570 CE, Makkah)',
    category: 'early-makkah', sortOrder: 1,
    collection: 'Qur\'an (Surah al-Fil) + classical seerah', sourceType: 'QURAN',
    surahNumber: 105, surahNameEn: 'Al-Fil', surahNameAr: 'الفيل', ayahNumber: 1, ayahEnd: 5,
    englishText: 'The Prophet Muhammad ﷺ was born in Makkah around 570 CE, in the Year of the Elephant — the year Abraha\'s army marched on the Kaʿbah with war elephants and was destroyed, as Surah al-Fil describes. His father Abdullah had died before his birth.',
    explanation: 'Sources: Surah al-Fil 105:1-5 for the year\'s namesake event; his father\'s pre-birth death and the birth year are from the classical biography (Ibn Ishaq/Ibn Hisham). Note: scholars differ by a year or two on the exact Gregorian date — BASIRA writes "c. 570 CE" deliberately.',
    topics: 'seerah, birth, makkah, prophet', keywords: 'birth, born, elephant year, 570, makkah', ...S,
  },
  {
    slug: 'seerah-aminah', title: 'Childhood: Halima, Amina\'s death, and guardians',
    category: 'early-makkah', sortOrder: 2,
    collection: IBN_ISHAQ,
    englishText: 'Per custom, the infant was nursed in the desert by Halima as-Sa\'diyyah. At about six, his mother Amina died at al-Abwa on a return journey from Madinah, leaving him an orphan; his grandfather Abdul-Muttalib cared for him — the Qur\'an later reminded: "Did He not find you an orphan and shelter you?" (93:6). At about eight, his grandfather died, and his uncle Abu Talib raised him.',
    explanation: 'From the classical biography (Ibn Ishaq/Ibn Hisham) with the Qur\'anic anchors (93:6-8; 94:1-8 — BASIRA includes both surahs in full in the Qur\'an section).',
    topics: 'seerah, childhood, orphan, halima, aminah', keywords: 'childhood, mother, orphan, halima, abu talib, grandfather', ...S,
  },
  {
    slug: 'seerah-al-amin', title: 'The Trustworthy one of Makkah',
    category: 'early-makkah', sortOrder: 3,
    collection: IBN_ISHAQ,
    englishText: 'Growing up, Muhammad ﷺ was known as al-Amin — the trustworthy. He tended sheep, traded, and at about 25 married Khadijah bint Khuwaylid after she witnessed his honesty managing her caravans. She was his sole wife for 25 years and the first believer. At about 35, his integrity made him the natural arbiter of the Black Stone dispute — all clans accepted his solution of placing the stone on a cloth carried by all leaders.',
    explanation: 'The Black Stone arbitration is from Ibn Ishaq/Ibn Hisham; the marriage to Khadijah is recorded in the classical sources and the hadith collections (her virtue is celebrated in Bukhari 3812-3815).',
    topics: 'seerah, khadijah, marriage, trustworthy', keywords: 'al-amin, trustworthy, khadijah, black stone, trade', ...S,
  },
  {
    slug: 'seerah-first-revelation', title: 'The first revelation — Cave of Hira (610 CE)',
    category: 'revelation', sortOrder: 4,
    collection: 'Sahih al-Bukhari', book: 'Book of Revelation (Kitab Bad\' al-Wahy)', hadithNumber: 3,
    englishText: 'At forty, withdrawing to the cave of Hira, the Prophet ﷺ received the first verses: "Read, in the name of your Lord who created" (96:1-5). He returned trembling to Khadijah, who comforted and believed him. Thereafter revelation continued — with a pause — until "Arise and warn" (74:1-3). The first believers: Khadijah, Abu Bakr, Ali, and Zayd ibn Harithah.',
    explanation: 'The full narration is Aisha\'s hadith in Sahih al-Bukhari (no. 3 — included complete in BASIRA\'s Hadith section). The Qur\'an describes itself as sent down in Ramadan (2:185) and on Laylat al-Qadr (97:1).',
    topics: 'seerah, revelation, hira, iqra, first revelation', keywords: 'cave hira, revelation, jibril, iqra, 610, khadijah', ...S,
  },
  {
    slug: 'seerah-persecution', title: 'The Makkah years: calling and persecution',
    category: 'makkah-period', sortOrder: 5,
    collection: IBN_ISHAQ,
    englishText: 'For years the Prophet ﷺ called quietly, then openly after "Arise and warn." Makkah\'s leaders rejected him; the vulnerable among his followers were tortured — Bilal was tortured yet held "Ahad, Ahad" (One, One), and Sumayyah, mother of Ammar, was killed: the first martyr of Islam. The Prophet ﷺ himself faced ridicule, the boycott of his clans, and theYear of grief. In 615 CE, some companions migrated to Abyssinia under its just Christian king, the Negus.',
    explanation: 'From the classical biography; the mutual-pledges and persecution reports vary in individual chains — BASIRA presents the mass-transmitted core (Bilal\'s steadfastness and Sumayyah\'s martyrdom are among the most established events of the period).',
    topics: 'seerah, persecution, makkah, bilal, sumayyah', keywords: 'persecution, torture, bilal, abyssinia, boycott', ...S,
  },
  {
    slug: 'seerah-year-of-sorrow', title: 'The Year of Sorrow, Ta\'if, and Isra & Miʿraj',
    category: 'makkah-period', sortOrder: 6,
    collection: IBN_ISHAQ,
    englishText: 'In 619 CE (year 10 of prophethood), Khadijah and Abu Talib died within weeks — "the Year of Sorrow." Seeking support, the Prophet ﷺ walked to Ta\'if, where its leaders mocked him and their youth stoned him; he made the journey\'s famous dua of trust. That same period came the Isra — the night journey to Jerusalem — and the Miʿraj — the ascension through the heavens, from which the five daily prayers were gifted.',
    explanation: 'Ta\'if and the Year of Sorrow: Ibn Ishaq/Ibn Hisham. The Isra is Qur\'anic (17:1) and the Miʿraj is detailed in Bukhari and Muslim (BASIRA includes the hadith in the Hadith section with its reference note). The Ta\'if dua\'s wording is reported with some chain discussion among scholars — BASIRA therefore does not reproduce it as certain text.',
    topics: 'seerah, taif, year of sorrow, isra, miraj', keywords: 'taif, sorrow, khadijah death, night journey, ascension, five prayers', ...S,
  },
  {
    slug: 'seerah-hijra', title: 'The Hijra to Madinah (622 CE)',
    category: 'madinah-period', sortOrder: 7,
    collection: 'Qur\'an + Sahih al-Bukhari',
    englishText: 'Delegations from Yathrib pledged allegiance, and in 622 CE the Muslims migrated to the city later named Madinah. The Prophet ﷺ and Abu Bakr hid three nights in the cave of Thawr as pursuers closed in — the moment preserved by the Qur\'an: "second of two, when they were both in the cave, when he said to his companion: Do not grieve; indeed Allah is with us" (9:40). Madinah received the building of the first mosque, the constitution uniting the tribes, and the brotherhood pairing migrants and helpers.',
    explanation: 'The cave event is Qur\'anic (9:40 — included in BASIRA\'s Qur\'an section). The migration details are in Bukhari\'s Book of the Merits of the Madinan Helpers and Ibn Ishaq. The Hijri calendar begins from this migration.',
    topics: 'seerah, hijra, madinah, migration, cave thawr', keywords: 'hijra, migration, madinah, medina, cave, abu bakr, 622', ...S,
  },
  {
    slug: 'seerah-badr', title: 'The Battle of Badr (2 AH / 624 CE)',
    category: 'madinah-period', sortOrder: 8,
    collection: 'Qur\'an + Sahih al-Bukhari/Muslim',
    englishText: 'About 313 Muslims faced roughly a thousand Quraysh. The Qur\'an records it as divine aid: "Allah already gave you victory at Badr while you were weak" (3:123). The battle ended in decisive victory for the Muslims; the prisoners were treated with unprecedented clemency — many were freed for teaching writing to Madinah\'s children.',
    explanation: 'Qur\'anic anchor: 3:123 (in BASIRA\'s Qur\'an section). The full battle account is in Bukhari\'s Book of Maghazi (Book of Military Expeditions) and Ibn Ishaq. Badr fell on 17 Ramadan, 2 AH by the common calculation.',
    topics: 'seerah, badr, battle, victory', keywords: 'badr, battle, 313, victory, ramadan', ...S,
  },
  {
    slug: 'seerah-uhud-trench', title: 'Uhud (3 AH) and the Trench (5 AH)',
    category: 'madinah-period', sortOrder: 9,
    collection: 'Qur\'an + classical sources',
    englishText: 'At Uhud (3 AH), the Muslims were wounded by a moment of disunity — the Qur\'an consoled them: "Do not weaken and do not grieve — you shall be superior, if you are believers" (3:139). At the Trench (5 AH), Madinah was defended by a dug trench against a confederate siege, which ended without pitched battle and with the siege lifted. Both trials forged the young community.',
    explanation: 'Uhud: Qur\'an 3:121-180 + Bukhari\'s Book of Maghazi. The Trench: Bukhari/Muslim and Ibn Ishaq. BASIRA summarizes only the mass-transmitted core of the events.',
    topics: 'seerah, uhud, trench, khandaq', keywords: 'uhud, trench, khandaq, battle, siege', ...S,
  },
  {
    slug: 'seerah-hudaybiyyah', title: 'Hudaybiyyah and the letters to kings (6 AH)',
    category: 'madinah-period', sortOrder: 10,
    collection: 'Sahih al-Bukhari + classical sources',
    englishText: 'In 6 AH the Prophet ﷺ set out for ʿUmrah; blocked at Hudaybiyyah, he signed a ten-year treaty on terms that initially disappointed the companions — the Qur\'an called it "a clear opening" (48:1). The same years carried his letters to Heraclius, Khosrau, the Negus, and others inviting them to Islam.',
    explanation: 'The treaty narrative is in Bukhari\'s Book of Military Expeditions (the "Bay\'at ar-Ridwan" pledge is Qur\'anic, 48:10); the letters are in Ibn Ishaq and the collections. The apparent setback became the gateway to Makkah.',
    topics: 'seerah, hudaybiyyah, treaty, letters', keywords: 'treaty, hudaybiyyah, opening, umrah, kings', ...S,
  },
  {
    slug: 'seerah-conquest', title: 'The Conquest of Makkah (8 AH / 630 CE)',
    category: 'madinah-period', sortOrder: 11,
    collection: IBN_ISHAQ,
    englishText: 'After Quraysh broke the treaty, the Prophet ﷺ entered Makkah with ten thousand — almost bloodlessly. At the Kaʿbah he asked its people: "What do you think I will do with you?" They said: "Good — you are a noble brother, son of a noble brother." He answered: "Go, for you are free." The idols were removed, and the city that had expelled him embraced the faith en masse.',
    explanation: 'From the classical biography and the hadith collections (Bukhari\'s Book of Maghazi preserves the entry). The general amnesty is among the most established events of the era — studied worldwide as a model of mercy in victory.',
    topics: 'seerah, conquest, makkah, forgiveness', keywords: 'conquest, makkah, amnesty, forgiveness, 630, victory', ...S,
  },
  {
    slug: 'seerah-farewell', title: 'The Farewell Pilgrimage and Sermon (10 AH / 632 CE)',
    category: 'final-days', sortOrder: 12,
    collection: IBN_ISHAQ,
    englishText: 'In 10 AH the Prophet ﷺ led the only Hajj of his prophethood, before ~100,000 companions. The Farewell Sermon — months before his death — declared: no superiority of Arab over non-Arab or of color over color except by mindfulness of Allah (taqwa); the sanctity of life and property; women\'s rights and mutual obligations; the abolition of usury and blood-feud vengeance; and "I leave among you that which, if you hold to it, you will never go astray: the Book of Allah." He asked: "Have I conveyed?" The valley itself was called to witness.',
    explanation: 'The sermon is preserved with several chains of varying strength in the collections (Muslim carries large portions, including the "taqwa" ending; Ibn Majah and others carry fuller wordings). BASIRA presents its mass-transmitted core. Within weeks, at 63 years old, the Prophet ﷺ passed away in Madinah, in Aisha\'s apartment, on Monday 12 Rabi\' al-Awwal, 11 AH (June 632 CE) — his final words reported as the testimony of Allah\'s oneness and the choice of the higher companionship.',
    topics: 'seerah, farewell sermon, hajj, death', keywords: 'farewell, sermon, pilgrimage, death, final, 632', ...S,
  },
];
