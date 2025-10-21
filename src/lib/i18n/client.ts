"use client";

import i18next from "i18next";
import LocizeBackend from "i18next-locize-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const initialLng =
  typeof document !== "undefined" && document.documentElement.lang
    ? (document.documentElement.lang as "fa" | "en")
    : "fa";

if (!i18next.isInitialized) {
  i18next
    .use(LocizeBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
.init({
  lng: initialLng,
  load: "languageOnly",
  supportedLngs: ["fa","en"],
  fallbackLng: "fa",
  defaultNS: "common",
  fallbackNS: "common",
  backend: {
    projectId: process.env.NEXT_PUBLIC_LOCIZE_PROJECT_ID!,
    version: process.env.NEXT_PUBLIC_LOCIZE_VERSION || "latest",
  },
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});
}

export default i18next;
