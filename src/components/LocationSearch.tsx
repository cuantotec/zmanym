'use client';

import { useState, useEffect } from 'react';
import { hebcalService } from '@/services/hebcal';
import { LocationData, LocationSearchProps } from '@/types';
import { trackLocationSearch, trackLocationSelect, trackZipCodeSearch, trackCitySearch } from '@/utils/analytics';

export default function LocationSearch({ currentLocation, onLocationChange, onLocationSelect, loading, hasData, cachedZmanimData, onCacheData }: LocationSearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      await onLocationChange(searchQuery);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search for autocomplete
  useEffect(() => {
    console.log('🔍 LocationSearch: searchQuery changed to:', searchQuery);
    
    // Don't run autocomplete if we're selecting a suggestion
    if (isSelectingSuggestion) {
      console.log('🔍 LocationSearch: Skipping autocomplete - selecting suggestion');
      return;
    }
    
    // If data is loaded but user is typing a different query, allow autocomplete
    if (hasData && searchQuery === currentLocation) {
      console.log('🔍 LocationSearch: Skipping autocomplete - same location as current');
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      if (searchQuery.length > 2) {
        console.log('🔍 LocationSearch: Starting autocomplete search for:', searchQuery);
        setIsLoadingSuggestions(true);
        try {
          const results = await hebcalService.searchLocation(searchQuery);
          console.log('🔍 LocationSearch: Got results:', results);
          setSearchResults(results.slice(0, 5)); // Limit to 5 results
          setShowResults(results.length > 0);
          console.log('🔍 LocationSearch: Set showResults to:', results.length > 0);
          
          // Track search analytics
          trackLocationSearch(searchQuery, results.length);
          
          // Track specific search types
          const isZipCode = /^\d{5}(-\d{4})?$/.test(searchQuery);
          if (isZipCode) {
            trackZipCodeSearch(searchQuery, results.length);
          } else {
            trackCitySearch(searchQuery, results.length);
          }
          
          // Pre-fetch and cache data in the background (non-blocking)
          if (results.length > 0) {
            setTimeout(() => {
              const resultsToCache = results.slice(0, 3); // Cache first 3 results
              resultsToCache.forEach(async (result) => {
                if (!cachedZmanimData.has(result.geonameid)) {
                  console.log('🔍 LocationSearch: Background pre-fetching data for:', result.name);
                  try {
                    const zmanimData = await hebcalService.getShabbatTimes(result.geonameid, result.name, result.isZipCode, result.zipCode);
                    onCacheData(result.geonameid, zmanimData);
                    console.log('🔍 LocationSearch: Background cached data for:', result.name);
                  } catch (error) {
                    console.error('❌ LocationSearch: Error background pre-fetching data for:', result.name, error);
                  }
                }
              });
            }, 0); // Execute in next tick
          }
        } catch (error) {
          console.error('❌ LocationSearch: Error fetching suggestions:', error);
          setSearchResults([]);
          setShowResults(false);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        console.log('🔍 LocationSearch: Query too short, clearing results');
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isSelectingSuggestion, hasData, currentLocation]);

  // Reset selection flag when loading completes
  useEffect(() => {
    if (!loading && isSelectingSuggestion) {
      console.log('🔍 LocationSearch: Loading completed, resetting selection flag');
      setIsSelectingSuggestion(false);
    }
  }, [loading, isSelectingSuggestion]);

  // Hide dropdown when loading starts
  useEffect(() => {
    if (loading) {
      console.log('🔍 LocationSearch: Loading started, hiding dropdown');
      setShowResults(false);
    }
  }, [loading]);

  // Hide dropdown when data is loaded and search query matches current location
  useEffect(() => {
    if (hasData && searchQuery === currentLocation) {
      console.log('🔍 LocationSearch: Data loaded and query matches current location, hiding dropdown');
      setShowResults(false);
      setSearchResults([]);
    }
  }, [hasData, searchQuery, currentLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('🔍 LocationSearch: Input changed to:', value);
    setSearchQuery(value);
    // Reset the selection flag when user starts typing
    setIsSelectingSuggestion(false);
  };

  const handleSuggestionClick = (suggestion: LocationData) => {
    console.log('🔍 LocationSearch: Suggestion clicked:', suggestion);
    setIsSelectingSuggestion(true);
    setSearchQuery(suggestion.name);
    setShowResults(false);
    setSearchResults([]); // Clear the search results
    
    // Track location selection
    trackLocationSelect(suggestion.name, suggestion.isZipCode || false);
    
    // Use the already fetched location data instead of searching again
    onLocationSelect(suggestion);
    // Keep the flag true until loading is complete - don't reset it automatically
  };

  return (
    <div className="relative z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Location Search
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Find your city for accurate Shabbat times
            </p>
          </div>
        </div>
        
        {/* Current Location Display */}
        {currentLocation && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 shadow-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                {currentLocation}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative z-30">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search for your city..."
            className="block w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl leading-5 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              type="submit"
              disabled={loading || isSearching || !searchQuery.trim()}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mr-3 shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>

        {/* Search Suggestions Dropdown */}
        {showResults && (
          <div className="absolute z-50 mt-2 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl max-h-60 rounded-xl py-2 text-base ring-1 ring-gray-200 dark:ring-gray-700 overflow-auto focus:outline-none sm:text-sm border border-gray-200/50 dark:border-gray-700/50">
            {isLoadingSuggestions ? (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading suggestions...
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="cursor-pointer select-none relative py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150 rounded-lg mx-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{suggestion.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {suggestion.admin1 && suggestion.admin2 
                            ? `${suggestion.admin2}, ${suggestion.admin1}` 
                            : suggestion.admin1 || suggestion.admin2 || suggestion.country}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {suggestion.country}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                No locations found
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
