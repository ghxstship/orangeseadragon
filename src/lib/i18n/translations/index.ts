import { LanguageCode } from "../types";
import { en, TranslationKeys } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { pt } from "./pt";
import { zh } from "./zh";
import { ja } from "./ja";
import { ko } from "./ko";
import { ar } from "./ar";

export const translations: Record<LanguageCode, TranslationKeys> = {
  en,
  es,
  fr,
  de,
  pt,
  zh,
  ja,
  ko,
  ar,
};

export type { TranslationKeys } from "./en";
