// src/lib/i18n/i18n.client.ts
"use client";

import i18next from "i18next";
import LocizeBackend from "i18next-locize-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { clampLang, defaultNS, fallbackLng, supportedLngs } from "./settings";

const initialLng =
  typeof document !== "undefined" && document.documentElement.lang
    ? clampLang(document.documentElement.lang)
    : fallbackLng;

if (!i18next.isInitialized) {
  i18next
    .use(LocizeBackend)
    .use(LanguageDetector) 
    .use(initReactI18next)
    .init({
      lng: initialLng,
      load: "languageOnly",
      supportedLngs,
      fallbackLng,
      defaultNS,
      fallbackNS: defaultNS,
      backend: {
        projectId: process.env.NEXT_PUBLIC_LOCIZE_PROJECT_ID!,
        version: process.env.NEXT_PUBLIC_LOCIZE_VERSION || "latest",
      },
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
}

export default i18next;