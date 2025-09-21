
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { db } from '../utils/db';

export type Theme = 'light' | 'dark';
export type AccentColor = 'sky' | 'emerald' | 'rose' | 'violet' | 'amber' | 'teal' | 'orange' | 'indigo';
export type BackgroundPattern = 'grid' | 'dots' | 'plus' | 'waves' | 'triangles' | 'checkerboard' | 'none';

interface AppearanceState {
  theme: Theme;
  accentColor: AccentColor;
  backgroundPattern: BackgroundPattern;
}

interface AppearanceContextType extends AppearanceState {
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  setBackgroundPattern: (pattern: BackgroundPattern) => void;
  toggleTheme: () => void;
  backgroundClass: string;
}

const defaultSettings: AppearanceState = {
  theme: 'dark',
  accentColor: 'sky',
  backgroundPattern: 'grid',
};

export const AppearanceContext = createContext<AppearanceContextType>({
  ...defaultSettings,
  setTheme: () => {},
  setAccentColor: () => {},
  setBackgroundPattern: () => {},
  toggleTheme: () => {},
  backgroundClass: '',
});

const patterns: Record<BackgroundPattern, string> = {
    grid: 'bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]',
    dots: 'bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:1rem_1rem]',
    plus: 'bg-[linear-gradient(#d1d5db_1px,transparent_1px),linear-gradient(to_right,#d1d5db_1px,transparent_1px)] dark:bg-[linear-gradient(#374151_1px,transparent_1px),linear-gradient(to_right,#374151_1px,transparent_1px)] bg-[size:1rem_1rem]',
    waves: `bg-size-[80px_40px] bg-[image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 40' width='80' height='40'%3e%3cpath d='M0 20 C20 0, 60 0, 80 20' stroke='%23d1d5db' fill='none' stroke-width='2'/%3e%3c/svg%3e")] dark:bg-[image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 40' width='80' height='40'%3e%3cpath d='M0 20 C20 0, 60 0, 80 20' stroke='%23374151' fill='none' stroke-width='2'/%3e%3c/svg%3e")]`,
    triangles: `bg-size-[50px_50px] bg-[image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 100 100'%3e%3cpath d='M0 100 L50 0 L100 100 Z' fill='%23e5e7eb'/%3e%3c/svg%3e")] dark:bg-[image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 100 100'%3e%3cpath d='M0 100 L50 0 L100 100 Z' fill='%231f2937'/%3e%3c/svg%3e")]`,
    checkerboard: 'bg-size-[20px_20px] bg-gray-200 dark:bg-gray-800 bg-[image:linear-gradient(45deg,#fff_25%,transparent_25%),linear-gradient(-45deg,#fff_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#fff_75%),linear-gradient(-45deg,transparent_75%,#fff_75%)] dark:bg-[image:linear-gradient(45deg,#1f2937_25%,transparent_25%),linear-gradient(-45deg,#1f2937_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1f2937_75%),linear-gradient(-45deg,transparent_75%,#1f2937_75%)]',
    none: ''
};

const accentColorHex: Record<AccentColor, { light: string; dark: string }> = {
    sky: { light: '#0ea5e9', dark: '#38bdf8' },
    emerald: { light: '#10b981', dark: '#34d399' },
    rose: { light: '#f43f5e', dark: '#fb7185' },
    violet: { light: '#8b5cf6', dark: '#a78bfa' },
    amber: { light: '#f59e0b', dark: '#fbbf24' },
    teal: { light: '#14b8a6', dark: '#2dd4bf' },
    orange: { light: '#f97316', dark: '#fb923c' },
    indigo: { light: '#6366f1', dark: '#818cf8' },
};


export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(defaultSettings.theme);
  const [accentColor, setAccentColorState] = useState<AccentColor>(defaultSettings.accentColor);
  const [backgroundPattern, setBackgroundPatternState] = useState<BackgroundPattern>(defaultSettings.backgroundPattern);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const storedTheme = await db.getSetting<Theme>('theme');
      const storedColor = await db.getSetting<AccentColor>('accentColor');
      const storedPattern = await db.getSetting<BackgroundPattern>('backgroundPattern');
      
      setThemeState(storedTheme || defaultSettings.theme);
      setAccentColorState(storedColor || defaultSettings.accentColor);
      setBackgroundPatternState(storedPattern || defaultSettings.backgroundPattern);
      setIsLoaded(true);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    db.setSetting('theme', theme);
  }, [theme, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    db.setSetting('accentColor', accentColor);
  }, [accentColor, isLoaded]);
  
  useEffect(() => {
    if (!isLoaded) return;
    db.setSetting('backgroundPattern', backgroundPattern);
  }, [backgroundPattern, isLoaded]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
        metaThemeColor.setAttribute("content", theme === 'dark' ? '#030712' : '#ffffff');
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const setAccentColor = (newColor: AccentColor) => setAccentColorState(newColor);
  const setBackgroundPattern = (newPattern: BackgroundPattern) => setBackgroundPatternState(newPattern);
  const toggleTheme = () => setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  
  const backgroundClass = patterns[backgroundPattern];

  const value = useMemo(() => ({
    theme,
    accentColor,
    backgroundPattern,
    setTheme,
    setAccentColor,
    setBackgroundPattern,
    toggleTheme,
    backgroundClass
  }), [theme, accentColor, backgroundPattern, backgroundClass]);

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = () => useContext(AppearanceContext);