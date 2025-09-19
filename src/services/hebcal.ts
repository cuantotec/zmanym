// Hebcal API service for fetching Jewish calendar data

import { CacheService } from './cache';

export interface LocationData {
  geonameid: string;
  name: string;
  country: string;
  admin1?: string;
  admin2?: string;
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

export interface HebcalResponse {
  items: Array<{
    title: string;
    date: string;
    category: string;
    hebrew?: string;
  }>;
  location: {
    geo: string;
    city: string;
    country: string;
    tzid: string;
  };
}

class HebcalService {
  private baseUrl = '/api/hebcal';
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  private readonly CACHE_PREFIX = 'zmanym_cache_';

  // Search for location using our API route
  async searchLocation(query: string): Promise<LocationData[]> {
    console.log('🔍 Starting location search for:', query);
    
    try {
      const url = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
      console.log('🌐 Fetching URL:', url);
      
      const response = await fetch(url);
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('❌ Response not OK:', response.status, response.statusText);
        throw new Error(`Location search failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Raw response data:', data);
      
      // The response is already in our format
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Found', data.length, 'locations');
        data.forEach((location, index) => {
          console.log(`📍 Location ${index + 1}:`, location);
        });
        return data;
      }
      
      console.log('⚠️ No locations found in response');
      return [];
    } catch (error) {
      console.error('❌ Error searching location:', error);
      throw new Error('Failed to search for location');
    }
  }


  // Get geonameid from coordinates using our API route
  async getGeonameidFromCoords(lat: number, lng: number): Promise<string> {
    console.log('🌍 Getting geonameid for coordinates:', lat, lng);
    
    try {
      const url = `${this.baseUrl}/coords?lat=${lat}&lng=${lng}`;
      console.log('🌍 Fetching URL:', url);
      
      const response = await fetch(url);
      console.log('🌍 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('🌍 Response not OK:', response.status, response.statusText);
        throw new Error(`Geolocation lookup failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('🌍 Response data:', data);
      
      if (data.geonameid) {
        console.log('🌍 Got geonameid:', data.geonameid);
        return data.geonameid;
      }
      
      throw new Error('No geonameid found in response');
    } catch (error) {
      console.error('❌ Error getting geonameid from coordinates:', error);
      
      // Fallback: try to find location by searching nearby cities
      try {
        console.log('🌍 Trying fallback search...');
        const nearbyCities = await this.searchLocation(`${lat},${lng}`);
        if (nearbyCities.length > 0) {
          console.log('🌍 Fallback search successful:', nearbyCities[0]);
          return nearbyCities[0].geonameid;
        }
      } catch (fallbackError) {
        console.error('❌ Fallback search also failed:', fallbackError);
      }
      
      throw new Error('Failed to get location from coordinates');
    }
  }


  // Fetch Shabbat times for a location using our API route
  async getShabbatTimes(geonameid: string, locationName?: string): Promise<ZmanimData> {
    console.log('🕯️ HebcalService: getShabbatTimes called with geonameid:', geonameid);
    
    // Check cache first
    const cached = CacheService.getCachedZmanimData(geonameid);
    if (cached) {
      console.log('🕯️ HebcalService: Using cached data');
      return cached as ZmanimData;
    }

    try {
      const url = `${this.baseUrl}/shabbat?geonameid=${geonameid}`;
      console.log('🕯️ HebcalService: Fetching URL:', url);
      
      const response = await fetch(url);
      console.log('🕯️ HebcalService: Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('🕯️ HebcalService: Response not OK:', response.status, response.statusText);
        throw new Error(`Shabbat times fetch failed: ${response.status}`);
      }

      const zmanimData: ZmanimData = await response.json();
      console.log('🕯️ HebcalService: Got zmanim data:', zmanimData);
      
      // Cache the data with location info
      if (locationName) {
        CacheService.saveZmanimData(geonameid, locationName, zmanimData);
        console.log('🕯️ HebcalService: Cached zmanim data for', locationName);
      }
      
      return zmanimData;
    } catch (error) {
      console.error('❌ HebcalService: Error fetching Shabbat times:', error);
      throw new Error('Failed to fetch Shabbat times');
    }
  }


  // Cache management using localStorage
  private getCachedData(key: string): unknown | null {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < this.CACHE_DURATION) {
          return data;
        } else {
          // Remove expired cache
          localStorage.removeItem(this.CACHE_PREFIX + key);
        }
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }
    return null;
  }

  private setCachedData(key: string, data: unknown): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  // Clear all cache (useful for testing)
  clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp >= this.CACHE_DURATION) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }
}

export const hebcalService = new HebcalService();
