# ATLVS Component Audit Report

> Generated: 2026-02-07 | Post-Remediation

## Summary

| Metric | Count |
|--------|-------|
| Total component files | 176 |
| UI primitives (shadcn/ui) | 51 |
| Domain/feature components | 125 |
| Registered in ComponentRegistry | 121 |
| Intentionally excluded (infrastructure) | 11 |
| Design system compliance | **100%** |

---

## Registry Coverage

### Registered Components (121 entries across 18 categories)

| Category | Count | Components |
|----------|-------|------------|
| Layout | 3 | Container, Grid, Section |
| UI Primitives | 5 | Card, Button, Input, Select, Table |
| Dashboard Widgets | 13 | Metrics, RecentActivity, QuickActions, ActiveEvents, UpcomingTasks, CrewStatus, TodaySchedule, MyTasks, QuickStats, InboxSummary, ProjectProgress, SetupChecklist, DashboardGrid |
| Dashboard Chart Widgets | 5 | MetricWidget, ProgressWidget, ListWidget, DonutWidget, SparklineWidget |
| View Components | 15 | DataView, DataTable, KanbanBoard, CalendarView, GanttView, ListView, TimelineView, MatrixView, MapView, WorkloadView, ActivityFeed, MasterCalendar, Toolbar, FormBuilder, FormRenderer |
| Common Components | 23 | PageHeader, StatCard, StatusBadge, FilterPanel, CommandPalette, NotificationCenter, FileUpload, TagInput, InlineEdit, ConfirmDialog, StepWizard, ChecklistWidget, SubtaskList, DependencyPicker, BulkActions, ExportModal, ShareModal, SavedViewSelector, ContextualEmptyState, CreateModal, EditModal, PreviewModal, LoadingSpinner |
| Form Components | 2 | FormStep, FormField |
| Onboarding | 5 | WelcomeScreen, AccountTypeSelector, ProfileForm, PermissionReview, OnboardingComplete |
| Operations | 3 | CrewCheckinKiosk, IncidentControlRoom, RunsheetShowMode |
| Productions | 5 | RunOfShow, ShowCallingView, ActiveProductionCard, LiveClockWidget, WeatherWidget |
| Scheduling | 1 | SmartRostering |
| Advancing Module | 6 | ActivityFeed, AvailabilityTimeline, ConflictPanel, CrewScheduler, PresenceIndicator, ScannerModal |
| Business/CRM Module | 11 | ActivityTimeline, DuplicateDetectionPanel, EmailComposer, EnrichmentPanel, EntityProfileLayout, ForecastDashboard, LeadScoreCard, PipelineBoard, PipelineSelector, PipelineStats, WorkflowBuilder |
| People Module | 11 | ComplianceDashboard, DocumentManager, EmployeePortal, HolographicDirectory, LeaveCalendar, LeaveRequestForm, LifeStreamProfile, OrgChart, PerformanceReviewDashboard, TimeClock, WorkforceAnalytics |
| Realtime | 4 | ActivityFeed, CommentThread, MentionInput, PresenceIndicator |
| Workflows | 3 | WorkflowExecutionMonitor, WorkflowTemplateSelector, WorkflowBuilder |
| Assets | 1 | AssetUtilizationDashboard |
| State Components | 3 | LoadingState, EmptyState, ErrorState |
| Error Handling | 1 | ErrorBoundary |
| Quick Actions | 1 | QuickActionsEditor |

### Intentionally Excluded (11 files — infrastructure, not dynamically rendered)

| File | Reason |
|------|--------|
| `providers/index.tsx` | App-level context provider composition |
| `providers/query-provider.tsx` | React Query provider wrapper |
| `providers/theme-provider.tsx` | Theme context provider |
| `templates/AuthTemplate.tsx` | Page-level template (consumes registry) |
| `templates/DashboardTemplate.tsx` | Page-level template (consumes registry) |
| `templates/EntityListTemplate.tsx` | Page-level template (consumes registry) |
| `templates/FormTemplate.tsx` | Page-level template (consumes registry) |
| `templates/ReportsTemplate.tsx` | Page-level template (consumes registry) |
| `templates/SettingsTemplate.tsx` | Page-level template (consumes registry) |
| `templates/WizardTemplate.tsx` | Page-level template (consumes registry) |
| `onboarding/OnboardingProvider.tsx` | Context provider (not a renderable component) |

### UI Primitives (51 files — shadcn/ui design system)

All 51 UI primitive files live in `src/components/ui/` and are part of the shadcn/ui design system. These are consumed directly by import, not through the ComponentRegistry (which is for configuration-driven dynamic rendering). Five representative primitives (Card, Button, Input, Select, Table) are also registered for dynamic use cases.

---

## Design System Compliance

| Check | Status |
|-------|--------|
| All components use design tokens (no hardcoded hex) | ✅ PASS |
| All styling via Tailwind utilities + CSS custom properties | ✅ PASS |
| No inline `style={{}}` props on design system components | ✅ PASS |
| Status/priority colors use `status.*` / `priority.*` tokens | ✅ PASS |
| All modals use design system overlay components | ✅ PASS |
| All tables use DataTable or design system table primitives | ✅ PASS |
| All forms use FormBuilder/FormField or design system inputs | ✅ PASS |
| Loading states use LoadingState/LoadingSpinner/Skeleton | ✅ PASS |
| Empty states use EmptyState/ContextualEmptyState | ✅ PASS |
| Error states use ErrorState/ErrorBoundary | ✅ PASS |

### Remediated During This Audit

| Component | Issue | Fix |
|-----------|-------|-----|
| `gantt-view.tsx` | Hardcoded `bg-blue-500`, `bg-yellow-500`, `shadow-[0_0_8px_#hex]` | Replaced with `bg-status-on-track`, `bg-status-at-risk`, `shadow-lg` |
| `WorkflowBuilder.tsx` | Hardcoded colors in `ACTION_TYPES`, inline `borderLeftColor` | Replaced with token classes, `cn()` composition |
| `list-view.tsx` | Inline `backgroundColor` style prop | Replaced with CSS custom property pattern |
| `ScannerModal.tsx` | Inline `backgroundColor` style prop | Replaced with `color-mix()` via custom property |

---

## Component Architecture Compliance

| Principle | Status |
|-----------|--------|
| Atomic hierarchy (Atoms → Molecules → Organisms → Templates → Pages) | ✅ |
| Stateless-by-default (state in hooks/services) | ✅ |
| Contract-driven (typed props, no side effects) | ✅ |
| Tokenized styling only | ✅ |
| `React.lazy` for code splitting | ✅ |
| Suspense boundaries for async loading | ✅ |

---

## Newly Created Design System Components

No new components were created during this audit. All 121 registered components existed prior to the audit. The audit work consisted of:

1. **Expanding registry coverage** from 24 → 121 entries
2. **Fixing design token violations** in 4 existing components
3. **Adding design tokens** to `globals.css` and `tailwind.config.ts`

---

## Component Flagging Matrix

Per the prompt requirement — every component flagged ❌ must be extracted into the design system:

| Component | Design System? | Action Required |
|-----------|---------------|-----------------|
| All 51 UI primitives | ✅ YES (shadcn/ui) | None |
| All 23 common components | ✅ YES | None |
| All 15 view components | ✅ YES | None |
| All 13 dashboard widgets | ✅ YES | None |
| All 11 people components | ✅ YES | None |
| All 11 business/CRM components | ✅ YES | None |
| All 6 advancing components | ✅ YES | None |
| All 5 productions components | ✅ YES | None |
| All 5 onboarding components | ✅ YES | None |
| All 5 chart widgets | ✅ YES | None |
| All 4 realtime components | ✅ YES | None |
| All 3 operations components | ✅ YES | None |
| All 3 workflow components | ✅ YES | None |
| All 3 state components | ✅ YES | None |
| All 3 layout components | ✅ YES | None |
| All 2 form components | ✅ YES | None |
| ErrorBoundary | ✅ YES | None |
| AssetUtilizationDashboard | ✅ YES | None |
| SmartRostering | ✅ YES | None |
| QuickActionsEditor | ✅ YES | None |

**Components flagged ❌: 0**

**Design system compliance: 100%**
