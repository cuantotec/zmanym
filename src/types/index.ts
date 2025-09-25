// Shared type definitions for the Zmanym application

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiErrorResponse {
  error: string;
}

export interface ApiSuccessResponse<T = unknown> {
  data?: T;
  message?: string;
}

// ============================================================================
// Location Types
// ============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  geonameid: string;
  name: string;
  country: string;
  admin1?: string;
  admin2?: string;
  isZipCode?: boolean;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationInfo {
  name: string;
  coordinates: Coordinates;
  geonameid?: string;
  isZipCode?: boolean;
  zipCode?: string;
}

// ============================================================================
// Hebcal API Types
// ============================================================================

export interface HebcalLocation {
  geo: string;
  city: string;
  country: string;
  tzid: string;
}

export interface HebcalItem {
  title: string;
  date: string;
  category: string;
  hebrew?: string;
  memo?: string;
}

export interface HebcalResponse {
  items: HebcalItem[];
  location: HebcalLocation;
}

export interface Holiday {
  title: string;
  date: string;
  category: string;
  candleLighting?: string;
}

export interface ZmanimData {
  candleLighting: string;
  havdalah: string;
  parsha: string;
  gregorianDate: string;
  hebrewDate: string;
  location: string;
  holidays: Holiday[];
}

// ============================================================================
// Daily Zmanim Types
// ============================================================================

export interface DailyZmanimTimes {
  chatzotNight: string;        // Midnight - Chatzot
  alotHaShachar: string;       // Dawn - Alot haShachar
  misheyakir: string;          // Earliest talis & tefillin - Misheyakir
  misheyakirMachmir: string;   // Earliest talis & tefillin - Misheyakir Machmir
  dawn: string;                // Civil dawn
  sunrise: string;             // Sunrise
  sofZmanShma: string;         // Latest Shema (Gra)
  sofZmanShmaMGA: string;      // Latest Shema (MGA)
  sofZmanTfilla: string;       // Latest Shacharit (Gra)
  sofZmanTfillaMGA: string;    // Latest Shacharit (MGA)
  chatzot: string;             // Midday - Chatzot
  minchaGedola: string;        // Earliest Mincha - Mincha Gedola
  minchaKetana: string;        // Preferable earliest time to recite Minchah
  plagHaMincha: string;        // Plag haMincha
  sunset: string;              // Sunset
  dusk: string;                // Civil dusk
  beinHaShmashos: string;      // Bein Hashemashot / Twilight
  tzeit7083deg: string;        // Nightfall (3 medium stars) - Tzeit 7.083°
  tzeit85deg: string;          // Nightfall (3 small stars) - Tzeit 8.5°
  tzeit42min: string;          // Nightfall (3 medium stars) - Tzeit 42 minutes
  tzeit50min: string;          // Nightfall (3 small stars) - Tzeit 50 minutes
  tzeit72min: string;          // Nightfall (Rabbeinu Tam) - Tzeit 72 minutes
}

export interface DailyZmanimLocation {
  latitude: number;
  longitude: number;
  il: boolean;
  tzid: string;
  name: string;
  cc: string;
  geoid: number;
  geo: string;
  geonameid: number;
  asciiname: string;
  admin1: string;
  population: number;
}

export interface DailyZmanimData {
  date: string;
  location: DailyZmanimLocation;
  times: DailyZmanimTimes;
}

export interface HebcalZmanimResponse {
  date: string;
  location: DailyZmanimLocation;
  times: DailyZmanimTimes;
}

// ============================================================================
// Prayer Types
// ============================================================================

export interface PrayerData {
  title: string;
  text: string;
  transliteration?: string;
  instructions?: string;
}

export interface PrayerContent {
  english: PrayerData;
  englishPlain: PrayerData;
  englishHebrew: PrayerData;
  spanish: PrayerData;
  hebrew: PrayerData;
}

export type PrayerType = 'candleLighting' | 'havdalah' | 'holiday';

export type Language = 'english' | 'englishPlain' | 'englishHebrew' | 'spanish' | 'hebrew';

export type TextSize = 'small' | 'medium' | 'large';

// ============================================================================
// Cache Types
// ============================================================================

export interface CachedZmanimData {
  data: ZmanimData;
  timestamp: number;
  geonameid: string;
  location: string;
}

export interface CacheData<T = unknown> {
  data: T;
  timestamp: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface AppError {
  message: string;
  type: 'network' | 'location' | 'api' | 'permission' | 'unknown';
  retryable: boolean;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface PrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerType: PrayerType;
  holidayName?: string;
}

export interface ZmanimCardProps {
  location: string;
  zmanimData: ZmanimData;
}

export interface LocationSearchProps {
  currentLocation: string;
  onLocationChange: (location: string) => void;
  onLocationSelect: (locationData: LocationData) => void;
  loading: boolean;
  hasData: boolean;
  cachedZmanimData: Map<string, ZmanimData>;
  onCacheData: (geonameid: string, data: ZmanimData) => void;
}

export interface LoadingSpinnerProps {
  message?: string;
}

export interface ErrorMessageProps {
  message: string;
  error?: AppError | null;
  onRetry?: () => void;
}

// ============================================================================
// Reverse Geocoding Types
// ============================================================================

export interface ReverseGeocodingResponse {
  city?: string;
  locality?: string;
  countryName?: string;
  principalSubdivision?: string;
  localityInfo?: {
    administrative?: Array<{
      name: string;
      order: number;
    }>;
  };
}

// ============================================================================
// Geolocation API Types
// ============================================================================

export interface GeolocationPosition {
  coords: GeolocationCoordinates;
  timestamp: number;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface GeolocationError {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
}

// ============================================================================
// Prayer Modal State Types
// ============================================================================

export interface PrayerModalState {
  isOpen: boolean;
  type: PrayerType;
  holidayName?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
