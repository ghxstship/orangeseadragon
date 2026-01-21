"use client";

import * as React from "react";
import { ThemeConfig, defaultTheme, generateCssVariables, mergeThemes } from "./theme-config";

interface ThemeContextValue {
  theme: ThemeConfig;
  mode: "light" | "dark" | "system";
  setMode: (mode: "light" | "dark" | "system") => void;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: "light" | "dark" | "system";
  organizationTheme?: Partial<ThemeConfig>;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultMode = "system",
  organizationTheme,
  storageKey = "theme-mode",
}: ThemeProviderProps) {
  const [mode, setModeState] = React.useState<"light" | "dark" | "system">(defaultMode);
  const [theme, setThemeState] = React.useState<ThemeConfig>(() => {
    if (organizationTheme) {
      return mergeThemes(defaultTheme, organizationTheme);
    }
    return defaultTheme;
  });

  // Initialize mode from storage
  React.useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored && ["light", "dark", "system"].includes(stored)) {
      setModeState(stored as "light" | "dark" | "system");
    }
  }, [storageKey]);

  // Apply theme to document
  React.useEffect(() => {
    const root = document.documentElement;
    
    // Determine actual mode
    const actualMode: "light" | "dark" = mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : mode;

    // Remove existing class
    root.classList.remove("light", "dark");
    root.classList.add(actualMode);

    // Apply CSS variables
    const cssVariables = generateCssVariables(theme, actualMode);
    root.style.cssText = cssVariables;

    // Apply custom CSS if present
    if (theme.customCss) {
      const styleId = "theme-custom-css";
      let styleEl = document.getElementById(styleId) as HTMLStyleElement;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = theme.customCss;
    }
  }, [theme, mode]);

  // Listen for system theme changes
  React.useEffect(() => {
    if (mode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(mediaQuery.matches ? "dark" : "light");
      
      const cssVariables = generateCssVariables(theme, mediaQuery.matches ? "dark" : "light");
      root.style.cssText = cssVariables;
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [mode, theme]);

  const setMode = React.useCallback((newMode: "light" | "dark" | "system") => {
    setModeState(newMode);
    localStorage.setItem(storageKey, newMode);
  }, [storageKey]);

  const setTheme = React.useCallback((updates: Partial<ThemeConfig>) => {
    setThemeState((current) => mergeThemes(current, updates));
  }, []);

  const resetTheme = React.useCallback(() => {
    if (organizationTheme) {
      setThemeState(mergeThemes(defaultTheme, organizationTheme));
    } else {
      setThemeState(defaultTheme);
    }
  }, [organizationTheme]);

  const value = React.useMemo(
    () => ({
      theme,
      mode,
      setMode,
      setTheme,
      resetTheme,
    }),
    [theme, mode, setMode, setTheme, resetTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useThemeMode() {
  const { mode, setMode } = useTheme();
  return { mode, setMode };
}

export function useThemeConfig() {
  const { theme, setTheme, resetTheme } = useTheme();
  return { theme, setTheme, resetTheme };
}
