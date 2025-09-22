'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  storageKey = 'zmanym-theme'
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Resolve theme based on current setting
  const resolveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      
      // Also set the data-theme attribute for better compatibility
      root.setAttribute('data-theme', newTheme);
      
      // For Tailwind dark mode, we need to add/remove the 'dark' class
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Load theme from localStorage
    const stored = localStorage.getItem(storageKey) as Theme;
    const initialTheme = (stored && ['light', 'dark', 'system'].includes(stored)) ? stored : defaultTheme;
    
    setTheme(initialTheme);
    const initialResolvedTheme = resolveTheme(initialTheme);
    setResolvedTheme(initialResolvedTheme);
    applyTheme(initialResolvedTheme);
  }, [defaultTheme, storageKey]);

  // Update resolved theme when theme changes
  useEffect(() => {
    if (!mounted) return;
    
    const newResolvedTheme = resolveTheme(theme);
    setResolvedTheme(newResolvedTheme);
    applyTheme(newResolvedTheme);
  }, [theme, mounted]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (!mounted || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newResolvedTheme = getSystemTheme();
      setResolvedTheme(newResolvedTheme);
      applyTheme(newResolvedTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  // Save theme to localStorage when it changes
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme);
    }
  };

  const value = {
    theme,
    setTheme: handleSetTheme,
    resolvedTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
