# GHXSTSHIP INDUSTRIES — SURGICAL UI AUDIT & REMEDIATION PROTOCOL v1.0

## WINDSURF UI CERTIFICATION PROMPT — ZERO TOLERANCE

**Classification:** UI-Only / Surgical Precision / Zero Tolerance
**Scope:** Every pixel, every component, every style declaration, every breakpoint
**Standard:** Enterprise White-Label-Ready, WCAG 2.1 AA, Device-Universal
**Failure Mode:** BLOCK until every finding is remediated in-place

---

## INSTRUCTIONS TO WINDSURF

You are operating as a **Principal UI/Design Systems Engineer** performing a **surgical audit and active remediation** of every UI file in this codebase. This is not a review — it is a **search-and-destroy mission** against every inline style, ad hoc component, hardcoded value, duplicate pattern, legacy artifact, accessibility violation, and responsive failure in the entire project.

**Your mandate:**

1. **FIND** every violation by opening and reading every file that touches UI
2. **REPORT** every violation with exact file path, line number, and code snippet
3. **FIX** every violation in-place — write the corrected code, not suggestions
4. **VERIFY** the fix resolves the issue and doesn't break adjacent patterns

**You are not making recommendations. You are performing surgery.**

---

## OUTPUT FORMAT PER FILE

```
══════════════════════════════════════════════════════════
📄 FILE: [path/to/file.tsx]
📏 LINES: [total line count]
⚡ VERDICT: CLEAN | REMEDIATED | CRITICAL-REWRITE
══════════════════════════════════════════════════════════

🔴 VIOLATION [V-001]: [Category] — [Description]
   LINE: [number]
   FOUND: [exact code snippet]
   FIXED: [exact replacement code]
   RULE: [which rule from this protocol was violated]

🔴 VIOLATION [V-002]: ...
   ...

📊 FILE SUMMARY:
   Violations Found: [count]
   Violations Fixed: [count]
   Remaining Blockers: [count — must be 0]
══════════════════════════════════════════════════════════
```

---

## PHASE 0: UI SURFACE AREA MAPPING

Before auditing any file, map the entire UI surface:

```
EXECUTE THESE COMMANDS AND CATALOG OUTPUT:

1. Find every UI file:
   find . -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.css" \
   -o -name "*.scss" -o -name "*.module.css" -o -name "*.module.scss" \
   -o -name "*.styled.ts" -o -name "*.styled.tsx" -o -name "*.svg" \) \
   | grep -v node_modules | grep -v dist | grep -v .next | sort

2. Find the design system / component library:
   - Identify: components/ ui/ primitives/ atoms/ molecules/ organisms/
   - Identify: theme files, token files, design token exports
   - Identify: tailwind.config, CSS variable declarations
   - Identify: shared layouts, page shells, wrappers

3. Catalog every unique component:
   grep -rn "export.*function\|export.*const.*=.*(" --include="*.tsx" \
   | grep -v node_modules | grep -v "test\|spec\|story"

4. Find all inline styles (the enemy):
   grep -rn "style={{" --include="*.tsx" --include="*.jsx" | grep -v node_modules
   grep -rn "style={" --include="*.tsx" --include="*.jsx" | grep -v node_modules

5. Find all hardcoded colors:
   grep -rn "#[0-9a-fA-F]\{3,8\}" --include="*.tsx" --include="*.jsx" \
   | grep -v node_modules | grep -v "tailwind\|config\|theme\|token"
   grep -rn "rgb\|rgba\|hsl\|hsla" --include="*.tsx" --include="*.jsx" \
   | grep -v node_modules | grep -v "tailwind\|config\|theme\|token"

6. Find all hardcoded spacing/sizing:
   grep -rn "px\b" --include="*.tsx" --include="*.jsx" \
   | grep -v node_modules | grep -v "tailwind\|config\|theme\|token"

7. Find all hardcoded font declarations:
   grep -rn "font-family\|fontFamily\|font-size\|fontSize\|font-weight\|fontWeight" \
   --include="*.tsx" --include="*.jsx" --include="*.css" \
   | grep -v node_modules | grep -v "tailwind\|config\|theme\|token"

8. Find all hardcoded breakpoints:
   grep -rn "@media\|useMediaQuery\|matchMedia\|window.innerWidth" \
   --include="*.tsx" --include="*.jsx" --include="*.css" \
   | grep -v node_modules

9. Find all z-index declarations:
   grep -rn "z-index\|zIndex\|z-\[" --include="*.tsx" --include="*.jsx" \
   --include="*.css" | grep -v node_modules

10. Find potential duplicates:
    - Components with similar names or overlapping responsibility
    - Multiple button, card, modal, input implementations
    - CSS classes that produce identical output

11. Build a COMPONENT REGISTRY:
    List every exported component with:
    - Name
    - File path
    - Props interface (or lack thereof)
    - Where it's imported/used (consumption count)
    - Whether it's a duplicate of another component
```

---

## PHASE 1: DESIGN TOKEN & THEMING INFRASTRUCTURE

### 1.1 — Token Architecture Audit & Remediation

```
THE APPLICATION MUST HAVE A SINGLE SOURCE OF TRUTH FOR ALL DESIGN VALUES.
If it doesn't exist, CREATE IT before proceeding with any other remediation.

REQUIRED TOKEN STRUCTURE (Tailwind + CSS Variables):

// tailwind.config.ts — SINGLE SOURCE
const tokens = {
  colors: {
    // Semantic color tokens — NOT raw hex values
    brand: {
      primary:    'var(--color-brand-primary)',
      secondary:  'var(--color-brand-secondary)',
      accent:     'var(--color-brand-accent)',
    },
    surface: {
      DEFAULT:    'var(--color-surface)',
      raised:     'var(--color-surface-raised)',
      overlay:    'var(--color-surface-overlay)',
      sunken:     'var(--color-surface-sunken)',
    },
    text: {
      DEFAULT:    'var(--color-text)',
      secondary:  'var(--color-text-secondary)',
      tertiary:   'var(--color-text-tertiary)',
      inverse:    'var(--color-text-inverse)',
      link:       'var(--color-text-link)',
    },
    border: {
      DEFAULT:    'var(--color-border)',
      strong:     'var(--color-border-strong)',
      subtle:     'var(--color-border-subtle)',
    },
    state: {
      error:      'var(--color-state-error)',
      warning:    'var(--color-state-warning)',
      success:    'var(--color-state-success)',
      info:       'var(--color-state-info)',
    },
    // Raw palette available for edge cases only — all usage must reference semantic tokens
    palette: { ... }
  },

  spacing: {
    // 4px base unit system (or 8px — pick one, enforce it)
    0: '0',
    0.5: '0.125rem',   // 2px
    1: '0.25rem',       // 4px
    1.5: '0.375rem',    // 6px
    2: '0.5rem',        // 8px
    2.5: '0.625rem',    // 10px
    3: '0.75rem',       // 12px
    4: '1rem',          // 16px
    5: '1.25rem',       // 20px
    6: '1.5rem',        // 24px
    8: '2rem',          // 32px
    10: '2.5rem',       // 40px
    12: '3rem',         // 48px
    16: '4rem',         // 64px
    20: '5rem',         // 80px
    24: '6rem',         // 96px
  },

  fontSize: {
    // Type scale — named semantically
    xs:   ['0.75rem',   { lineHeight: '1rem' }],
    sm:   ['0.875rem',  { lineHeight: '1.25rem' }],
    base: ['1rem',      { lineHeight: '1.5rem' }],
    lg:   ['1.125rem',  { lineHeight: '1.75rem' }],
    xl:   ['1.25rem',   { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem',   { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem',  { lineHeight: '2.5rem' }],
    '5xl': ['3rem',     { lineHeight: '1' }],
  },

  fontFamily: {
    sans:    'var(--font-sans)',
    mono:    'var(--font-mono)',
    display: 'var(--font-display)',
  },

  borderRadius: {
    none: '0',
    sm:   'var(--radius-sm)',
    DEFAULT: 'var(--radius-default)',
    md:   'var(--radius-md)',
    lg:   'var(--radius-lg)',
    xl:   'var(--radius-xl)',
    full: '9999px',
  },

  boxShadow: {
    sm:   'var(--shadow-sm)',
    DEFAULT: 'var(--shadow-default)',
    md:   'var(--shadow-md)',
    lg:   'var(--shadow-lg)',
    xl:   'var(--shadow-xl)',
  },

  // Animation tokens
  transitionDuration: {
    fast:   '100ms',
    normal: '200ms',
    slow:   '300ms',
    slower: '500ms',
  },

  // Z-index scale — ONLY these values allowed
  zIndex: {
    hide:     -1,
    base:     0,
    raised:   1,
    dropdown: 10,
    sticky:   20,
    overlay:  30,
    modal:    40,
    popover:  50,
    toast:    60,
    tooltip:  70,
    max:      9999,
  },

  // Breakpoints (used across the entire app — no ad hoc values)
  screens: {
    xs:  '375px',
    sm:  '640px',
    md:  '768px',
    lg:  '1024px',
    xl:  '1280px',
    '2xl': '1440px',
    '3xl': '1920px',
  },
};

CSS VARIABLE LAYER (for white-label theming):

/* globals.css or theme.css */
:root {
  /* Brand — overridden per tenant */
  --color-brand-primary: #2563eb;
  --color-brand-secondary: #7c3aed;
  --color-brand-accent: #f59e0b;

  /* Surfaces */
  --color-surface: #ffffff;
  --color-surface-raised: #f9fafb;
  --color-surface-overlay: rgba(0, 0, 0, 0.5);
  --color-surface-sunken: #f3f4f6;

  /* Text */
  --color-text: #111827;
  --color-text-secondary: #4b5563;
  --color-text-tertiary: #9ca3af;
  --color-text-inverse: #ffffff;
  --color-text-link: var(--color-brand-primary);

  /* Borders */
  --color-border: #e5e7eb;
  --color-border-strong: #d1d5db;
  --color-border-subtle: #f3f4f6;

  /* State */
  --color-state-error: #dc2626;
  --color-state-warning: #d97706;
  --color-state-success: #16a34a;
  --color-state-info: #2563eb;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-display: var(--font-sans);

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-default: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Focus ring — used globally */
  --focus-ring: 0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-brand-primary);
}

/* Dark mode — automatic via class or system preference */
.dark, [data-theme="dark"] {
  --color-brand-primary: #60a5fa;
  --color-brand-secondary: #a78bfa;
  --color-brand-accent: #fbbf24;

  --color-surface: #0f172a;
  --color-surface-raised: #1e293b;
  --color-surface-overlay: rgba(0, 0, 0, 0.7);
  --color-surface-sunken: #020617;

  --color-text: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-tertiary: #64748b;
  --color-text-inverse: #0f172a;

  --color-border: #334155;
  --color-border-strong: #475569;
  --color-border-subtle: #1e293b;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4);
}

/* White-label tenant override pattern */
[data-tenant="acme-corp"] {
  --color-brand-primary: #e11d48;
  --color-brand-secondary: #be185d;
  --color-brand-accent: #f97316;
  --font-display: 'Poppins', var(--font-sans);
  --radius-default: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
}

❌ ZERO TOLERANCE VIOLATIONS — EVERY INSTANCE MUST BE ELIMINATED:

- ANY hex color (#xxx) in a component file → REPLACE with token
- ANY rgb/rgba/hsl in a component file → REPLACE with token
- ANY pixel value for spacing in a component file → REPLACE with spacing token
- ANY font-family declaration in a component file → REPLACE with font token
- ANY font-size declaration in a component file → REPLACE with type scale token
- ANY border-radius value in a component file → REPLACE with radius token
- ANY box-shadow value in a component file → REPLACE with shadow token
- ANY z-index outside the defined scale → REPLACE with z-index token
- ANY breakpoint value not from screens config → REPLACE with screen token
- ANY animation duration not from transition tokens → REPLACE with token
```

---

## PHASE 2: INLINE STYLE ERADICATION

```
ZERO TOLERANCE. EVERY INLINE STYLE MUST BE DESTROYED.

SEARCH PATTERN:
  style={{     ← React inline style object
  style={      ← React inline style variable
  :style="     ← Vue inline style

FOR EACH INSTANCE FOUND:

1. IDENTIFY what the inline style is doing
2. DETERMINE the correct token-based replacement
3. REPLACE with Tailwind utilities or component-level class
4. VERIFY the visual output is identical

COMMON INLINE STYLE → TOKEN MIGRATION:

❌ style={{ color: '#2563eb' }}
✅ className="text-brand-primary"

❌ style={{ marginTop: '16px' }}
✅ className="mt-4"

❌ style={{ fontSize: '14px' }}
✅ className="text-sm"

❌ style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
✅ className="bg-surface-overlay"

❌ style={{ borderRadius: '8px' }}
✅ className="rounded-md"

❌ style={{ zIndex: 9999 }}
✅ className="z-max"

❌ style={{ padding: '24px 32px' }}
✅ className="px-8 py-6"

❌ style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
✅ className="flex items-center justify-center"

❌ style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}
✅ className="w-full max-w-7xl mx-auto"

THE ONLY ACCEPTABLE INLINE STYLES:
- Dynamic values computed at runtime that CANNOT be expressed as tokens
  (e.g., style={{ transform: `translateX(${offset}px)` }})
- CSS custom property overrides for dynamic theming
  (e.g., style={{ '--progress': `${percent}%` } as React.CSSProperties})
- Third-party library requirements that mandate inline styles
  (MUST have comment: // @ui-audit: inline required by [library-name])

EVERY surviving inline style MUST have a justification comment.
Any inline style without a comment is a violation.
```

---

## PHASE 3: AD HOC COMPONENT ERADICATION

```
DEFINITION: An "ad hoc component" is any UI pattern that is:
- Built directly in a page/feature file instead of extracted to a shared component
- A one-off implementation of a pattern that exists elsewhere in the codebase
- A local component that should be in the design system
- A styled div/span doing the job of a proper component

DETECTION METHOD — For each page and feature file:

1. SCAN for anonymous structural JSX blocks > 10 lines
2. SCAN for repeated patterns (buttons, cards, inputs, modals, badges, etc.)
3. SCAN for local sub-components defined inside parent component files
4. SCAN for className strings > 80 characters (indicates a component should be extracted)
5. SCAN for conditional className logic that recurs across files

COMMON AD HOC PATTERNS TO DESTROY:

❌ AD HOC BUTTON:
<button
  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  onClick={handleSubmit}
>
  Save Changes
</button>

✅ DESIGN SYSTEM BUTTON:
<Button variant="primary" onClick={handleSubmit}>
  Save Changes
</Button>

❌ AD HOC CARD:
<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
  <p className="mt-2 text-sm text-gray-500">{description}</p>
</div>

✅ DESIGN SYSTEM CARD:
<Card>
  <Card.Header>
    <Card.Title>{title}</Card.Title>
  </Card.Header>
  <Card.Body>
    <Text variant="body-sm" color="secondary">{description}</Text>
  </Card.Body>
</Card>

❌ AD HOC INPUT:
<div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-gray-700">{label}</label>
  <input
    className="block w-full rounded-md border border-gray-300 px-3 py-2
               text-sm shadow-sm focus:border-blue-500 focus:ring-1
               focus:ring-blue-500 disabled:bg-gray-50"
    {...props}
  />
  {error && <p className="text-sm text-red-600">{error}</p>}
</div>

✅ DESIGN SYSTEM INPUT:
<FormField label={label} error={error}>
  <Input {...props} />
</FormField>

❌ AD HOC BADGE/TAG:
<span className="inline-flex items-center rounded-full bg-green-100
                 px-2.5 py-0.5 text-xs font-medium text-green-800">
  Active
</span>

✅ DESIGN SYSTEM BADGE:
<Badge variant="success">Active</Badge>

❌ AD HOC MODAL:
{isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="fixed inset-0 bg-black/50" onClick={onClose} />
    <div className="relative z-10 bg-white rounded-xl p-6 shadow-xl max-w-md w-full">
      ...
    </div>
  </div>
)}

✅ DESIGN SYSTEM MODAL:
<Modal open={isOpen} onClose={onClose}>
  <Modal.Header>...</Modal.Header>
  <Modal.Body>...</Modal.Body>
  <Modal.Footer>...</Modal.Footer>
</Modal>

REMEDIATION PROTOCOL:
1. Identify every ad hoc UI pattern
2. Check if a design system equivalent exists
3. If YES → replace with design system component
4. If NO → CREATE the design system component, then replace all instances
5. Document the new component in the component registry
```

---

## PHASE 4: HARDCODED VALUE ELIMINATION

```
ZERO TOLERANCE FOR HARDCODED VALUES IN COMPONENT FILES.

4.1 — HARDCODED STRINGS (copy/content)

❌ VIOLATIONS:
<h1>Welcome to Our Platform</h1>
<button>Submit</button>
<p>No results found. Try a different search.</p>
<title>Dashboard | MyApp</title>
placeholder="Enter your email"
aria-label="Close dialog"

✅ REQUIRED PATTERN:
All user-facing strings must be in a constants file or i18n system:

// constants/copy.ts or messages/en.ts
export const COPY = {
  common: {
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    close: 'Close',
    loading: 'Loading...',
    noResults: 'No results found. Try a different search.',
    error: 'Something went wrong. Please try again.',
  },
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome to {appName}',
  },
  // ...
} as const;

// Usage:
<h1>{COPY.dashboard.welcome.replace('{appName}', config.appName)}</h1>
<Button>{COPY.common.submit}</Button>

// OR with i18n:
<h1>{t('dashboard.welcome', { appName: config.appName })}</h1>

WHY: White-label tenants need to customize ALL copy.
Hardcoded strings make this impossible.

EXCEPTION: Component internal labels that are purely structural
(e.g., aria-hidden content that never faces users) MAY be inline
with comment: // @ui-audit: structural label, not user-facing

4.2 — HARDCODED URLS AND PATHS

❌ VIOLATIONS:
<a href="/dashboard">
<img src="/images/logo.png" />
<Link href="/settings/billing">

✅ REQUIRED:
// constants/routes.ts
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  settings: {
    root: '/settings',
    profile: '/settings/profile',
    billing: '/settings/billing',
    team: '/settings/team',
  },
  // ...
} as const;

// constants/assets.ts
export const ASSETS = {
  logo: {
    light: '/images/logo-light.svg',
    dark: '/images/logo-dark.svg',
  },
  // White-label: loaded from tenant config
  tenantLogo: (tenantSlug: string) => `/tenants/${tenantSlug}/logo.svg`,
} as const;

4.3 — HARDCODED DIMENSIONS AND MAGIC NUMBERS

❌ VIOLATIONS:
className="w-[347px]"
className="max-w-[1127px]"
className="h-[calc(100vh-64px)]"
className="grid-cols-[250px_1fr_300px]"
style={{ width: 347 }}
if (window.innerWidth < 768) { ... }

✅ REQUIRED:
// All dimensions map to the design token scale
// If a dimension doesn't fit the scale, it must be a named token:

// tailwind.config.ts extend
extend: {
  spacing: {
    'sidebar': '16rem',      // 256px — sidebar width
    'header': '4rem',        // 64px — header height
    'panel': '20rem',        // 320px — side panel
  },
  maxWidth: {
    'content': '72rem',      // 1152px — max content width
    'narrow': '42rem',       // 672px — narrow content
    'prose': '65ch',         // optimal reading width
  },
  height: {
    'screen-minus-header': 'calc(100vh - var(--header-height))',
  }
}

// Usage:
className="w-sidebar"
className="max-w-content"
className="h-screen-minus-header"
className="grid grid-cols-[theme(spacing.sidebar)_1fr_theme(spacing.panel)]"

4.4 — HARDCODED BREAKPOINT LOGIC

❌ VIOLATIONS:
if (width < 768) { ... }
const isMobile = useMediaQuery('(max-width: 767px)')
@media (min-width: 1024px) { ... }  /* in component-scoped CSS */

✅ REQUIRED:
// hooks/useBreakpoint.ts — single source of truth
import { screens } from '@/config/tokens';
// All breakpoint logic references token values

// Tailwind classes for responsive:
className="flex flex-col md:flex-row"  // uses config breakpoints

// If JS breakpoint detection needed:
const { isMobile, isTablet, isDesktop } = useBreakpoint(); // reads from tokens
```

---

## PHASE 5: DUPLICATE & REDUNDANT COMPONENT ELIMINATION

```
DETECTION PROTOCOL — Find every duplicate:

5.1 — COMPONENT DUPLICATION SCAN

For each of these primitive categories, there must be
EXACTLY ONE canonical implementation:

PRIMITIVES (must exist once and only once):
□ Button (with variants: primary, secondary, ghost, destructive, link, outline)
□ IconButton
□ Input (text, email, password, number, search, tel, url)
□ Textarea
□ Select / Dropdown
□ Checkbox
□ RadioGroup
□ Switch / Toggle
□ Label
□ FormField (label + input + error + description wrapper)

LAYOUT (must exist once and only once):
□ Container (max-width wrapper)
□ Stack (vertical spacing — or use flex/grid directly)
□ Grid
□ Divider / Separator
□ Spacer (if used — prefer gap/space utilities)
□ AspectRatio

DATA DISPLAY (must exist once and only once):
□ Card
□ Badge / Tag
□ Avatar
□ Table
□ DataTable (sortable, filterable, paginated)
□ EmptyState
□ Skeleton / LoadingPlaceholder
□ Stat / Metric display
□ List / ListItem

FEEDBACK (must exist once and only once):
□ Alert / Banner
□ Toast / Notification
□ Progress (bar and/or circular)
□ Spinner / Loading indicator
□ Tooltip
□ ErrorBoundary
□ ErrorState (full page or section error)

OVERLAY (must exist once and only once):
□ Modal / Dialog
□ Drawer / Sheet (side panel)
□ Popover
□ DropdownMenu
□ CommandPalette / CommandMenu
□ AlertDialog (confirmation)

NAVIGATION (must exist once and only once):
□ Tabs
□ Breadcrumbs
□ Pagination
□ Sidebar / Nav
□ TopBar / Header
□ MobileNav / BottomNav
□ Link (styled, wrapping framework link)

TYPOGRAPHY (must exist once and only once):
□ Heading (h1-h6, or level prop)
□ Text / Paragraph (with variants)
□ Code (inline and block)
□ Prose (rich text container)

REMEDIATION FOR DUPLICATES:
1. Identify ALL implementations of a given pattern
2. Pick the BEST one (most complete, best typed, best accessible)
3. Enhance it to cover all use cases from the duplicates
4. Replace every duplicate usage with the canonical component
5. DELETE every duplicate file
6. Update all imports

5.2 — UTILITY CLASS DUPLICATION

Search for repeated className patterns across files:

grep -rn 'className="' --include="*.tsx" | \
  sed 's/.*className="//' | sed 's/".*//' | \
  sort | uniq -c | sort -rn | head -50

Any className string appearing 3+ times across different files
MUST be extracted to either:
- A design system component (preferred)
- A shared utility via tailwind-merge or clsx helper
- A Tailwind @apply class (last resort)

5.3 — LEGACY / DEAD COMPONENT DETECTION

FIND AND DELETE:
- Components with 0 imports (unused) — DELETE
- Components with only 1 import where the feature is deprecated — DELETE
- Components wrapped in // TODO: remove or // deprecated — DELETE
- Components that re-export another component with no changes — FLATTEN
- CSS files / modules with no imports — DELETE
- Storybook stories for deleted components — DELETE
- Test files for deleted components — DELETE
```

---

## PHASE 6: ACCESSIBILITY SURGICAL AUDIT

```
WCAG 2.1 AA COMPLIANCE — EVERY VIOLATION IS A BLOCKER.

6.1 — SEMANTIC HTML AUDIT

FOR EVERY PAGE, VERIFY THIS LANDMARK STRUCTURE:
<body>
  <a href="#main" className="sr-only focus:not-sr-only ...">
    Skip to content                    ← REQUIRED: skip nav link
  </a>
  <header role="banner">              ← ONE per page
    <nav aria-label="Main">           ← Labeled navigation
      ...
    </nav>
  </header>
  <main id="main" role="main">        ← ONE per page, id matches skip link
    <h1>Page Title</h1>               ← EXACTLY ONE h1 per page
    <section aria-labelledby="...">   ← Sections labeled by headings
      <h2 id="...">Section Title</h2>
      ...
    </section>
  </main>
  <aside role="complementary">        ← Sidebar if present
    ...
  </aside>
  <footer role="contentinfo">         ← ONE per page
    ...
  </footer>
</body>

❌ VIOLATIONS:
- <div> used where semantic element should be (nav, section, article, aside, etc.)
- <div onClick> instead of <button> (not keyboard accessible)
- <a> without href (use <button> if not navigating)
- <a href="#"> (use button, or prevent default and explain)
- Multiple <h1> on a page
- Heading levels skipped (h1 → h3 without h2)
- <img> without alt attribute
- <img> with alt="" on meaningful images (empty alt = decorative only)
- <img> with redundant alt like "image of..." or "photo of..."
- Lists not using <ul>/<ol>/<li> structure
- Tables not using <thead>/<tbody>/<th> structure
- <table> used for layout (never)
- <br> used for spacing (use CSS)
- <b>/<i> used instead of <strong>/<em>
- Empty <a> or <button> tags (no accessible name)

6.2 — INTERACTIVE ELEMENT AUDIT

FOR EVERY INTERACTIVE ELEMENT:

BUTTONS:
□ Uses <button> element (not div/span with onClick)
□ Has visible text label OR aria-label (for icon buttons)
□ type="button" explicitly set (not relying on default "submit")
□ Disabled state uses disabled attribute (not just className)
□ Loading state has aria-busy="true" and prevents double-click
□ Focus style visible and matches design system (--focus-ring)

LINKS:
□ Uses <a> with href for navigation
□ External links have target="_blank" rel="noopener noreferrer"
□ External links indicate they open in new tab (visual icon + aria text)
□ Link text is descriptive (not "click here" or "read more")

FORM INPUTS:
□ Every input has an associated <label> (htmlFor/id pair or wrapping)
□ Required fields indicated visually AND with required attribute
□ Error messages associated via aria-describedby
□ Help text associated via aria-describedby
□ Autocomplete attribute set for personal data fields
□ Input type matches data (email, tel, url, number, etc.)
□ Character limits communicated to screen readers (aria-describedby)
□ File inputs have accessible label describing accepted formats

SELECT / DROPDOWN:
□ Custom dropdowns are keyboard navigable (Arrow keys, Enter, Escape)
□ Active/selected option has aria-selected="true"
□ Dropdown uses role="listbox" or proper Radix/Headless UI primitives
□ Type-ahead search works (typing filters options)

MODALS / DIALOGS:
□ Uses role="dialog" and aria-modal="true"
□ Has aria-labelledby pointing to the modal title
□ Focus trapped inside when open
□ Focus returns to trigger element on close
□ Escape key closes the modal
□ Background scroll locked when open
□ Screen reader announces "dialog" when opened

TABS:
□ Tab list uses role="tablist"
□ Tabs use role="tab" with aria-selected
□ Tab panels use role="tabpanel" with aria-labelledby
□ Arrow keys navigate between tabs
□ Tab key moves to tab panel (not next tab)
□ Active tab panel is the only one in the DOM or aria-hidden on others

TOOLTIPS:
□ Trigger has aria-describedby pointing to tooltip
□ Tooltip uses role="tooltip"
□ Tooltip accessible via hover AND focus
□ Tooltip dismissible with Escape
□ Tooltip delay allows cursor movement to tooltip content

TOAST / NOTIFICATION:
□ Container uses role="status" or role="alert" (for errors)
□ Container has aria-live="polite" (or "assertive" for critical)
□ Auto-dismiss timer is reasonable (≥ 5 seconds)
□ User can pause auto-dismiss on hover/focus
□ Dismiss button has accessible name

6.3 — KEYBOARD NAVIGATION AUDIT

TEST EVERY PAGE — Tab through the entire page and verify:

□ Tab order follows visual reading order (no jumping around)
□ All interactive elements are reachable via Tab
□ No focus traps (except intentional: modals, drawers)
□ Focus indicator visible on EVERY focused element
□ Custom focus style: outline: none + box-shadow: var(--focus-ring)
   OR equivalent visible indicator with 3:1 contrast ratio
□ Skip link works (visible on focus, jumps to main content)
□ Keyboard shortcuts documented and don't conflict with browser/AT
□ Escape closes any overlay (modal, dropdown, popover, drawer)
□ Enter activates buttons and links
□ Space activates buttons, checkboxes, and radio buttons
□ Arrow keys navigate within composite widgets (tabs, menus, radio groups)
□ No invisible elements receiving focus (hidden content must be inert)

FOCUS MANAGEMENT RULES:
- After navigation: focus on <h1> or main content
- After modal open: focus on first focusable element inside
- After modal close: focus returns to trigger
- After delete: focus on previous or next item in list
- After form submit success: focus on success message or redirect
- After form submit error: focus on first error field
- After dynamic content load: announce via aria-live or focus

6.4 — COLOR & CONTRAST AUDIT

CHECK EVERY TEXT/BACKGROUND COMBINATION:

MINIMUM CONTRAST RATIOS (WCAG 2.1 AA):
- Normal text (< 18pt / < 14pt bold): 4.5:1
- Large text (≥ 18pt / ≥ 14pt bold): 3:1
- UI components and graphical objects: 3:1
- Focus indicators: 3:1 against adjacent colors

❌ COMMON FAILURES:
- Light gray text on white background (#9ca3af on #ffffff = 2.9:1 FAIL)
- Placeholder text too light (must be 4.5:1 or labeled separately)
- Disabled state too low contrast (acceptable at 3:1 minimum)
- Error text on colored backgrounds
- White text on colored buttons without sufficient contrast
- Links indistinguishable from surrounding text (need underline OR 3:1 + non-color indicator)
- Icons conveying meaning without sufficient contrast
- Focus ring invisible against background

VERIFY FOR BOTH LIGHT AND DARK MODE:
Every color combination must meet contrast requirements in BOTH themes.

COLOR-BLIND SAFE:
- Information never conveyed by color alone
- Error states have icon + color + text (not just red)
- Success states have icon + color + text (not just green)
- Charts/graphs have patterns or labels in addition to colors
- Status indicators have text labels (not just colored dots)

6.5 — SCREEN READER AUDIT

FOR EVERY PAGE, VERIFY THESE ANNOUNCEMENTS:

□ Page title announced (document.title is descriptive and unique)
□ Heading structure navigable (h1 → h2 → h3, no gaps)
□ Landmark regions navigable (header, nav, main, aside, footer)
□ Images described appropriately (alt text is useful, not redundant)
□ Decorative images hidden (alt="" or role="presentation")
□ SVG icons hidden from AT (aria-hidden="true") when adjacent to text
□ SVG icons exposed to AT (role="img" aria-label="...") when standalone
□ Dynamic content changes announced (aria-live regions)
□ Loading states announced (aria-busy, aria-live, or role="status")
□ Form errors announced when they appear
□ Route changes announced (for SPA navigation)
□ Current page indicated in navigation (aria-current="page")
□ Expanded/collapsed state communicated (aria-expanded)
□ Selected state communicated (aria-selected)
□ Sort order communicated in table headers (aria-sort)
□ Required fields communicated (required attribute or aria-required)
□ Disabled elements communicated (disabled attribute or aria-disabled)

6.6 — MOTION & ANIMATION AUDIT

□ prefers-reduced-motion query wraps ALL animations:
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
□ No auto-playing videos or carousels without pause control
□ No flashing content (more than 3 flashes per second)
□ Parallax effects respect prefers-reduced-motion
□ Page transitions respect prefers-reduced-motion
□ Toast/notification animations respect prefers-reduced-motion
```

---

## PHASE 7: RESPONSIVE DESIGN SURGICAL AUDIT

```
EVERY PAGE AND COMPONENT MUST RENDER CORRECTLY AT EVERY BREAKPOINT.

7.1 — BREAKPOINT TEST MATRIX

Test every page at these exact viewports:

MOBILE:
  320px  × 568px   — iPhone SE / smallest supported
  375px  × 667px   — iPhone 8 / standard mobile
  390px  × 844px   — iPhone 14 / modern mobile
  412px  × 915px   — Pixel 7 / large Android

TABLET:
  744px  × 1133px  — iPad Mini
  768px  × 1024px  — iPad (standard, portrait)
  810px  × 1080px  — iPad 10th gen
  1024px × 768px   — iPad (landscape)
  1024px × 1366px  — iPad Pro 12.9 (portrait)

DESKTOP:
  1280px × 800px   — Small laptop (MacBook Air 13)
  1440px × 900px   — Standard laptop (MacBook Pro 14)
  1920px × 1080px  — Full HD monitor
  2560px × 1440px  — QHD / ultrawide (ensure max-width containment)
  3840px × 2160px  — 4K (ensure content doesn't float in ocean of space)

FOR EACH VIEWPORT, CHECK:
□ No horizontal scrollbar (overflow-x: hidden is a bandaid, not a fix)
□ No content truncated or hidden unintentionally
□ No overlapping elements
□ Text is readable without zooming (min 16px body, 14px secondary)
□ Touch targets ≥ 44x44px on mobile (48x48px preferred)
□ Spacing proportional to viewport (not too cramped or too spacious)
□ Images scale properly (no stretching, no overflow)
□ Tables scroll horizontally OR reflow to card layout on mobile
□ Navigation collapses to mobile menu at appropriate breakpoint
□ Modals don't overflow viewport on small screens
□ Forms are single-column on mobile
□ Side-by-side layouts stack vertically on mobile
□ Typography scales appropriately (clamp or responsive sizes)
□ Grid columns reduce appropriately per breakpoint
□ Fixed/sticky elements don't cover content on small screens
□ Bottom navigation doesn't overlap with system UI (safe area insets)

7.2 — MOBILE-FIRST VERIFICATION

CODE MUST BE MOBILE-FIRST:

❌ WRONG (desktop-first):
className="flex-row md:flex-col"           // starts row, stacks on tablet??
className="grid-cols-3 sm:grid-cols-1"     // starts 3 cols, goes to 1??
className="text-xl sm:text-base"           // starts XL, shrinks??

✅ CORRECT (mobile-first):
className="flex flex-col md:flex-row"      // stacks mobile, row on tablet+
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="text-base md:text-lg lg:text-xl"

VERIFY: Every responsive class escalates from mobile UP.
If ANY class goes from larger to smaller, it's backwards.

7.3 — SAFE AREA AND NOTCH HANDLING

FOR MOBILE WEB:
□ env(safe-area-inset-top) applied to fixed headers
□ env(safe-area-inset-bottom) applied to fixed footers/bottom nav
□ env(safe-area-inset-left/right) for landscape on notched devices
□ viewport-fit=cover in meta viewport tag
□ Bottom sheets/drawers account for home indicator height

7.4 — CONTAINER AND LAYOUT AUDIT

□ Page content has max-width container (not stretching to 4K)
□ Content width comfortable for reading (max ~75ch for text)
□ Grid gap uses spacing tokens (not arbitrary values)
□ Flexbox gap used instead of margin hacks
□ No margin-based spacing between siblings (use parent gap)
□ Sticky headers have correct stacking context
□ Scroll areas have overscroll-behavior configured
□ Horizontal scroll containers have scroll-snap (for carousels)
□ Print stylesheet considered (or @media print { display: none })

7.5 — BROWSER COMPATIBILITY AUDIT

TEST AND VERIFY IN:
□ Chrome (latest - 2)
□ Firefox (latest - 2)
□ Safari (latest - 2) — CRITICAL: many CSS bugs
□ Edge (latest - 2)
□ Safari iOS (latest - 2) — CRITICAL: viewport issues
□ Chrome Android (latest - 2)
□ Samsung Internet (latest) — significant market share

COMMON SAFARI GOTCHAS TO CHECK:
□ -webkit-overflow-scrolling: touch (if legacy support needed)
□ 100vh includes URL bar on iOS (use 100dvh or JS workaround)
□ position: sticky in overflow containers
□ Flexbox gap support (available Safari 14.1+)
□ CSS backdrop-filter needs -webkit- prefix
□ Date input rendering (Safari minimal support)
□ File input styling limitations
□ PWA splash screen / status bar styling
□ overscroll-behavior not supported in older Safari
□ CSS container queries (Safari 16+)

COMMON FIREFOX GOTCHAS TO CHECK:
□ Scrollbar styling uses scrollbar-width/scrollbar-color (not ::-webkit-)
□ backdrop-filter support
□ Some CSS math function limitations

PROGRESSIVE ENHANCEMENT:
□ @supports used for cutting-edge CSS features
□ Fallbacks exist for unsupported features
□ Core functionality works without JavaScript (form submissions, links)
□ No-JS fallback message if JavaScript is required
```

---

## PHASE 8: WHITE LABEL ARCHITECTURE AUDIT

```
THE ENTIRE UI MUST BE FULLY REBRANDABLE WITHOUT CODE CHANGES.

8.1 — THEME INJECTION VERIFICATION

□ All visual properties flow from CSS custom properties
□ Tenant theme loads via:
  - Database config → CSS variable injection (server-rendered)
  - data-tenant attribute on <html> or <body>
  - Tenant-scoped CSS loaded dynamically
□ Theme switching is instant (no flash of default theme)
□ Theme applied before first paint (no FOUC — Flash of Unstyled Content)

8.2 — BRANDABLE ASSET AUDIT

Every tenant must be able to customize:
□ Logo (header, footer, login page, email, favicon)
□ App name / product name (never hardcoded)
□ Primary color palette (brand.primary, brand.secondary, brand.accent)
□ Font family (display, body, mono)
□ Border radius scale (sharp vs rounded aesthetic)
□ Shadow intensity (flat vs elevated aesthetic)
□ Dark mode colors
□ Favicon / app icon
□ Meta title pattern ("{Page} | {Tenant Name}")
□ OG image template
□ Email header/footer branding
□ Loading screen / splash screen

VERIFY EACH IS SOURCED FROM TENANT CONFIG:
□ No "MyApp" or "Our Platform" or "YourBrand" hardcoded anywhere
□ No logo files referenced directly (loaded from tenant config or CDN)
□ No color values that aren't CSS variables
□ No font names in component files

8.3 — COMPONENT THEME PROP AUDIT

Every design system component must derive its visual properties
from tokens, NOT from hardcoded classes:

❌ HARDCODED VARIANT:
const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  destructive: 'bg-red-600 hover:bg-red-700 text-white',
};

✅ TOKEN-DRIVEN VARIANT:
const buttonVariants = {
  primary: 'bg-brand-primary hover:bg-brand-primary/90 text-text-inverse',
  destructive: 'bg-state-error hover:bg-state-error/90 text-text-inverse',
};

AUDIT EVERY CVA / CLASS-VARIANCE-AUTHORITY DEFINITION:
Every variant class must reference semantic tokens, not raw Tailwind colors.

8.4 — MULTI-THEME TESTING

Verify the UI renders correctly with at minimum:
□ Default light theme
□ Default dark theme
□ High-contrast light theme (WCAG AAA)
□ A "wildly different" brand theme (e.g., neon green primary, rounded-full radii)
  This catches hardcoded values that survive the other themes.
```

---

## PHASE 9: COMPONENT API QUALITY AUDIT

```
EVERY DESIGN SYSTEM COMPONENT MUST MEET THIS API STANDARD:

9.1 — PROPS INTERFACE

REQUIRED FOR EVERY COMPONENT:

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'link';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  /** Loading state — disables interactions and shows spinner */
  loading?: boolean;
  /** Renders as child element (for Radix Slot pattern) */
  asChild?: boolean;
}

RULES:
□ Props extend native HTML element attributes (spread ...rest onto root)
□ Variants use string union types (not boolean flags like isPrimary)
□ Optional props have sensible defaults
□ Required props are truly required (no "it breaks without this")
□ No props named className — use cn() merger pattern instead
□ Component accepts className for composition (merged, not replaced)
□ ref forwarded via React.forwardRef
□ displayName set for DevTools debugging
□ JSDoc comments on every prop
□ Default values documented

9.2 — COMPONENT IMPLEMENTATION STANDARD

EVERY COMPONENT MUST:

□ Use cn() or clsx + tailwind-merge for className merging:
  className={cn(baseStyles, variantStyles[variant], className)}

□ Spread remaining props onto root element:
  <button {...rest} className={cn(...)} ref={ref}>

□ Handle disabled + loading states:
  const isDisabled = disabled || loading;
  <button disabled={isDisabled} aria-busy={loading}>

□ Support polymorphic rendering (asChild or as prop) where appropriate

□ Have NO side effects (no data fetching, no subscriptions, no timers)

□ Be pure presentational (no business logic)

□ Have a single root element (no fragments as root unless intentional)

9.3 — COMPOSITION PATTERNS

COMPOUND COMPONENTS (for complex UI):
// ✅ Correct: Compound component pattern
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Subtitle</Card.Description>
  </Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>

// ❌ Wrong: Prop soup
<Card
  title="Title"
  description="Subtitle"
  body={<div>Content</div>}
  footer={<Button>Action</Button>}
/>

SLOT PATTERN (for flexible layouts):
// ✅ Correct: Slot-based composition
<PageHeader
  leading={<BackButton />}
  title="Settings"
  trailing={<SaveButton />}
/>

// ❌ Wrong: Hardcoded layout with booleans
<PageHeader
  showBackButton={true}
  title="Settings"
  showSaveButton={true}
/>
```

---

## PHASE 10: FINAL UI CERTIFICATION

```
COMPLETE THIS CHECKLIST — EVERY ITEM MUST PASS:

TOKEN LAYER:
□ Single token file is the source of truth for ALL visual values
□ CSS variables defined for all themeable properties
□ Dark mode tokens complete and tested
□ White-label override layer functional and tested
□ No raw color, spacing, font, radius, shadow, or z-index values in components

INLINE STYLES:
□ Zero inline styles without justification comment
□ Every surviving inline style has @ui-audit comment explaining why

AD HOC COMPONENTS:
□ Zero ad hoc UI patterns in page/feature files
□ Every UI pattern routes through design system
□ Design system component inventory is complete

HARDCODED VALUES:
□ Zero hardcoded user-facing strings in components
□ Zero hardcoded URLs/paths in components
□ Zero magic numbers in components
□ Zero hardcoded breakpoint values in components

DUPLICATES:
□ Zero duplicate component implementations
□ Zero unused/dead components in codebase
□ Zero unused CSS files or modules
□ Every component imported from canonical location

ACCESSIBILITY:
□ Semantic HTML on every page (landmarks, headings, lists)
□ Every interactive element keyboard accessible
□ Every form input has associated label
□ Every image has appropriate alt text
□ Every icon button has accessible name
□ Focus management correct for all overlays
□ Color contrast meets WCAG AA on all text
□ Screen reader navigation logical and complete
□ prefers-reduced-motion respected globally
□ Skip navigation link present and functional

RESPONSIVE:
□ Every page tested at all breakpoints in the matrix
□ Mobile-first implementation verified
□ No horizontal overflow at any viewport
□ Touch targets ≥ 44px on mobile
□ Safe area insets handled for notched devices
□ Browser compatibility verified (Chrome, Firefox, Safari, Edge)
□ Safari iOS viewport issues addressed

WHITE LABEL:
□ Theme injection functional (no flash of default)
□ All brand assets sourced from tenant config
□ All copy sourced from constants/i18n (not hardcoded)
□ UI renders correctly with "wildly different" test theme
□ Component variants use semantic tokens, not raw colors

COMPONENT QUALITY:
□ Every component has typed props interface
□ Every component forwards ref
□ Every component merges className (not replaces)
□ Every component spreads remaining HTML attributes
□ Compound component pattern used for complex UI
□ No prop drilling beyond 2 levels
```

---

## UI CERTIFICATION SCORECARD

```
╔══════════════════════════════════════════════════════════╗
║              UI CERTIFICATION SCORECARD                 ║
╠════════════════════════════════════╦═════════╦══════════╣
║ LAYER                              ║ SCORE   ║ STATUS   ║
╠════════════════════════════════════╬═════════╬══════════╣
║ Design Token Architecture          ║   /100  ║          ║
║ Inline Style Elimination           ║   /100  ║          ║
║ Ad Hoc Component Elimination       ║   /100  ║          ║
║ Hardcoded Value Elimination        ║   /100  ║          ║
║ Duplicate Component Elimination    ║   /100  ║          ║
║ Semantic HTML & Landmarks          ║   /100  ║          ║
║ Keyboard Accessibility             ║   /100  ║          ║
║ Screen Reader Compatibility        ║   /100  ║          ║
║ Color & Contrast Compliance        ║   /100  ║          ║
║ Motion & Animation Safety          ║   /100  ║          ║
║ Responsive — Mobile (320-480px)    ║   /100  ║          ║
║ Responsive — Tablet (768-1024px)   ║   /100  ║          ║
║ Responsive — Desktop (1280+)       ║   /100  ║          ║
║ Responsive — Ultra-wide (2560+)    ║   /100  ║          ║
║ Cross-Browser Compatibility        ║   /100  ║          ║
║ Safari-Specific Audit              ║   /100  ║          ║
║ White Label Theme Architecture     ║   /100  ║          ║
║ White Label Asset Management       ║   /100  ║          ║
║ White Label Copy Externalization   ║   /100  ║          ║
║ Component API Quality              ║   /100  ║          ║
║ Component Composition Patterns     ║   /100  ║          ║
║ Component Documentation            ║   /100  ║          ║
╠════════════════════════════════════╬═════════╬══════════╣
║ OVERALL UI SCORE                   ║   /100  ║          ║
╠════════════════════════════════════╩═════════╩══════════╣
║                                                         ║
║ CERTIFICATION: [ CERTIFIED / BLOCKED ]                  ║
║ INLINE STYLES REMAINING: [ must be 0 or justified ]     ║
║ AD HOC COMPONENTS REMAINING: [ must be 0 ]              ║
║ HARDCODED VALUES REMAINING: [ must be 0 ]               ║
║ DUPLICATE COMPONENTS REMAINING: [ must be 0 ]           ║
║ ACCESSIBILITY VIOLATIONS: [ must be 0 ]                 ║
║ RESPONSIVE FAILURES: [ must be 0 ]                      ║
║ WHITE LABEL FAILURES: [ must be 0 ]                     ║
║                                                         ║
║ MINIMUM SCORE TO CERTIFY: 95 per layer                  ║
║ MINIMUM OVERALL TO CERTIFY: 95                          ║
║                                                         ║
╚═════════════════════════════════════════════════════════╝
```

---

## EXECUTION PROTOCOL

**When you receive a codebase to audit with this prompt:**

1. **Phase 0**: Map every UI file. Build the component registry. Run all grep scans.
2. **Phase 1**: Audit and remediate the token/theming layer. If it doesn't exist, build it.
3. **Phase 2**: Open every component file. Find and destroy every inline style.
4. **Phase 3**: Find and extract every ad hoc pattern to design system components.
5. **Phase 4**: Find and replace every hardcoded value with tokens/constants.
6. **Phase 5**: Find and merge every duplicate. Delete every dead component.
7. **Phase 6**: Audit every page and component for WCAG 2.1 AA compliance.
8. **Phase 7**: Test every page at every breakpoint. Fix every responsive failure.
9. **Phase 8**: Verify white-label theming works with alternate brand.
10. **Phase 9**: Audit every component API for quality and composition.
11. **Phase 10**: Complete the final checklist and produce the scorecard.

**FOR EVERY VIOLATION:**
- Report the exact file and line
- Show the offending code
- Write the corrected code
- Apply the fix
- Move to the next violation

**You are not done until every file has been opened, every violation has been fixed, and the scorecard is 95+ across the board.**

**This is surgery, not consultation.**

---

*GHXSTSHIP Industries LLC — Every Pixel. Every Token. Every Device. No Exceptions.*
*UI Audit Protocol v1.0 — Built for white-label-ready, enterprise-grade interfaces*