'use client';

import { useState, useEffect } from 'react';
import { ZmanimCardProps, PrayerModalState, PrayerType } from '@/types';
import PrayerModal from './PrayerModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackPrayerModalOpen, trackCandleLightingClick, trackHavdalahClick, trackHolidayClick, trackParashaLinkClick } from '@/utils/analytics';

export default function ZmanimCard({ location, zmanimData }: ZmanimCardProps) {
  const { isRTL } = useLanguage();
  const [prayerModal, setPrayerModal] = useState<PrayerModalState>({
    isOpen: false,
    type: 'candleLighting'
  });
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Trigger highlight effect when component mounts
  useEffect(() => {
    setIsHighlighted(true);
    const timer = setTimeout(() => setIsHighlighted(false), 5000); // Highlight for 5 seconds
    return () => clearTimeout(timer);
  }, []);

  const openPrayerModal = (type: PrayerType, holidayName?: string) => {
    setPrayerModal({
      isOpen: true,
      type,
      holidayName
    });
    
    trackPrayerModalOpen(type, holidayName);
  };

  const closePrayerModal = () => {
    setPrayerModal({
      isOpen: false,
      type: 'candleLighting'
    });
  };

  // English text only for now
  const t = {
    thisShabbat: 'This Shabbat',
    candleLighting: 'Candle Lighting',
    havdalah: 'Havdalah',
    touchToViewPrayer: 'Touch to View Prayer',
    weeklyTorahPortion: 'Weekly Torah Portion'
  };

  return (
    <div className={`flex flex-col gap-4 animate-fade-in bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4`} dir={isRTL ? 'rtl' : 'ltr'} data-shabbat-card>
      {/* Scroll target - positioned before parasha name */}
      <div id="shabbat-card-start" className="scroll-mt-20"></div>
      {/* Shabbat Times - Root Properties */}
      <div className={`relative overflow-hidden backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-white/20 shadow-lg transition-all duration-500 ${
        isHighlighted 
          ? 'animate-highlight-glow border-blue-400/50' 
          : 'animate-pulse-glow'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-black/5"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-4 left-4 w-6 h-6 border border-amber-400/30 rounded-full"></div>
          <div className="absolute top-8 right-6 w-4 h-4 border border-orange-400/30 rounded-full"></div>
          <div className="absolute bottom-6 left-8 w-3 h-3 border border-amber-300/30 rounded-full"></div>
        </div>
        <div className="relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-wide mb-3">
              {zmanimData.parsha || t.thisShabbat}
            </h2>
            {zmanimData.parsha && (
              <a
                href={`https://hebcal.com/s/${zmanimData.parsha.toLowerCase().replace(/\s+/g, '-')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white/90 transition-all duration-200 hover:scale-105 transform group flex items-center justify-center gap-2 mb-3"
                title="View parasha on Hebcal"
                onClick={() => trackParashaLinkClick(zmanimData.parsha, location)}
              >
                <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium">Read Parasha</span>
              </a>
            )}
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto rounded-full"></div>
            <p className="text-white/70 text-sm mt-3">
              {zmanimData.gregorianDate}
            </p>
            <p className="text-white/70 text-sm">
              {location}
            </p>
          </div>
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-8">
            {/* Candle Lighting */}
            <div 
              className="flex items-center gap-3 sm:gap-4 cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => {
                trackCandleLightingClick(location, zmanimData.candleLighting);
                openPrayerModal('candleLighting');
              }}
            >
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400/20 to-orange-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-amber-400/30 shadow-lg">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="9" y="10" width="6" height="10" rx="3" fill="currentColor" />
                    <rect x="11.5" y="6" width="1" height="4" fill="currentColor" />
                    <path d="M12 2C13.5 2 14.5 3.5 14 5C13.5 6.5 12 7 12 7C12 7 10.5 6.5 10 5C9.5 3.5 10.5 2 12 2Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-sm -z-10"></div>
              </div>
              <div className="text-center">
                <div className="text-base sm:text-lg font-medium text-white/90 mb-2">{t.candleLighting}</div>
                <div className="text-lg sm:text-2xl lg:text-3xl font-semibold text-amber-300">
                  {zmanimData.candleLighting}
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="w-4 sm:w-px h-px sm:h-16 bg-gradient-to-r sm:bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

            {/* Havdalah */}
            <div 
              className="flex items-center gap-3 sm:gap-4 cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => {
                trackHavdalahClick(location, zmanimData.havdalah);
                openPrayerModal('havdalah');
              }}
            >
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400/20 to-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-orange-400/30 shadow-lg">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-300 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="9" y="10" width="6" height="10" rx="3" fill="currentColor" />
                    <rect x="11.5" y="6" width="1" height="4" fill="currentColor" />
                    <path d="M12 2C13.5 2 14.5 3.5 14 5C13.5 6.5 12 7 12 7C12 7 10.5 6.5 10 5C9.5 3.5 10.5 2 12 2Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-sm -z-10"></div>
              </div>
              <div className="text-center">
                <div className="text-base sm:text-lg font-medium text-white/90 mb-2">{t.havdalah}</div>
                <div className="text-lg sm:text-2xl lg:text-3xl font-semibold text-orange-300">
                  {zmanimData.havdalah}
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-6">
            <div className="text-xs text-white/60">{t.touchToViewPrayer}</div>
          </div>
        </div>
      </div>

      {/* Holidays Array - Only active/future events */}
      {(() => {
        // Filter out past holidays and only show active/future events
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
        
        const activeHolidays = zmanimData.holidays?.filter(holiday => {
          const holidayDate = new Date(holiday.date);
          holidayDate.setHours(0, 0, 0, 0);
          return holidayDate >= today;
        }) || [];

        if (activeHolidays.length === 0) return null;

        return (
          <div className="space-y-3">
            {/* First Holiday - Large */}
            <div 
              className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => {
                trackHolidayClick(activeHolidays[0].title, activeHolidays[0].date);
                openPrayerModal('holiday', activeHolidays[0].title);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {activeHolidays[0].title}
              </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {activeHolidays[0].category}
                    </p>
                    {activeHolidays[0].candleLighting && activeHolidays[0].candleLighting.trim() !== '' && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                        Candle lighting: {activeHolidays[0].candleLighting}
                      </p>
                    )}
            </div>
          </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(activeHolidays[0].date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activeHolidays[0].date).getFullYear()}
                  </p>
                </div>
              </div>
            </div>

            {/* Remaining Holidays - Smaller */}
            {activeHolidays.slice(1).map((holiday, index) => {
              const holidayDate = new Date(holiday.date);
              return (
                <div 
                  key={index + 1}
                  className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => {
                    trackHolidayClick(holiday.title, holiday.date);
                    openPrayerModal('holiday', holiday.title);
                  }}
                >
                  <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                        {holiday.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {holiday.category}
                      </p>
                      {holiday.candleLighting && holiday.candleLighting.trim() !== '' && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Candle lighting: {holiday.candleLighting}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {holidayDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {holidayDate.getFullYear()}
                    </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

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