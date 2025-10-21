import i18next, { type InitOptions } from "i18next";
import LocizeBackend from "i18next-locize-backend";
import { defaultNS, fallbackLng } from "./settings";


const initOptions: InitOptions = {
  lng: fallbackLng,
  fallbackLng,
  ns: [defaultNS],
  defaultNS,
  supportedLngs: ["fa", "en"],
  backend: {
    projectId: process.env.LOCIZE_PROJECT_ID!,
    apiKey: process.env.LOCIZE_API_KEY, 
    version: process.env.LOCIZE_VERSION || "latest",
    referenceLng: process.env.LOCIZE_REFERENCE_LNG, 
  },
  interpolation: { escapeValue: false },
  saveMissing: !!process.env.LOCIZE_API_KEY, 
  react: { useSuspense: false },
};

if (!i18next.isInitialized) {
  i18next.use(LocizeBackend).init(initOptions);
}

export default i18next;
