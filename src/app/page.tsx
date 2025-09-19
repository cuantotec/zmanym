'use client';

import { useState, useEffect } from 'react';
import LocationSearch from '@/components/LocationSearch';
import ZmanimCard from '@/components/ZmanimCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { hebcalService, ZmanimData, LocationData } from '@/services/hebcal';
import { locationService, LocationInfo } from '@/services/location';
import { createAppError, AppError } from '@/utils/errorHandler';

export default function Home() {
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [appError, setAppError] = useState<AppError | null>(null);
  const [zmanimData, setZmanimData] = useState<ZmanimData | null>(null);
  const [geonameid, setGeonameid] = useState<string>('');
  const [isDefaultLocation, setIsDefaultLocation] = useState<boolean>(false);
  const [cachedZmanimData, setCachedZmanimData] = useState<Map<string, ZmanimData>>(new Map());

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log geonameid changes for debugging
  useEffect(() => {
    if (geonameid) {
      console.log('🏠 Main App: geonameid changed to:', geonameid);
    }
  }, [geonameid]);

  const initializeApp = async () => {
    console.log('🏠 Main App: Initializing app...');
    
    try {
      setLoading(true);
      setError('');
      setAppError(null);

      // Check if we have a saved location
      const savedLocation = locationService.getSavedLocation();
      console.log('🏠 Main App: Saved location:', savedLocation);

      if (savedLocation && savedLocation.geonameid) {
        console.log('🏠 Main App: Using saved location');
        setLocation(savedLocation.name);
        setGeonameid(savedLocation.geonameid);
        setIsDefaultLocation(false);
        await fetchZmanimData(savedLocation.geonameid, savedLocation.name, savedLocation.isZipCode || false, savedLocation.zipCode);
        return;
      }

      // No saved location - show empty state
      console.log('🏠 Main App: No saved location found');
      setLocation('');
      setGeonameid('');
      setIsDefaultLocation(false);
      setZmanimData(null);
    } catch (err) {
      console.error('🏠 Main App: Error initializing app:', err);
      const error = createAppError(err, 'initializing app');
      setAppError(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchZmanimData = async (geonameid: string, locationName?: string, isZipCode?: boolean, zipCode?: string) => {
    console.log('🏠 Main App: Fetching zmanim data for geonameid:', geonameid, 'location:', locationName, 'isZipCode:', isZipCode, 'zipCode:', zipCode);
    
    try {
      const data = await hebcalService.getShabbatTimes(geonameid, locationName, isZipCode, zipCode);
      console.log('🏠 Main App: Got zmanim data:', data);
      
      // Cache the data for future use
      setCachedZmanimData(prev => {
        const newCache = new Map(prev);
        newCache.set(geonameid, data);
        console.log('🏠 Main App: Cached zmanim data for geonameid:', geonameid);
        return newCache;
      });
      
      setZmanimData(data);
      setError('');
      setAppError(null);
    } catch (err) {
      console.error('🕯️ Main App: Error fetching zmanim data:', err);
      const error = createAppError(err, 'fetching zmanim data');
      throw error;
    }
  };

  const handleLocationChange = async (newLocation: string) => {
    console.log('🏠 Main App: handleLocationChange called with:', newLocation);
    
    try {
      setLoading(true);
      setError('');
      setAppError(null);

      // Search for the location
      console.log('🏠 Main App: Searching for location...');
      const locations = await hebcalService.searchLocation(newLocation);
      console.log('🏠 Main App: Search returned locations:', locations);
      
      if (locations.length === 0) {
        console.log('🏠 Main App: No locations found');
        throw new Error('Location not found. Please try a different search term.');
      }

      const selectedLocation = locations[0];
      console.log('🏠 Main App: Selected location:', selectedLocation);
      
      setLocation(selectedLocation.name);
      setGeonameid(selectedLocation.geonameid);
      setIsDefaultLocation(false); // Reset default location flag

      // Save the new location
      const locationInfo: LocationInfo = {
        name: selectedLocation.name,
        coordinates: { latitude: 0, longitude: 0 }, // Not available from search
        geonameid: selectedLocation.geonameid
      };
      locationService.saveLocation(locationInfo);
      console.log('🏠 Main App: Saved location info:', locationInfo);

      // Check if we already have cached data for this location
      if (cachedZmanimData.has(selectedLocation.geonameid)) {
        console.log('🏠 Main App: Using cached zmanim data for:', selectedLocation.geonameid);
        const cachedData = cachedZmanimData.get(selectedLocation.geonameid)!;
        setZmanimData(cachedData);
        setError('');
        setAppError(null);
      } else {
        console.log('🏠 Main App: Fetching zmanim data for geonameid:', selectedLocation.geonameid);
        await fetchZmanimData(selectedLocation.geonameid, selectedLocation.name, selectedLocation.isZipCode, selectedLocation.zipCode);
      }
    } catch (err) {
      console.error('🏠 Main App: Error in handleLocationChange:', err);
      const error = createAppError(err, 'changing location');
      setAppError(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = async (locationData: LocationData) => {
    console.log('🏠 Main App: handleLocationSelect called with:', locationData);
    
    try {
      setLoading(true);
      setError('');
      setAppError(null);

      // Use the already fetched location data - no need to search again!
      console.log('🏠 Main App: Using pre-fetched location data');
      
      setLocation(locationData.name);
      setGeonameid(locationData.geonameid);
      setIsDefaultLocation(false); // Reset default location flag

      // Save the new location
      const locationInfo: LocationInfo = {
        name: locationData.name,
        coordinates: { latitude: 0, longitude: 0 }, // Not available from search
        geonameid: locationData.geonameid
      };
      locationService.saveLocation(locationInfo);
      console.log('🏠 Main App: Saved location info:', locationInfo);

      // Check if we already have cached data for this location
      if (cachedZmanimData.has(locationData.geonameid)) {
        console.log('🏠 Main App: Using cached zmanim data for:', locationData.geonameid);
        const cachedData = cachedZmanimData.get(locationData.geonameid)!;
        setZmanimData(cachedData);
        setError('');
        setAppError(null);
      } else {
        console.log('🏠 Main App: Fetching zmanim data for geonameid:', locationData.geonameid);
        await fetchZmanimData(locationData.geonameid, locationData.name, locationData.isZipCode, locationData.zipCode);
      }
    } catch (err) {
      console.error('🏠 Main App: Error in handleLocationSelect:', err);
      const error = createAppError(err, 'selecting location');
      setAppError(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 sm:py-6">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Zmanym
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Shabbat Times Made Simple
                </p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Real-time updates</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Location Search */}
        <div className="mb-8 sm:mb-12">
          <LocationSearch 
            currentLocation={location}
            onLocationChange={handleLocationChange}
            onLocationSelect={handleLocationSelect}
            loading={loading}
            hasData={!!zmanimData}
            cachedZmanimData={cachedZmanimData}
            onCacheData={(geonameid, data) => {
              setCachedZmanimData(prev => {
                const newCache = new Map(prev);
                newCache.set(geonameid, data);
                return newCache;
              });
            }}
          />
        </div>



        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center py-16 sm:py-24">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <ErrorMessage 
              message={error} 
              error={appError}
              onRetry={() => initializeApp()}
            />
          ) : zmanimData ? (
            <ZmanimCard 
              location={location}
              zmanimData={zmanimData}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome to Zmanym
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Search for your city above to get accurate Shabbat candle lighting and Havdalah times for your location.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Start by searching for your city</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 mt-16 sm:mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {/* Brand Section */}
            <div className="sm:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">Zmanym</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Accurate Shabbat times for Jewish communities across the United States.
              </p>
            </div>

            {/* Features Section */}
            <div className="sm:col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Real-time updates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>US locations only</span>
          </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Mobile responsive</span>
          </li>
              </ul>
            </div>

            {/* Data Source Section */}
            <div className="sm:col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Data Source</h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Powered by <span className="font-medium text-blue-600 dark:text-blue-400">Hebcal API</span>
                </p>
                <p className="text-xs">
                  Data provided for educational and religious purposes. Times are calculated based on your selected location.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 mb-6">
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  © 2025 Zmanym
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  All rights reserved
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-red-500">❤️</span>
                <span className="font-medium">Made with love for the Jewish community</span>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Developed With Love By
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-base font-bold text-gray-800 dark:text-gray-200">
                    Eliran Yihye
                  </span>
                  <span className="text-gray-400 dark:text-gray-600">|</span>
                  <a 
                    href="https://cuantotec.com" 
            target="_blank"
            rel="noopener noreferrer"
                    className="text-base font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 hover:underline decoration-2 underline-offset-2"
                  >
                    Cuanto Technologies
          </a>
        </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Building innovative solutions for the modern world
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}