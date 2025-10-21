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
      lng: initialLng, // 👈 زبان اولیه از <html lang>
      load: "languageOnly", // fa-IR → fa
      supportedLngs: ["fa", "en"],
      fallbackLng: "fa",

      ns: ["common", "header"], // 👈 namespace header
      defaultNS: "common",

      backend: {
        projectId: process.env.NEXT_PUBLIC_LOCIZE_PROJECT_ID!,
        version: process.env.NEXT_PUBLIC_LOCIZE_VERSION || "latest",
      },

      // 👇 فقط همین دو منبع؛ navigator/localStorage را حذف کن
      detection: {
        order: ["cookie", "htmlTag"],
        caches: ["cookie"],
        lookupCookie: "lng",
      },

      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      // debug: true,
    });
}

export default i18next;
