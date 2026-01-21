export type LanguageCode = 
  | "en" 
  | "es" 
  | "fr" 
  | "de" 
  | "pt" 
  | "zh" 
  | "ja" 
  | "ko" 
  | "ar";

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", direction: "ltr", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", direction: "ltr", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", direction: "ltr", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", direction: "ltr", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", nativeName: "Português", direction: "ltr", flag: "🇧🇷" },
  { code: "zh", name: "Chinese", nativeName: "中文", direction: "ltr", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", direction: "ltr", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", direction: "ltr", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl", flag: "🇸🇦" },
];

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}

export function isValidLanguageCode(code: string): code is LanguageCode {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}
