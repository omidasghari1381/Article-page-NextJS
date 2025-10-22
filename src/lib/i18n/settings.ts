// src/lib/i18n/settings.ts
export const languages = {
  fa: "فارسی",
  en: "English",
} as const;

export type Lang = keyof typeof languages;

export const supportedLngs: Lang[] = ["fa", "en"];
export const fallbackLng: Lang = "fa";
export const defaultNS = "common";

export const allNamespaces = [defaultNS, "header", "sidebar"] as const;

export function clampLang(v: unknown): Lang {
  return v === "en" ? "en" : "fa";
}