import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { TRANSLATIONS, Language } from "../data/translations";

export type { Language };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  getName: <
    T extends { name: string; gujaratiName?: string; hindiName?: string },
  >(
    item: T | null | undefined,
  ) => string;
  getDescription: <
    T extends {
      description?: string;
      gujaratiDescription?: string;
      hindiDescription?: string;
    },
  >(
    item: T | null | undefined,
  ) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app_language");
    if (saved === "gu" || saved === "hi" || saved === "en") {
      return saved;
    }
    return "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Strictly namespaced active dictionary for selected language to eliminate rendering flickers
  const activeDictionary = useMemo(() => {
    return TRANSLATIONS[language] || TRANSLATIONS["en"];
  }, [language]);

  const fallbackDictionary = TRANSLATIONS["en"];

  const t = useCallback(
    (key: string, fallback?: string): string => {
      if (activeDictionary && key in activeDictionary) {
        return activeDictionary[key];
      }
      if (fallbackDictionary && key in fallbackDictionary) {
        return fallbackDictionary[key];
      }
      return fallback || key;
    },
    [activeDictionary],
  );

  const getName = useCallback(
    <T extends { name: string; gujaratiName?: string; hindiName?: string }>(
      item: T | null | undefined,
    ): string => {
      if (!item) return "";
      if (
        language === "gu" &&
        item.gujaratiName &&
        item.gujaratiName.trim().length > 0
      )
        return item.gujaratiName;
      if (
        language === "hi" &&
        item.hindiName &&
        item.hindiName.trim().length > 0
      )
        return item.hindiName;
      return item.name;
    },
    [language],
  );

  const getDescription = useCallback(
    <
      T extends {
        description?: string;
        gujaratiDescription?: string;
        hindiDescription?: string;
      },
    >(
      item: T | null | undefined,
    ): string => {
      if (!item) return "";
      if (
        language === "gu" &&
        item.gujaratiDescription &&
        item.gujaratiDescription.trim().length > 0
      )
        return item.gujaratiDescription;
      if (
        language === "hi" &&
        item.hindiDescription &&
        item.hindiDescription.trim().length > 0
      )
        return item.hindiDescription;
      return item.description || "";
    },
    [language],
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      getName,
      getDescription,
    }),
    [language, setLanguage, t, getName, getDescription],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
