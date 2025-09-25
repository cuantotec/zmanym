'use client';

import React, { useState, useEffect } from 'react';
import { DailyZmanimData } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface DailyZmanimCardProps {
  dailyZmanimData: DailyZmanimData;
  location: string;
}

interface ZmanimItem {
  key: keyof DailyZmanimData['times'];
  label: string;
  description: string;
  category: 'morning' | 'prayer' | 'day' | 'evening' | 'night';
}

const zmanimItems: ZmanimItem[] = [
  // Morning times
  { key: 'alotHaShachar', label: 'Dawn', description: '72 minutes as 16.1 degrees', category: 'morning' },
  { key: 'misheyakir', label: 'Earliest talis & tefillin', description: 'Sun is 11.5° below horizon', category: 'morning' },
  { key: 'misheyakirMachmir', label: 'Earliest talis & tefillin (Machmir)', description: 'Sun is 10.2° below horizon', category: 'morning' },
  { key: 'dawn', label: 'Civil Dawn', description: 'Sun is 6° below horizon', category: 'morning' },
  { key: 'sunrise', label: 'Sunrise', description: 'Level region at sea level', category: 'morning' },
  
  // Prayer times
  { key: 'sofZmanShmaMGA', label: 'Latest shema Magen Avraham', description: 'Using 72 minutes as 16.1 degrees', category: 'prayer' },
  { key: 'sofZmanShma', label: 'Latest shema Gra & Baal HaTanya', description: 'Sunrise plus 3 halachic hours', category: 'prayer' },
  { key: 'sofZmanTfillaMGA', label: 'Latest shacharis Magen Avraham', description: 'Sunrise plus 4 halachic hours', category: 'prayer' },
  { key: 'sofZmanTfilla', label: 'Latest shacharis Gra & Baal HaTanya', description: 'Sunrise plus 4 halachic hours', category: 'prayer' },
  
  // Day times
  { key: 'chatzot', label: 'Midday', description: 'Sunrise plus 6 halachic hours', category: 'day' },
  { key: 'minchaGedola', label: 'Earliest mincha', description: 'Lechumra', category: 'day' },
  { key: 'minchaKetana', label: 'Preferable mincha', description: 'Sunrise plus 9.5 halachic hours', category: 'day' },
  { key: 'plagHaMincha', label: 'Plag hamincha', description: 'Gra & Baal HaTanya', category: 'day' },
  
  // Evening times
  { key: 'sunset', label: 'Sunset', description: 'Level region at sea level', category: 'evening' },
  { key: 'dusk', label: 'Civil Dusk', description: 'Sun is 6° below horizon', category: 'evening' },
  { key: 'beinHaShmashos', label: 'Bein Hashemashot', description: '13.5 minutes prior to tzeit', category: 'evening' },
  
  // Night times
  { key: 'tzeit7083deg', label: 'Nightfall - 3 stars emerge', description: '36 minutes as degrees', category: 'night' },
  { key: 'tzeit85deg', label: 'Nightfall (3 small stars)', description: 'Sun 8.5° below horizon', category: 'night' },
  { key: 'tzeit42min', label: 'Nightfall (42 minutes)', description: 'Fixed 42 minutes after sunset', category: 'night' },
  { key: 'tzeit50min', label: 'Nightfall (50 minutes)', description: 'Fixed 50 minutes after sunset', category: 'night' },
  { key: 'tzeit72min', label: 'Nightfall - 72 minutes', description: 'Fixed 72 minutes after sunset', category: 'night' },
];


const categoryIcons = {
  morning: '🌅',
  prayer: '🙏',
  day: '☀️',
  evening: '🌇',
  night: '🌙',
};

export default function DailyZmanimCard({ dailyZmanimData, location }: DailyZmanimCardProps) {
  const { isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    // Trigger highlight animation on mount
    setIsHighlighted(true);
    const timer = setTimeout(() => setIsHighlighted(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const categories = ['all', ...Array.from(new Set(zmanimItems.map(item => item.category)))];
  
  const filteredItems = selectedCategory === 'all' 
    ? zmanimItems 
    : zmanimItems.filter(item => item.category === selectedCategory);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div 
      className="w-full max-w-5xl mx-auto p-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Daily Zmanim
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {formatDate(dailyZmanimData.date)} • {location}
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-blue-600 text-white border border-blue-700 shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
            }`}
          >
            {category === 'all' ? 'All' : categoryIcons[category as keyof typeof categoryIcons]}
          </button>
        ))}
      </div>

      {/* Zmanim Table */}
      <div 
        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 transition-all duration-500 shadow-xl ${
          isHighlighted ? 'ring-4 ring-blue-500/50' : ''
        }`}
      >
        <div className="space-y-1">
          {filteredItems.map((item) => {
            const time = dailyZmanimData.times[item.key];
            
            return (
              <div
                key={item.key}
                className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 group border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-lg">
                    {categoryIcons[item.category]}
                  </span>
                  <div className="flex-1">
                    <div className="text-gray-900 dark:text-white font-semibold text-sm">
                      {item.label}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">
                      {item.description}
                    </div>
                  </div>
                </div>
                <div className={`font-mono text-sm font-bold px-3 py-1 rounded ${
                  item.category === 'morning' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200' :
                  item.category === 'prayer' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                  item.category === 'day' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                  item.category === 'evening' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                  'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                }`}>
                  {time}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            Data provided by <a href="https://hebcal.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 underline">Hebcal.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
