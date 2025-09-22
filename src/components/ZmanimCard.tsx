'use client';

import { useState } from 'react';
import { ZmanimCardProps, PrayerModalState, PrayerType } from '@/types';
import PrayerModal from './PrayerModal';
import { trackPrayerModalOpen, trackCandleLightingClick, trackHavdalahClick, trackHolidayClick } from '@/utils/analytics';

export default function ZmanimCard({ location, zmanimData }: ZmanimCardProps) {
  const [prayerModal, setPrayerModal] = useState<PrayerModalState>({
    isOpen: false,
    type: 'candleLighting'
  });

  // Determine if we're in holiday mode
  const isHolidayMode = zmanimData.holidays && zmanimData.holidays.length > 0;
  const currentHoliday = isHolidayMode ? zmanimData.holidays[0] : null;

  const openPrayerModal = (type: PrayerType, holidayName?: string) => {
    setPrayerModal({
      isOpen: true,
      type,
      holidayName
    });
    
    // Track prayer modal opening
    trackPrayerModalOpen(type, holidayName);
  };

  const closePrayerModal = () => {
    setPrayerModal({
      isOpen: false,
      type: 'candleLighting'
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Main Zmanim Card */}
      <div className="bg-gray-800/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-600/30 dark:border-gray-500/30 p-4 sm:p-6 lg:p-8 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white dark:text-gray-100 mb-3">
            {isHolidayMode ? (currentHoliday?.title || 'Holiday') : 'This Shabbat'}
          </h2>
          <div className="space-y-2">
            <p className="text-lg text-gray-200 dark:text-gray-300 font-medium">
              {zmanimData.gregorianDate}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-sm text-gray-400 dark:text-gray-500">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm">{location}</span>
            </div>
          </div>
        </div>

        {/* Weekly Parsha - only show for Shabbat, not holidays */}
        {!isHolidayMode && (
          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-gray-200 dark:text-gray-300">
              Weekly Torah Portion: <span className="text-blue-400 dark:text-blue-400 font-bold">{zmanimData.parsha}</span>
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-2 italic">
              Press on anything to view prayer
            </p>
          </div>
        )}

        {/* Times Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Candle Lighting */}
          <div 
            className="bg-gradient-to-br from-orange-900/20 via-amber-900/20 to-yellow-900/20 dark:from-orange-900/30 dark:via-amber-900/30 dark:to-yellow-900/30 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-orange-700/30 dark:border-orange-600/30 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
            onClick={() => {
              trackCandleLightingClick(location, zmanimData.candleLighting);
              openPrayerModal('candleLighting');
            }}
          >
            {/* Responsive layout: stacked on mobile, side-by-side on desktop */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              {/* Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden flex-shrink-0">
                {/* Animated candle flame */}
                <div className="relative">
                  <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                    {/* Candle base */}
                    <rect x="9" y="10" width="6" height="10" rx="3" fill="currentColor" />
                    {/* Candle wick */}
                    <rect x="11.5" y="6" width="1" height="4" fill="currentColor" />
                    {/* Candle flame - outer */}
                    <path d="M12 2C13.5 2 14.5 3.5 14 5C13.5 6.5 12 7 12 7C12 7 10.5 6.5 10 5C9.5 3.5 10.5 2 12 2Z" fill="currentColor" />
                    {/* Candle flame - inner */}
                    <path d="M12 3C12.8 3 13.5 3.8 13.2 4.5C12.9 5.2 12 5.5 12 5.5C12 5.5 11.1 5.2 10.8 4.5C10.5 3.8 11.2 3 12 3Z" fill="currentColor" />
                  </svg>
                  {/* Animated flame overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
                      <div className="absolute inset-0 animate-flame">
                        <div className="w-full h-full bg-gradient-to-t from-yellow-300 to-orange-400 rounded-full opacity-80"></div>
                      </div>
                      <div className="absolute inset-0 animate-flicker" style={{ animationDelay: '0.5s' }}>
                        <div className="w-3/4 h-3/4 bg-gradient-to-t from-yellow-200 to-orange-300 rounded-full opacity-60"></div>
                      </div>
                      <div className="absolute inset-0 animate-pulse" style={{ animationDelay: '1s' }}>
                        <div className="w-1/2 h-1/2 bg-gradient-to-t from-yellow-100 to-orange-200 rounded-full opacity-40"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content column */}
              <div className="flex flex-col flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white dark:text-white mb-2">
                  Candle Lighting
                </h3>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-orange-400 dark:text-orange-400 mb-3">
                  {zmanimData.candleLighting}
                </p>
                <p className="text-sm text-gray-300 dark:text-gray-400 leading-relaxed group-hover:text-orange-300 dark:group-hover:text-orange-300 transition-colors">
                  {isHolidayMode ? 'Light candles for the holiday' : 'Light candles 18 minutes before sunset'}
                </p>
                <div className="mt-2 text-xs text-orange-400 dark:text-orange-400">
                  Click to view prayer
                </div>
              </div>
            </div>
          </div>

          {/* Havdalah */}
          <div 
            className="bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-blue-900/20 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-purple-700/30 dark:border-purple-600/30 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
            onClick={() => {
              trackHavdalahClick(location, zmanimData.havdalah);
              openPrayerModal('havdalah');
            }}
          >
            {/* Responsive layout: stacked on mobile, side-by-side on desktop */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              {/* Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden flex-shrink-0">
                {/* Animated havdalah candle flame */}
                <div className="relative">
                  <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                    {/* Candle base */}
                    <rect x="9" y="10" width="6" height="10" rx="3" fill="currentColor" />
                    {/* Candle wick */}
                    <rect x="11.5" y="6" width="1" height="4" fill="currentColor" />
                    {/* Candle flame - outer */}
                    <path d="M12 2C13.5 2 14.5 3.5 14 5C13.5 6.5 12 7 12 7C12 7 10.5 6.5 10 5C9.5 3.5 10.5 2 12 2Z" fill="currentColor" />
                    {/* Candle flame - inner */}
                    <path d="M12 3C12.8 3 13.5 3.8 13.2 4.5C12.9 5.2 12 5.5 12 5.5C12 5.5 11.1 5.2 10.8 4.5C10.5 3.8 11.2 3 12 3Z" fill="currentColor" />
                  </svg>
                  {/* Animated flame overlay with different timing for variety */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
                      <div className="absolute inset-0 animate-flame" style={{ animationDelay: '0.3s' }}>
                        <div className="w-full h-full bg-gradient-to-t from-purple-300 to-indigo-400 rounded-full opacity-70"></div>
                      </div>
                      <div className="absolute inset-0 animate-flicker" style={{ animationDelay: '0.8s' }}>
                        <div className="w-3/4 h-3/4 bg-gradient-to-t from-purple-200 to-indigo-300 rounded-full opacity-50"></div>
                      </div>
                      <div className="absolute inset-0 animate-pulse" style={{ animationDelay: '1.2s' }}>
                        <div className="w-1/2 h-1/2 bg-gradient-to-t from-purple-100 to-indigo-200 rounded-full opacity-40"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content column */}
              <div className="flex flex-col flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white dark:text-white mb-2">
                  Havdalah
                </h3>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-purple-400 dark:text-purple-400 mb-3">
                  {zmanimData.havdalah}
                </p>
                <p className="text-sm text-gray-300 dark:text-gray-400 leading-relaxed group-hover:text-purple-300 dark:group-hover:text-purple-300 transition-colors">
                  {isHolidayMode ? 'End of holiday' : 'End of Shabbat'}
                </p>
                <div className="mt-2 text-xs text-purple-400 dark:text-purple-400">
                  Click to view prayer
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Holidays Section */}
      {zmanimData.holidays && zmanimData.holidays.length > 0 && (
        <div className="bg-gray-800/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-600/50 dark:border-gray-500/50 p-6 sm:p-8 transform transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] mb-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white dark:text-white">
                Upcoming Holidays
              </h3>
              <p className="text-sm text-gray-300 dark:text-gray-400">
                Jewish holidays and special days
              </p>
            </div>
          </div>

          {/* Holidays List */}
          <div className="space-y-3">
            {zmanimData.holidays.map((holiday, index) => {
              // Parse the date string as local date to avoid timezone issues
              const [year, month, day] = holiday.date.split('-').map(Number);
              const holidayDate = new Date(year, month - 1, day); // month is 0-indexed
              const formattedDate = holidayDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              });
              
              
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                  onClick={() => {
                    trackHolidayClick(holiday.title, holiday.date);
                    openPrayerModal('holiday', holiday.title);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors">
                        {holiday.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {holiday.category}
                      </p>
                      {holiday.candleLighting && holiday.candleLighting.trim() !== '' && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                          Candle lighting: {holiday.candleLighting}
                        </p>
                      )}
                      <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                        Click to view prayer
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formattedDate}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {holidayDate.getFullYear()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional Info Card */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Important Notes
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Candle Lighting</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Light candles 18 minutes before sunset to ensure you don&apos;t violate Shabbat.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Havdalah</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Wait until you can see three stars in the sky before making Havdalah.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 sm:col-span-2 lg:col-span-1">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Accuracy</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Times are calculated for your specific location and may vary based on local customs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Modal */}
      <PrayerModal
        isOpen={prayerModal.isOpen}
        onClose={closePrayerModal}
        prayerType={prayerModal.type}
        holidayName={prayerModal.holidayName}
      />

    </div>
  );
}