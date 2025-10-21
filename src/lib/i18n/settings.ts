// src/lib/i18n/settings.ts
export const defaultNS = 'common';

export const languages = {
  fa: 'فارسی',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const fallbackLng: Lang = 'fa';