import type { SeedRecord } from './shared';
import { BASIRA_TRANSLATION } from './shared';

// ============================================================================
// QURAN — curated verified ayah records. Arabic follows the Uthmani script;
// translations are BASIRA's own simple English renderings (public domain).
// Every record carries an exact Surah:Ayah reference. Excerpts of long ayahs
// are marked excerptOnly and use ellipsis (…) — never presented as the full ayah.
// ============================================================================

const T = BASIRA_TRANSLATION;
const F = { translationSource: T, sourceType: 'QURAN', verificationStatus: 'VERIFIED', reviewer: 'BASIRA Editorial Review', lastReviewedAt: '2025-01-15' } as const;

export const QURAN_SEED: SeedRecord[] = [
  // ————— Al-Fatihah (1) —————
  {
    slug: 'quran-1-1', title: 'Al-Fatihah 1:1 — The Opening',
    surahNumber: 1, surahNameEn: 'Al-Fatihah', surahNameAr: 'الفاتحة', surahNameTranslit: 'Al-Fatihah', ayahNumber: 1,
    arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    englishText: 'In the name of Allah, the Most Compassionate, the Most Merciful.',
    explanation: 'Muslims begin recitation, deeds, and daily actions with Allah\'s name, remembering that He is endlessly merciful. Ar-Rahman and Ar-Rahim both come from the root of mercy (rahmah).',
    topics: 'mercy, opening, bismillah, names of allah', keywords: 'beginning, start, bismillah', ...F,
  },
  {
    slug: 'quran-1-2', title: 'Al-Fatihah 1:2 — All praise belongs to Allah',
    surahNumber: 1, surahNameEn: 'Al-Fatihah', surahNameAr: 'الفاتحة', surahNameTranslit: 'Al-Fatihah', ayahNumber: 2,
    arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    englishText: 'All praise belongs to Allah, Lord of all worlds.',
    explanation: 'Hamd (praise) combines gratitude and admiration. Rabb means Lord, Sustainer, and Caretaker of everything that exists.',
    topics: 'praise, gratitude, lordship', keywords: 'alhamdulillah, thanks', ...F,
  },
  {
    slug: 'quran-1-3', title: 'Al-Fatihah 1:3 — The Most Compassionate, the Most Merciful',
    surahNumber: 1, surahNameEn: 'Al-Fatihah', surahNameAr: 'الفاتحة', surahNameTranslit: 'Al-Fatihah', ayahNumber: 3,
    arabicText: 'الرَّحْمَٰنِ الرَّحِيمِ',
    englishText: 'The Most Compassionate, the Most Merciful.',
    explanation: 'The verse repeats two names of mercy to emphasize that Allah\'s relationship with creation is founded on mercy before anything else.',
    topics: 'mercy, names of allah', keywords: 'rahman, rahim', ...F,
  },
  {
    slug: 'quran-1-4', title: 'Al-Fatihah 1:4 — Master of the Day of Judgment',
    surahNumber: 1, surahNameEn: 'Al-Fatihah', surahNameAr: 'الفاتحة', surahNameTranslit: 'Al-Fatihah', ayahNumber: 4,
    arabicText: 'مَالِكِ يَوْمِ الدِّينِ',
    englishText: 'Master of the Day of Judgment.',
    explanation: 'Ad-Din here means recompense. On that Day, ownership and kingship belong to Allah alone — a reminder that we are all accountable.',
    topics: 'judgment day, hereafter, accountability', keywords: 'yawm ad-din, accountability', ...F,
  },
  {
    slug: 'quran-1-5', title: 'Al-Fatihah 1:5 — You alone we worship',
    surahNumber: 1, surahNameEn: 'Al-Fatihah', surahNameAr: 'الفاتحة', surahNameTranslit: 'Al-Fatihah', ayahNumber: 5,
    arabicText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    englishText: 'You alone we worship, and You alone we ask for help.',
    explanation: 'The essence of tawhid: worship and reliance belong to Allah alone. Classical scholars noted that worship is mentioned before seeking help, because worship is the goal.',
    topics: 'tawhid, worship, reliance, purpose', keywords: 'oneness, monotheism', ...F,
  },
  {
    slug: 'quran-1-6', title: 'Al-Fatihah 1:6 — Guide us along the straight path',
    surahNumber: 1, surahNameEn: 'Al-Fatihah', surahNameAr: 'الفاتحة', surahNameTranslit: 'Al-Fatihah', ayahNumber: 6,
    arabicText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    englishText: 'Guide us along the straight path.',
    explanation: 'The believer asks for guidance every day — both to stay on Islam and to grow in it. Hidayah includes being shown the way and being kept firm upon it.',
    topics: 'guidance, dua, prayer', keywords: 'guide, hidayah, sirat', ...F,
  },
  {
    slug: 'quran-1-7', title: 'Al-Fatihah 1:7 — The path of those You blessed',
    surahNumber: 1, surahNameEn: 'Al-Fatihah', surahNameAr: 'الفاتحة', surahNameTranslit: 'Al-Fatihah', ayahNumber: 7,
    arabicText: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    englishText: 'The path of those You have blessed; not of those who earned anger, nor of those who went astray.',
    explanation: 'The believer asks to follow the way of the prophets, the truthful, the martyrs and the righteous, and to avoid the paths of misguidance.',
    topics: 'guidance, dua', keywords: 'blessed, path', ...F,
  },

  // ————— Al-Baqarah (2) —————
  {
    slug: 'quran-2-21', title: 'Al-Baqarah 2:21 — Worship your Lord',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 21,
    arabicText: 'يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ وَالَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
    englishText: 'O mankind, worship your Lord who created you and those before you, so that you may become mindful of Him.',
    explanation: 'The call to worship is addressed to all people. Gratitude and awe for the Creator naturally lead to taqwa — God-consciousness.',
    topics: 'worship, tawhid, taqwa, purpose', keywords: 'created, worship', ...F,
  },
  {
    slug: 'quran-2-45', title: 'Al-Baqarah 2:45 — Seek help through patience and prayer',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 45,
    arabicText: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ',
    englishText: 'Seek help through patience and prayer; it is truly heavy except for the humble.',
    explanation: 'In difficulty, the Qur\'an prescribes sabr (patient perseverance) and salah as the believer\'s two greatest supports. Those with khushu (presence of heart) find this light.',
    topics: 'patience, prayer, difficulty, anxiety', keywords: 'sabr, salah, hardship, help', ...F,
  },
  {
    slug: 'quran-2-152', title: 'Al-Baqarah 2:152 — Remember Me; I will remember you',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 152,
    arabicText: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    englishText: 'So remember Me; I will remember you. Be thankful to Me, and do not be ungrateful.',
    explanation: 'Remembrance (dhikr) is a two-way relationship of love. Gratitude multiplies blessing; ingratitude dims it.',
    topics: 'dhikr, gratitude, remembrance', keywords: 'remember, shukr, thankfulness', ...F,
  },
  {
    slug: 'quran-2-153', title: 'Al-Baqarah 2:153 — Allah is with the patient',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 153,
    arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    englishText: 'O you who believe, seek help through patience and prayer. Surely Allah is with the patient.',
    explanation: '"Allah is with the patient" is one of the most comforting promises in the Qur\'an — His help, care and closeness accompany those who endure with dignity.',
    topics: 'patience, prayer, difficulty, anxiety, trial', keywords: 'sabr, endurance, calamity, steadfast', ...F,
  },
  {
    slug: 'quran-2-155', title: 'Al-Baqarah 2:155 — We will certainly test you',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 155,
    arabicText: 'وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ',
    englishText: 'We will most surely test you with something of fear and hunger, and loss of wealth, lives and fruits; but give good news to the patient.',
    explanation: 'Tests are certain, not optional — they measure and purify faith. The good news is directed specifically to those who respond with patience.',
    topics: 'patience, trial, fear, loss, difficulty', keywords: 'test, examination, hardship', ...F,
  },
  {
    slug: 'quran-2-156', title: 'Al-Baqarah 2:156 — We belong to Allah',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 156,
    arabicText: 'الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
    englishText: 'Those who, when calamity strikes them, say: "We belong to Allah, and to Him we return."',
    explanation: 'Inna lillahi wa inna ilayhi rajiʿun (recited at loss and grief) acknowledges that everything belongs to Allah and that every soul returns to Him.',
    topics: 'patience, difficulty, grief, death, trial', keywords: 'calamity, loss, mourning, patience', ...F,
  },
  {
    slug: 'quran-2-157', title: 'Al-Baqarah 2:157 — Blessings and mercy descend upon them',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 157,
    arabicText: 'أُولَٰئِكَ عَلَيْهِمْ صَلَوَاتٌ مِّن رَّبِّهِمْ وَرَحْمَةٌ ۖ وَأُولَٰئِكَ هُمُ الْمُهْتَدُونَ',
    englishText: 'It is they upon whom blessings and mercy from their Lord descend — and it is they who are rightly guided.',
    explanation: 'The reward of the patient is described as salah (blessings/prayers) from Allah Himself upon them, together with mercy and true guidance.',
    topics: 'patience, mercy, guidance', keywords: 'blessing, reward', ...F,
  },
  {
    slug: 'quran-2-183', title: 'Al-Baqarah 2:183 — Fasting is prescribed for you',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 183,
    arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
    englishText: 'O you who believe, fasting is prescribed for you as it was prescribed for those before you, so that you may become mindful of God.',
    explanation: 'Fasting was known to earlier nations too. Its goal is not hunger itself but taqwa — heightened God-consciousness that carries into everyday life.',
    topics: 'fasting, ramadan, taqwa', keywords: 'sawm, fast, siyam', ...F,
  },
  {
    slug: 'quran-2-185', title: 'Al-Baqarah 2:185 — The month of Ramadan',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 185,
    arabicText: 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ',
    englishText: 'The month of Ramadan is the one in which the Qur\'an was sent down as guidance for mankind, with clear proofs of guidance and the criterion.',
    explanation: 'Ramadan honors the revelation of the Qur\'an. That is why extra recitation and study of the Qur\'an mark this month. The ayah continues with the rules of fasting and the command to magnify Allah for His guidance.',
    topics: 'ramadan, quran, fasting, revelation', keywords: 'fasting, month, ramadhan', ...F,
  },
  {
    slug: 'quran-2-186', title: 'Al-Baqarah 2:186 — I am near',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 186,
    arabicText: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    englishText: 'When My servants ask about Me — I am near. I answer the call of the caller when he calls upon Me.',
    explanation: 'Unlike other verses where the Prophet ﷺ is told to answer questions, here Allah answers directly: "I am near." A foundation of hope in dua.',
    category: 'general', topics: 'dua, nearness, hope, anxiety, worship', keywords: 'call, supplication, near, answer', ...F,
  },
  {
    slug: 'quran-2-222', title: 'Al-Baqarah 2:222 — Allah loves those who repent',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 222,
    excerptOnly: true,
    arabicText: '…إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ',
    englishText: '…Surely Allah loves those who constantly turn to Him in repentance and loves those who purify themselves.',
    explanation: 'Excerpt of the ayah (which begins with the ruling of menstruation). The verse ends with one of the most hopeful phrases in the Qur\'an: Allah does not merely accept repentance — He loves the repenters.',
    topics: 'repentance, forgiveness, purity, tawbah', keywords: 'tawbah, turn back, repent', ...F,
  },
  {
    slug: 'quran-2-25', title: 'Al-Baqarah 2:25 — Gardens beneath which rivers flow',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 25,
    excerptOnly: true,
    arabicText: 'وَبَشِّرِ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أَنَّ لَهُمْ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ',
    englishText: 'Give good news to those who believe and do righteous deeds: gardens with rivers flowing beneath them await them…',
    explanation: 'Excerpt of the ayah. Jannah is described with images of gardens, rivers, and everlasting delight — the reward of faith joined with action.',
    topics: 'jannah, paradise, reward, hereafter', keywords: 'gardens, rivers, paradise', ...F,
  },
  {
    slug: 'quran-2-255', title: 'Al-Baqarah 2:255 — Ayat al-Kursi (The Throne Verse)',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 255,
    arabicText: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    englishText: 'Allah — there is no god but Him, the Ever-Living, the Sustainer of existence. Neither slumber overtakes Him nor sleep. To Him belongs whatever is in the heavens and the earth. Who can intercede with Him except by His permission? He knows what lies before them and what lies behind them, and they encompass nothing of His knowledge except what He wills. His Throne extends over the heavens and the earth, and their preservation does not weary Him. He is the Most High, the Most Great.',
    explanation: 'The greatest ayah of the Qur\'an according to authentic hadith (Muslim 810, Abu Huraira and the Shaytan who stole zakat). It describes Allah\'s oneness, life, knowledge, power and care of creation. Many scholars recommend reciting it after prayers and before sleeping.',
    topics: 'tawhid, names of allah, protection, dhikr, power', keywords: 'ayat al-kursi, throne, greatest verse, protection', ...F,
  },
  {
    slug: 'quran-2-286', title: 'Al-Baqarah 2:286 — Allah does not burden a soul beyond what it can bear',
    surahNumber: 2, surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', surahNameTranslit: 'Al-Baqarah', ayahNumber: 286,
    excerptOnly: true,
    arabicText: '…لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    englishText: '…Allah does not burden any soul beyond what it can bear.',
    explanation: 'Excerpt from the final ayah of Al-Baqarah. Whatever Allah has decreed for you, He knows you can carry it. A cornerstone verse for hope in anxiety and hardship.',
    topics: 'patience, difficulty, anxiety, hope, capacity', keywords: 'burden, capacity, ability, ease', ...F,
  },

  // ————— Aal ʿImran (3) —————
  {
    slug: 'quran-3-8', title: 'Aal ʿImran 3:8 — Do not let our hearts deviate',
    surahNumber: 3, surahNameEn: "Ali 'Imran", surahNameAr: 'آل عمران', surahNameTranslit: "Ali 'Imran", ayahNumber: 8,
    arabicText: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ',
    englishText: 'Our Lord, do not let our hearts deviate after You have guided us, and grant us mercy from Yourself. You are the Bestower.',
    explanation: 'A Qur\'anic dua taught by the scholars deeply pondering creation (see the following ayah). Guidance is a gift that must be guarded with humility.',
    category: 'general', topics: 'dua, guidance, heart, steadfastness', keywords: 'heart, deviate, steadfast', ...F,
  },
  {
    slug: 'quran-3-92', title: 'Aal ʿImran 3:92 — You will never attain righteousness until you give what you love',
    surahNumber: 3, surahNameEn: "Ali 'Imran", surahNameAr: 'آل عمران', surahNameTranslit: "Ali 'Imran", ayahNumber: 92,
    arabicText: 'لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ',
    englishText: 'Never will you attain righteousness until you spend from what you love.',
    explanation: 'True piety costs something precious. Spending from what we love — wealth, time, skill — is the proof of sincerity.',
    topics: 'charity, zakat, righteousness', keywords: 'spend, give, birr', ...F,
  },
  {
    slug: 'quran-3-123', title: 'Aal ʿImran 3:123 — Victory at Badr',
    surahNumber: 3, surahNameEn: "Ali 'Imran", surahNameAr: 'آل عمران', surahNameTranslit: "Ali 'Imran", ayahNumber: 123,
    arabicText: 'وَلَقَدْ نَصَرَكُمُ اللَّهُ بِبَدْرٍ وَأَنتُمْ أَذِلَّةٌ ۚ فَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُشْكُرُونَ',
    englishText: 'Allah already gave you victory at Badr while you were weak. So be mindful of Allah, so that you may be grateful.',
    explanation: 'The battle of Badr (2 AH / 624 CE) — the first major battle in Islam — was won by divine help despite the Muslims being few. A seerah landmark.',
    topics: 'seerah, badr, victory, gratitude', keywords: 'battle, badr, help', ...F,
  },
  {
    slug: 'quran-3-134', title: 'Aal ʿImran 3:134 — Those who restrain anger and pardon people',
    surahNumber: 3, surahNameEn: "Ali 'Imran", surahNameAr: 'آل عمران', surahNameTranslit: "Ali 'Imran", ayahNumber: 134,
    arabicText: 'الَّذِينَ يُنفِقُونَ فِي السَّرَّاءِ وَالضَّرَّاءِ وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ ۗ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ',
    englishText: 'Those who spend in ease and hardship, who restrain anger, and who pardon people — Allah loves those who do good.',
    explanation: 'Three marks of the muttaqin (God-conscious): giving in all states, swallowing anger (kazm al-ghayz), and forgiving others. Ihsan is the summit.',
    topics: 'anger, forgiveness, kindness, manners, charity', keywords: 'restrain anger, pardon, forgive', ...F,
  },
  {
    slug: 'quran-3-139', title: 'Aal ʿImran 3:139 — Do not weaken and do not grieve',
    surahNumber: 3, surahNameEn: "Ali 'Imran", surahNameAr: 'آل عمران', surahNameTranslit: "Ali 'Imran", ayahNumber: 139,
    arabicText: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
    englishText: 'Do not weaken and do not grieve — you shall be superior, if you are believers.',
    explanation: 'Revealed in the aftermath of Uhud. Even after wounds and loss, the believers\' honor is with faith, not circumstances.',
    topics: 'hope, anxiety, patience, difficulty', keywords: 'grieve, weakness, sadness, uhud', ...F,
  },
  {
    slug: 'quran-3-159', title: 'Aal ʿImran 3:159 — It was by Allah\'s mercy that you were gentle with them',
    surahNumber: 3, surahNameEn: "Ali 'Imran", surahNameAr: 'آل عمران', surahNameTranslit: "Ali 'Imran", ayahNumber: 159,
    arabicText: 'فَبِمَا رَحْمَةٍ مِّنَ اللَّهِ لِنتَ لَهُمْ ۖ وَلَوْ كُنتَ فَظًّا غَلِيظَ الْقَلْبِ لَانفَضُّوا مِنْ حَوْلِكَ',
    englishText: 'By mercy from Allah you were gentle with them; had you been harsh and hard-hearted they would have dispersed from around you.',
    explanation: 'Praise for the Prophet\'s ﷺ gentleness after the mistake of some companions at Uhud. Leadership, teaching and family life all flourish through softness.',
    topics: 'kindness, gentleness, manners, mercy, leadership', keywords: 'gentle, soft, harsh, leadership', ...F,
  },
  {
    slug: 'quran-3-190', title: 'Aal ʿImran 3:190 — Signs for people of understanding',
    surahNumber: 3, surahNameEn: "Ali 'Imran", surahNameAr: 'آل عمران', surahNameTranslit: "Ali 'Imran", ayahNumber: 190,
    arabicText: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ',
    englishText: 'In the creation of the heavens and the earth and the alternation of the night and day are signs for people of understanding.',
    explanation: 'The Qur\'an repeatedly calls to reflect on the cosmos. Reflection (tafakkur) on creation is itself an act of worship.',
    topics: 'reflection, knowledge, creation, tawhid', keywords: 'heavens, earth, night, day, signs', ...F,
  },
  {
    slug: 'quran-3-191', title: 'Aal ʿImran 3:191 — They remember Allah standing, sitting and lying down',
    surahNumber: 3, surahNameEn: "Ali 'Imran", surahNameAr: 'آل عمران', surahNameTranslit: "Ali 'Imran", ayahNumber: 191,
    arabicText: 'الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ',
    englishText: 'Those who remember Allah while standing, sitting, and lying on their sides, and reflect on the creation of the heavens and the earth: "Our Lord, You did not create this without purpose — glory be to You — so protect us from the punishment of the Fire."',
    explanation: 'The portrait of ulul-albab (people of understanding): dhikr in every posture + tadabbur (deep reflection) on creation + a prayer rising from that reflection.',
    topics: 'dhikr, reflection, remembrance, dua, creation', keywords: 'remember, reflect, think', ...F,
  },

  // ————— An-Nisa (4) —————
  {
    slug: 'quran-4-29', title: 'An-Nisa 4:29 — Do not consume wealth unjustly',
    surahNumber: 4, surahNameEn: 'An-Nisa', surahNameAr: 'النساء', surahNameTranslit: 'An-Nisa', ayahNumber: 29,
    excerptOnly: true,
    arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ…',
    englishText: 'O you who believe, do not consume one another\'s wealth unjustly, but only through trade by mutual consent…',
    explanation: 'Excerpt of the ayah. The foundation of halal commerce: consent, transparency, and no exploitation. Riba (interest), deception, and coercion are excluded.',
    topics: 'business, trade, finance, halal earning', keywords: 'trade, wealth, money, commerce, consent', ...F,
  },
  {
    slug: 'quran-4-36', title: 'An-Nisa 4:36 — Be good to parents',
    surahNumber: 4, surahNameEn: 'An-Nisa', surahNameAr: 'النساء', surahNameTranslit: 'An-Nisa', ayahNumber: 36,
    excerptOnly: true,
    arabicText: 'وَاعْبُدُوا اللَّهَ وَلَا تُشْرِكُوا بِهِ شَيْئًا ۖ وَبِالْوَالِدَيْنِ إِحْسَانًا…',
    englishText: 'Worship Allah and associate nothing with Him, and be good to parents…',
    explanation: 'Excerpt of the ayah. Kindness to parents is placed immediately after the command to worship Allah alone — the highest ranking of any human relationship. The ayah continues with relatives, orphans, the needy, neighbors, companions and travelers.',
    topics: 'parents, tawhid, kindness, manners, family', keywords: 'mother, father, parents, worship', ...F,
  },
  {
    slug: 'quran-4-103', title: 'An-Nisa 4:103 — Prayer at specified times',
    surahNumber: 4, surahNameEn: 'An-Nisa', surahNameAr: 'النساء', surahNameTranslit: 'An-Nisa', ayahNumber: 103,
    excerptOnly: true,
    arabicText: '…إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا',
    englishText: '…Indeed, prayer has been decreed upon the believers at specified times.',
    explanation: 'Excerpt of the ayah (revealed after the battle of the trench concerning fear prayer). The five prayers are tied to the movement of the day — a rhythm of return to Allah.',
    topics: 'prayer, salah, prayer times', keywords: 'salah, fixed times, obligatory', ...F,
  },
  {
    slug: 'quran-4-110', title: 'An-Nisa 4:110 — Whoever does wrong then seeks forgiveness',
    surahNumber: 4, surahNameEn: 'An-Nisa', surahNameAr: 'النساء', surahNameTranslit: 'An-Nisa', ayahNumber: 110,
    arabicText: 'وَمَن يَعْمَلْ سُوءًا أَوْ يَظْلِمْ نَفْسَهُ ثُمَّ يَسْتَغْفِرِ اللَّهَ يَجِدِ اللَّهَ غَفُورًا رَّحِيمًا',
    englishText: 'Whoever does evil or wrongs himself, then seeks Allah\'s forgiveness, will find Allah Forgiving and Merciful.',
    explanation: 'The door of forgiveness never closes for the one who turns back. Istighfar (seeking forgiveness) is the practical first step of tawbah.',
    topics: 'forgiveness, repentance, tawbah, mercy', keywords: 'seek forgiveness, istighfar, sin', ...F,
  },

  // ————— Al-Ma\'idah (5) —————
  {
    slug: 'quran-5-2', title: "Al-Ma'idah 5:2 — Cooperate in righteousness",
    surahNumber: 5, surahNameEn: "Al-Ma'idah", surahNameAr: 'المائدة', surahNameTranslit: "Al-Ma'idah", ayahNumber: 2,
    excerptOnly: true,
    arabicText: '…وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ',
    englishText: '…Cooperate with one another in righteousness and mindfulness of God, and do not cooperate in sin and aggression.',
    explanation: 'Excerpt of the ayah. The social principle of Islam: help each other in good, refuse cooperation in wrongdoing — in business, work, and community life.',
    topics: 'cooperation, manners, community, righteousness', keywords: 'help, cooperate, sin', ...F,
  },
  {
    slug: 'quran-5-6', title: "Al-Ma'idah 5:6 — How to perform wudu",
    surahNumber: 5, surahNameEn: "Al-Ma'idah", surahNameAr: 'المائدة', surahNameTranslit: "Al-Ma'idah", ayahNumber: 6,
    excerptOnly: true,
    arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ فَاغْسِلُوا وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى الْمَرَافِقِ وَامْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ إِلَى الْكَعْبَيْنِ…',
    englishText: 'O you who believe, when you rise to pray, wash your faces and your forearms to the elbows, wipe your heads, and wash your feet to the ankles…',
    explanation: 'Excerpt of the ayah of wudu (which continues with tayammum for when water is unavailable). The Qur\'an itself defines the essential steps of ablution. Allah ends the ayah: "Allah does not intend to place you in difficulty, but to purify you and complete His favor upon you."',
    topics: 'wudu, purity, prayer, salah', keywords: 'ablution, wash, face, arms, head, feet, tayammum', ...F,
  },

  // ————— Al-Anfal (8) —————
  {
    slug: 'quran-8-2', title: 'Al-Anfal 8:2 — Hearts tremble when Allah is mentioned',
    surahNumber: 8, surahNameEn: 'Al-Anfal', surahNameAr: 'الأنفال', surahNameTranslit: 'Al-Anfal', ayahNumber: 2,
    excerptOnly: true,
    arabicText: 'إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ إِذَا ذُكِرَ اللَّهُ وَجِلَتْ قُلُوبُهُمْ…',
    englishText: 'The believers are only those whose hearts tremble with awe when Allah is mentioned…',
    explanation: 'Excerpt of the ayah. True iman shows itself in the heart\'s response to the remembrance of Allah — awe that grows into trust (the ayah continues: "and when His verses are recited to them, they increase them in faith").',
    topics: 'iman, faith, dhikr, khushu', keywords: 'believers, hearts, tremble, awe', ...F,
  },

  // ————— At-Tawbah (9) —————
  {
    slug: 'quran-9-40', title: 'At-Tawbah 9:40 — Second of two in the cave',
    surahNumber: 9, surahNameEn: 'At-Tawbah', surahNameAr: 'التوبة', surahNameTranslit: 'At-Tawbah', ayahNumber: 40,
    excerptOnly: true,
    arabicText: '…إِلَّا تَنصُرُوهُ فَقَدْ نَصَرَهُ اللَّهُ إِذْ أَخْرَجَهُ الَّذِينَ كَفَرُوا ثَانِيَ اثْنَيْنِ إِذْ هُمَا فِي الْغَارِ إِذْ يَقُولُ لِصَاحِبِهِ لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا',
    englishText: '…If you do not support him, Allah already supported him when the disbelievers drove him out — second of two, when they were both in the cave, when he said to his companion: "Do not grieve; indeed Allah is with us."',
    explanation: 'Excerpt of the ayah describing the Hijra: the Prophet ﷺ and Abu Bakr as-Siddiq hiding in the cave of Thawr while pursued by the Quraysh. The Prophet\'s words "Do not grieve; Allah is with us" are a timeless lesson in tawakkul.',
    topics: 'seerah, hijra, trust, tawakkul, patience', keywords: 'cave, thawr, abu bakr, migration', ...F,
  },

  // ————— Ar-Raʿd (13) —————
  {
    slug: 'quran-13-11', title: 'Ar-Raʿd 13:11 — Allah does not change a people until they change themselves',
    surahNumber: 13, surahNameEn: "Ar-Ra'd", surahNameAr: 'الرعد', surahNameTranslit: "Ar-Ra'd", ayahNumber: 11,
    excerptOnly: true,
    arabicText: '…إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ',
    englishText: '…Indeed, Allah does not change the condition of a people until they change what is within themselves.',
    explanation: 'Excerpt of the ayah (about angels and divine decree). Free will and divine decree meet here: renewal begins inside — in intentions, habits and effort.',
    topics: 'change, effort, self-improvement, decree', keywords: 'change, condition, self', ...F,
  },
  {
    slug: 'quran-13-28', title: 'Ar-Raʿd 13:28 — Hearts find rest in the remembrance of Allah',
    surahNumber: 13, surahNameEn: "Ar-Ra'd", surahNameAr: 'الرعد', surahNameTranslit: "Ar-Ra'd", ayahNumber: 28,
    arabicText: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    englishText: 'Those who believe, and whose hearts find rest in the remembrance of Allah. Surely in the remembrance of Allah do hearts find rest.',
    explanation: 'The divine diagnosis for anxiety of the heart: dhikr. Not distraction, not accumulation — remembrance brings the heart back to its Owner.',
    topics: 'dhikr, anxiety, peace, heart, rest', keywords: 'anxious, worry, stress, calm, tranquility, remembrance', ...F,
  },

  // ————— An-Nahl (16) —————
  {
    slug: 'quran-16-90', title: 'An-Nahl 16:90 — Allah commands justice and excellence',
    surahNumber: 16, surahNameEn: 'An-Nahl', surahNameAr: 'النحل', surahNameTranslit: 'An-Nahl', ayahNumber: 90,
    arabicText: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَىٰ وَيَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ وَالْبَغْيِ ۚ يَعِظُكُمْ لَعَلَّكُمْ تَذَكَّرُونَ',
    englishText: 'Allah commands justice, excellence, and giving to relatives; and He forbids indecency, wrong, and aggression. He admonishes you, so that you may take heed.',
    explanation: 'A comprehensive summary of Islamic ethics. ʿUthman ibn ʿAffan reportedly said that this ayah comprehends every good — justice (giving everyone their due), ihsan (going beyond duty with beauty), and kinship.',
    topics: 'justice, kindness, manners, righteousness', keywords: 'fair, equity, ihsan, family', ...F,
  },
  {
    slug: 'quran-16-97', title: 'An-Nahl 16:97 — A good life',
    surahNumber: 16, surahNameEn: 'An-Nahl', surahNameAr: 'النحل', surahNameTranslit: 'An-Nahl', ayahNumber: 97,
    arabicText: 'مَنْ عَمِلَ صَالِحًا مِّن ذَكَرٍ أَوْ أُنثَىٰ وَهُوَ مُؤْمِنٌ فَلَنُحْيِيَنَّهُ حَيَاةً طَيِّبَةً',
    englishText: 'Whoever does righteous deeds, male or female, while believing — We will surely grant them a good life.',
    explanation: 'The "hayat tayyibah" (good, wholesome life) is the promised reward of faith + action in this world — contentment, meaning and dignity before the hereafter reward.',
    topics: 'righteousness, faith, good life, reward', keywords: 'good deeds, male, female, believer', ...F,
  },

  // ————— Al-Isra (17) —————
  {
    slug: 'quran-17-1', title: 'Al-Isra 17:1 — The Night Journey',
    surahNumber: 17, surahNameEn: 'Al-Isra', surahNameAr: 'الإسراء', surahNameTranslit: 'Al-Isra', ayahNumber: 1,
    arabicText: 'سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى الَّذِي بَارَكْنَا حَوْلَهُ',
    englishText: 'Glory to Him who took His servant by night from the Sacred Mosque to the Farthest Mosque, whose surroundings We have blessed.',
    explanation: 'The Isra — the night journey from Makkah to Jerusalem — followed by the Miʿraj (ascension) described in hadith. A key event of the Prophet\'s ﷺ Makkah period, before the Hijra.',
    topics: 'seerah, isra miraj, jerusalem, night journey', keywords: 'masjid al-aqsa, journey, ascension', ...F,
  },
  {
    slug: 'quran-17-23', title: 'Al-Isra 17:23 — Be kind to your parents',
    surahNumber: 17, surahNameEn: 'Al-Isra', surahNameAr: 'الإسراء', surahNameTranslit: 'Al-Isra', ayahNumber: 23,
    arabicText: 'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا',
    englishText: 'Your Lord has decreed that you worship none but Him, and that you be kind to parents. If one or both of them reach old age with you, do not say to them even "uff", nor rebuke them, but speak to them with honorable words.',
    explanation: 'Kindness to parents is decreed directly after worship of Allah. The verse forbids even the smallest expression of irritation ("uff") — training the believer for the years when parents become dependent.',
    topics: 'parents, kindness, manners, worship, tawhid', keywords: 'mother, father, old age, honor', ...F,
  },
  {
    slug: 'quran-17-24', title: 'Al-Isra 17:24 — Lower to them the wing of humility',
    surahNumber: 17, surahNameEn: 'Al-Isra', surahNameAr: 'الإسراء', surahNameTranslit: 'Al-Isra', ayahNumber: 24,
    arabicText: 'وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    englishText: 'And lower to them the wing of humility out of mercy, and say: "My Lord, have mercy on them as they raised me when I was small."',
    explanation: 'The dua for parents — for living and deceased — taught by the Qur\'an itself. The image of a bird lowering its wing expresses tender, protective love.',
    category: 'parents', topics: 'parents, dua, mercy, kindness, family', keywords: 'dua for parents, mercy, raise', ...F,
  },
  {
    slug: 'quran-17-36', title: 'Al-Isra 17:36 — Do not follow what you have no knowledge of',
    surahNumber: 17, surahNameEn: 'Al-Isra', surahNameAr: 'الإسراء', surahNameTranslit: 'Al-Isra', ayahNumber: 36,
    arabicText: 'وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ ۚ إِنَّ السَّمْعَ وَالْبَصَرَ وَالْفُؤَادَ كُلُّ أُولَٰئِكَ كَانَ عَنْهُ مَسْئُولًا',
    englishText: 'Do not pursue what you have no knowledge of. Hearing, sight, and heart — all of these will be questioned.',
    explanation: 'A Qur\'anic foundation of intellectual honesty: verify before believing and transmitting. The believer speaks only with knowledge — especially about religion.',
    topics: 'knowledge, honesty, truthfulness, verification', keywords: 'knowledge, verify, gossip, assumption', ...F,
  },
  {
    slug: 'quran-17-70', title: 'Al-Isra 17:70 — We honored the children of Adam',
    surahNumber: 17, surahNameEn: 'Al-Isra', surahNameAr: 'الإسراء', surahNameTranslit: 'Al-Isra', ayahNumber: 70,
    excerptOnly: true,
    arabicText: 'وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ…',
    englishText: 'We have honored the children of Adam…',
    explanation: 'Excerpt of the ayah. Every human being carries God-given dignity — the basis of Islamic ethics toward all people, regardless of faith or background.',
    topics: 'dignity, humanity, respect, manners', keywords: 'honor, human, mankind, dignity', ...F,
  },
  {
    slug: 'quran-17-78', title: 'Al-Isra 17:78 — Establish prayer at the sun\'s decline',
    surahNumber: 17, surahNameEn: 'Al-Isra', surahNameAr: 'الإسراء', surahNameTranslit: 'Al-Isra', ayahNumber: 78,
    arabicText: 'أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ وَقُرْآنَ الْفَجْرِ ۖ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا',
    englishText: 'Establish prayer from the decline of the sun until the darkness of the night, and the Qur\'an at dawn — indeed the Qur\'an at dawn is witnessed.',
    explanation: 'One of the Qur\'anic anchors for prayer times: from after noon until night, with special mention of Fajr, whose recitation is witnessed by angels (as the hadith explains).',
    topics: 'prayer, salah, prayer times, fajr', keywords: 'prayer times, noon, night, dawn', ...F,
  },

  // ————— Al-Kahf (18) —————
  {
    slug: 'quran-18-10', title: 'Al-Kahf 18:10 — Our Lord, grant us mercy from Yourself',
    surahNumber: 18, surahNameEn: 'Al-Kahf', surahNameAr: 'الكهف', surahNameTranslit: 'Al-Kahf', ayahNumber: 10,
    excerptOnly: true,
    arabicText: 'إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ فَقَالُوا رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
    englishText: 'When the youths took refuge in the cave and said: "Our Lord, grant us mercy from Yourself and prepare for us right guidance in our affair."',
    explanation: 'The dua of the People of the Cave — young believers who fled persecution. Their prayer is a model for anyone facing fitnah: ask Allah for mercy and a guided way out.',
    category: 'difficulty', topics: 'dua, difficulty, guidance, youth, trial', keywords: 'cave, youths, refuge, guidance', ...F,
  },

  // ————— Ta-Ha (20) —————
  {
    slug: 'quran-20-14', title: 'Ta-Ha 20:14 — Establish prayer for My remembrance',
    surahNumber: 20, surahNameEn: 'Ta-Ha', surahNameAr: 'طه', surahNameTranslit: 'Taha', ayahNumber: 14,
    excerptOnly: true,
    arabicText: 'إِنَّنِي أَنَا اللَّهُ لَا إِلَٰهَ إِلَّا أَنَا فَاعْبُدْنِي وَأَقِمِ الصَّلَاةَ لِذِكْرِي',
    englishText: 'Indeed, I am Allah; there is no god but Me. So worship Me and establish prayer for My remembrance.',
    explanation: 'Spoken to Musa (Moses) at Mount Tur. The stated purpose of salah is dhikr — remembrance of Allah. Prayer is the appointment of remembering throughout the day.',
    topics: 'prayer, salah, tawhid, dhikr, remembrance', keywords: 'establish prayer, remember, worship', ...F,
  },
  {
    slug: 'quran-20-25-27', title: 'Ta-Ha 20:25-27 — Expand my chest for me',
    surahNumber: 20, surahNameEn: 'Ta-Ha', surahNameAr: 'طه', surahNameTranslit: 'Taha', ayahNumber: 25, ayahEnd: 27,
    arabicText: 'قَالَ رَبِّ اشْرَحْ لِي صَدْرِي / وَيَسِّرْ لِي أَمْرِي / وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي',
    englishText: 'He said: "My Lord, expand my chest for me, ease my task for me, and untie the knot from my tongue."',
    explanation: 'The dua of Musa when given his mission. Recited by students before exams, by public speakers, and by anyone carrying a weight — asking for capacity, ease, and clarity of expression.',
    category: 'study', topics: 'dua, study, difficulty, clarity, anxiety', keywords: 'exams, speech, ease, task, tongue', ...F,
  },
  {
    slug: 'quran-20-114', title: 'Ta-Ha 20:114 — My Lord, increase me in knowledge',
    surahNumber: 20, surahNameEn: 'Ta-Ha', surahNameAr: 'طه', surahNameTranslit: 'Taha', ayahNumber: 114,
    excerptOnly: true,
    arabicText: '…وَقُل رَّبِّ زِدْنِي عِلْمًا',
    englishText: '…And say: "My Lord, increase me in knowledge."',
    explanation: 'Excerpt of the ayah. The one prophetic command to request more of something in the Qur\'an is knowledge (ʿilm). A favorite dua of students.',
    category: 'study', topics: 'dua, knowledge, study, learning', keywords: 'increase, knowledge, student, learn', ...F,
  },

  // ————— Al-Anbiya (21) —————
  {
    slug: 'quran-21-87', title: 'Al-Anbiya 21:87 — The dua of Yunus',
    surahNumber: 21, surahNameEn: 'Al-Anbiya', surahNameAr: 'الأنبياء', surahNameTranslit: 'Al-Anbiya', ayahNumber: 87,
    arabicText: 'وَذَا النُّونِ إِذ ذَّهَبَ مُغَاضِبًا فَظَنَّ أَن لَّن نَّقْدِرَ عَلَيْهِ فَنَادَىٰ فِي الظُّلُمَاتِ أَن لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    englishText: 'And the Man of the Fish — when he left in anger, thinking We would not constrain him; then he called out in the depths of darkness: "There is no god but You; glory be to You; I was indeed among the wrongdoers."',
    explanation: 'The dua of Yunus (Jonah) in the belly of the whale — called "the dua of distress". The Prophet ﷺ said no Muslim calls upon Allah with these words except that Allah answers (recorded by at-Tirmidhi and others). It combines tawhid, tasbih, and owning one\'s mistake.',
    category: 'difficulty', topics: 'dua, difficulty, distress, forgiveness, repentance', keywords: 'yunus, jonah, whale, distress, darkness', ...F,
  },

  // ————— Ar-Rum (30) —————
  {
    slug: 'quran-30-21', title: 'Ar-Rum 30:21 — Tranquility, affection and mercy between spouses',
    surahNumber: 30, surahNameEn: 'Ar-Rum', surahNameAr: 'الروم', surahNameTranslit: 'Ar-Rum', ayahNumber: 21,
    excerptOnly: true,
    arabicText: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    englishText: 'Among His signs is that He created for you spouses from among yourselves, that you may find tranquility in them; and He placed between you affection and mercy…',
    explanation: 'Excerpt of the ayah. The Qur\'anic picture of marriage: sukun (tranquility), mawaddah (love), and rahmah (mercy) — the three pillars of a Muslim home.',
    topics: 'marriage, family, love, mercy', keywords: 'spouse, wife, husband, tranquility, love', ...F,
  },

  // ————— Luqman (31) —————
  {
    slug: 'quran-31-14', title: 'Luqman 31:14 — His mother bore him with hardship',
    surahNumber: 31, surahNameEn: 'Luqman', surahNameAr: 'لقمان', surahNameTranslit: 'Luqman', ayahNumber: 14,
    excerptOnly: true,
    arabicText: 'وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ حَمَلَتْهُ أُمُّهُ وَهْنًا عَلَى وَهْنٍ… أَنِ اشْكُرْ لِي وَلِوَالِدَيْكَ',
    englishText: 'We entrusted the human being with care of his parents — his mother carried him in weakness upon weakness… "Be grateful to Me and to your parents."',
    explanation: 'Excerpt of the ayah. The Qur\'an remembers the physical hardship of pregnancy and nursing, then ties gratitude to parents directly to gratitude to Allah.',
    topics: 'parents, gratitude, kindness, mother', keywords: 'mother, hardship, carry, grateful', ...F,
  },

  // ————— Al-Qasas (28) —————
  {
    slug: 'quran-28-24', title: 'Al-Qasas 28:24 — I am in need of whatever good You send me',
    surahNumber: 28, surahNameEn: 'Al-Qasas', surahNameAr: 'القصص', surahNameTranslit: 'Al-Qasas', ayahNumber: 24,
    arabicText: 'فَقَالَ رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
    englishText: 'So he said: "My Lord, I am truly in need of whatever good You send down to me."',
    explanation: 'The dua of Musa (Moses) as a penniless refugee after helping the two women at the well. The classical scholars praised it as the dua of the one who has nothing left but Allah — and Musa was answered with safety, employment, family, and home within one ayah.',
    topics: 'dua, difficulty, provision, trust', keywords: 'need, poor, provision, rizq, musa', category: 'difficulty', ...F,
  },

  // ————— An-Nur (24) —————
  {
    slug: 'quran-24-61', title: 'An-Nur 24:61 — Greet your households with peace',
    surahNumber: 24, surahNameEn: 'An-Nur', surahNameAr: 'النور', surahNameTranslit: 'An-Nur', ayahNumber: 61,
    excerptOnly: true,
    arabicText: '…فَإِذَا دَخَلْتُم بُيُوتًا فَسَلِّمُوا عَلَىٰ أَنفُسِكُمْ تَحِيَّةً مِّنْ عِندِ اللَّهِ مُبَارَكَةً طَيِّبَةً',
    englishText: '…When you enter houses, greet one another with a greeting from Allah — blessed and good.',
    explanation: 'Excerpt of the ayah. Salam upon entering the home — even if you live alone, on the hadith of the Prophet\'s ﷺ practice — fills the house with the blessing of Allah\'s own greeting. The etiquette of entering a house in Islam.',
    topics: 'entering home, manners, salam, family', keywords: 'enter, house, home, greeting, salam', category: 'entering-home', ...F,
  },

  // ————— Aal ʿImran (3) —————
  {
    slug: 'quran-3-173', title: 'Aal ʿImran 3:173 — Sufficient for us is Allah',
    surahNumber: 3, surahNameEn: "Ali 'Imran", surahNameAr: 'آل عمران', surahNameTranslit: "Ali 'Imran", ayahNumber: 173,
    excerptOnly: true,
    arabicText: '…حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    englishText: '…Sufficient for us is Allah, and He is the best disposer of affairs.',
    explanation: 'Excerpt of the ayah. Said by the believers when armies gathered against them, and attributed to Ibrahim when he was cast into the fire (recorded in Sahih al-Bukhari, Book of Tafsir). "Hasbunallahu wa ni\'mal wakeel" is the believer\'s phrase when fear outgrows resources.',
    topics: 'fear, trust, tawakkul, difficulty', keywords: 'hasbunallah, sufficient, wakeel, fear, anxiety', category: 'fear', ...F,
  },

  // ————— Nuh (71) —————
  {
    slug: 'quran-71-28', title: 'Nuh 71:28 — My Lord, forgive me and my parents',
    surahNumber: 71, surahNameEn: 'Nuh', surahNameAr: 'نوح', surahNameTranslit: 'Nuh', ayahNumber: 28,
    arabicText: 'رَّبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَن دَخَلَ بَيْتِيَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ',
    englishText: 'My Lord, forgive me and my parents, and whoever enters my house as a believer, and the believing men and women.',
    explanation: 'The closing dua of Surah Nuh — forgiveness ascending in widening circles: self, parents, household, and the entire believing community. A model for how dua should expand beyond ourselves.',
    topics: 'dua, forgiveness, parents, family', keywords: 'forgive, nuh, noah, parents, believers', category: 'parents', ...F,
  },

  // ————— Fussilat (41) —————
  {
    slug: 'quran-41-34', title: 'Fussilat 41:34 — Repel evil with what is better',
    surahNumber: 41, surahNameEn: 'Fussilat', surahNameAr: 'فصلت', surahNameTranslit: 'Fussilat', ayahNumber: 34,
    excerptOnly: true,
    arabicText: 'وَلَا تَسْتَوِي الْحَسَنَةُ وَلَا السَّيِّئَةُ ۚ ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ فَإِذَا الَّذِي بَيْنَكَ وَبَيْنَهُ عَدَاوَةٌ كَأَنَّهُ وَلِيٌّ حَمِيمٌ',
    englishText: 'Good and evil are not equal. Repel evil with what is better, and your enemy will become like a close friend.',
    explanation: 'Excerpt of the ayah. The Qur\'anic strategy against hostility: respond with excellence. Kindness disarms enmity over time — a hallmark of Prophetic character.',
    topics: 'kindness, manners, forgiveness, enemies', keywords: 'repel, evil, better, friend, enemy', ...F,
  },



  // ————— Adh-Dhariyat (51) —————
  {
    slug: 'quran-51-56', title: 'Adh-Dhariyat 51:56 — I created jinn and mankind to worship Me',
    surahNumber: 51, surahNameEn: 'Adh-Dhariyat', surahNameAr: 'الذاريات', surahNameTranslit: 'Adh-Dhariyat', ayahNumber: 56,
    arabicText: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ',
    englishText: 'I did not create jinn and mankind except to worship Me.',
    explanation: 'The purpose of existence in one line. Classical scholars note: worship here means to know Allah — every lawful act becomes worship when done for Him.',
    topics: 'purpose, worship, tawhid, life', keywords: 'creation, jinn, mankind, purpose', ...F,
  },

  // ————— Al-Mujadila (58) —————
  {
    slug: 'quran-58-11', title: 'Al-Mujadila 58:11 — Allah raises those given knowledge in degrees',
    surahNumber: 58, surahNameEn: 'Al-Mujadila', surahNameAr: 'المجادلة', surahNameTranslit: 'Al-Mujadila', ayahNumber: 11,
    excerptOnly: true,
    arabicText: '…يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
    englishText: '…Allah will raise those who believe among you, and those given knowledge, in degrees.',
    explanation: 'Excerpt of the ayah. Faith and knowledge are ranked by Allah Himself — an enduring motivation for Islamic scholarship and study.',
    topics: 'knowledge, learning, faith, rank', keywords: 'raise, knowledge, degrees, scholar', ...F,
  },

  // ————— Al-Jumuʿah (62) —————
  {
    slug: 'quran-62-9', title: "Al-Jumu'ah 62:9 — Hasten to the remembrance of Allah",
    surahNumber: 62, surahNameEn: "Al-Jumu'ah", surahNameAr: 'الجمعة', surahNameTranslit: "Al-Jumu'ah", ayahNumber: 9,
    arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ وَذَرُوا الْبَيْعَ',
    englishText: 'O you who believe, when the call is made for prayer on Friday, hasten to the remembrance of Allah and leave off trade.',
    explanation: 'The foundation of Jumuʿah: when the adhan sounds, work pauses. The ayah continues that commerce is not forbidden after the prayer — balance of worship and livelihood.',
    topics: 'jumuah, friday, prayer, salah', keywords: 'friday, jumuah, call, prayer, trade', ...F,
  },

  // ————— Al-Mulk (67) —————
  {
    slug: 'quran-67-2', title: 'Al-Mulk 67:2 — He created death and life as a test',
    surahNumber: 67, surahNameEn: 'Al-Mulk', surahNameAr: 'الملك', surahNameTranslit: 'Al-Mulk', ayahNumber: 2,
    arabicText: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
    englishText: 'He who created death and life to test which of you is best in deed — and He is the Almighty, the Most Forgiving.',
    explanation: 'Life and death are instruments of examination. The measure is not quantity of deeds but their beauty and quality (ahsan ʿamalan).',
    topics: 'purpose, death, life, trial, deeds', keywords: 'test, death, life, best deeds', ...F,
  },

  // ————— Sad (38) —————
  {
    slug: 'quran-38-29', title: 'Sad 38:29 — A blessed Book, that they may reflect upon it',
    surahNumber: 38, surahNameEn: 'Sad', surahNameAr: 'ص', surahNameTranslit: 'Sad', ayahNumber: 29,
    arabicText: 'كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ وَلِيَتَذَكَّرَ أُولُو الْأَلْبَابِ',
    englishText: 'A blessed Book We sent down to you, that they may reflect deeply upon its verses, and that those of understanding would take heed.',
    explanation: 'The Qur\'an states its own purpose: tadabbur — deep, deliberate reflection. Reading slowly with understanding is valued over speed.',
    topics: 'quran, reflection, knowledge', keywords: 'book, reflect, tadabbur, verses', ...F,
  },

  // ————— Al-Mu\'minun (23) —————
  {
    slug: 'quran-23-1-2', title: 'Al-Mu\'minun 23:1-2 — Successful are the believers',
    surahNumber: 23, surahNameEn: "Al-Mu'minun", surahNameAr: 'المؤمنون', surahNameTranslit: "Al-Mu'minun", ayahNumber: 1, ayahEnd: 2,
    arabicText: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ / الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ',
    englishText: 'Successful indeed are the believers — those who are humble and present in their prayers.',
    explanation: 'The first quality of the successful believers listed in this surah: khushuʿ in salah — full presence of heart, calmness of body, and mindfulness of Allah.',
    topics: 'prayer, salah, khushu, faith, success', keywords: 'successful, believers, humble, khushu', ...F,
  },

  // ————— Al-Furqan (25) —————
  {
    slug: 'quran-25-63', title: 'Al-Furqan 25:63 — The servants of the Most Merciful walk gently',
    surahNumber: 25, surahNameEn: 'Al-Furqan', surahNameAr: 'الفرقان', surahNameTranslit: 'Al-Furqan', ayahNumber: 63,
    arabicText: 'وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا وَإِذَا خَاطَبَهُمُ الْجَاهِلُونَ قَالُوا سَلَامًا',
    englishText: 'The servants of the Most Merciful are those who walk gently upon the earth, and when the ignorant address them, they reply with words of peace.',
    explanation: 'The opening description of ʿibad ar-Rahman (the servants of the Most Merciful) across this surah: humility in movement, peace in response to provocation.',
    topics: 'manners, humility, kindness, patience', keywords: 'walk, gently, ignorant, peace, salam', ...F,
  },
  {
    slug: 'quran-25-74', title: 'Al-Furqan 25:74 — Comfort of our eyes from spouses and offspring',
    surahNumber: 25, surahNameEn: 'Al-Furqan', surahNameAr: 'الفرقان', surahNameTranslit: 'Al-Furqan', ayahNumber: 74,
    arabicText: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    englishText: 'Our Lord, grant us from our spouses and offspring the comfort of our eyes, and make us leaders of the God-conscious.',
    explanation: 'The dua of ʿibad ar-Rahman for a righteous family. "Qurrat aʿyun" (coolness of the eyes) describes the joy of seeing one\'s family upon goodness.',
    category: 'general', topics: 'dua, family, children, marriage, guidance', keywords: 'spouses, offspring, children, family, eyes', ...F,
  },

  // ————— Ash-Shuʿara (26) —————
  {
    slug: 'quran-26-181', title: 'Ash-Shuʿara 26:181 — Give full measure',
    surahNumber: 26, surahNameEn: "Ash-Shu'ara", surahNameAr: 'الشعراء', surahNameTranslit: "Ash-Shu'ara", ayahNumber: 181,
    arabicText: 'أَوْفُوا الْكَيْلَ وَلَا تَكُونُوا مِنَ الْمُخْسِرِينَ',
    englishText: 'Give full measure, and do not be of those who cause loss.',
    explanation: 'Said to the people of Madyan through Shuʿayb. Honest scales, honest pricing, honest quality — the ethics of trade in the Qur\'an.',
    topics: 'business, trade, honesty', keywords: 'measure, scale, weight, honest, cheat', ...F,
  },

  // ————— Al-ʿAnkabut (29) —————
  {
    slug: 'quran-29-2', title: 'Al-ʿAnkabut 29:2 — Do people think they will not be tested?',
    surahNumber: 29, surahNameEn: "Al-'Ankabut", surahNameAr: 'العنكبوت', surahNameTranslit: "Al-'Ankabut", ayahNumber: 2,
    arabicText: 'أَحَسِبَ النَّاسُ أَن يُتْرَكُوا أَن يَقُولُوا آمَنَّا وَهُمْ لَا يُفْتَنُونَ',
    englishText: 'Do people think they will be left alone saying "We believe", without being tested?',
    explanation: 'Iman is proven in examination. Trials are not punishments of the believer but the gym in which faith grows — the next ayah affirms that those before us were tested too.',
    topics: 'trial, patience, faith, test', keywords: 'test, trial, belief, examined', ...F,
  },


  // ————— Az-Zumar (39) —————
  {
    slug: 'quran-39-53', title: 'Az-Zumar 39:53 — Do not despair of Allah\'s mercy',
    surahNumber: 39, surahNameEn: 'Az-Zumar', surahNameAr: 'الزمر', surahNameTranslit: 'Az-Zumar', ayahNumber: 53,
    arabicText: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ',
    englishText: 'Say: "O My servants who have transgressed against themselves — do not despair of Allah\'s mercy. Surely Allah forgives all sins. He is the Most Forgiving, the Most Merciful."',
    explanation: 'One of the most hopeful verses in the Qur\'an. Allah addresses sinners with "O My servants" — keeping them in His fold — and commands His Prophet to announce forgiveness of ALL sins for those who return. The verse continues: "turn to your Lord and submit to Him before the punishment comes upon you."',
    category: 'forgiveness', topics: 'forgiveness, repentance, tawbah, hope, mercy, anxiety', keywords: 'despair, mercy, forgive, sins, transgressed', ...F,
  },

  // ————— Ghafir (40) —————
  {
    slug: 'quran-40-60', title: 'Ghafir 40:60 — Call upon Me; I will answer you',
    surahNumber: 40, surahNameEn: 'Ghafir', surahNameAr: 'غافر', surahNameTranslit: 'Ghafir', ayahNumber: 60,
    arabicText: 'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ',
    englishText: 'Your Lord has said: "Call upon Me; I will answer you."',
    explanation: 'A direct divine promise about dua. Scholars explain: the answer is granted either by giving what is asked, by averting harm, or by storing a greater reward — the dua itself is never wasted.',
    category: 'general', topics: 'dua, worship, hope, prayer', keywords: 'call, answer, supplication, response', ...F,
  },

  // ————— Al-Hujurat (49) —————
  {
    slug: 'quran-49-12', title: 'Al-Hujurat 49:12 — Do not backbite one another',
    surahNumber: 49, surahNameEn: 'Al-Hujurat', surahNameAr: 'الحجرات', surahNameTranslit: 'Al-Hujurat', ayahNumber: 12,
    excerptOnly: true,
    arabicText: '…وَلَا يَغْتَبْ بَعْضُكُم بَعْضًا',
    englishText: '…And do not backbite one another.',
    explanation: 'Excerpt of the ayah, which compares backbiting to eating the flesh of your dead brother. Ghiba is defined in hadith as mentioning your brother with what he dislikes (Abu Dawud 4874).',
    topics: 'manners, gossip, backbiting, speech', keywords: 'backbite, gossip, slander, rumor', ...F,
  },
  {
    slug: 'quran-49-13', title: 'Al-Hujurat 49:13 — The most honored of you is the most mindful',
    surahNumber: 49, surahNameEn: 'Al-Hujurat', surahNameAr: 'الحجرات', surahNameTranslit: 'Al-Hujurat', ayahNumber: 13,
    arabicText: 'يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ۚ إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ',
    englishText: 'O mankind, We created you from a male and a female, and made you peoples and tribes that you may know one another. Surely the most honored of you before Allah is the most mindful of you.',
    explanation: 'Islam abolished racial and tribal superiority. Diversity exists for acquaintance and cooperation; rank before Allah is only taqwa — God-consciousness.',
    topics: 'respect, diversity, manners, taqwa, equality', keywords: 'tribes, peoples, racism, honor, taqwa', ...F,
  },

  // ————— At-Talaq (65) —————
  {
    slug: 'quran-65-2', title: 'At-Talaq 65:2 — Whoever is mindful of Allah, He makes a way out',
    surahNumber: 65, surahNameEn: 'At-Talaq', surahNameAr: 'الطلاق', surahNameTranslit: 'At-Talaq', ayahNumber: 2,
    excerptOnly: true,
    arabicText: '…وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
    englishText: '…Whoever is mindful of Allah, He will make a way out for him.',
    explanation: 'Excerpt of the ayah. The famous promise of makhraj — an exit from every difficulty — for those who hold taqwa even when the situation seems closed.',
    topics: 'difficulty, anxiety, trust, tawakkul, taqwa', keywords: 'way out, escape, relief, hardship', ...F,
  },
  {
    slug: 'quran-65-3', title: 'At-Talaq 65:3 — He provides from where you do not expect',
    surahNumber: 65, surahNameEn: 'At-Talaq', surahNameAr: 'الطلاق', surahNameTranslit: 'At-Talaq', ayahNumber: 3,
    excerptOnly: true,
    arabicText: 'وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    englishText: 'And He provides for him from where he does not expect. And whoever places his trust in Allah — He is enough for him.',
    explanation: 'Excerpt of the ayah continuing the promise of 65:2. Provision and sufficiency are tied to tawakkul — entrusting one\'s affairs to Allah while taking the means.',
    topics: 'provision, trust, tawakkul, difficulty, anxiety', keywords: 'provide, rizq, sustenance, trust, rely', ...F,
  },

  // ————— Al-Maʿun (107) —————
  {
    slug: 'quran-107-1-3', title: 'Al-Maʿun 107:1-3 — The one who repulses the orphan',
    surahNumber: 107, surahNameEn: "Al-Ma'un", surahNameAr: 'الماعون', surahNameTranslit: "Al-Ma'un", ayahNumber: 1, ayahEnd: 3,
    arabicText: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ / فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ / وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ',
    englishText: 'Have you seen the one who denies the religion? That is the one who repulses the orphan, and does not encourage feeding the needy.',
    explanation: 'The Qur\'an measures real faith by treatment of the weakest: orphans and the poor. Denial of religion manifests socially before it manifests verbally.',
    topics: 'kindness, charity, orphans, poor, manners', keywords: 'orphan, needy, poor, feed, kindness', ...F,
  },

  // ————— Al-ʿAsr (103) —————
  {
    slug: 'quran-103-1-3', title: 'Al-ʿAsr 103:1-3 — Except those who believe and counsel patience',
    surahNumber: 103, surahNameEn: "Al-'Asr", surahNameAr: 'العصر', surahNameTranslit: "Al-'Asr", ayahNumber: 1, ayahEnd: 3,
    arabicText: 'وَالْعَصْرِ / إِنَّ الْإِنسَانَ لَفِي خُسْرٍ / إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
    englishText: 'By time — indeed mankind is in loss, except those who believe, do righteous deeds, counsel one another to truth, and counsel one another to patience.',
    explanation: 'The famous short surah Imam ash-Shafiʿi is reported to have said contains the sum of guidance: faith, action, truth-counsel and patience-counsel as the escape from universal loss.',
    topics: 'patience, faith, time, righteousness, manners', keywords: 'time, asr, loss, patience, truth', ...F,
  },

  // ————— Ad-Duha (93) —————
  {
    slug: 'quran-93-1-8', title: 'Ad-Duha 93:1-8 — Your Lord has not left you',
    surahNumber: 93, surahNameEn: 'Ad-Duha', surahNameAr: 'الضحى', surahNameTranslit: 'Ad-Duha', ayahNumber: 1, ayahEnd: 8,
    arabicText: 'وَالضُّحَىٰ / وَاللَّيْلِ إِذَا سَجَىٰ / مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ / وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ / وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ / أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ / وَوَجَدَكَ ضَالًّا فَهَدَىٰ / وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ',
    englishText: 'By the morning light, and the night when it grows still — your Lord has not left you, nor does He hate you. The hereafter is better for you than this life, and your Lord will give you, and you will be pleased. Did He not find you an orphan and shelter you? Did He not find you wandering and guide you? Did He not find you in need and make you self-sufficient?',
    explanation: 'Revealed when revelation paused and the Prophet ﷺ worried Allah was displeased with him. It answered with tenderness, remembered his own life story, and commanded care for the orphan and the needy. A surah of comfort in periods when worship feels "silent".',
    topics: 'anxiety, comfort, hope, mercy, seerah', keywords: 'duha, left, hate, orphan, comfort, reassurance', ...F,
  },

  // ————— Ash-Sharh (94) —————
  {
    slug: 'quran-94-5-6', title: 'Ash-Sharh 94:5-6 — With hardship comes ease',
    surahNumber: 94, surahNameEn: 'Ash-Sharh', surahNameAr: 'الشرح', surahNameTranslit: 'Ash-Sharh', ayahNumber: 5, ayahEnd: 6,
    arabicText: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا / إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    englishText: 'So surely, with hardship comes ease. Surely, with hardship comes ease.',
    explanation: 'The promise is repeated twice for emphasis. Scholars note: the word "with" (maʿa) — ease arrives alongside the difficulty, not merely after it. One hardship can never defeat two eases.',
    topics: 'difficulty, patience, hope, ease, anxiety', keywords: 'hardship, ease, difficulty, relief', ...F,
  },
  {
    slug: 'quran-94-7-8', title: 'Ash-Sharh 94:7-8 — Devote yourself to your Lord',
    surahNumber: 94, surahNameEn: 'Ash-Sharh', surahNameAr: 'الشرح', surahNameTranslit: 'Ash-Sharh', ayahNumber: 7, ayahEnd: 8,
    arabicText: 'فَإِذَا فَرَغْتَ فَانصَبْ / وَإِلَىٰ رَبِّكَ فَارْغَبْ',
    englishText: 'So when you are free, devote yourself; and let your longing turn to your Lord.',
    explanation: 'After the promise of ease, the surah teaches the believer\'s rhythm: even rest and energy belong to Allah — worship when free, and direct all desire to Him.',
    topics: 'worship, purpose, devotion', keywords: 'free, devote, desire, lord', ...F,
  },

  // ————— Al-ʿAlaq (96) —————
  {
    slug: 'quran-96-1-5', title: "Al-'Alaq 96:1-5 — Read, in the name of your Lord",
    surahNumber: 96, surahNameEn: "Al-'Alaq", surahNameAr: 'العلق', surahNameTranslit: "Al-'Alaq", ayahNumber: 1, ayahEnd: 5,
    arabicText: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ / خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ / اقْرَأْ وَرَبُّكَ الْأَكْرَمُ / الَّذِي عَلَّمَ بِالْقَلَمِ / عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ',
    englishText: 'Read, in the name of your Lord who created — created man from a clinging form. Read, and your Lord is the Most Generous, who taught by the pen, taught man what he did not know.',
    explanation: 'The first words of revelation to the Prophet ﷺ in the cave of Hira. Islam began with the command to read and to honor knowledge transmitted by the pen.',
    topics: 'knowledge, revelation, seerah, learning', keywords: 'read, iqra, first revelation, pen, teach', ...F,
  },

  // ————— Al-Qadr (97) —————
  {
    slug: 'quran-97', title: 'Al-Qadr 97:1-5 — The Night of Decree',
    surahNumber: 97, surahNameEn: 'Al-Qadr', surahNameAr: 'القدر', surahNameTranslit: 'Al-Qadr', ayahNumber: 1, ayahEnd: 5,
    arabicText: 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ / وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ / لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ / تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ / سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ',
    englishText: 'We sent it down on the Night of Decree. And what will make you understand what the Night of Decree is? The Night of Decree is better than a thousand months. The angels and the Spirit descend in it, by permission of their Lord, for every affair. Peace it is, until the break of dawn.',
    explanation: 'Laylat al-Qadr — sought in the odd nights of the last ten of Ramadan. Worship in it outweighs a lifetime (over 83 years). The surah ends: "salam" — peace until dawn.',
    category: 'ramadan', topics: 'ramadan, laylat qadr, quran, worship, dua', keywords: 'night of power, qadr, ramadan, thousand months', ...F,
  },

  // ————— Al-Fil (105) —————
  {
    slug: 'quran-105-1-5', title: 'Al-Fil 105:1-5 — The People of the Elephant',
    surahNumber: 105, surahNameEn: 'Al-Fil', surahNameAr: 'الفيل', surahNameTranslit: 'Al-Fil', ayahNumber: 1, ayahEnd: 5,
    arabicText: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ / أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ / وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ / تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ / فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ',
    englishText: 'Have you not seen how your Lord dealt with the People of the Elephant? Did He not turn their plan into ruin, sending against them birds in flocks, pelting them with stones of baked clay, leaving them like chewed-up straw?',
    explanation: 'The year of the Prophet\'s ﷺ birth is known as the Year of the Elephant: Abraha\'s army marched on the Kaʿbah with war elephants, and Allah destroyed the expedition — the Kaʿbah needs no human defense.',
    topics: 'seerah, birth of prophet, makkah, history', keywords: 'elephant, abraha, year, birth', ...F,
  },

  // ————— Al-Ikhlas, Al-Falaq, An-Nas —————
  {
    slug: 'quran-112-1-4', title: 'Al-Ikhlas 112:1-4 — Say: He is Allah, the One',
    surahNumber: 112, surahNameEn: 'Al-Ikhlas', surahNameAr: 'الإخلاص', surahNameTranslit: 'Al-Ikhlas', ayahNumber: 1, ayahEnd: 4,
    arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ / اللَّهُ الصَّمَدُ / لَمْ يَلِدْ وَلَمْ يُولَدْ / وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    englishText: 'Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there anyone equal to Him.',
    explanation: 'The surah that equals a third of the Qur\'an in reward according to Bukhari (Hadith 5013 — "reciting it is equal to one-third of the Qur\'an"). A complete definition of tawhid in four lines.',
    topics: 'tawhid, dhikr, names of allah, protection', keywords: 'oneness, one, ikhlas, sincerity, qul', ...F,
  },
  {
    slug: 'quran-113-1-5', title: 'Al-Falaq 113:1-5 — Say: I seek refuge with the Lord of daybreak',
    surahNumber: 113, surahNameEn: 'Al-Falaq', surahNameAr: 'الفلق', surahNameTranslit: 'Al-Falaq', ayahNumber: 1, ayahEnd: 5,
    arabicText: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ / مِن شَرِّ مَا خَلَقَ / وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ / وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ / وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    englishText: 'Say: I seek refuge with the Lord of daybreak — from the evil of what He created, from the evil of darkness as it settles, from the evil of those who blow upon knots, and from the evil of an envier when he envies.',
    explanation: 'One of the two protectors (al-muʿawwidhatayn) the Prophet ﷺ recited for protection, along with Surah 114 — recommended in the morning and evening and before sleep (see Bukhari 5017).',
    topics: 'protection, dhikr, morning, evening, fear', keywords: 'refuge, falaq, protect, evil, envy', ...F,
  },
  {
    slug: 'quran-114-1-6', title: 'An-Nas 114:1-6 — Say: I seek refuge with the Lord of mankind',
    surahNumber: 114, surahNameEn: 'An-Nas', surahNameAr: 'الناس', surahNameTranslit: 'An-Nas', ayahNumber: 1, ayahEnd: 6,
    arabicText: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ / مَلِكِ النَّاسِ / إِلَٰهِ النَّاسِ / مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ / الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ / مِنَ الْجِنَّةِ وَالنَّاسِ',
    englishText: 'Say: I seek refuge with the Lord of mankind, the King of mankind, the God of mankind — from the evil of the retreating whisperer, who whispers in the hearts of mankind, from among the jinn and mankind.',
    explanation: 'Protection from waswas — intrusive whispers of Shaytan and harmful suggestions of people. The Prophet ﷺ said these two surahs (113 and 114) suffice as protection (Abu Dawud 5082).',
    topics: 'protection, dhikr, morning, evening, fear, whispering', keywords: 'refuge, nas, protect, whisper, waswas', ...F,
  },
];

// Remove placeholder stubs (kept above only for editing convenience)
export const QURAN_SEED_CLEAN = QURAN_SEED.filter(
  (r) => r.englishText && r.englishText.length > 3
);
