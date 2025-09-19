'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

export interface PrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerType: 'candleLighting' | 'havdalah' | 'holiday';
  holidayName?: string;
}

type Language = 'english' | 'englishPlain' | 'englishHebrew' | 'spanish' | 'hebrew';

export default function PrayerModal({ isOpen, onClose, prayerType, holidayName }: PrayerModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [prayerData, setPrayerData] = useState<PrayerContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Load prayer data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPrayerData();
    }
  }, [isOpen, prayerType, holidayName]);

  const loadPrayerData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/prayers.json');
      const data = await response.json();
      
      let prayerContent: PrayerContent;
      
      if (prayerType === 'holiday' && holidayName) {
        // Map holiday names to prayer data keys
        const holidayKey = getHolidayKey(holidayName);
        prayerContent = data.holidays[holidayKey] || data.holidays.roshHashana; // fallback
      } else {
        prayerContent = data[prayerType];
      }
      
      setPrayerData(prayerContent);
    } catch (error) {
      console.error('Error loading prayer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHolidayKey = (holidayName: string): string => {
    const name = holidayName.toLowerCase();
    if (name.includes('rosh') || name.includes('hashana')) return 'roshHashana';
    if (name.includes('yom kippur') || name.includes('kippur')) return 'yomKippur';
    if (name.includes('sukkot') || name.includes('sukot')) return 'sukkot';
    if (name.includes('hanukkah') || name.includes('chanukah')) return 'hanukkah';
    if (name.includes('passover') || name.includes('pesach')) return 'passover';
    return 'roshHashana'; // default fallback
  };

  const getLanguageLabel = (lang: Language): string => {
    switch (lang) {
      case 'english': return 'English';
      case 'englishPlain': return 'English (Plain)';
      case 'englishHebrew': return 'English + Hebrew';
      case 'spanish': return 'Español';
      case 'hebrew': return 'עברית';
    }
  };

  const isRTL = selectedLanguage === 'hebrew' || selectedLanguage === 'englishHebrew';

  const getTextSizeClass = () => {
    switch (textSize) {
      case 'small': return 'text-xl';
      case 'medium': return 'text-3xl';
      case 'large': return 'text-5xl';
      default: return 'text-3xl';
    }
  };

  const getTransliterationSizeClass = () => {
    switch (textSize) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-xl';
      case 'large': return 'text-2xl';
      default: return 'text-xl';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl transform overflow-hidden rounded-3xl bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shadow-2xl transition-all duration-300 scale-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {prayerData?.english.title || 'Prayer'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-3 text-gray-400 hover:bg-white/80 dark:hover:bg-gray-600/80 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-105"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Language Dropdown */}
          <div className="border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label htmlFor="language-select" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <span>🌐</span>
                  <span>Language:</span>
                </label>
                <select
                  id="language-select"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                  className="flex-1 max-w-xs px-4 py-3 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                >
                  {(['english', 'englishPlain', 'englishHebrew', 'spanish', 'hebrew'] as Language[]).map((lang) => (
                    <option key={lang} value={lang}>
                      {getLanguageLabel(lang)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Text Size Controls */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <span>🔤</span>
                  <span>Size:</span>
                </span>
                <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setTextSize('small')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                      textSize === 'small'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setTextSize('medium')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      textSize === 'medium'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setTextSize('large')}
                    className={`px-3 py-1.5 text-base font-medium rounded-md transition-all duration-200 ${
                      textSize === 'large'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    A
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : prayerData ? (
              <div className="space-y-8">
                {/* Prayer Text */}
                <div className={`text-center ${isRTL ? 'rtl' : 'ltr'}`}>
                  <div className={`${getTextSizeClass()} leading-relaxed text-gray-900 dark:text-white font-medium ${isRTL ? 'prayer-text hebrew' : 'prayer-text'} bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-inner`}>
                    {prayerData[selectedLanguage].text}
                  </div>
                </div>

                {/* Transliteration (for English + Hebrew) */}
                {selectedLanguage === 'englishHebrew' && prayerData[selectedLanguage].transliteration && (
                  <div className="text-center">
                    <div className={`${getTransliterationSizeClass()} text-gray-600 dark:text-gray-300 italic bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 shadow-sm`}>
                      {prayerData[selectedLanguage].transliteration}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {prayerData[selectedLanguage].instructions && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 shadow-lg border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white text-lg">💡</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Instructions
                        </h3>
                        <p className="text-base text-blue-800 dark:text-blue-200 leading-relaxed">
                          {prayerData[selectedLanguage].instructions}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Language Info */}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  Showing {getLanguageLabel(selectedLanguage)} version
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-lg">
                Prayer not found
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
