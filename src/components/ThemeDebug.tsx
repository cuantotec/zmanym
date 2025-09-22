'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';

export function ThemeDebug() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [htmlClasses, setHtmlClasses] = useState('N/A');
  const [dataTheme, setDataTheme] = useState('N/A');

  useEffect(() => {
    setMounted(true);
    setHtmlClasses(document.documentElement.className);
    setDataTheme(document.documentElement.getAttribute('data-theme') || 'N/A');
  }, []);

  if (!mounted) {
    return (
      <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
        <div>Loading debug info...</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div>Theme: {theme}</div>
      <div>Resolved: {resolvedTheme}</div>
      <div>HTML classes: {htmlClasses}</div>
      <div>Data theme: {dataTheme}</div>
      <div className="mt-2">
        <button 
          onClick={() => setTheme('light')}
          className="mr-2 px-2 py-1 bg-blue-500 rounded text-xs"
        >
          Light
        </button>
        <button 
          onClick={() => setTheme('dark')}
          className="mr-2 px-2 py-1 bg-blue-500 rounded text-xs"
        >
          Dark
        </button>
        <button 
          onClick={() => setTheme('system')}
          className="px-2 py-1 bg-blue-500 rounded text-xs"
        >
          System
        </button>
      </div>
      <div className="mt-2">
        <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-2 rounded border border-gray-300 dark:border-gray-600">
          Test Element
        </div>
      </div>
    </div>
  );
}
