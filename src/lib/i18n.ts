import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { setAutoTranslateLanguage } from "@/lib/autoTranslate";

// Load translations dynamically
const loadLanguage = async (lang: string) => {
  try {
    const response = await fetch(`/locales/${lang}.json`);
    const translations = await response.json();
    i18n.addResourceBundle(lang, "translation", translations, true, true);
  } catch (error) {
    console.error(`Failed to load language ${lang}:`, error);
  }
};

// Initialize i18n and load all languages
export const initializeI18n = async () => {
  await i18n
    .use(initReactI18next)
    .init({
      resources: {},
      lng: "th",
      fallbackLng: "th",
      interpolation: {
        escapeValue: false,
      },
    });

  // Load all languages
  await Promise.all(["th", "en", "zh", "ja"].map(loadLanguage));

  // Hook auto-translate to language changes
  i18n.on("languageChanged", (lng) => {
    setAutoTranslateLanguage(lng);
  });

  // Apply for initial language (in case it's persisted as non-Thai elsewhere)
  setAutoTranslateLanguage(i18n.language);

  return i18n;
};

export default i18n;
