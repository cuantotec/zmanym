'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50">
        <span className="text-lg">☀️</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
          Loading...
        </span>
      </div>
    );
  }

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ] as const;

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
        aria-label="Toggle theme"
      >
        <span className="text-lg">{currentTheme.icon}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
          {currentTheme.label}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-lg z-20 overflow-hidden">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
                  theme === themeOption.value 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-lg">{themeOption.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{themeOption.label}</div>
                  {themeOption.value === 'system' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {resolvedTheme === 'dark' ? 'Dark mode' : 'Light mode'}
                    </div>
                  )}
                </div>
                {theme === themeOption.value && (
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Alternative compact toggle for smaller spaces
export function ThemeToggleCompact() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50">
        <span className="text-lg">☀️</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
          Loading...
        </span>
      </div>
    );
  }

  const getIcon = () => {
    if (theme === 'system') {
      return resolvedTheme === 'dark' ? '🌙' : '☀️';
    }
    return theme === 'dark' ? '🌙' : '☀️';
  };

  const getLabel = () => {
    if (theme === 'system') {
      return resolvedTheme === 'dark' ? 'Dark' : 'Light';
    }
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
      aria-label={`Current theme: ${getLabel()}. Click to cycle themes.`}
      title={`Current theme: ${getLabel()}. Click to cycle themes.`}
    >
      <span className="text-lg">{getIcon()}</span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
        {getLabel()}
      </span>
    </button>
  );
}
