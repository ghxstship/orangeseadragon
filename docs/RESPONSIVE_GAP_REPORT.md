# ATLVS — Comprehensive Responsive Gap Report

**Date:** 2026-02-16
**Scope:** Full UI codebase audit — layout shell, 12 layout templates, 16 view components, 48 UI primitives, CSS foundations, hooks, CRUD system, hub pages

---

## Executive Summary

The ATLVS codebase has **strong responsive foundations** at the CSS/token layer (fluid typography, touch targets, safe areas, reduced-motion, RTL). The **layout template system** (12 layouts) is well-structured with sticky headers, overflow handling, and flex-based content areas. However, there are **systematic gaps at the component and page level** that would cause breakage or poor UX on mobile/tablet viewports.

### Severity Scale

| Level | Meaning |
|-------|---------|
| 🔴 **Critical** | Broken or unusable on mobile viewports |
| 🟠 **High** | Significant UX degradation on small screens |
| 🟡 **Medium** | Suboptimal but functional; polish issue |
| 🟢 **Low** | Minor improvement opportunity |

---

## 1. Responsive Foundations — What's Working Well ✅

### CSS Layer (`globals.css`)
- **Fluid typography**: `clamp()` on h1/h2/h3 — scales between mobile and desktop
- **Touch targets**: `@media (pointer: coarse)` enforces 44×44px minimum (WCAG 2.5.8)
- **Safe areas**: `env(safe-area-inset-*)` utilities for notched devices
- **Reduced motion**: `prefers-reduced-motion` kills all animations/transitions
- **RTL support**: Direction flips for sidebar, margins, padding, borders
- **CJK/Arabic fonts**: Language-specific font families via `[lang]` selectors

### Tailwind Config
- Full design token system mapped to CSS variables (semantic, status, priority, chart, marker colors)
- Container centered with `2rem` padding, `1400px` max at 2xl
- `tailwindcss-animate` plugin for keyframe animations

### Hooks
- `useBreakpoint` — SSR-safe `isMobile`/`isTablet`/`isDesktop` with `current` breakpoint
- `useMediaQuery` — SSR-safe `window.matchMedia` wrapper

### Layout Templates
- **ListLayout** — `sm:flex-row` header, `p-4 sm:p-6` content, `overflow-x-auto scrollbar-hide` on tabs
- **DetailLayout** — `sm:flex-row` header, responsive avatar sizing, sidebar `hidden lg:block`
- **SplitLayout** — Full mobile stacking via `useBreakpoint`, resizable panels on desktop
- **FormLayout** — `max-w-3xl mx-auto`, sidebar `hidden lg:block`
- **DashboardLayout** — Responsive grid columns (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`)
- **WizardLayout** — `max-w-2xl mx-auto`, sticky header/footer

### UI Primitives
- **BentoGrid** — Collapses to single column on mobile via `grid-cols-1 md:grid-cols-*`
- **Motion primitives** — All respect `useReducedMotion()`
- **Dialog/Sheet/Drawer** — Glass overlay with backdrop blur, proper z-indexing
- **MobileSidebar** — Sheet-based navigation for small screens

---

## 2. Critical Gaps 🔴

### G-01: FormLayout header not responsive on mobile
**File:** `src/lib/layouts/FormLayout.tsx:81`
**Issue:** Header uses `flex items-center justify-between px-6 py-4` without `flex-col` / `sm:flex-row` breakpoint. On narrow screens, the title + Cancel/Save buttons will overflow horizontally.
**Fix:** Add `flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` pattern (matching ListLayout/DetailLayout).

### G-02: DashboardLayout header not responsive on mobile
**File:** `src/lib/layouts/DashboardLayout.tsx:101`
**Issue:** Same pattern — `flex items-center justify-between px-6 py-4` without column stacking. The date range selector + refresh + customize buttons will collide with the title on mobile.
**Fix:** Apply `flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 sm:px-6 sm:py-4`.

### G-03: CanvasLayout toolbar overflows on mobile
**File:** `src/lib/layouts/CanvasLayout.tsx:171`
**Issue:** Toolbar has tool selection, undo/redo, grid toggle, zoom slider, and save all in a single `flex items-center justify-between` row. No wrapping or collapse behavior. Completely unusable on mobile.
**Fix:** Hide non-essential controls on mobile, use a toolbar overflow menu, or stack into two rows.

### G-04: WorkspaceLayout header not responsive
**File:** `src/lib/layouts/WorkspaceLayout.tsx:130`
**Issue:** Header `flex items-center justify-between px-6 py-4` — no column stacking. Collaborator avatars + favorite + share + settings + more + sidebar toggle will overflow.
**Fix:** Apply responsive flex pattern. Consider collapsing action buttons into a single overflow menu on mobile.

### G-05: DocumentLayout sidebar never accessible on mobile
**File:** `src/lib/layouts/DocumentLayout.tsx:211-241`
**Issue:** Sidebar has no `hidden lg:block` or mobile equivalent. It renders inline, consuming horizontal space on small screens. No Sheet-based mobile alternative.
**Fix:** Add `hidden lg:block` to sidebar `<aside>`, provide a Sheet-based mobile sidebar triggered from the header toggle.

### G-06: SettingsLayout sidebar always visible, no mobile collapse
**File:** `src/lib/layouts/SettingsLayout.tsx:118-147`
**Issue:** Left navigation sidebar (`w-56 border-r`) renders at all breakpoints with no responsive hiding. On mobile, it consumes ~224px of a 375px viewport.
**Fix:** Add `hidden md:block` to sidebar, provide a mobile navigation alternative (e.g., horizontal scrollable tabs or a Sheet).

### G-07: WorkspaceLayout sidebars never hidden on mobile
**File:** `src/lib/layouts/WorkspaceLayout.tsx:268-293, 302-309`
**Issue:** Both left tab sidebar (`w-56`) and right sidebar render at all breakpoints. No `hidden lg:block` or mobile alternative.
**Fix:** Hide sidebars below `lg` breakpoint, provide Sheet-based alternatives.

---

## 3. High-Severity Gaps 🟠

### G-08: DataTable has no mobile adaptation
**File:** `src/components/views/data-table.tsx`
**Issue:** The table renders a full HTML `<table>` with horizontal scroll (`overflow-x-auto`). While functional, on mobile this creates a tiny viewport with horizontal scrolling that's difficult to use. No card/list fallback for mobile.
**Recommendation:** When `isMobile`, switch to a stacked card layout or use the existing `ListView` component. The `DataView` component already supports view type switching — wire `useBreakpoint` to auto-select `list` view on mobile.

### G-09: Toolbar overflows on mobile
**File:** `src/components/views/toolbar.tsx`
**Issue:** Toolbar renders search, filters, column visibility, view switcher, bulk actions, import/export all in a single row. No responsive wrapping or overflow menu.
**Recommendation:** Wrap secondary actions (columns, import, export) into a "More" dropdown on mobile. Keep search + view switcher visible.

### G-10: WorkloadView fixed-width columns
**File:** `src/components/views/workload-view.tsx`
**Issue:** Day columns use fixed widths. On mobile, the grid overflows horizontally with no indication of scrollability.
**Recommendation:** Add horizontal scroll indicators, reduce visible days on mobile (e.g., 3-day view instead of 7), or collapse to a summary view.

### G-11: GanttView not mobile-friendly
**File:** `src/components/views/gantt-view.tsx`
**Issue:** Gantt charts are inherently wide. The component has no mobile adaptation — no zoom-to-fit, no simplified timeline, no touch gesture support for panning.
**Recommendation:** On mobile, show a simplified timeline or list view. Add pinch-to-zoom and swipe-to-pan for tablet.

### G-12: TimelineView horizontal overflow
**File:** `src/components/views/timeline-view.tsx`
**Issue:** Similar to Gantt — horizontal timeline with zoom levels. No mobile adaptation.
**Recommendation:** Default to a wider zoom level (months) on mobile, or switch to a vertical timeline.

### G-13: CalendarView month grid too dense on mobile
**File:** `src/components/views/calendar-view.tsx`
**Issue:** Month view renders a 7-column grid. On 375px screens, each cell is ~50px wide — too small for event text. No responsive mode switching.
**Recommendation:** Auto-switch to agenda/list view on mobile, or show a 1-day/3-day view.

### G-14: RichTextEditor toolbar wrapping
**File:** `src/components/ui/rich-text-editor.tsx`
**Issue:** Toolbar renders 15+ formatting buttons in a single `flex flex-wrap` row. While `flex-wrap` helps, the toolbar becomes very tall on mobile with no grouping or overflow.
**Recommendation:** Group related actions, collapse less-used actions into a "More" popover on mobile.

### G-15: MapView no responsive sizing
**File:** `src/components/views/map-view.tsx`
**Issue:** Map container uses a fixed height. Sidebar filters render alongside the map with no responsive stacking.
**Recommendation:** Stack filters above map on mobile, make map height responsive (`h-[50vh] lg:h-full`).

### G-16: Carousel prev/next buttons positioned outside container
**File:** `src/components/ui/carousel.tsx:207-213, 237-241`
**Issue:** `CarouselPrevious` uses `-left-12` and `CarouselNext` uses `-right-12`, positioning buttons 48px outside the carousel container. On mobile with tight margins, these buttons will be clipped or overlap adjacent content.
**Recommendation:** Move buttons inside the carousel on mobile (`left-2`/`right-2`) with semi-transparent backgrounds, or use swipe gestures only.

---

## 4. Medium-Severity Gaps 🟡

### G-17: Container component lacks responsive max-width
**File:** `src/components/layout/Container.tsx`
**Issue:** Uses a single `maxWidth` prop (default `max-w-7xl`). No responsive stepping (e.g., `max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl`).
**Impact:** Content jumps to full width on mobile rather than having appropriate padding.

### G-18: Grid component has no responsive column override
**File:** `src/components/layout/Grid.tsx`
**Issue:** Accepts a `cols` prop but applies it at all breakpoints. No `sm:grid-cols-*` / `md:grid-cols-*` responsive behavior.
**Impact:** A 12-column grid renders 12 columns on mobile.

### G-19: TopBar breadcrumb overflow
**File:** `src/components/layout/top-bar.tsx`
**Issue:** Breadcrumbs can grow long on deeply nested pages. While `BreadcrumbEllipsis` exists, there's no responsive truncation strategy — on mobile the breadcrumb + action buttons compete for space.
**Recommendation:** Collapse breadcrumbs to show only the last 1-2 segments on mobile, with a dropdown for the full path.

### G-20: StatGrid columns not always responsive
**File:** `src/components/common/stat-card.tsx` (via ListLayout/hub pages)
**Issue:** `StatGrid` accepts a `columns` prop (2/3/4) but some usages pass `columns={4}` without mobile fallback. Four stat cards at 375px = ~94px each.
**Recommendation:** Ensure StatGrid always uses `grid-cols-2 md:grid-cols-{n}` pattern.

### G-21: DetailLayout sidebar has no mobile access
**File:** `src/lib/layouts/DetailLayout.tsx:255-264`
**Issue:** Sidebar uses `hidden lg:block` — correct for hiding on mobile, but there's no Sheet-based alternative. Users on mobile/tablet cannot access sidebar content (stats, quick actions, activity, related records).
**Recommendation:** Add a Sheet triggered by the existing sidebar toggle button when below `lg` breakpoint.

### G-22: FormBuilder drag-and-drop not touch-friendly
**File:** `src/components/views/form-builder.tsx`
**Issue:** Uses `@dnd-kit` which supports touch, but the drag handles and drop zones are sized for mouse interaction. Field settings panel renders as a sidebar with no mobile adaptation.
**Recommendation:** Increase touch target sizes for drag handles, use a Sheet for field settings on mobile.

### G-23: KanbanBoard columns overflow horizontally
**File:** `src/components/views/kanban-board.tsx`
**Issue:** Kanban columns render in a horizontal `flex` row. On mobile, this creates horizontal scroll which is expected, but there's no visual indicator of scrollability and no snap behavior.
**Recommendation:** Add scroll snap (`snap-x snap-mandatory`), show partial next column as a scroll hint.

### G-24: InlineEditCell touch interaction
**File:** `src/components/views/inline-edit-cell.tsx`
**Issue:** Click-to-edit requires precise clicking on small table cells. On touch devices, the edit trigger area may be too small.
**Recommendation:** On `pointer: coarse`, increase the clickable area or show an explicit edit button.

### G-25: ColorPicker preset grid too dense on mobile
**File:** `src/components/ui/color-picker.tsx`
**Issue:** Preset color swatches render in a `grid grid-cols-8` grid. On a narrow popover, swatches become very small.
**Recommendation:** Reduce to `grid-cols-6` or `grid-cols-5` on mobile.

### G-26: DashboardGrid widget layout not responsive
**File:** `src/components/dashboard/DashboardGrid.tsx`
**Issue:** Widget grid uses a 12-column CSS grid with widget-specific `colSpan`/`rowSpan`. Widgets that span 4+ columns will overflow on mobile.
**Recommendation:** Collapse all widgets to `col-span-full` on mobile, `col-span-6` on tablet.

---

## 5. Low-Severity Gaps 🟢

### G-27: CanvasLayout sidebar has no responsive hiding
**File:** `src/lib/layouts/CanvasLayout.tsx:298-304, 326-333`
**Issue:** Left/right sidebars render at all breakpoints. Canvas layouts are inherently desktop-oriented, but should still gracefully degrade.

### G-28: WizardLayout step indicators overflow
**File:** `src/lib/layouts/WizardLayout.tsx:136-163`
**Issue:** Step indicators render horizontally with fixed `w-12` connectors. With many steps (6+), this overflows on mobile.
**Recommendation:** Switch to a compact progress bar on mobile (already present), hide individual step indicators.

### G-29: MatrixView quadrant labels
**File:** `src/components/views/matrix-view.tsx`
**Issue:** 4-quadrant view with axis labels. On mobile, the quadrants become too small to be useful.
**Recommendation:** Consider a list-based alternative on mobile.

### G-30: MasterCalendar source filter sidebar
**File:** `src/components/views/master-calendar.tsx`
**Issue:** Source filtering panel renders alongside the calendar. No responsive stacking.

### G-31: ActivityFeed type filter bar
**File:** `src/components/views/activity-feed.tsx`
**Issue:** Filter buttons render in a horizontal row. With many activity types, this wraps but could benefit from a dropdown on mobile.

---

## 6. Missing Responsive Patterns

### P-01: No global responsive container query strategy
The codebase uses viewport-based media queries exclusively. Container queries (`@container`) would allow components to adapt based on their actual rendered width, which is critical for components used in sidebars, split panels, and varying layout contexts.

### P-02: No responsive image strategy
No `<picture>` elements, no `srcset` attributes, no responsive image loading. All images load at full resolution regardless of viewport.

### P-03: No viewport meta tag verification
The root `layout.tsx` should be verified to include `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` for proper mobile rendering and safe area support.

### P-04: No responsive table strategy at the primitive level
The `Table` primitive (`src/components/ui/table.tsx`) wraps in `overflow-x-auto` but has no built-in responsive mode (e.g., stacked rows, hidden columns). Each consumer must implement their own mobile adaptation.

### P-05: No responsive navigation pattern for deep hierarchies
The sidebar + top-bar navigation works well for desktop but on mobile, navigating deep hierarchies (e.g., Productions > Events > Event Detail > Tasks > Task Detail) requires many taps with no breadcrumb trail visible.

---

## 7. Recommended Remediation Priority

### Phase 1 — Critical (Week 1)
| ID | Gap | Effort |
|----|-----|--------|
| G-01 | FormLayout header responsive | S |
| G-02 | DashboardLayout header responsive | S |
| G-04 | WorkspaceLayout header responsive | S |
| G-05 | DocumentLayout mobile sidebar | M |
| G-06 | SettingsLayout mobile navigation | M |
| G-07 | WorkspaceLayout mobile sidebars | M |
| G-03 | CanvasLayout toolbar overflow | L |

### Phase 2 — High (Week 2-3)
| ID | Gap | Effort |
|----|-----|--------|
| G-08 | DataTable mobile card fallback | L |
| G-09 | Toolbar responsive overflow | M |
| G-21 | DetailLayout mobile sidebar Sheet | M |
| G-13 | CalendarView mobile mode | M |
| G-14 | RichTextEditor toolbar grouping | M |
| G-16 | Carousel button positioning | S |
| G-23 | KanbanBoard scroll snap | S |

### Phase 3 — Medium (Week 3-4)
| ID | Gap | Effort |
|----|-----|--------|
| G-10 | WorkloadView mobile adaptation | M |
| G-11 | GanttView mobile fallback | L |
| G-12 | TimelineView mobile adaptation | M |
| G-15 | MapView responsive stacking | M |
| G-17 | Container responsive max-width | S |
| G-18 | Grid responsive columns | S |
| G-19 | TopBar breadcrumb truncation | M |
| G-20 | StatGrid responsive columns | S |

### Phase 4 — Polish (Week 4+)
All 🟢 low-severity items + missing patterns (P-01 through P-05).

---

## 8. Files Scanned

### Layout Shell (6 files)
- `src/components/layout/app-shell.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/top-bar.tsx`
- `src/components/layout/Container.tsx`
- `src/components/layout/Grid.tsx`
- `src/components/layout/Section.tsx`

### Layout Templates (12 files)
- `src/lib/layouts/ListLayout.tsx`
- `src/lib/layouts/DetailLayout.tsx`
- `src/lib/layouts/FormLayout.tsx`
- `src/lib/layouts/DashboardLayout.tsx`
- `src/lib/layouts/SplitLayout.tsx`
- `src/lib/layouts/WizardLayout.tsx`
- `src/lib/layouts/WorkspaceLayout.tsx`
- `src/lib/layouts/CanvasLayout.tsx`
- `src/lib/layouts/DocumentLayout.tsx`
- `src/lib/layouts/SettingsLayout.tsx`
- `src/lib/layouts/EmptyLayout.tsx`
- `src/lib/layouts/ErrorLayout.tsx`

### View Components (16 files)
- `src/components/views/data-table.tsx`
- `src/components/views/data-view.tsx`
- `src/components/views/toolbar.tsx`
- `src/components/views/inline-edit-cell.tsx`
- `src/components/views/kanban-board.tsx`
- `src/components/views/calendar-view.tsx`
- `src/components/views/timeline-view.tsx`
- `src/components/views/gantt-view.tsx`
- `src/components/views/map-view.tsx`
- `src/components/views/matrix-view.tsx`
- `src/components/views/list-view.tsx`
- `src/components/views/form-builder.tsx`
- `src/components/views/dashboard-widgets.tsx`
- `src/components/views/workload-view.tsx`
- `src/components/views/master-calendar.tsx`
- `src/components/views/activity-feed.tsx`

### UI Primitives (48 files)
- All files in `src/components/ui/` (see `src/components/ui/index.ts` for full list)

### CRUD System (6 files)
- `src/lib/crud/components/CrudList.tsx`
- `src/lib/crud/components/CrudDetail.tsx`
- `src/lib/crud/components/CrudForm.tsx`
- `src/lib/crud/components/DynamicForm.tsx`
- `src/lib/crud/components/TabRenderer.tsx`
- `src/lib/crud/components/SidebarRenderer.tsx`

### CSS & Config (3 files)
- `src/app/globals.css`
- `tailwind.config.ts`
- `src/lib/config.ts`

### Hooks (3 files)
- `src/hooks/use-breakpoint.ts`
- `src/hooks/use-media-query.ts`
- `src/hooks/use-copilot-context.ts`

### Hub Pages (2 files sampled)
- `src/app/(app)/productions/page.tsx`
- `src/app/(app)/core/dashboard/page.tsx`

**Total files scanned: ~96**
