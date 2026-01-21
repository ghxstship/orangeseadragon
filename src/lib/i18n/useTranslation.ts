"use client";

import { useCallback } from "react";
import { useLanguageStore } from "./store";
import { translations, TranslationKeys } from "./translations";

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type TranslationPath = NestedKeyOf<TranslationKeys>;

function getNestedValue(obj: TranslationKeys, path: string): string {
  const keys = path.split(".");
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof result === "string" ? result : path;
}

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const currentTranslations = translations[language];

  const t = useCallback(
    (key: TranslationPath, params?: Record<string, string | number>): string => {
      let value = getNestedValue(currentTranslations, key);

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value.replace(`{${paramKey}}`, String(paramValue));
        });
      }

      return value;
    },
    [currentTranslations]
  );

  return { t, language };
}
