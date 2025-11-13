import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .init({
    resources: {},
    lng: "th",
    fallbackLng: "th",
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}.json",
    },
  });

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

// Load all languages
["th", "en", "zh"].forEach(loadLanguage);

export default i18n;
