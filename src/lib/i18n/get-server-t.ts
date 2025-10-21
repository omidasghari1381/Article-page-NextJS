import { cache } from "react";
import i18next, { type Lang } from "@/lib/i18n/i18n";
import { defaultNS } from "@/lib/i18n/settings";

export const getServerT = cache(
  async (lang: Lang, ns: string | string[] = defaultNS) => {
    await i18next.changeLanguage(lang);
    const need = Array.isArray(ns) ? ns : [ns];
    await i18next.loadNamespaces(need);
    return i18next.getFixedT(lang, need);
  }
);
