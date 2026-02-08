import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { en, de, fr, type TranslationKeys } from "./translations";

export type Language = "en" | "de" | "fr";

export const languageNames: Record<Language, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
};

export const languageFlags: Record<Language, string> = {
  en: "🇬🇧",
  de: "🇩🇪",
  fr: "🇫🇷",
};

const translations: Record<Language, TranslationKeys> = {
  en,
  de,
  fr,
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "influenceai-language";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === "en" || stored === "de" || stored === "fr")) {
      return stored as Language;
    }
    // Try to detect from browser
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "de" || browserLang === "fr") {
      return browserLang;
    }
    return "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  
  // Provide a fallback for portals/HMR edge cases where context may be undefined temporarily
  if (!context) {
    // Return a safe fallback with English translations
    return {
      language: "en",
      setLanguage: () => {},
      t: translations.en,
    };
  }
  return context;
};
