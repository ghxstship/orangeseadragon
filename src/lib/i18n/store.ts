"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LanguageCode, DEFAULT_LANGUAGE, getLanguageByCode } from "./types";

interface LanguageState {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  getDirection: () => "ltr" | "rtl";
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language: LanguageCode) => {
        set({ language });
        if (typeof document !== "undefined") {
          const lang = getLanguageByCode(language);
          document.documentElement.lang = language;
          document.documentElement.dir = lang?.direction ?? "ltr";
        }
      },
      getDirection: () => {
        const lang = getLanguageByCode(get().language);
        return lang?.direction ?? "ltr";
      },
    }),
    {
      name: "atlvs-language",
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          const lang = getLanguageByCode(state.language);
          document.documentElement.lang = state.language;
          document.documentElement.dir = lang?.direction ?? "ltr";
        }
      },
    }
  )
);
