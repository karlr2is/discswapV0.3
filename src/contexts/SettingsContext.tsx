import { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'et';

type SettingsContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  // Theme is always dark — kept for backward compatibility but no-ops
  theme: 'dark';
  setTheme: (_theme: string) => void;
  toggleTheme: () => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'et';
  });

  // Always force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const value = {
    language,
    theme: 'dark' as const,
    setLanguage,
    setTheme: () => {},   // no-op
    toggleTheme: () => {}, // no-op
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
