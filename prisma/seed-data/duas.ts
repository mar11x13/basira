import type { SeedRecord } from './shared';

// ============================================================================
// DUA LIBRARY — organized by situation (morning, evening, sleep, eating,
// travel, fear, difficulty, forgiveness, parents, study, illness, rain,
// masjid, salah, ramadan, home, general).
// SOURCING RULES (non-negotiable):
//  - Sunnah duas carry collection/book/number (or "reference pending").
//  - Qur'anic duas are labeled QURAN with exact ayah references.
//  - General permissible duas (not specifically narrated) are labeled
//    GENERAL with collection = null so the UI shows "general permissible
//    dua" — never presented as Sunnah.
// ============================================================================

const V = { sourceType: 'DUA', verificationStatus: 'VERIFIED', reviewer: 'BASIRA Editorial Review', lastReviewedAt: '2025-01-15' } as const;
const PND = { sourceType: 'DUA', verificationStatus: 'REFERENCE_PENDING', reviewer: 'BASIRA Editorial Review', lastReviewedAt: '2025-01-15' } as const;
const GN = { sourceType: 'DUA', verificationStatus: 'VERIFIED', reviewer: 'BASIRA Editorial Review', lastReviewedAt: '2025-01-15', collection: null, referenceNote: 'General permissible supplication — not a specifically narrated Sunnah dua.' } as const;

export const DUA_SEED: SeedRecord[] = [
  // ————— MORNING —————
  {
    slug: 'dua-morning-dominion', title: 'Morning & evening: the dominion belongs to Allah',
    category: 'morning,evening',
    collection: 'Sahih Muslim', book: 'Book of Remembrance of Allah (Dhikr)', hadithNumber: 2723,
    arabicText: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku walahul-hamdu wa huwa \'ala kulli shay\'in qadir.',
    englishText: 'We have entered the morning, and with the morning all dominion belongs to Allah. All praise is for Allah. There is no god but Allah alone, without partner; to Him belong the kingdom and all praise, and He is able to do all things.',
    explanation: 'Said at morning — for evening, replace with "Amsayna wa amsal-mulku lillah" (we have entered the evening). The Prophet ﷺ would then ask for the good of the day/evening and seek refuge from its evil.',
    topics: 'dua, morning, evening, dhikr', keywords: 'morning, dominion, kingdom, evening, day', ...V,
  },
  {
    slug: 'dua-morning-bika-asbahna', title: 'Morning & evening: by You we live',
    category: 'morning,evening',
    collection: 'Sahih al-Bukhari', book: 'Book of Invocations (Kitab ad-Da\'awat)', hadithNumber: null,
    referenceNote: 'Reported in the Book of Invocations (also recorded by Abu Dawud in the Book of Manners); BASIRA is reviewing the exact number.',
    arabicText: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    transliteration: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilaykan-nushur.',
    englishText: 'O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection.',
    explanation: 'For evening: "wa ilaykal-maseer" (to You is the destination). A complete handing-over of the day\'s life and death to Allah.',
    topics: 'dua, morning, evening', keywords: 'morning, evening, live, die, resurrection', ...PND,
  },
  {
    slug: 'dua-morning-protection', title: 'Refuge in the perfect words of Allah',
    category: 'morning,evening,fear',
    collection: 'Sahih Muslim', book: 'Book of Remembrance of Allah (Dhikr)', hadithNumber: 2708, targetCount: 3,
    arabicText: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: 'A\'udhu bikalimatillahit-tammati min sharri ma khalaq.',
    englishText: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    explanation: 'Said three times in the evening — no harm (the hadith mentions even the sting of venomous creatures) comes that night. The same words are prescribed when feeling fear and upon settling in a new place.',
    topics: 'dua, protection, evening, fear', keywords: 'refuge, perfect words, harm, protect', ...V,
  },
  {
    slug: 'dua-morning-sayyid-istighfar', title: 'Sayyid al-Istighfar (the master of seeking forgiveness)',
    category: 'morning,evening,forgiveness',
    collection: 'Sahih al-Bukhari', book: 'Book of Invocations (Kitab ad-Da\'awat)', hadithNumber: 6306,
    arabicText: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
    transliteration: 'Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana \'abduka, wa ana \'ala \'ahdika wa wa\'dika ma-stata\'tu, a\'udhu bika min sharri ma sana\'tu, abu\'u laka bini\'matika \'alayya wa abu\'u bidhanbi, faghfir li fa-innahu la yaghfirudh-dhunuba illa anta.',
    englishText: 'O Allah, You are my Lord; there is no god but You. You created me and I am Your servant; I keep Your covenant and promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me and I acknowledge my sin — so forgive me, for none forgives sins except You.',
    explanation: 'The Prophet ﷺ called it "the master of all istighfar" and said whoever says it with certainty in the morning and dies before evening is of the people of Paradise — and likewise for the evening (full hadith in the Hadith section).',
    topics: 'dua, forgiveness, istighfar, morning, evening', keywords: 'sayyid, istighfar, forgiveness, master', ...V,
  },

  // ————— AFTER WAKING —————
  {
    slug: 'dua-waking', title: 'Upon waking: All praise to Allah who gave us life',
    category: 'after-waking,morning',
    collection: 'Sahih al-Bukhari', book: 'Book of Invocations (Kitab ad-Da\'awat)', hadithNumber: 6312,
    arabicText: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: 'Alhamdu lillahil-ladhi ahyana ba\'da ma amatana wa ilayhin-nushur.',
    englishText: 'All praise belongs to Allah, who gave us life after causing us to die, and to Him is the resurrection.',
    explanation: 'The first words of the Muslim morning. Sleep is a "minor death"; waking is a daily resurrection to be received with gratitude.',
    topics: 'dua, waking, morning, gratitude', keywords: 'wake up, waking, praise, life, resurrection', ...V,
  },

  // ————— BEFORE SLEEPING —————
  {
    slug: 'dua-sleeping', title: 'Before sleeping: In Your name we die and live',
    category: 'before-sleeping',
    collection: 'Sahih al-Bukhari', book: 'Book of Invocations (Kitab ad-Da\'awat)', hadithNumber: 6324,
    arabicText: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya.',
    englishText: 'In Your name, O Allah, I die and I live.',
    explanation: 'The short bedtime dua of the Prophet ﷺ — said at sleep, paired with the waking dua of the morning. The fuller Prophetic bedtime ritual (wudu, right side, and the long dua) is in the Hadith section (Bukhari 247).',
    topics: 'dua, sleep, night, dhikr', keywords: 'sleep, bed, die, live, night', ...V,
  },
  {
    slug: 'dua-sleeping-ayat-kursi', title: 'Before sleeping: Ayat al-Kursi',
    category: 'before-sleeping',
    collection: 'Sahih al-Bukhari', book: 'Book of the Virtues of the Qur\'an', hadithNumber: 2311,
    arabicText: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ… (آية الكرسي، البقرة ٢٥٥)',
    transliteration: 'Ayat al-Kursi — Qur\'an 2:255 (recite the full ayah).',
    englishText: 'Recite Ayat al-Kursi (Qur\'an 2:255) before sleeping: "Allah — there is no god but Him, the Ever-Living, the Sustainer of existence…" (full text in the Qur\'an section).',
    explanation: 'The Prophet ﷺ said: whoever recites it at bedtime will have a guardian from Allah and no shaytan will approach until morning (Bukhari 2311).',
    topics: 'dua, sleep, protection, quran', keywords: 'ayat kursi, sleep, protection, night, shaytan', ...V,
  },
  {
    slug: 'dua-sleeping-three-quls', title: 'Before sleeping: the three surahs into cupped hands',
    category: 'before-sleeping,illness',
    collection: 'Sahih al-Bukhari', book: 'Book of the Virtues of the Qur\'an', hadithNumber: 5017, targetCount: 3,
    arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ… / قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ… / قُلْ أَعُوذُ بِرَبِّ النَّاسِ…',
    transliteration: 'Recite Surah al-Ikhlas (112), al-Falaq (113) and an-Nas (114) into cupped palms, blow gently, and wipe over the body.',
    englishText: 'Join your cupped palms, blow into them, recite Surah al-Ikhlas, al-Falaq and an-Nas, then wipe over as much of your body as you can — beginning with the head, face, and front. Repeat three times.',
    explanation: 'The nightly routine of the Prophet ﷺ (Bukhari 5017). The same three surahs blown and wiped were used by the companions for healing the sick.',
    topics: 'dua, sleep, protection, healing', keywords: 'three quls, sleep, blow, palms, protection', ...V,
  },

  // ————— EATING —————
  {
    slug: 'dua-before-eating', title: 'Before eating: Bismillah',
    category: 'before-eating',
    collection: 'Sahih al-Bukhari', book: 'Book of Food (Kitab al-At\'imah)', hadithNumber: 5376,
    arabicText: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah.',
    englishText: 'Bismillah — In the name of Allah. (And eat with the right hand, from what is near you.)',
    explanation: 'The Prophetic table etiquette taught to a young boy: mention Allah\'s name, eat with the right hand, and eat from what is in front of you. If you forget at the start: "Bismillahi awwalahu wa akhirahu."',
    topics: 'dua, eating, food', keywords: 'eat, food, bismillah, meal, before eating', ...V,
  },
  {
    slug: 'dua-after-eating', title: 'After eating: praise with awareness',
    category: 'after-eating',
    collection: "Jami' at-Tirmidhi", book: 'Book of Supplications', hadithNumber: 3458, grade: 'Hasan Sahih (sound)',
    arabicText: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ',
    transliteration: 'Alhamdu lillahil-ladhi at\'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah.',
    englishText: 'All praise belongs to Allah who fed me this and provided it for me without any effort or power on my part.',
    explanation: 'Whoever says this after a meal has his previous sins forgiven (Tirmidhi 3458). A shorter form: "Alhamdu lillahil-ladhi at\'amana wa saqana wa ja\'alana muslimin" (Sahih Muslim 2734).',
    topics: 'dua, eating, food, gratitude', keywords: 'after eating, praise, food, meal, gratitude', ...V,
  },

  // ————— HOME —————
  {
    slug: 'dua-entering-home', title: 'Entering the home: name Allah and greet',
    category: 'entering-home',
    collection: 'Sahih Muslim', book: 'Book of Drinks (Kitab al-Ashriba)', hadithNumber: 2018,
    arabicText: 'بِسْمِ اللَّهِ (وَتُسَلِّمُ عَلَى أَهْلِكَ)',
    transliteration: 'Bismillah — then greet your family: Assalamu \'alaykum.',
    englishText: 'Mention the name of Allah when entering, and greet your family with salam: "Assalamu \'alaykum wa rahmatullah."',
    explanation: 'When a man enters mentioning Allah and eats mentioning Allah, shaytan says: "no lodging and no supper tonight" (Muslim 2018). The Qur\'an commands: "When you enter houses, greet one another with a greeting from Allah" (24:61). A separate reported dua ("Bismillahi walajna…") is graded weak by several scholars — BASIRA notes this in the Hadith section.',
    topics: 'dua, entering home, family, protection', keywords: 'enter, house, home, salam, greeting, family', ...V,
  },
  {
    slug: 'dua-leaving-home', title: 'Leaving the home: trust in Allah',
    category: 'leaving-home',
    collection: 'Sunan Abi Dawud', book: 'Book of Manners (Kitab al-Adab)', hadithNumber: 5095, grade: 'Hasan Sahih (sound)',
    arabicText: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ',
    transliteration: 'Bismillah, tawakkaltu \'alallah, wa la hawla wa la quwwata illa billah.',
    englishText: 'In the name of Allah; I place my trust in Allah; and there is no power and no might except by Allah.',
    explanation: 'Whoever says this when leaving home is told: "You are guided, you are sufficed, you are protected" — and shaytan steps away (Abu Dawud 5095).',
    topics: 'dua, leaving home, protection, trust', keywords: 'leave, house, home, trust, protection, tawakkul', ...V,
  },

  // ————— TRAVEL —————
  {
    slug: 'dua-travel', title: 'Travel: Glory to Him who subjected this to us',
    category: 'travel',
    collection: 'Sahih Muslim', book: 'Book of Hajj', hadithNumber: 1342,
    arabicText: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration: 'Subhana alladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun.',
    englishText: 'Glory to Him who subjected this to us, and we could never have accomplished it by ourselves; indeed to our Lord we are returning.',
    explanation: 'Said when boarding any vehicle — car, plane, ship (the words mirror Qur\'an 43:13-14). Begin with Allahu Akbar three times, then this dhikr, then ask Allah for righteousness and a safe return (Muslim 1342).',
    topics: 'dua, travel, journey', keywords: 'travel, trip, car, plane, flight, journey, vehicle', ...V,
  },

  // ————— FEAR & DIFFICULTY —————
  {
    slug: 'dua-distress', title: 'The dua of distress',
    category: 'fear,difficulty',
    collection: 'Sahih al-Bukhari', book: 'Book of Invocations (Kitab ad-Da\'awat)', hadithNumber: 6346,
    arabicText: 'لاَ إِلَهَ إِلاَّ اللَّهُ الْعَظِيمُ الْحَلِيمُ، لاَ إِلَهَ إِلاَّ اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لاَ إِلَهَ إِلاَّ اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
    transliteration: 'La ilaha illallahul-\'Adhimul-Halim, la ilaha illallahu Rabbul-\'Arshil-\'Adhim, la ilaha illallahu Rabbus-samawati wa Rabbul-ard wa Rabbul-\'Arshil-Karim.',
    englishText: 'There is no god but Allah, the Great, the Forbearing; there is no god but Allah, Lord of the Magnificent Throne; there is no god but Allah, Lord of the heavens and the earth, and Lord of the Noble Throne.',
    explanation: 'The Prophet\'s ﷺ formula at times of distress — pure tawhid addressed to the Lord of the throne above all thrones.',
    topics: 'dua, distress, fear, difficulty, anxiety', keywords: 'distress, anxiety, fear, panic, difficulty', ...V,
  },
  {
    slug: 'dua-yunus', title: 'The dua of Yunus — for every hardship',
    category: 'difficulty,forgiveness',
    collection: 'Qur\'an — Surah al-Anbiya (21:87)', sourceType: 'QURAN',
    surahNumber: 21, surahNameEn: 'Al-Anbiya', surahNameAr: 'الأنبياء', surahNameTranslit: 'Al-Anbiya', ayahNumber: 87,
    arabicText: 'لاَ إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    transliteration: 'La ilaha illa anta subhanaka inni kuntu minaz-zalimin.',
    englishText: 'There is no god but You; glory be to You; I was indeed among the wrongdoers.',
    explanation: 'The dua of Yunus (peace be upon him) in the belly of the whale. The Prophet ﷺ said no Muslim calls upon Allah with it except that Allah answers (recorded by at-Tirmidhi, Book of Supplications — BASIRA notes the number is pending). Its three parts: tawhid, tasbih, and owning one\'s wrong.',
    topics: 'dua, difficulty, distress, forgiveness', keywords: 'yunus, jonah, whale, hardship, distress, zalimin', ...V,
  },
  {
    slug: 'dua-istikhara', title: 'Salat al-Istikhara — when deciding',
    category: 'difficulty',
    collection: 'Sahih al-Bukhari', book: 'Book of Istikhara', hadithNumber: 1166,
    arabicText: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ…',
    transliteration: 'Allahumma inni astakhiruka bi\'ilmika, wa astaqdiruka biqudratika, wa as\'aluka min fadlikal-\'Adhim… (full dua in the Hadith section).',
    englishText: 'Pray two rakʿahs, then say: "O Allah, I seek Your guidance by Your knowledge and Your power, and ask You of Your immense bounty — for You are able and I am not; You know and I do not… If You know this matter is good for my religion, my livelihood, and my outcome, decree it and bless it for me; if it is bad, turn it away from me and turn me away from it, and decree good for me wherever it is, then make me content with it."',
    explanation: 'The complete decision-making dua (full text and story in the Hadith section, Bukhari 1166). Name your specific matter when reciting. Istikhara works alongside research and consultation — not instead of them.',
    topics: 'dua, decision, guidance, difficulty', keywords: 'istikhara, decision, choice, guidance, marriage, job', ...V,
  },

  // ————— FORGIVENESS —————
  {
    slug: 'dua-astaghfirullah', title: 'The daily istighfar of the Prophet ﷺ',
    category: 'forgiveness',
    collection: 'Sahih al-Bukhari', book: 'Book of Invocations (Kitab ad-Da\'awat)', hadithNumber: 6307,
    arabicText: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullaha wa atubu ilayh.',
    englishText: 'I seek Allah\'s forgiveness and turn to Him in repentance.',
    explanation: 'The Prophet ﷺ said he said this more than seventy times a day (Bukhari 6307); in other narrations, one hundred times. The simplest continuous tawbah practice.',
    topics: 'dua, forgiveness, istighfar, repentance', keywords: 'istighfar, astaghfirullah, forgive, repent, tawbah', ...V,
  },
  {
    slug: 'dua-qadr-forgiveness', title: 'Qur\'anic dua of forgiveness for all sins',
    category: 'forgiveness',
    collection: 'Qur\'an — Surah az-Zumar (39:53)', sourceType: 'QURAN',
    surahNumber: 39, surahNameEn: 'Az-Zumar', surahNameAr: 'الزمر', surahNameTranslit: 'Az-Zumar', ayahNumber: 53,
    arabicText: 'رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    englishText: '(From 3:147) "Our Lord, forgive us our sins and our excess in our affair, make our feet firm, and grant us victory over the disbelieving people." And from 39:53: no matter how great the sins, "do not despair of Allah\'s mercy; surely Allah forgives all sins."',
    explanation: 'When seeking forgiveness, the Qur\'an itself supplies the words: the believers\' collective dua (3:147) and the promise attached to turning back (39:53). See the Qur\'an section for the full verses.',
    topics: 'dua, forgiveness', keywords: 'forgive, sins, despair, mercy', ...V,
  },

  // ————— PARENTS —————
  {
    slug: 'dua-parents', title: 'The Qur\'anic dua for parents',
    category: 'parents,forgiveness',
    collection: 'Qur\'an — Surah al-Isra (17:24)', sourceType: 'QURAN',
    surahNumber: 17, surahNameEn: 'Al-Isra', surahNameAr: 'الإسراء', surahNameTranslit: 'Al-Isra', ayahNumber: 24,
    arabicText: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbir-hamhuma kama rabbayani saghira.',
    englishText: 'My Lord, have mercy upon them as they raised me when I was small.',
    explanation: 'The exact dua the Qur\'an commands the believer to say for their parents (17:24) — for the living and the deceased. Pair with Nuh\'s wider dua (71:28) and serve them in person while you can.',
    topics: 'dua, parents, mercy', keywords: 'parents, mother, father, mercy, dua for parents', ...V,
  },

  // ————— STUDY —————
  {
    slug: 'dua-study-zidni', title: 'My Lord, increase me in knowledge',
    category: 'study',
    collection: 'Qur\'an — Surah Ta-Ha (20:114)', sourceType: 'QURAN',
    surahNumber: 20, surahNameEn: 'Ta-Ha', surahNameAr: 'طه', surahNameTranslit: 'Taha', ayahNumber: 114,
    arabicText: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: 'Rabbi zidni \'ilma.',
    englishText: 'My Lord, increase me in knowledge.',
    explanation: 'A direct Qur\'anic command — the Prophet ﷺ was told to ask for exactly one increase: knowledge. The essential student\'s dua.',
    topics: 'dua, study, knowledge, learning', keywords: 'study, student, exam, knowledge, learn, increase', ...V,
  },
  {
    slug: 'dua-study-expand-chest', title: 'Expand my chest, ease my task',
    category: 'study,difficulty',
    collection: 'Qur\'an — Surah Ta-Ha (20:25-27)', sourceType: 'QURAN',
    surahNumber: 20, surahNameEn: 'Ta-Ha', surahNameAr: 'طه', surahNameTranslit: 'Taha', ayahNumber: 25, ayahEnd: 27,
    arabicText: 'رَبِّ اشْرَحْ لِي صَدْرِي / وَيَسِّرْ لِي أَمْرِي / وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي',
    transliteration: 'Rabbish-rahli sadri, wa yassirli amri, wahlul \'uqdatam-mil-lisani.',
    englishText: 'My Lord, expand my chest for me, ease my task for me, and untie the knot from my tongue.',
    explanation: 'Musa\'s (peace be upon him) dua when given his mission. Recited before exams, presentations, and any heavy responsibility — asking for capacity, ease, and clarity.',
    topics: 'dua, study, difficulty, clarity', keywords: 'exam, presentation, speech, ease, task, chest, musa', ...V,
  },
  {
    slug: 'dua-study-effort', title: 'A general dua before study or exams',
    category: 'study',
    arabicText: 'اللَّهُمَّ لاَ سَهْلَ إِلاَّ مَا جَعَلْتَهُ سَهْلاً',
    transliteration: 'Allahumma la sahla illa ma ja\'altahu sahla.',
    englishText: 'O Allah, nothing is easy except what You have made easy.',
    explanation: 'BASIRA labels this honestly: this phrase is reported in some collections (Ibn Hibban and others) but is not from the firmly established Sahih collections, and scholars have discussed its grading. It is a general permissible dua — beneficial to say, not to be attributed as a firmly established Sunnah dua. For firmly sourced study duas, use "Rabbi zidni ilma" (Qur\'an 20:114) above.',
    topics: 'dua, study, exam', keywords: 'exam, study, easy, difficult, student', ...GN,
  },

  // ————— ILLNESS —————
  {
    slug: 'dua-illness-rabbanas', title: 'O Allah, Lord of mankind, remove the harm',
    category: 'illness',
    collection: 'Sahih Muslim', book: 'Book of Greetings (Salam)', hadithNumber: 2202,
    arabicText: 'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَاسَ، اشْفِ وَأَنْتَ الشَّافِي، لاَ شِفَاءَ إِلاَّ شِفَاؤُكَ، شِفَاءً لاَ يُغَادِرُ سَقَمًا',
    transliteration: 'Allahumma Rabbanas, adhhibil-ba\'s, washfi antash-Shafi, la shifa\'a illa shifa\'uk, shifa\'an la yughadiru saqama.',
    englishText: 'O Allah, Lord of mankind, remove the harm. Heal — for You are the Healer; there is no healing like Your healing — a healing that leaves no trace of illness.',
    explanation: 'The Prophet\'s ﷺ dua when visiting the sick. For the visitor\'s sevenfold dua: "As\'alullahal-\'Adhim Rabbal-\'Arshil-\'Adhim an yashfiyak" (Tirmidhi 2083). Seeking medical treatment remains a Sunnah alongside dua.',
    topics: 'dua, illness, sickness, healing', keywords: 'sick, illness, patient, cure, heal, disease, pain', ...V,
  },
  {
    slug: 'dua-illness-visitor', title: 'For the person you are visiting',
    category: 'illness',
    collection: "Jami' at-Tirmidhi", book: 'Book of Visiting the Sick', hadithNumber: 2083, grade: 'Hasan (sound)', targetCount: 7,
    arabicText: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ',
    transliteration: 'As\'alullahal-\'Adhim Rabbal-\'Arshil-\'Adhim an yashfiyak.',
    englishText: 'I ask Allah the Great, Lord of the Magnificent Throne, to cure you.',
    explanation: 'Said seven times beside the sick person (whose appointed time has not come) — with the reward and outcome resting with Allah\'s wisdom. Also say to the patient: "La ba\'sa, tahurun in sha Allah" (no harm; may it be a purification, Allah willing) — reported in Sahih al-Bukhari, Book of Patients.',
    topics: 'dua, illness, visiting sick', keywords: 'visit, patient, seven, throne, cure, hospital', ...V,
  },

  // ————— RAIN —————
  {
    slug: 'dua-rain', title: 'When rain falls',
    category: 'rain',
    collection: 'Sahih al-Bukhari', book: 'Book of Rain Prayers (Kitab al-Istisqa)', hadithNumber: 1032,
    arabicText: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
    transliteration: 'Allahumma sayyiban naafi\'an.',
    englishText: 'O Allah, make it a beneficial, abundant rain.',
    explanation: 'Said when rain begins. After the rain, one says: "Mutirna bi-fadlillahi wa rahmatih" — we have been given rain by Allah\'s bounty and mercy. During strong winds, the Prophet ﷺ would say: "O Allah, I ask You for its good and the good of what is in it… and I seek refuge in You from its evil."',
    topics: 'dua, rain, weather', keywords: 'rain, raining, storm, weather, beneficial', ...V,
  },

  // ————— MASJID —————
  {
    slug: 'dua-masjid-enter', title: 'Entering and leaving the mosque',
    category: 'masjid',
    collection: 'Sahih Muslim', book: 'Book of Prayer', hadithNumber: 713,
    arabicText: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ / اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Entering: Allahumma iftah li abwaba rahmatik. Leaving: Allahumma inni as\'aluka min fadlik.',
    englishText: 'Entering: "O Allah, open for me the doors of Your mercy." Leaving: "O Allah, I ask You of Your bounty."',
    explanation: 'Begin with salawat upon the Prophet ﷺ when entering (per the narration). The thresholds of the masjid are the exchange points of mercy and provision.',
    topics: 'dua, masjid, mosque', keywords: 'mosque, masjid, enter, leave, mercy, bounty', ...V,
  },

  // ————— SALAH —————
  {
    slug: 'dua-after-salah', title: 'Immediately after the taslim',
    category: 'salah',
    collection: 'Sahih Muslim', book: 'Book of Prayer', hadithNumber: 591,
    arabicText: 'أَسْتَغْفِرُ اللَّهَ (ثَلاَثًا)، اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ',
    transliteration: 'Astaghfirullah (x3). Allahumma antas-Salamu wa minkas-salamu, tabarakta ya Dhal-Jalali wal-Ikram.',
    englishText: 'Seek Allah\'s forgiveness three times, then say: "O Allah, You are Peace and from You comes peace; blessed are You, O Owner of Majesty and Honor."',
    explanation: 'Then the dhikr of 33-33-33-1 (Muslim 597) and, per a debated report, Ayat al-Kursi (see the Dhikr section for all of them with their sources).',
    topics: 'dua, salah, prayer, dhikr', keywords: 'after prayer, after salah, taslim, peace', ...V,
  },
  {
    slug: 'dua-tashahhud-salawat', title: 'The salawat (Ibrahimiyya) in tashahhud',
    category: 'salah',
    collection: 'Sahih al-Bukhari', book: 'Book of Invocations (Kitab ad-Da\'awat)', hadithNumber: null,
    referenceNote: 'The salawat al-Ibrahimiyya is recorded in Sahih al-Bukhari (commonly cited in the Book of Asking Permission and the Book of Invocations) and Sahih Muslim; BASIRA is reviewing the exact number for this rendering.',
    arabicText: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، وَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
    transliteration: 'Allahumma salli \'ala Muhammadin wa \'ala ali Muhammad, kama sallayta \'ala Ibrahima wa \'ala ali Ibrahim, innaka Hamidun Majid. Wa barik \'ala Muhammadin wa \'ala ali Muhammad, kama barakta \'ala Ibrahima wa \'ala ali Ibrahim, innaka Hamidun Majid.',
    englishText: 'O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious. And send grace upon Muhammad and the family of Muhammad, as You sent grace upon Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious.',
    explanation: 'The salawat recited in the final tashahhud of the prayer — the dua the companions taught exactly as taught, word for word, as the hadiths describe. Sending one salawat upon the Prophet ﷺ earns ten in return (Muslim 408).',
    topics: 'dua, salah, prayer, salawat', keywords: 'tashahhud, salawat, ibrahimiyya, durood, blessings upon prophet', ...PND,
  },

  // ————— RAMADAN —————
  {
    slug: 'dua-iftar', title: 'Breaking the fast',
    category: 'ramadan',
    collection: 'Sunan Abi Dawud', book: 'Book of Fasting', hadithNumber: 2357, grade: 'Hasan (sound)',
    arabicText: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration: 'Dhahaba az-zama\'u wabtallatil-\'uruqu wa thabatal-ajru in sha Allah.',
    englishText: 'The thirst is gone, the veins are moistened, and the reward is confirmed — if Allah wills.',
    explanation: 'Said at iftar. The Prophet ﷺ also taught that the fasting person\'s dua at the moment of breaking is not rejected (recorded by Ibn Majah and others — graded good by some scholars).',
    topics: 'dua, ramadan, fasting, iftar', keywords: 'iftar, break fast, breaking, ramadan, thirst', ...V,
  },
  {
    slug: 'dua-laylat-qadr', title: 'The dua of Laylat al-Qadr',
    category: 'ramadan',
    collection: "Jami' at-Tirmidhi", book: 'Book of Supplications', hadithNumber: 3513, grade: 'Hasan Sahih (sound)',
    arabicText: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliteration: 'Allahumma innaka \'Afuwwun tuhibbul-\'afwa fa\'fu \'anni.',
    englishText: 'O Allah, You are the Most Pardoning, and You love to pardon — so pardon me.',
    explanation: 'Aisha asked what she should say if she found Laylat al-Qadr; this was the Prophet\'s ﷺ answer. Perfect for the odd nights of the last ten of Ramadan.',
    topics: 'dua, ramadan, laylat qadr, forgiveness', keywords: 'laylatul qadr, night of power, ramadan, pardon, aisha', ...V,
  },

  // ————— GENERAL REMEMBRANCE —————
  {
    slug: 'dua-general-tasbih', title: 'The two words heavy on the scales',
    category: 'general',
    collection: 'Sahih al-Bukhari', hadithNumber: 6682,
    arabicText: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    transliteration: 'SubhanAllahi wa bihamdih, SubhanAllahil-\'Adhim.',
    englishText: 'Glory and praise be to Allah; glory be to Allah the Most Great.',
    explanation: 'Light on the tongue, heavy on the scales, beloved to the Most Merciful (Bukhari 6682). And "SubhanAllahi wa bihamdihi" one hundred times daily wipes sins like the foam of the sea (Bukhari 6405).',
    topics: 'dua, dhikr, general, tasbih', keywords: 'subhanallah, tasbih, glory, praise, general', targetCount: 100, ...V,
  },
  {
    slug: 'dua-general-salawat', title: 'Sending blessings upon the Prophet ﷺ',
    category: 'general',
    collection: 'Sahih Muslim', book: 'Book of Prayer', hadithNumber: 408,
    arabicText: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ / اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    transliteration: 'Salla Allahu \'alayhi wa sallam / Allahumma salli \'ala Muhammad.',
    englishText: 'Salla Allahu \'alayhi wa sallam — may Allah\'s peace and blessings be upon him. Or: "O Allah, send blessings upon Muhammad."',
    explanation: 'Whoever sends one blessing upon the Prophet ﷺ, Allah sends ten upon him (Muslim 408). Say it whenever the Prophet\'s ﷺ name is mentioned — including while reading this.',
    topics: 'dua, salawat, general, dhikr', keywords: 'salawat, durood, blessings, prophet, muhammad', ...V,
  },
  {
    slug: 'dua-general-morning100', title: 'One hundred glorifications for the day',
    category: 'morning,evening,general',
    collection: 'Sahih al-Bukhari', book: 'Book of Invocations (Kitab ad-Da\'awat)', hadithNumber: 6405, targetCount: 100,
    arabicText: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bihamdih.',
    englishText: 'Glory be to Allah and praise be to Him.',
    explanation: 'One hundred times in a day erases sins even if like the foam of the sea (Bukhari 6405). Two minutes of your morning — an ocean of purification.',
    topics: 'dua, dhikr, morning, evening, forgiveness', keywords: 'hundred, subhanallah, morning, tasbih, foam', ...V,
  },
  {
    slug: 'dua-sneezing-exchange', title: 'When someone sneezes — the three parts',
    category: 'general',
    collection: 'Sahih al-Bukhari', book: 'Book of Adhan (Kitab al-Adhan), chapter on sneezing', hadithNumber: 6224,
    arabicText: 'الْحَمْدُ لِلَّهِ — يَرْحَمُكَ اللَّهُ — يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ',
    transliteration: 'Alhamdulillah — Yarhamukallah — Yahdikumullahu wa yuslihu balakum.',
    englishText: 'The one who sneezes says: "Alhamdulillah" (all praise is for Allah). The one who hears him responds: "Yarhamukallah" (may Allah have mercy on you). The sneezer then replies: "Yahdikumullahu wa yuslihu balakum" (may Allah guide you and set your affairs right).',
    explanation: 'The complete three-part exchange from the Sunnah. Each part is a small act of worship and connection between Muslims — even the everyday sneeze becomes a moment of remembrance.',
    topics: 'dua, sneezing, manners, general', keywords: 'sneeze, alhamdulillah, yarhamukallah, response, etiquette', ...V,
  },
  {
    slug: 'dua-rain-harmful', title: 'When rain becomes harmful',
    category: 'rain',
    collection: 'Sahih al-Bukhari', book: 'Book of Rain (Kitab al-Istisqa)', hadithNumber: null,
    referenceNote: 'In the narration of Anas in the Book of Rain of Sahih al-Bukhari; BASIRA is confirming the exact number in the English edition, so no single number is shown.',
    arabicText: 'اللَّهُمَّ حَوَالَيْنَا وَلاَ عَلَيْنَا',
    transliteration: 'Allahumma hawalayna wa la \'alayna.',
    englishText: 'O Allah, let it rain around us and not upon us.',
    explanation: 'When rain becomes excessive or harmful, the Prophet ﷺ prayed for it to fall around the people rather than on them — on the hills, the heights, the valleys, and the places where trees grow. A practical prophetic example of asking Allah even about the weather, with mercy for the community.',
    topics: 'dua, rain, storm, harm, weather', keywords: 'rain, storm, flood, harmful, weather, around', ...PND,
  },
];
