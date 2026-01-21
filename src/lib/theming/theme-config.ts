/**
 * White-Label Theming Configuration
 * Supports multi-tenant customization and branding
 */

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  ring: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingFontFamily?: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeSpacing {
  unit: number;
  scale: number[];
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeBranding {
  logo: string;
  logoLight?: string;
  logoDark?: string;
  favicon: string;
  appName: string;
  tagline?: string;
  supportEmail?: string;
  supportUrl?: string;
  termsUrl?: string;
  privacyUrl?: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  organizationId?: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  branding: ThemeBranding;
  customCss?: string;
}

export const defaultTheme: ThemeConfig = {
  id: "default",
  name: "Default Theme",
  colors: {
    light: {
      primary: "222.2 47.4% 11.2%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96.1%",
      secondaryForeground: "222.2 47.4% 11.2%",
      accent: "210 40% 96.1%",
      accentForeground: "222.2 47.4% 11.2%",
      background: "0 0% 100%",
      foreground: "222.2 47.4% 11.2%",
      muted: "210 40% 96.1%",
      mutedForeground: "215.4 16.3% 46.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 47.4% 11.2%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "222.2 47.4% 11.2%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "210 40% 98%",
      success: "142.1 76.2% 36.3%",
      successForeground: "355.7 100% 97.3%",
      warning: "45.4 93.4% 47.5%",
      warningForeground: "26 83.3% 14.1%",
      info: "199.4 95.5% 53.8%",
      infoForeground: "0 0% 100%",
    },
    dark: {
      primary: "210 40% 98%",
      primaryForeground: "222.2 47.4% 11.2%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      accent: "217.2 32.6% 17.5%",
      accentForeground: "210 40% 98%",
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "212.7 26.8% 83.9%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      success: "142.1 70.6% 45.3%",
      successForeground: "144.9 80.4% 10%",
      warning: "48 96.5% 53.1%",
      warningForeground: "26 83.3% 14.1%",
      info: "199.4 95.5% 53.8%",
      infoForeground: "0 0% 100%",
    },
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    headingFontFamily: "Inter, system-ui, sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    unit: 4,
    scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64],
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px",
  },
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
  branding: {
    logo: "/logo.svg",
    logoLight: "/logo-light.svg",
    logoDark: "/logo-dark.svg",
    favicon: "/favicon.ico",
    appName: "Unified Operations Platform",
    tagline: "Streamline your operations",
    supportEmail: "support@example.com",
    supportUrl: "https://support.example.com",
    termsUrl: "/terms",
    privacyUrl: "/privacy",
  },
};

export function generateCssVariables(theme: ThemeConfig, mode: "light" | "dark"): string {
  const colors = theme.colors[mode];
  
  const variables = [
    `--primary: ${colors.primary};`,
    `--primary-foreground: ${colors.primaryForeground};`,
    `--secondary: ${colors.secondary};`,
    `--secondary-foreground: ${colors.secondaryForeground};`,
    `--accent: ${colors.accent};`,
    `--accent-foreground: ${colors.accentForeground};`,
    `--background: ${colors.background};`,
    `--foreground: ${colors.foreground};`,
    `--muted: ${colors.muted};`,
    `--muted-foreground: ${colors.mutedForeground};`,
    `--card: ${colors.card};`,
    `--card-foreground: ${colors.cardForeground};`,
    `--border: ${colors.border};`,
    `--input: ${colors.input};`,
    `--ring: ${colors.ring};`,
    `--destructive: ${colors.destructive};`,
    `--destructive-foreground: ${colors.destructiveForeground};`,
    `--radius: ${theme.borderRadius.lg};`,
  ];

  return variables.join("\n  ");
}

export function mergeThemes(base: ThemeConfig, overrides: Partial<ThemeConfig>): ThemeConfig {
  return {
    ...base,
    ...overrides,
    colors: {
      light: { ...base.colors.light, ...overrides.colors?.light },
      dark: { ...base.colors.dark, ...overrides.colors?.dark },
    },
    typography: { ...base.typography, ...overrides.typography },
    spacing: { ...base.spacing, ...overrides.spacing },
    borderRadius: { ...base.borderRadius, ...overrides.borderRadius },
    shadows: { ...base.shadows, ...overrides.shadows },
    branding: { ...base.branding, ...overrides.branding },
  };
}

export const presetThemes: Record<string, Partial<ThemeConfig>> = {
  blue: {
    name: "Ocean Blue",
    colors: {
      light: {
        ...defaultTheme.colors.light,
        primary: "221.2 83.2% 53.3%",
        primaryForeground: "210 40% 98%",
      },
      dark: {
        ...defaultTheme.colors.dark,
        primary: "217.2 91.2% 59.8%",
        primaryForeground: "222.2 47.4% 11.2%",
      },
    },
  },
  green: {
    name: "Forest Green",
    colors: {
      light: {
        ...defaultTheme.colors.light,
        primary: "142.1 76.2% 36.3%",
        primaryForeground: "355.7 100% 97.3%",
      },
      dark: {
        ...defaultTheme.colors.dark,
        primary: "142.1 70.6% 45.3%",
        primaryForeground: "144.9 80.4% 10%",
      },
    },
  },
  purple: {
    name: "Royal Purple",
    colors: {
      light: {
        ...defaultTheme.colors.light,
        primary: "262.1 83.3% 57.8%",
        primaryForeground: "210 40% 98%",
      },
      dark: {
        ...defaultTheme.colors.dark,
        primary: "263.4 70% 50.4%",
        primaryForeground: "210 40% 98%",
      },
    },
  },
  orange: {
    name: "Sunset Orange",
    colors: {
      light: {
        ...defaultTheme.colors.light,
        primary: "24.6 95% 53.1%",
        primaryForeground: "60 9.1% 97.8%",
      },
      dark: {
        ...defaultTheme.colors.dark,
        primary: "20.5 90.2% 48.2%",
        primaryForeground: "60 9.1% 97.8%",
      },
    },
  },
};
