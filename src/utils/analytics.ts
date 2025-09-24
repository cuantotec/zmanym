// Analytics utility functions for tracking user interactions

import { track } from '@vercel/analytics';

// Event types for better type safety
export type AnalyticsEvent = 
  | 'location_search'
  | 'location_select'
  | 'prayer_modal_open'
  | 'prayer_modal_close'
  | 'prayer_language_change'
  | 'prayer_text_size_change'
  | 'holiday_click'
  | 'candle_lighting_click'
  | 'havdalah_click'
  | 'parasha_link_click'
  | 'error_occurred'
  | 'cache_hit'
  | 'cache_miss'
  | 'geolocation_success'
  | 'geolocation_error'
  | 'zip_code_search'
  | 'city_search';

export interface AnalyticsEventData {
  [key: string]: string | number | boolean;
}

// Track user interactions with detailed context
export const trackEvent = (event: AnalyticsEvent, data?: AnalyticsEventData) => {
  try {
    track(event, data);
    console.log(`📊 Analytics: Tracked event "${event}"`, data);
  } catch (error) {
    console.error('📊 Analytics: Failed to track event', error);
  }
};

// Specific tracking functions for common actions
export const trackLocationSearch = (query: string, resultCount: number) => {
  trackEvent('location_search', {
    query: query.toLowerCase(),
    result_count: resultCount,
    query_length: query.length
  });
};

export const trackLocationSelect = (locationName: string, isZipCode: boolean) => {
  trackEvent('location_select', {
    location_name: locationName,
    is_zip_code: isZipCode,
    selection_type: isZipCode ? 'zip_code' : 'city'
  });
};

export const trackPrayerModalOpen = (prayerType: string, holidayName?: string) => {
  trackEvent('prayer_modal_open', {
    prayer_type: prayerType,
    holiday_name: holidayName || 'none'
  });
};

export const trackPrayerModalClose = (prayerType: string, language: string, textSize: string) => {
  trackEvent('prayer_modal_close', {
    prayer_type: prayerType,
    language,
    text_size: textSize
  });
};

export const trackPrayerLanguageChange = (prayerType: string, fromLanguage: string, toLanguage: string) => {
  trackEvent('prayer_language_change', {
    prayer_type: prayerType,
    from_language: fromLanguage,
    to_language: toLanguage
  });
};

export const trackPrayerTextSizeChange = (prayerType: string, fromSize: string, toSize: string) => {
  trackEvent('prayer_text_size_change', {
    prayer_type: prayerType,
    from_size: fromSize,
    to_size: toSize
  });
};

export const trackHolidayClick = (holidayName: string, holidayDate: string) => {
  trackEvent('holiday_click', {
    holiday_name: holidayName,
    holiday_date: holidayDate
  });
};

export const trackCandleLightingClick = (location: string, time: string) => {
  trackEvent('candle_lighting_click', {
    location,
    time
  });
};

export const trackHavdalahClick = (location: string, time: string) => {
  trackEvent('havdalah_click', {
    location,
    time
  });
};

export const trackError = (errorType: string, errorMessage: string, context: string) => {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage.substring(0, 100), // Limit message length
    context
  });
};

export const trackCacheHit = (geonameid: string, location: string) => {
  trackEvent('cache_hit', {
    geonameid,
    location
  });
};

export const trackCacheMiss = (geonameid: string, location: string) => {
  trackEvent('cache_miss', {
    geonameid,
    location
  });
};

export const trackGeolocationSuccess = (coordinates: { latitude: number; longitude: number }) => {
  trackEvent('geolocation_success', {
    latitude: Math.round(coordinates.latitude * 1000) / 1000, // Round to 3 decimal places for privacy
    longitude: Math.round(coordinates.longitude * 1000) / 1000
  });
};

export const trackGeolocationError = (errorCode: number, errorMessage: string) => {
  trackEvent('geolocation_error', {
    error_code: errorCode,
    error_message: errorMessage
  });
};

export const trackZipCodeSearch = (zipCode: string, resultCount: number) => {
  trackEvent('zip_code_search', {
    zip_code: zipCode,
    result_count: resultCount
  });
};

export const trackCitySearch = (cityName: string, resultCount: number) => {
  trackEvent('city_search', {
    city_name: cityName.toLowerCase(),
    result_count: resultCount
  });
};

export const trackParashaLinkClick = (parashaName: string, location: string) => {
  trackEvent('parasha_link_click', {
    parasha_name: parashaName,
    location: location
  });
};
