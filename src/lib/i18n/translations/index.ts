import { LanguageCode } from "../types";
import { en, type TranslationKeys, type PartialTranslationKeys } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { pt } from "./pt";
import { zh } from "./zh";
import { ja } from "./ja";
import { ko } from "./ko";
import { ar } from "./ar";

/**
 * Deep-merge a partial translation with the English base.
 * Missing keys in the partial locale fall back to English.
 */
function mergeWithFallback(partial: PartialTranslationKeys): TranslationKeys {
  const result = {} as Record<string, Record<string, string>>;
  for (const section of Object.keys(en) as Array<keyof TranslationKeys>) {
    result[section] = {
      ...en[section],
      ...(partial[section] || {}),
    };
  }
  return result as unknown as TranslationKeys;
}

export const translations: Record<LanguageCode, TranslationKeys> = {
  en,
  es: mergeWithFallback(es),
  fr: mergeWithFallback(fr),
  de: mergeWithFallback(de),
  pt: mergeWithFallback(pt),
  zh: mergeWithFallback(zh),
  ja: mergeWithFallback(ja),
  ko: mergeWithFallback(ko),
  ar: mergeWithFallback(ar),
};

export type { TranslationKeys, PartialTranslationKeys } from "./en";
