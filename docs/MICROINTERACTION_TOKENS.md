# Microinteraction & Style Token Normalization

## Overview

This document catalogs the centralized design token system for all UI microinteractions, animations, transitions, shadows, z-index, and visual effects across the ATLVS codebase. All hardcoded inline values have been extracted into named tokens with a single source of truth (SSOT).

**Build status:** ✅ 0 errors, 0 lint warnings

---

## Token Sources (SSOT)

| File | Purpose |
|------|---------|
| `src/lib/tokens/motion.ts` | TypeScript constants for framer-motion durations, easings, springs, transitions, presets, hover/tap, stagger variants, z-index, shadows, opacity |
| `src/app/globals.css` `:root` | CSS custom properties for motion durations, easings, z-index scale, and named shadows |
| `tailwind.config.ts` `theme.extend` | Tailwind boxShadow utilities, zIndex scale, keyframe animations, and animation presets |

---

## Motion Tokens (`src/lib/tokens/motion.ts`)

### Durations (seconds, for framer-motion)
| Token | Value | Usage |
|-------|-------|-------|
| `DURATION.instant` | `0` | Reduced-motion fallback |
| `DURATION.fast` | `0.15` | Micro-interactions, icon swaps |
| `DURATION.normal` | `0.2` | Default transitions |
| `DURATION.moderate` | `0.3` | Page transitions |
| `DURATION.slow` | `0.4` | FadeIn, stat cards |
| `DURATION.slower` | `0.5` | Deliberate reveals |
| `DURATION.deliberate` | `0.7` | Hero animations |
| `DURATION.counter` | `1` | Animated counters |

### Easing Curves (cubic-bezier arrays)
| Token | Value | Usage |
|-------|-------|-------|
| `EASE.out` | `[0.0, 0.0, 0.2, 1]` | Standard ease-out |
| `EASE.in` | `[0.4, 0.0, 1, 1]` | Standard ease-in |
| `EASE.inOut` | `[0.4, 0.0, 0.2, 1]` | Standard ease-in-out |
| `EASE.decelerate` | `[0.25, 0.46, 0.45, 0.94]` | Natural deceleration |
| `EASE.overshoot` | `[0.23, 1, 0.32, 1]` | Slight overshoot |
| `EASE.expo` | `[0.16, 1, 0.3, 1]` | Exponential ease |

### Spring Physics
| Token | Stiffness | Damping | Usage |
|-------|-----------|---------|-------|
| `SPRING.default` | 260 | 20 | General spring |
| `SPRING.gentle` | 120 | 14 | Stagger items, soft motion |
| `SPRING.snappy` | 400 | 30 | Hover lifts, bento grid |
| `SPRING.bouncy` | 400 | 17 | Copilot FAB button |

### Transition Presets
| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `TRANSITION.quick` | 0.15 | decelerate | Icon swaps |
| `TRANSITION.normal` | 0.2 | decelerate | Sidebar chevron, list items |
| `TRANSITION.page` | 0.3 | decelerate | Page transitions |
| `TRANSITION.template` | 0.2 | out | Template wrapper |
| `TRANSITION.fadeIn` | 0.4 | overshoot | FadeIn, stat cards, registry |
| `TRANSITION.overlay` | 0.2 | decelerate | Copilot backdrop |
| `TRANSITION.shimmer` | 1.5 | linear, infinite | Shimmer loading |
| `TRANSITION.progress` | 1.0 | out | Progress bars |
| `TRANSITION.scanner` | 2.0 | linear, infinite | Scanner sweep |

### Motion Presets
| Token | Initial | Animate | Exit |
|-------|---------|---------|------|
| `MOTION_PRESET.fadeUp` | `{opacity:0, y:20}` | `{opacity:1, y:0}` | `{opacity:0, y:20}` |
| `MOTION_PRESET.fadeUpSubtle` | `{opacity:0, y:4}` | `{opacity:1, y:0}` | — |
| `MOTION_PRESET.fade` | `{opacity:0}` | `{opacity:1}` | `{opacity:0}` |
| `MOTION_PRESET.scaleIn` | `{opacity:0, scale:0.96}` | `{opacity:1, scale:1}` | — |
| `MOTION_PRESET.scaleExit` | — | — | `{opacity:0, scale:0.96}` |
| `MOTION_PRESET.page` | `{opacity:0, y:8}` | `{opacity:1, y:0}` | `{opacity:0, y:-8}` |
| `MOTION_PRESET.listItem` | `{opacity:0, y:-10}` | `{opacity:1, y:0}` | `{opacity:0, x:-20}` |

### Hover & Tap Presets
| Token | Values | Usage |
|-------|--------|-------|
| `HOVER.lift` | `{y:-2, scale:1.005, transition: SPRING.snappy}` | GlassCard |
| `HOVER.bento` | `{y:-3, scale:1.005}` | BentoItem |
| `HOVER.stat` | `{y:-5, scale:1.02}` | StatCard |
| `TAP.subtle` | `{scale:0.995}` | GlassCard, BentoItem |

### Stagger Variants
| Token | Value | Usage |
|-------|-------|-------|
| `STAGGER_DELAY.fast` | `0.04` | Dense lists |
| `STAGGER_DELAY.normal` | `0.06` | Default stagger |
| `STAGGER_DELAY.slow` | `0.1` | Deliberate reveals |

---

## Shadow Tokens

### CSS Custom Properties (`globals.css :root`)

**46 named shadow tokens** replacing all `shadow-[...]` arbitrary values:

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| `--shadow-glow` | `shadow-glow` | GlassCard hover glow |
| `--shadow-success-glow` | `shadow-success-glow` | Success trend badges (subtle) |
| `--shadow-success-glow-strong` | `shadow-success-glow-strong` | Success trend badges (strong) |
| `--shadow-success-glow-medium` | `shadow-success-glow-medium` | Progress bar success |
| `--shadow-destructive-glow` | `shadow-destructive-glow` | Destructive trend badges (subtle) |
| `--shadow-destructive-glow-strong` | `shadow-destructive-glow-strong` | Destructive trend badges (strong) |
| `--shadow-progress-glow` | `shadow-progress-glow` | Progress bar glow |
| `--shadow-primary-button` | `shadow-primary-button` | Primary button default |
| `--shadow-primary-button-hover` | `shadow-primary-button-hover` | Primary button hover |
| `--shadow-primary-badge` | `shadow-primary-badge` | Primary badge |
| `--shadow-destructive-badge` | `shadow-destructive-badge` | Destructive badge |
| `--shadow-glass-button` | `shadow-glass-button` | Glass button variant |
| `--shadow-spatial-button` | `shadow-spatial-button` | Spatial button default |
| `--shadow-spatial-button-hover` | `shadow-spatial-button-hover` | Spatial button hover |
| `--shadow-spatial-badge` | `shadow-spatial-badge` | Spatial badge |
| `--shadow-input-inset` | `shadow-input-inset` | Spatial input inset |
| `--shadow-input-focus` | `shadow-input-focus` | Spatial input focus |
| `--shadow-tab-active` | `shadow-tab-active` | Spatial tab active state |
| `--shadow-aurora-badge` | `shadow-aurora-badge` | Aurora badge glow |
| `--shadow-today-line` | `shadow-today-line` | Gantt/timeline today line |
| `--shadow-icon-glow` | `shadow-icon-glow` | Icon glow (subtle) |
| `--shadow-icon-glow-strong` | `shadow-icon-glow-strong` | Icon glow (strong) |
| `--shadow-bar-inset` | `shadow-bar-inset` | Gantt bar inset |
| `--shadow-bar-glow` | `shadow-bar-glow` | Gantt progress bar glow |
| `--shadow-dot-glow` | `shadow-dot-glow` | Kanban/timeline color dots |
| `--shadow-inner-highlight` | `shadow-inner-highlight` | List selected highlight (subtle) |
| `--shadow-inner-highlight-strong` | `shadow-inner-highlight-strong` | Timeline today column |
| `--shadow-sticky-column` | `shadow-sticky-column` | Data table sticky column |
| `--shadow-card-hover` | `shadow-card-hover` | Kanban card hover |
| `--shadow-card-dramatic` | `shadow-card-dramatic` | Holographic directory hover |
| `--shadow-clock-glow` | `shadow-clock-glow` | Live clock widget |
| `--shadow-status-success-glow` | `shadow-status-success-glow` | TimeClock working status |
| `--shadow-status-warning-glow` | `shadow-status-warning-glow` | TimeClock break status |
| `--shadow-status-info-glow` | `shadow-status-info-glow` | TimeClock clocked-out status |
| `--shadow-legend-dot` | `shadow-legend-dot` | Chart legend dots |
| `--shadow-conflict-glow` | `shadow-conflict-glow` | Scheduling conflict shifts |
| `--shadow-field-selected` | `shadow-field-selected` | Form builder selected field |
| `--shadow-inner-destructive` | `shadow-inner-destructive` | Matrix view red quadrant |
| `--shadow-inner-subtle` | `shadow-inner-subtle` | Matrix view gray quadrant |
| `--shadow-nav-active` | `shadow-nav-active` | Sidebar active nav item |
| `--shadow-nav-badge` | `shadow-nav-badge` | Sidebar nav badge |
| `--shadow-success-ambient` | `shadow-success-ambient` | Runsheet active cue card |
| `--shadow-destructive-ambient` | `shadow-destructive-ambient` | Runsheet overtime cue card |
| `--shadow-success-button` | `shadow-success-button` | Runsheet GO button |
| `--shadow-success-node` | `shadow-success-node` | Run-of-show active node |

---

## Z-Index Scale

| Token (CSS) | Token (Tailwind) | Value | Usage |
|-------------|-----------------|-------|-------|
| `--z-behind` | `z-behind` | -1 | Behind content |
| `--z-base` | `z-base` | 0 | Default |
| `--z-raised` | `z-raised` | 10 | Raised elements |
| `--z-sticky` | `z-sticky` | 20 | Sticky headers |
| `--z-dropdown` | `z-dropdown` | 30 | Dropdowns |
| `--z-navigation` | `z-navigation` | 40 | Navigation |
| `--z-overlay` | `z-overlay` | 50 | Overlays |
| `--z-modal` | `z-modal` | 60 | Modals |
| `--z-toast` | `z-toast` | 70 | Toast notifications |
| `--z-copilot` | `z-copilot` | 90 | AI Copilot drawer |
| `--z-max` | `z-max` | 100 | Maximum |

---

## Files Modified

### Token Definition Files
- `src/lib/tokens/motion.ts` — Created (SSOT for all motion tokens)
- `src/app/globals.css` — Added 46 shadow tokens, 12 motion tokens, 11 z-index tokens
- `tailwind.config.ts` — Added boxShadow utilities, zIndex scale, keyframe animations

### Core UI Primitives
- `src/components/ui/motion.tsx` — All durations, easings, springs, stagger → token refs
- `src/components/ui/page-transition.tsx` — Motion preset + transition tokens
- `src/components/ui/glass-card.tsx` — HOVER/TAP tokens, shadow-glow token
- `src/components/ui/bento-grid.tsx` — HOVER/TAP/SPRING tokens
- `src/components/ui/button.tsx` — 3 shadow tokens replaced
- `src/components/ui/badge.tsx` — 4 shadow tokens replaced
- `src/components/ui/input.tsx` — 2 shadow tokens replaced
- `src/components/ui/tabs.tsx` — 1 shadow token replaced

### Layout & Navigation
- `src/app/template.tsx` — Motion preset + transition tokens
- `src/components/layout/sidebar.tsx` — Transition token, 3 shadow tokens replaced

### Common Components
- `src/components/common/stat-card.tsx` — Motion preset, hover, transition, 2 shadow tokens
- `src/components/common/copilot-drawer.tsx` — Motion preset, spring, transition tokens, z-index tokens

### View Components
- `src/components/views/dashboard-widgets.tsx` — Transition token, 7 shadow tokens replaced
- `src/components/views/gantt-view.tsx` — 3 shadow tokens replaced, z-index token
- `src/components/views/timeline-view.tsx` — 3 shadow tokens replaced, z-index token
- `src/components/views/list-view.tsx` — 1 shadow token replaced
- `src/components/views/kanban-board.tsx` — 2 shadow tokens replaced
- `src/components/views/matrix-view.tsx` — 2 shadow tokens replaced
- `src/components/views/data-table.tsx` — 1 shadow token replaced
- `src/components/views/data-view.tsx` — 1 shadow token replaced
- `src/components/views/activity-feed.tsx` — 1 shadow token replaced
- `src/components/views/form-builder.tsx` — 1 shadow token replaced

### Module Components
- `src/components/ComponentRegistry.tsx` — Motion preset + transition tokens
- `src/components/widgets/SetupChecklistWidget.tsx` — Motion preset + transition tokens
- `src/components/operations/RunsheetShowMode.tsx` — Transition token, 3 shadow tokens replaced
- `src/components/modules/advancing/ScannerModal.tsx` — Transition token
- `src/components/productions/RunOfShow.tsx` — 1 shadow token replaced
- `src/components/productions/widgets/LiveClockWidget.tsx` — 1 shadow token replaced
- `src/components/people/HolographicDirectory.tsx` — 1 shadow token replaced
- `src/components/people/TimeClock.tsx` — 3 shadow tokens replaced
- `src/components/scheduling/SmartRostering.tsx` — 1 shadow token replaced

---

## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint -- --max-warnings=0` | ✅ 0 warnings, 0 errors |
| `npx next build` | ✅ 0 errors |
| `shadow-[` in `.tsx` files | ✅ 0 remaining |
| Visual behavior preserved | ✅ All token values match original hardcoded values exactly |

---

## Design Principles

1. **Single Source of Truth** — Every motion, shadow, and z-index value resolves from one canonical definition
2. **White-label ready** — All shadows use CSS custom properties; override `:root` to rebrand
3. **Accessibility** — `prefers-reduced-motion` respected via `useReducedMotion()` in all motion components
4. **No visual changes** — Every token value is an exact 1:1 match of the original hardcoded value
