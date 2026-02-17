/**
 * White-Label Theme Engine
 * Supports organization-specific branding and theming as per ENTERPRISE_EXTENSION_PLAN.md
 */

export interface ColorMode {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface SemanticColorOverrides {
  success?: string;
  warning?: string;
  info?: string;
  accent?: string;
  purple?: string;
  cyan?: string;
  orange?: string;
  indigo?: string;
}

export interface WhiteLabelTheme {
  id: string;
  name: string;
  organizationId: string;
  brand: {
    primaryColor: string;
    secondaryColor: string;
    accentColor?: string;
    logoUrl?: string;
    logoUrlDark?: string;
    faviconUrl?: string;
    appName?: string;
  };
  typography: {
    fontFamily: string;
    headingFontFamily?: string;
    monoFontFamily?: string;
    baseFontSize?: number;
  };
  modes: {
    light: Partial<ColorMode>;
    dark: Partial<ColorMode>;
  };
  semanticColors?: {
    light: SemanticColorOverrides;
    dark: SemanticColorOverrides;
  };
  components: {
    borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "full";
    buttonStyle: "default" | "rounded" | "pill";
    cardStyle: "flat" | "elevated" | "bordered";
    inputStyle: "default" | "filled" | "underlined";
  };
  layout: {
    sidebarWidth: number;
    headerHeight: number;
    contentMaxWidth?: number;
    density: "compact" | "comfortable" | "spacious";
  };
  customCss?: string;
}

export const defaultTheme: WhiteLabelTheme = {
  id: "default",
  name: "ATLVS Default",
  organizationId: "",
  brand: {
    primaryColor: "#0066FF",
    secondaryColor: "#6B7280",
    accentColor: "#10B981",
    appName: "ATLVS",
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    headingFontFamily: "Inter, system-ui, sans-serif",
    monoFontFamily: "JetBrains Mono, monospace",
    baseFontSize: 14,
  },
  modes: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 84% 4.9%",
      primary: "221.2 83.2% 53.3%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96.1%",
      secondaryForeground: "222.2 47.4% 11.2%",
      muted: "210 40% 96.1%",
      mutedForeground: "215.4 16.3% 46.9%",
      accent: "210 40% 96.1%",
      accentForeground: "222.2 47.4% 11.2%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "210 40% 98%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "221.2 83.2% 53.3%",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      popover: "222.2 84% 4.9%",
      popoverForeground: "210 40% 98%",
      primary: "217.2 91.2% 59.8%",
      primaryForeground: "222.2 47.4% 11.2%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      accent: "217.2 32.6% 17.5%",
      accentForeground: "210 40% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "224.3 76.3% 48%",
    },
  },
  components: {
    borderRadius: "md",
    buttonStyle: "default",
    cardStyle: "bordered",
    inputStyle: "default",
  },
  layout: {
    sidebarWidth: 256,
    headerHeight: 64,
    contentMaxWidth: 1440,
    density: "comfortable",
  },
};

export function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  const r = parseInt(result[1] ?? '0', 16) / 255;
  const g = parseInt(result[2] ?? '0', 16) / 255;
  const b = parseInt(result[3] ?? '0', 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function generateThemeFromPrimaryColor(primaryHex: string): Partial<ColorMode> {
  const primaryHSL = hexToHSL(primaryHex);
  const [h] = primaryHSL.split(" ");
  const hue = parseInt(h ?? '0');

  return {
    primary: primaryHSL,
    primaryForeground: "0 0% 100%",
    ring: primaryHSL,
    accent: `${(hue + 30) % 360} 70% 50%`,
    accentForeground: "0 0% 100%",
  };
}

export function generateCSSVariables(theme: WhiteLabelTheme, mode: "light" | "dark"): string {
  const colors = { ...defaultTheme.modes[mode], ...theme.modes[mode] };
  
  const borderRadiusMap: Record<string, string> = {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  };

  const densityMap: Record<string, { spacing: string; fontSize: string }> = {
    compact: { spacing: "0.5rem", fontSize: "13px" },
    comfortable: { spacing: "1rem", fontSize: "14px" },
    spacious: { spacing: "1.5rem", fontSize: "15px" },
  };

  const density = densityMap[theme.layout.density];

  let css = `:root {\n`;
  
  Object.entries(colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    css += `  --${cssKey}: ${value};\n`;
  });

  css += `  --radius: ${borderRadiusMap[theme.components.borderRadius]};\n`;
  css += `  --font-sans: ${theme.typography.fontFamily};\n`;
  css += `  --font-heading: ${theme.typography.headingFontFamily || theme.typography.fontFamily};\n`;
  css += `  --font-mono: ${theme.typography.monoFontFamily || "monospace"};\n`;
  css += `  --sidebar-width: ${theme.layout.sidebarWidth}px;\n`;
  css += `  --header-height: ${theme.layout.headerHeight}px;\n`;
  css += `  --content-max-width: ${theme.layout.contentMaxWidth || 1440}px;\n`;
  css += `  --density-spacing: ${density?.spacing ?? '0.5rem'};\n`;
  css += `  --density-font-size: ${density?.fontSize ?? '0.875rem'};\n`;

  // Emit semantic color overrides if provided
  const semantic = theme.semanticColors?.[mode];
  if (semantic) {
    Object.entries(semantic).forEach(([key, value]) => {
      if (value) {
        css += `  --semantic-${key}: ${value};\n`;
      }
    });
  }

  css += `}\n`;

  if (theme.customCss) {
    css += `\n${theme.customCss}\n`;
  }

  return css;
}

export function applyTheme(theme: WhiteLabelTheme, mode: "light" | "dark"): void {
  const css = generateCSSVariables(theme, mode);
  
  let styleElement = document.getElementById("white-label-theme");
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "white-label-theme";
    document.head.appendChild(styleElement);
  }
  
  styleElement.textContent = css;

  if (theme.brand.logoUrl) {
    document.documentElement.style.setProperty("--logo-url", `url(${theme.brand.logoUrl})`);
  }
  if (theme.brand.logoUrlDark) {
    document.documentElement.style.setProperty("--logo-url-dark", `url(${theme.brand.logoUrlDark})`);
  }
}

export function getThemePreview(theme: WhiteLabelTheme): {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
} {
  return {
    primaryColor: theme.brand.primaryColor,
    secondaryColor: theme.brand.secondaryColor,
    backgroundColor: theme.modes.light.background || "#ffffff",
    textColor: theme.modes.light.foreground || "#000000",
  };
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
  theme: Partial<WhiteLabelTheme>;
}

export const themePresets: ThemePreset[] = [
  {
    id: "default",
    name: "ATLVS Blue",
    description: "Default professional blue theme",
    preview: { primary: "#0066FF", secondary: "#6B7280", accent: "#10B981" },
    theme: {
      brand: { primaryColor: "#0066FF", secondaryColor: "#6B7280", accentColor: "#10B981" },
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark and sophisticated",
    preview: { primary: "#6366F1", secondary: "#4B5563", accent: "#8B5CF6" },
    theme: {
      brand: { primaryColor: "#6366F1", secondaryColor: "#4B5563", accentColor: "#8B5CF6" },
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Natural and calming greens",
    preview: { primary: "#059669", secondary: "#6B7280", accent: "#10B981" },
    theme: {
      brand: { primaryColor: "#059669", secondaryColor: "#6B7280", accentColor: "#10B981" },
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange and red tones",
    preview: { primary: "#EA580C", secondary: "#78716C", accent: "#F59E0B" },
    theme: {
      brand: { primaryColor: "#EA580C", secondaryColor: "#78716C", accentColor: "#F59E0B" },
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool blue and teal",
    preview: { primary: "#0891B2", secondary: "#64748B", accent: "#06B6D4" },
    theme: {
      brand: { primaryColor: "#0891B2", secondaryColor: "#64748B", accentColor: "#06B6D4" },
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Elegant pink and rose",
    preview: { primary: "#E11D48", secondary: "#6B7280", accent: "#F43F5E" },
    theme: {
      brand: { primaryColor: "#E11D48", secondaryColor: "#6B7280", accentColor: "#F43F5E" },
    },
  },
];

export function mergeThemes(base: WhiteLabelTheme, override: Partial<WhiteLabelTheme>): WhiteLabelTheme {
  return {
    ...base,
    ...override,
    brand: { ...base.brand, ...override.brand },
    typography: { ...base.typography, ...override.typography },
    modes: {
      light: { ...base.modes.light, ...override.modes?.light },
      dark: { ...base.modes.dark, ...override.modes?.dark },
    },
    components: { ...base.components, ...override.components },
    layout: { ...base.layout, ...override.layout },
  };
}

export function createThemeFromPreset(preset: ThemePreset, organizationId: string): WhiteLabelTheme {
  const merged = mergeThemes(defaultTheme, preset.theme);
  const primaryColors = generateThemeFromPrimaryColor(preset.preview.primary);
  
  return {
    ...merged,
    id: `${organizationId}-${preset.id}`,
    organizationId,
    modes: {
      light: { ...merged.modes.light, ...primaryColors },
      dark: { ...merged.modes.dark, ...primaryColors },
    },
  };
}
