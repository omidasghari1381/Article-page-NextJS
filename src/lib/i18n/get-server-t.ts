// src/lib/i18n/i18n.server.ts
import { createInstance, type i18n as I18nInstance } from "i18next";
import LocizeBackend from "i18next-locize-backend";
import { cache } from "react";
import {
  defaultNS,
  fallbackLng,
  supportedLngs,
  type Lang,
} from "./settings";

const makeServerI18n = cache(async (lang: Lang): Promise<I18nInstance> => {
  const i18n = createInstance();
  await i18n
    .use(LocizeBackend)
    .init({
      lng: lang,
      fallbackLng,
      supportedLngs,
      ns: [defaultNS],
      defaultNS,
      backend: {
        projectId: process.env.LOCIZE_PROJECT_ID!,
        apiKey: process.env.LOCIZE_API_KEY,           // فقط سرور
        version: process.env.LOCIZE_VERSION || "latest",
        referenceLng: process.env.LOCIZE_REFERENCE_LNG,
      },
      interpolation: { escapeValue: false },
      saveMissing: !!process.env.LOCIZE_API_KEY,      // فقط سرور
      react: { useSuspense: false },
    });
  return i18n;
});

export async function getServerT(lang: Lang, ns: string | string[] = defaultNS) {
  const i18n = await makeServerI18n(lang);
  const need = Array.isArray(ns) ? ns : [ns];
  await i18n.loadNamespaces(need);
  return i18n.getFixedT(lang, need);
}