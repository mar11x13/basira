// ============================================================================
// BASIRA — structured learning paths (Beginner / Intermediate / Advanced).
// Lessons reference verified SourceText records by slug. Progress is tracked
// per user; deliberately NO leaderboard (religious learning, not competition).
// ============================================================================

import type { LearningPath } from './types';

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'learn-salah',
    title: 'Learn Salah',
    titleAr: 'تعلَّم الصلاة',
    description: 'From wudu to a complete, focused prayer — step by step for beginners.',
    level: 'Beginner',
    icon: 'moon-star',
    lessons: [
      { id: 'l1', title: 'Why we pray', summary: 'The meaning and purpose of Salah.', recordSlugs: ['quran-20-14', 'quran-2-153', 'hadith-bukhari-8'] },
      { id: 'l2', title: 'Purity first: Wudu', summary: 'How to perform ablution correctly.', recordSlugs: ['quran-5-6', 'hadith-bukhari-164', 'fiqh-wudu-steps'] },
      { id: 'l3', title: 'The five daily prayers', summary: 'Names, times and rakʿah counts.', recordSlugs: ['quran-4-103', 'fiqh-prayer-times-overview', 'quran-17-78'] },
      { id: 'l4', title: 'How to pray — step by step', summary: 'A gentle walkthrough from takbir to taslim.', recordSlugs: ['hadith-bukhari-631', 'fiqh-how-to-pray'] },
      { id: 'l5', title: 'Common mistakes and what invalidates prayer', summary: 'Fixing habits, calmly.', recordSlugs: ['fiqh-prayer-mistakes', 'fiqh-prayer-invalidators'] },
      { id: 'l6', title: 'Missed a prayer?', summary: 'What to do — mercy comes first.', recordSlugs: ['hadith-bukhari-597'] },
      { id: 'l7', title: 'Khushuʿ: praying with presence of heart', summary: 'Bringing life into your prayer.', recordSlugs: ['quran-23-1-2', 'quran-8-2'] },
    ],
  },
  {
    id: 'learn-aqeedah',
    title: 'Aqeedah Basics',
    titleAr: 'أسس العقيدة',
    description: 'The foundations of Islamic belief explained simply.',
    level: 'Beginner',
    icon: 'book-open',
    lessons: [
      { id: 'l1', title: 'Who is Allah?', summary: 'Tawhid — the Oneness of Allah.', recordSlugs: ['quran-112-1-4', 'quran-2-255', 'glossary-tawhid'] },
      { id: 'l2', title: 'The articles of faith', summary: 'Belief in Allah, angels, books, messengers, the Last Day and decree.', recordSlugs: ['hadith-bukhari-50', 'glossary-iman'] },
      { id: 'l3', title: 'Ihsan — excellence in worship', summary: 'Worshipping Allah as though you see Him.', recordSlugs: ['hadith-bukhari-50'] },
      { id: 'l4', title: 'The purpose of life', summary: 'Why we are here.', recordSlugs: ['quran-51-56', 'quran-67-2'] },
    ],
  },
  {
    id: 'learn-seerah',
    title: 'Learn Seerah',
    titleAr: 'السيرة النبوية',
    description: 'The life of the Prophet Muhammad ﷺ from trusted reports.',
    level: 'Beginner',
    icon: 'scroll',
    lessons: [
      { id: 'l1', title: 'Birth and early life', summary: 'Makkah, the Year of the Elephant, and his upbringing.', recordSlugs: ['quran-105-1-5', 'seerah-birth', 'seerah-aminah'] },
      { id: 'l2', title: 'The first revelation', summary: 'Cave Hira and the beginning of prophethood.', recordSlugs: ['quran-96-1-5', 'hadith-bukhari-3', 'seerah-first-revelation'] },
      { id: 'l3', title: 'The Makkah years', summary: 'Patience under persecution.', recordSlugs: ['seerah-persecution', 'seerah-year-of-sorrow'] },
      { id: 'l4', title: 'The Hijra', summary: 'The migration to Madinah.', recordSlugs: ['quran-9-40', 'seerah-hijra'] },
      { id: 'l5', title: 'The Madinah years', summary: 'Community, Badr, Uhud, and the conquest of Makkah.', recordSlugs: ['quran-3-123', 'seerah-badr', 'seerah-conquest'] },
      { id: 'l6', title: 'The farewell sermon', summary: 'The final pilgrimage and message.', recordSlugs: ['seerah-farewell'] },
    ],
  },
  {
    id: 'learn-hadith',
    title: 'Learn Hadith',
    titleAr: 'علوم الحديث',
    description: 'What hadith are, how they were preserved, and how to read them.',
    level: 'Intermediate',
    icon: 'library',
    lessons: [
      { id: 'l1', title: 'What is a hadith?', summary: 'Sunnah, isnad and matn explained.', recordSlugs: ['glossary-hadith', 'glossary-sunnah'] },
      { id: 'l2', title: 'Sahih al-Bukhari', summary: 'Why it is the most rigorously authenticated collection.', recordSlugs: ['glossary-sahih', 'hadith-bukhari-1'] },
      { id: 'l3', title: 'Grades of hadith', summary: 'Sahih, hasan, daʿif — and what they mean for practice.', recordSlugs: ['glossary-sahih', 'glossary-daif'] },
      { id: 'l4', title: 'Beware false attributions', summary: 'Why BASIRA never invents hadith, and neither should we.', recordSlugs: ['hadith-bukhari-110'] },
    ],
  },
  {
    id: 'learn-quran',
    title: 'Learn Quran',
    titleAr: 'تعلَّم القرآن',
    description: 'How to approach, recite and connect with the Book of Allah.',
    level: 'Beginner',
    icon: 'book-marked',
    lessons: [
      { id: 'l1', title: 'What the Quran is', summary: 'The final revelation, preserved word by word.', recordSlugs: ['quran-2-185', 'glossary-quran-term'] },
      { id: 'l2', title: 'Etiquette of recitation', summary: 'Purity, respect and reflection.', recordSlugs: ['quran-5-6', 'quran-3-190'] },
      { id: 'l3', title: 'Learning and teaching', summary: 'The virtue of the people of the Quran.', recordSlugs: ['hadith-bukhari-5027'] },
      { id: 'l4', title: 'Reflecting on the Quran', summary: 'Tadabbur — reading with the heart.', recordSlugs: ['quran-3-191', 'quran-38-29'] },
    ],
  },
  {
    id: 'learn-fiqh',
    title: 'Learn Fiqh',
    titleAr: 'تعلَّم الفقه',
    description: 'Islamic jurisprudence and how scholars derive rulings.',
    level: 'Intermediate',
    icon: 'scale',
    lessons: [
      { id: 'l1', title: 'What is fiqh?', summary: 'Understanding the sources of rulings.', recordSlugs: ['glossary-fiqh', 'glossary-madhhab'] },
      { id: 'l2', title: 'The four madhhabs', summary: 'Respected schools of jurisprudence.', recordSlugs: ['glossary-madhhab', 'scholarly-madhhab-overview'] },
      { id: 'l3', title: 'When scholars differ', summary: 'Differences are a mercy, not a war.', recordSlugs: ['scholarly-differences-intro', 'fiqh-wudu-breaks'] },
    ],
  },
  {
    id: 'learn-manners',
    title: 'Islamic Manners',
    titleAr: 'الأخلاق',
    description: 'The character of a believer in everyday life.',
    level: 'Beginner',
    icon: 'heart-handshake',
    lessons: [
      { id: 'l1', title: 'Gentleness', summary: 'The Prophet\'s way was mercy.', recordSlugs: ['quran-3-159', 'hadith-bukhari-6927', 'hadith-muslim-2592'] },
      { id: 'l2', title: 'Truthfulness', summary: 'A believer does not lie.', recordSlugs: ['hadith-bukhari-33', 'hadith-bukhari-6094'] },
      { id: 'l3', title: 'Kindness to parents', summary: 'The highest station after Allah.', recordSlugs: ['quran-17-23', 'quran-17-24', 'hadith-bukhari-5971', 'hadith-muslim-2551'] },
      { id: 'l4', title: 'Good character with people', summary: 'From the tongue and the hand.', recordSlugs: ['hadith-muslim-40', 'quran-41-34', 'quran-49-13'] },
    ],
  },
  {
    id: 'learn-ramadan',
    title: 'Learn Ramadan',
    titleAr: 'تعلَّم رمضان',
    description: 'Make the most of the month of the Quran.',
    level: 'Beginner',
    icon: 'sun',
    lessons: [
      { id: 'l1', title: 'Why we fast', summary: 'Taqwa through fasting.', recordSlugs: ['quran-2-183', 'quran-2-185'] },
      { id: 'l2', title: 'The month of mercy', summary: 'Gates opened, sins forgiven.', recordSlugs: ['hadith-muslim-1079', 'hadith-bukhari-38'] },
      { id: 'l3', title: 'Laylat al-Qadr', summary: 'The night better than a thousand months.', recordSlugs: ['quran-97', 'hadith-bukhari-2017', 'dua-laylat-qadr'] },
      { id: 'l4', title: 'Daily worship in Ramadan', summary: 'Suhoor, iftar and charity.', recordSlugs: ['hadith-tirmidhi-807', 'dua-iftar'] },
    ],
  },
  {
    id: 'learn-daily-worship',
    title: 'Daily Worship',
    titleAr: 'العبادات اليومية',
    description: 'Morning, evening and everyday remembrance structured around your day.',
    level: 'Beginner',
    icon: 'sparkles',
    lessons: [
      { id: 'l1', title: 'Waking up', summary: 'Begin the day with gratitude.', recordSlugs: ['dua-waking'] },
      { id: 'l2', title: 'Morning remembrance', summary: 'Adhkar to carry through the day.', recordSlugs: ['hadith-bukhari-6306', 'hadith-bukhari-6405'] },
      { id: 'l3', title: 'Through the day', summary: 'Eating, leaving home, working with ihsan.', recordSlugs: ['dua-before-eating', 'dua-leaving-home', 'quran-4-29'] },
      { id: 'l4', title: 'Evening and sleep', summary: 'End the day in remembrance.', recordSlugs: ['dua-sleeping', 'hadith-bukhari-2311', 'hadith-bukhari-5017'] },
    ],
  },
];

export function getPath(id: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.id === id);
}
