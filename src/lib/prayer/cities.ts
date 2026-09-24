// ============================================================================
// BASIRA — curated city presets for manual location selection.
// City-center coordinates (accurate to ~0.01°, well under the ~1 km level
// that meaningfully affects prayer times) + correct IANA timezones.
// ============================================================================

export interface CityPreset {
  id: string;
  city: string;
  cityAr: string;
  country: string;
  countryAr: string;
  lat: number;
  lng: number;
  timezone: string;
  region: 'middle-east' | 'africa' | 'europe' | 'asia' | 'americas' | 'oceania';
}

export const CITY_REGIONS: Record<CityPreset['region'], { en: string; ar: string }> = {
  'middle-east': { en: 'Middle East', ar: 'الشرق الأوسط' },
  africa: { en: 'Africa', ar: 'أفريقيا' },
  europe: { en: 'Europe', ar: 'أوروبا' },
  asia: { en: 'Asia', ar: 'آسيا' },
  americas: { en: 'Americas', ar: 'الأمريكتان' },
  oceania: { en: 'Oceania', ar: 'أوقيانوسيا' },
};

export const CITY_PRESETS: CityPreset[] = [
  // ——— Middle East ———
  { id: 'makkah', city: 'Makkah', cityAr: 'مكة المكرمة', country: 'Saudi Arabia', countryAr: 'السعودية', lat: 21.4225, lng: 39.8262, timezone: 'Asia/Riyadh', region: 'middle-east' },
  { id: 'madinah', city: 'Madinah', cityAr: 'المدينة المنورة', country: 'Saudi Arabia', countryAr: 'السعودية', lat: 24.4686, lng: 39.6142, timezone: 'Asia/Riyadh', region: 'middle-east' },
  { id: 'riyadh', city: 'Riyadh', cityAr: 'الرياض', country: 'Saudi Arabia', countryAr: 'السعودية', lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh', region: 'middle-east' },
  { id: 'doha', city: 'Doha', cityAr: 'الدوحة', country: 'Qatar', countryAr: 'قطر', lat: 25.2867, lng: 51.5312, timezone: 'Asia/Qatar', region: 'middle-east' },
  { id: 'dubai', city: 'Dubai', cityAr: 'دبي', country: 'United Arab Emirates', countryAr: 'الإمارات', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai', region: 'middle-east' },
  { id: 'abu-dhabi', city: 'Abu Dhabi', cityAr: 'أبو ظبي', country: 'United Arab Emirates', countryAr: 'الإمارات', lat: 24.4539, lng: 54.3773, timezone: 'Asia/Dubai', region: 'middle-east' },
  { id: 'kuwait-city', city: 'Kuwait City', cityAr: 'مدينة الكويت', country: 'Kuwait', countryAr: 'الكويت', lat: 29.3759, lng: 47.9774, timezone: 'Asia/Kuwait', region: 'middle-east' },
  { id: 'manama', city: 'Manama', cityAr: 'المنامة', country: 'Bahrain', countryAr: 'البحرين', lat: 26.2285, lng: 50.586, timezone: 'Asia/Bahrain', region: 'middle-east' },
  { id: 'muscat', city: 'Muscat', cityAr: 'مسقط', country: 'Oman', countryAr: 'عُمان', lat: 23.588, lng: 58.3829, timezone: 'Asia/Muscat', region: 'middle-east' },
  { id: 'amman', city: 'Amman', cityAr: 'عمّان', country: 'Jordan', countryAr: 'الأردن', lat: 31.9454, lng: 35.9284, timezone: 'Asia/Amman', region: 'middle-east' },
  { id: 'istanbul', city: 'Istanbul', cityAr: 'إستنبول', country: 'Türkiye', countryAr: 'تركيا', lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul', region: 'middle-east' },
  { id: 'tehran', city: 'Tehran', cityAr: 'طهران', country: 'Iran', countryAr: 'إيران', lat: 35.6892, lng: 51.389, timezone: 'Asia/Tehran', region: 'middle-east' },
  { id: 'jerusalem', city: 'Jerusalem', cityAr: 'القدس', country: 'Palestine', countryAr: 'فلسطين', lat: 31.7683, lng: 35.2137, timezone: 'Asia/Jerusalem', region: 'middle-east' },
  // ——— Africa ———
  { id: 'cairo', city: 'Cairo', cityAr: 'القاهرة', country: 'Egypt', countryAr: 'مصر', lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo', region: 'africa' },
  { id: 'alexandria', city: 'Alexandria', cityAr: 'الإسكندرية', country: 'Egypt', countryAr: 'مصر', lat: 31.2001, lng: 29.9187, timezone: 'Africa/Cairo', region: 'africa' },
  { id: 'casablanca', city: 'Casablanca', cityAr: 'الدار البيضاء', country: 'Morocco', countryAr: 'المغرب', lat: 33.5731, lng: -7.5898, timezone: 'Africa/Casablanca', region: 'africa' },
  { id: 'tunis', city: 'Tunis', cityAr: 'تونس', country: 'Tunisia', countryAr: 'تونس', lat: 36.8065, lng: 10.1815, timezone: 'Africa/Tunis', region: 'africa' },
  { id: 'algiers', city: 'Algiers', cityAr: 'الجزائر', country: 'Algeria', countryAr: 'الجزائر', lat: 36.7538, lng: 3.0588, timezone: 'Africa/Algiers', region: 'africa' },
  { id: 'khartoum', city: 'Khartoum', cityAr: 'الخرطوم', country: 'Sudan', countryAr: 'السودان', lat: 15.5007, lng: 32.5599, timezone: 'Africa/Khartoum', region: 'africa' },
  { id: 'lagos', city: 'Lagos', cityAr: 'لاغوس', country: 'Nigeria', countryAr: 'نيجيريا', lat: 6.5244, lng: 3.3792, timezone: 'Africa/Lagos', region: 'africa' },
  { id: 'nairobi', city: 'Nairobi', cityAr: 'نيروبي', country: 'Kenya', countryAr: 'كينيا', lat: -1.2921, lng: 36.8219, timezone: 'Africa/Nairobi', region: 'africa' },
  { id: 'johannesburg', city: 'Johannesburg', cityAr: 'جوهانسبرغ', country: 'South Africa', countryAr: 'جنوب أفريقيا', lat: -26.2041, lng: 28.0473, timezone: 'Africa/Johannesburg', region: 'africa' },
  // ——— Europe ———
  { id: 'london', city: 'London', cityAr: 'لندن', country: 'United Kingdom', countryAr: 'المملكة المتحدة', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London', region: 'europe' },
  { id: 'paris', city: 'Paris', cityAr: 'باريس', country: 'France', countryAr: 'فرنسا', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris', region: 'europe' },
  { id: 'berlin', city: 'Berlin', cityAr: 'برلين', country: 'Germany', countryAr: 'ألمانيا', lat: 52.52, lng: 13.405, timezone: 'Europe/Berlin', region: 'europe' },
  { id: 'stockholm', city: 'Stockholm', cityAr: 'ستوكهولم', country: 'Sweden', countryAr: 'السويد', lat: 59.3293, lng: 18.0686, timezone: 'Europe/Stockholm', region: 'europe' },
  { id: 'moscow', city: 'Moscow', cityAr: 'موسكو', country: 'Russia', countryAr: 'روسيا', lat: 55.7558, lng: 37.6173, timezone: 'Europe/Moscow', region: 'europe' },
  // ——— Asia ———
  { id: 'karachi', city: 'Karachi', cityAr: 'كراتشي', country: 'Pakistan', countryAr: 'باكستان', lat: 24.8607, lng: 67.0011, timezone: 'Asia/Karachi', region: 'asia' },
  { id: 'lahore', city: 'Lahore', cityAr: 'لاهور', country: 'Pakistan', countryAr: 'باكستان', lat: 31.5204, lng: 74.3587, timezone: 'Asia/Karachi', region: 'asia' },
  { id: 'delhi', city: 'Delhi', cityAr: 'دلهي', country: 'India', countryAr: 'الهند', lat: 28.6139, lng: 77.209, timezone: 'Asia/Kolkata', region: 'asia' },
  { id: 'dhaka', city: 'Dhaka', cityAr: 'دكا', country: 'Bangladesh', countryAr: 'بنغلاديش', lat: 23.8103, lng: 90.4125, timezone: 'Asia/Dhaka', region: 'asia' },
  { id: 'kuala-lumpur', city: 'Kuala Lumpur', cityAr: 'كوالالمبور', country: 'Malaysia', countryAr: 'ماليزيا', lat: 3.139, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur', region: 'asia' },
  { id: 'jakarta', city: 'Jakarta', cityAr: 'جاكرتا', country: 'Indonesia', countryAr: 'إندونيسيا', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta', region: 'asia' },
  { id: 'singapore', city: 'Singapore', cityAr: 'سنغافورة', country: 'Singapore', countryAr: 'سنغافورة', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore', region: 'asia' },
  // ——— Americas ———
  { id: 'new-york', city: 'New York', cityAr: 'نيويورك', country: 'United States', countryAr: 'الولايات المتحدة', lat: 40.7128, lng: -74.006, timezone: 'America/New_York', region: 'americas' },
  { id: 'chicago', city: 'Chicago', cityAr: 'شيكاغو', country: 'United States', countryAr: 'الولايات المتحدة', lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago', region: 'americas' },
  { id: 'houston', city: 'Houston', cityAr: 'هيوستن', country: 'United States', countryAr: 'الولايات المتحدة', lat: 29.7604, lng: -95.3698, timezone: 'America/Chicago', region: 'americas' },
  { id: 'los-angeles', city: 'Los Angeles', cityAr: 'لوس أنجلوس', country: 'United States', countryAr: 'الولايات المتحدة', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles', region: 'americas' },
  { id: 'toronto', city: 'Toronto', cityAr: 'تورونتو', country: 'Canada', countryAr: 'كندا', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto', region: 'americas' },
  { id: 'sao-paulo', city: 'São Paulo', cityAr: 'ساو باولو', country: 'Brazil', countryAr: 'البرازيل', lat: -23.5505, lng: -46.6333, timezone: 'America/Sao_Paulo', region: 'americas' },
  // ——— Oceania ———
  { id: 'sydney', city: 'Sydney', cityAr: 'سيدني', country: 'Australia', countryAr: 'أستراليا', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney', region: 'oceania' },
  { id: 'melbourne', city: 'Melbourne', cityAr: 'ملبورن', country: 'Australia', countryAr: 'أستراليا', lat: -37.8136, lng: 144.9631, timezone: 'Australia/Melbourne', region: 'oceania' },
  { id: 'auckland', city: 'Auckland', cityAr: 'أوكلاند', country: 'New Zealand', countryAr: 'نيوزيلندا', lat: -36.8485, lng: 174.7633, timezone: 'Pacific/Auckland', region: 'oceania' },
];
