'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'he';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Always use English for now
  useEffect(() => {
    setLanguageState('en');
  }, []);

  const setLanguage = (newLanguage: Language) => {
    // Only allow English for now
    if (newLanguage === 'en') {
      setLanguageState(newLanguage);
      localStorage.setItem('zmanym_language', newLanguage);
    }
  };

  const isRTL = false; // Always LTR for now

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
