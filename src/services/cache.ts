// Cache service for storing Shabbat times and other data in localStorage

import { ZmanimData, CachedZmanimData } from '@/types';

export class CacheService {
  private static readonly ZMANIM_CACHE_KEY = 'zmanym_zmanim_cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Save zmanim data to cache
  static saveZmanimData(geonameid: string, location: string, zmanimData: ZmanimData): void {
    try {
      const cachedData: CachedZmanimData = {
        data: zmanimData,
        timestamp: Date.now(),
        geonameid,
        location
      };
      
      localStorage.setItem(this.ZMANIM_CACHE_KEY, JSON.stringify(cachedData));
      console.log('💾 Cache: Saved zmanim data for', location, 'at', new Date().toISOString());
    } catch (error) {
      console.error('❌ Cache: Error saving zmanim data:', error);
    }
  }

  // Get cached zmanim data
  static getCachedZmanimData(geonameid: string): ZmanimData | null {
    try {
      const cached = localStorage.getItem(this.ZMANIM_CACHE_KEY);
      if (!cached) {
        console.log('💾 Cache: No cached data found');
        return null;
      }

      const cachedData: CachedZmanimData = JSON.parse(cached);
      
      // Check if cache is for the same location
      if (cachedData.geonameid !== geonameid) {
        console.log('💾 Cache: Cached data is for different location');
        return null;
      }

      // Check if cache is still valid (within 24 hours)
      const now = Date.now();
      const cacheAge = now - cachedData.timestamp;
      
      if (cacheAge > this.CACHE_DURATION) {
        console.log('💾 Cache: Cached data is expired (age:', Math.round(cacheAge / (60 * 60 * 1000)), 'hours)');
        this.clearZmanimCache();
        return null;
      }

      console.log('💾 Cache: Using cached data for', cachedData.location, '(age:', Math.round(cacheAge / (60 * 1000)), 'minutes)');
      return cachedData.data;
    } catch (error) {
      console.error('❌ Cache: Error getting cached zmanim data:', error);
      return null;
    }
  }

  // Clear zmanim cache
  static clearZmanimCache(): void {
    try {
      localStorage.removeItem(this.ZMANIM_CACHE_KEY);
      console.log('💾 Cache: Cleared zmanim cache');
    } catch (error) {
      console.error('❌ Cache: Error clearing zmanim cache:', error);
    }
  }

  // Check if we have valid cached data for a location
  static hasValidCache(geonameid: string): boolean {
    const cached = this.getCachedZmanimData(geonameid);
    return cached !== null;
  }

  // Get cache info for debugging
  static getCacheInfo(): { hasCache: boolean; age?: number; location?: string } {
    try {
      const cached = localStorage.getItem(this.ZMANIM_CACHE_KEY);
      if (!cached) {
        return { hasCache: false };
      }

      const cachedData: CachedZmanimData = JSON.parse(cached);
      const age = Math.round((Date.now() - cachedData.timestamp) / (60 * 1000)); // age in minutes
      
      return {
        hasCache: true,
        age,
        location: cachedData.location
      };
    } catch (error) {
      console.error('❌ Cache: Error getting cache info:', error);
      return { hasCache: false };
    }
  }
}
