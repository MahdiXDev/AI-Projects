import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { db } from '../utils/db';

export type Theme = 'light' | 'dark';
export type AccentColor = 'sky' | 'emerald' | 'rose' | 'violet' | 'amber' | 'teal' | 'orange' | 'indigo';
export type BackgroundPattern = 'grid' | 'dots' | 'waves' | 'triangles' | 'checkerboard' | 'none';

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

const patterns: Record<BackgroundPattern, { light: string; dark: string; }> = {
    grid: {
        light: 'bg-[size:4rem_4rem] bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)]',
        dark: 'dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]'
    },
    dots: {
        light: 'bg-[size:1rem_1rem] bg-[radial-gradient(#d1d5db_1px,transparent_1px)]',
        dark: 'dark:bg-[radial-gradient(#374151_1px,transparent_1px)]'
    },
    waves: {
        light: `bg-[size:80px_40px] bg-[image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA4MCA0MCcgd2lkdGg9JzgwJyBoZWlnaHQ9JzQwJz48cGF0aCBkPSdNMCAyMCBDMjAgMCwgNjAgMCwgODAgMjAnIHN0cm9rZT0nI2QxZDVkYicgZmlsbD0nbm9uZScgc3Ryb2tlLXdpZHRoPScyJy8+PC9zdmc+)]`,
        dark: `dark:bg-[image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA4MCA0MCcgd2lkdGg9JzgwJyBoZWlnaHQ9JzQwJz48cGF0aCBkPSdNMCAyMCBDMjAgMCwgNjAgMCwgODAgMjAnIHN0cm9rZT0nIzM3NDE1MScgZmlsbD0nbm9uZScgc3Ryb2tlLXdpZHRoPScyJy8+PC9zdmc+)]`
    },
    triangles: {
        light: `bg-[size:50px_50px] bg-[image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc1MCcgaGVpZ2h0PSc1MCcgdmlld0JveD0nMCAwIDEwMCAxMDAnPjxwYXRoIGQ9J00wIDEwMCBMNTAgMCBMMTAwIDEwMCBaJyBmaWxsPScjZTVlN2ViJy8+PC9zdmc+)]`,
        dark: `dark:bg-[image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc1MCcgaGVpZ2h0PSc1MCcgdmlld0JveD0nMCAwIDEwMCAxMDAnPjxwYXRoIGQ9J00wIDEwMCBMNTAgMCBMMTAwIDEwMCBaJyBmaWxsPScjMWYyOTM3Jy8+PC9zdmc+)]`
    },
    checkerboard: {
        light: 'bg-[size:20px_20px] bg-[image:linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)]',
        dark: 'dark:bg-[image:linear-gradient(45deg,#1f2937_25%,transparent_25%),linear-gradient(-45deg,#1f2937_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1f2937_75%),linear-gradient(-45deg,transparent_75%,#1f2937_75%)]'
    },
    none: { light: '', dark: '' }
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
  
  const backgroundClass = useMemo(() => {
    const pattern = patterns[backgroundPattern];
    return `${pattern.light} ${pattern.dark}`;
  }, [backgroundPattern]);

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