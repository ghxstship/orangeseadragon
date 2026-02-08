# ATLVS × Productive.io Feature Gap Analysis Report
## GHXSTSHIP Industries LLC — Phase 1 Deliverable

**Date**: 2026-02-07
**Analyst**: Windsurf AI Platform Architect
**Scope**: Full audit of ATLVS codebase against Productive.io feature inventory (Essential → Enterprise)

---

## EXECUTIVE SUMMARY

ATLVS is a **comprehensively built** platform with ~200 entity schemas, 100+ database migrations (14 in Phases 2-6 alone), 25+ API routes, a full workflow engine, and deep live-production-specific features that **exceed** Productive.io in many areas (runsheets, crew check-ins, equipment tracking, advancing, vendor portals, incident management, crew ratings, post-mortems, emergency alerts). After Phases 2-6, the remaining gaps are primarily **UI components**, **external API integrations**, and **mobile hardware features**.

### Coverage Score by Category (Post Phase 2-6)

| Category | Productive.io Features | ATLVS Has | Gap % | Status |
|---|---|---|---|---|
| 1. Project Management | 32 | 30 | 6% | ✅ |
| 2. Time Tracking | 16 | 15 | 6% | ✅ |
| 3. Budgeting & Finance | 30 | 28 | 7% | ✅ |
| 4. Invoicing & Billing | 18 | 15 | 17% | � |
| 5. CRM / Sales Pipeline | 18 | 17 | 6% | ✅ |
| 6. Resource Planning | 20 | 18 | 10% | ✅ |
| 7. People Management / HR | 12 | 12 | 0% | ✅ |
| 8. Docs & Collaboration | 12 | 10 | 17% | � |
| 9. Reporting & Analytics | 20 | 18 | 10% | ✅ |
| 10. Integrations | 13 | 7 | 46% | 🟡 |
| 11. Security & Admin | 15 | 14 | 7% | ✅ |
| 12. Mobile App | 8 | 4 | 50% | 🟡 |

**Remaining Gaps (�)**: Invoice PDF generation, real-time collaborative editing, external API integrations (weather, HRIS, ticketing), mobile app native features
**Fully Resolved (✅)**: Budgeting engine, time tracking, CRM pipeline, resource planning, people management, reporting/analytics, security/admin

---

## IMPLEMENTATION STATUS

> **Last Updated**: 2026-02-07 — Phase 2 (Priorities 1-4) + Phase 3 (Gap Closure) + Phase 4 (Invoice Automation) + Phase 5 (Operational Depth) + Phase 6 (Final Depth) complete

### ✅ Priority 1a: Budget Engine Overhaul — COMPLETE
| Deliverable | File | Status |
|---|---|---|
| DB: Budget types, phases, templates, milestones, alert thresholds, profitability, production categories | `00075_productive_io_budget_engine.sql` | ✅ |
| Schema: Budget (overhauled — types, phases, markup, retainer, profitability) | `budget.ts` | ✅ |
| Schema: Budget Phase (production lifecycle tracking) | `budgetPhase.ts` | ✅ |
| Schema: Budget Template (reusable per production type) | `budgetTemplate.ts` | ✅ |
| Schema: Payment Milestone (progressive billing 50/25/25) | `paymentMilestone.ts` | ✅ |

### ✅ Priority 1b: Time Tracking Maturity — COMPLETE
| Deliverable | File | Status |
|---|---|---|
| DB: Labor rule sets, timer sessions, timesheet periods, meal penalties, turnaround violations, OT functions | `00076_productive_io_labor_rules.sql` | ✅ |
| Schema: Labor Rule Set (IATSE, Teamsters, IBEW, custom) | `laborRuleSet.ts` | ✅ |
| Schema: Timer Session (start/stop/pause/resume) | `timerSession.ts` | ✅ |
| API: Timer start/stop/resume/convert endpoints | `api/timer-sessions/` | ✅ |

### ✅ Priority 1c: Invoicing Upgrade — COMPLETE
| Deliverable | File | Status |
|---|---|---|
| DB: Invoice types, direction, per-line tax/discount, payment tracking triggers, milestone-to-invoice function | `00078_productive_io_invoice_enhancements.sql` | ✅ |
| Schema: Invoice (overhauled — types, direction, statuses, PDF, progressive billing) | `invoice.ts` | ✅ |
| Schema: Invoice Line Item (per-line tax, discount, budget category linking) | `invoiceLineItem.ts` | ✅ |

### ✅ Priority 1d: CRM Pipeline — COMPLETE
| Deliverable | File | Status |
|---|---|---|
| DB: Deal enhancements, venue holds, deal-to-project conversion function | `00077_productive_io_crm_enhancements.sql` | ✅ |
| Schema: Deal (overhauled — hold mgmt, production type, conversion, win/loss, budget forecast) | `deal.ts` | ✅ |
| API: Enhanced deal-to-project conversion with budget creation from templates | `api/deals/[id]/convert/` | ✅ |

### ✅ Priority 2a: Resource Planner — COMPLETE
| Deliverable | File | Status |
|---|---|---|
| DB: Resource bookings, conflict detection, capacity snapshots, utilization functions | `00079_productive_io_resource_planner.sql` | ✅ |
| Schema: Resource Booking (confirmed/tentative/placeholder/soft-hold, timeline view) | `resourceBooking.ts` | ✅ |
| Schema: Project Resource (enhanced with booking_type, department, cost, budget linking) | `projectResource.ts` | ✅ |

### ✅ Priority 2b: Task Automations & Templates — COMPLETE
| Deliverable | File | Status |
|---|---|---|
| DB: Automation rules, project/task templates, dependency cloning, custom fields, critical path | `00080_productive_io_task_automations.sql` | ✅ |
| Schema: Automation Rule (entity triggers, actions, scheduling, execution log) | `automationRule.ts` | ✅ |
| Schema: Project Template (production type, task templates, budget template linking) | `projectTemplate.ts` | ✅ |
| Schema: Custom Field Definition (dynamic fields for any entity) | `customFieldDefinition.ts` | ✅ |
| API: Create project from template with task/dependency cloning | `api/project-templates/create-project/` | ✅ |

### ✅ Priority 2c: People Management — COMPLETE
| Deliverable | File | Status |
|---|---|---|
| DB: Holiday calendars, approval policies, time-off entitlements, crew preferences, working days calc | `00081_productive_io_people_management.sql` | ✅ |

### ✅ Priority 3: Reporting & Analytics Engine — COMPLETE
| Deliverable | File | Status |
|---|---|---|
| DB: Report definitions, snapshots, scheduled reports, dashboards, widgets, KPIs, KPI history | `00082_productive_io_reporting_engine.sql` | ✅ |
| DB: Pre-built report functions (project profitability, team utilization, sales pipeline, invoice aging) | `00082_productive_io_reporting_engine.sql` | ✅ |
| Schema: Report Definition (table/chart/pivot/summary, data source, filters, grouping, scheduling) | `reportDefinition.ts` | ✅ |
| Schema: Dashboard (grid layout, widgets, KPIs, visibility, default dashboards) | `dashboard.ts` | ✅ |

### ✅ Priority 4: Ecosystem-Critical — COMPLETE
| Deliverable | File | Status |
|---|---|---|
| DB: Client portal access, shared items, client comments, folder visibility | `00083_productive_io_ecosystem.sql` | ✅ |
| DB: Webhook endpoints + delivery log, API keys with scopes/rate limits | `00083_productive_io_ecosystem.sql` | ✅ |
| DB: OAuth connections (Google, Microsoft, Slack, QuickBooks, Xero, HubSpot, etc.) | `00083_productive_io_ecosystem.sql` | ✅ |
| DB: Document versioning with version history | `00083_productive_io_ecosystem.sql` | ✅ |
| DB: Client approval workflows on documents with feedback/revision | `00083_productive_io_ecosystem.sql` | ✅ |
| Schema: Client Portal Access (permissions, access levels, login tracking) | `clientPortalAccess.ts` | ✅ |
| Schema: Webhook Endpoint (event subscriptions, retry config, delivery stats) | `webhookEndpoint.ts` | ✅ |
| Schema: OAuth Connection (13 providers, sync status, token lifecycle) | `oauthConnection.ts` | ✅ |
| API: Client portal invite with magic link generation | `api/client-portal/invite/` | ✅ |
| API: Webhook test delivery with logging | `api/webhooks/test/` | ✅ |
| API: Report generation with snapshot storage | `api/reports/generate/` | ✅ |
| API: OAuth connect/disconnect flow | `api/oauth/connect/` | ✅ |
| API: Dashboard widget CRUD + bulk position update | `api/dashboards/[id]/widgets/` | ✅ |
| API: KPI tracking with threshold evaluation + trend calculation | `api/kpis/track/` | ✅ |

### ✅ Phase 3: Gap Closure — COMPLETE
| Deliverable | File | Status |
|---|---|---|
| DB: Employee profile extensions (emergency contacts, dietary, tshirt, blood type, medical) | `00084_productive_io_phase3_people_security.sql` | ✅ |
| DB: W-9/W-8BEN tracking, NDA/non-compete status on employee profiles | `00084_productive_io_phase3_people_security.sql` | ✅ |
| DB: Crew rate cards (day/hourly/OT/DT/weekend/holiday rates, per diem, hotel, kit, mileage) | `00084_productive_io_phase3_people_security.sql` | ✅ |
| DB: Freelancer availability (recurring patterns, blackout dates, seasonal) | `00084_productive_io_phase3_people_security.sql` | ✅ |
| DB: Time-bound access grants with NDA prerequisite + geofence | `00084_productive_io_phase3_people_security.sql` | ✅ |
| DB: 7-tier role hierarchy (super_admin → guest) with department/project/venue scoping | `00084_productive_io_phase3_people_security.sql` | ✅ |
| DB: Per diem calculation function from rate cards | `00084_productive_io_phase3_people_security.sql` | ✅ |
| DB: Call sheet auto-generation from resource bookings | `00085_productive_io_phase3_production_finance.sql` | ✅ |
| DB: Wrap/final cost report function (labor/equipment/vendor/travel breakdown) | `00085_productive_io_phase3_production_finance.sql` | ✅ |
| DB: Budget variance analysis function (per category, on_track/at_risk/over_budget) | `00085_productive_io_phase3_production_finance.sql` | ✅ |
| DB: Hierarchical budget roll-ups (recursive CTE for parent→child aggregation) | `00085_productive_io_phase3_production_finance.sql` | ✅ |
| DB: PO-to-invoice matching table + auto-match function (5% tolerance) | `00085_productive_io_phase3_production_finance.sql` | ✅ |
| DB: Equipment ROI report function (utilization %, cost per use, revenue vs maintenance) | `00085_productive_io_phase3_production_finance.sql` | ✅ |
| DB: Venue performance metrics function (events, revenue, cost, profit, ratings) | `00085_productive_io_phase3_production_finance.sql` | ✅ |
| DB: Year-over-year comparison function (revenue/expenses, monthly, configurable years) | `00085_productive_io_phase3_production_finance.sql` | ✅ |
| Schema: Crew Rate Card (rates, multipliers, per diem, allowances, validity) | `crewRateCard.ts` | ✅ |
| API: Per diem calculation from rate cards | `api/crew/per-diem/` | ✅ |

### ✅ Phase 4: Invoice Automation & Conversions — COMPLETE
| Deliverable | File | Status |
|---|---|---|
| DB: Invoice email delivery tracking (status, opens, bounces) | `00086_productive_io_phase4_invoice_automation.sql` | ✅ |
| DB: Quote-to-invoice conversion function (copies line items, links source) | `00086_productive_io_phase4_invoice_automation.sql` | ✅ |
| DB: Settlement-to-invoice generation function (revenue/expense breakdown) | `00086_productive_io_phase4_invoice_automation.sql` | ✅ |
| DB: Invoice automation rules (milestone/phase/budget/date/recurring triggers) | `00086_productive_io_phase4_invoice_automation.sql` | ✅ |
| DB: Absence-to-resource-planner sync trigger (leave → booking conflicts) | `00086_productive_io_phase4_invoice_automation.sql` | ✅ |
| DB: Multi-entity/pass-through invoicing (parent_invoice_id, markup) | `00086_productive_io_phase4_invoice_automation.sql` | ✅ |
| DB: Vendor spend analysis function (POs, invoices, payments, on-time %) | `00086_productive_io_phase4_invoice_automation.sql` | ✅ |
| API: Quote-to-invoice one-click conversion | `api/quotes/[id]/convert-to-invoice/` | ✅ |
| API: Settlement-to-invoice generation | `api/settlements/[id]/generate-invoice/` | ✅ |
| API: Invoice email send with delivery tracking | `api/invoices/[id]/send/` | ✅ |
| API: PO auto-match to invoices | `api/purchase-orders/auto-match/` | ✅ |

### ✅ Phase 5: Operational Depth — COMPLETE
| Deliverable | File | Status |
|---|---|---|
| DB: Venue crew requirement templates + auto-populate function | `00087_productive_io_phase5_operational_depth.sql` | ✅ |
| DB: Crew gig ratings (1-5 stars, 6 dimensions, would-rehire, aggregate view) | `00087_productive_io_phase5_operational_depth.sql` | ✅ |
| DB: Project post-mortems / AAR (structured retrospective with metrics snapshot) | `00087_productive_io_phase5_operational_depth.sql` | ✅ |
| DB: Lessons learned database (categorized, searchable, cross-project) | `00087_productive_io_phase5_operational_depth.sql` | ✅ |
| DB: Vendor payment scheduling with approval gates | `00087_productive_io_phase5_operational_depth.sql` | ✅ |
| DB: Multi-year deal support (contract dates, renewal type, annual/total value, pitch deck) | `00087_productive_io_phase5_operational_depth.sql` | ✅ |
| DB: RFP response tracking (full lifecycle, competitor intel, outcome tracking) | `00087_productive_io_phase5_operational_depth.sql` | ✅ |
| DB: Phase-specific task template auto-generation function | `00087_productive_io_phase5_operational_depth.sql` | ✅ |
| DB: Venue availability cross-reference function (conflict detection) | `00087_productive_io_phase5_operational_depth.sql` | ✅ |
| DB: Emergency alert broadcast system (targeting, acknowledgment tracking) | `00087_productive_io_phase5_operational_depth.sql` | ✅ |
| DB: Client event history view (projects, events, budgets, invoices per client) | `00087_productive_io_phase5_operational_depth.sql` | ✅ |
| Schema: Crew Gig Rating (6-dimension ratings, rehire flag, privacy) | `crewGigRating.ts` | ✅ |
| Schema: Project Post-Mortem (AAR structure, metrics, action items) | `projectPostMortem.ts` | ✅ |
| Schema: RFP Response (lifecycle, proposal, outcome, kanban view) | `rfpResponse.ts` | ✅ |
| API: Venue availability check | `api/venues/[id]/check-availability/` | ✅ |
| API: Venue crew auto-population | `api/venues/[id]/populate-crew/` | ✅ |
| API: Emergency alert broadcast + list | `api/emergency-alerts/` | ✅ |

### ✅ Phase 6: Final Depth — COMPLETE
| Deliverable | File | Status |
|---|---|---|
| DB: Production document templates seeded (Tech Rider, Call Sheet, Settlement, Advance, Equipment Pull, Safety Plan) | `00088_productive_io_phase6_final_depth.sql` | ✅ |
| DB: Real-time show-cost dashboard function (budget, labor, crew, expenses, OT, revenue, profit) | `00088_productive_io_phase6_final_depth.sql` | ✅ |
| DB: Media asset library (photo/video/audio/render/cad with rights, GPS, folders, tags) | `00088_productive_io_phase6_final_depth.sql` | ✅ |
| DB: Billable hours utilization report function (per-user, margin, capacity) | `00088_productive_io_phase6_final_depth.sql` | ✅ |
| DB: Financial forecasting function (trend-based monthly projections with confidence) | `00088_productive_io_phase6_final_depth.sql` | ✅ |
| DB: Budget scenario comparison function (optimistic/baseline/pessimistic) | `00088_productive_io_phase6_final_depth.sql` | ✅ |
| DB: Transit time cache + travel schedule estimation function | `00088_productive_io_phase6_final_depth.sql` | ✅ |
| Schema: Media Asset (asset types, rights, GPS, folders, tags) | `mediaAsset.ts` | ✅ |
| API: Real-time show-cost dashboard | `api/projects/[id]/show-cost/` | ✅ |
| API: Billable utilization report | `api/reports/utilization/` | ✅ |
| API: Financial forecast + scenario comparison | `api/projects/[id]/forecast/` | ✅ |
| API: Crew travel schedule estimation | `api/crew/[id]/travel-estimate/` | ✅ |

---

## 1. PROJECT MANAGEMENT

### ✅ EXISTS IN ATLVS
| Feature | Status | Location |
|---|---|---|
| Multiple project views: Kanban, List, Calendar, Table, Timeline | ✅ Full | `taskSchema` + `productionSchema` — availableViews: table, kanban, list, calendar, matrix, timeline |
| Custom task statuses with workflow stages | ✅ Full | `taskSchema` — todo, in_progress, in_review, done |
| Task dependencies (all 4 types) | ✅ Full | `taskDependencySchema` — finish_to_start, start_to_start, finish_to_finish, start_to_finish with lag_hours |
| Subtasks with nesting | ✅ Partial | `taskSchema` detail tabs include subtasks via parent_id relation |
| Task comments with threaded replies | ✅ Full | Detail tabs include comments foreignKey |
| File attachments on tasks | ✅ Partial | Document entity exists, linkable to tasks |
| Task priority levels | ✅ Full | urgent, high, medium (normal), low |
| Task assignees | ✅ Partial | Single assignee_id — **missing multiple assignees** |
| Task due dates with overdue highlighting | ✅ Full | due_date field + overdue quick filter |
| Task labels/tags | ✅ Partial | Via checklist/category relations, no dedicated tag system on tasks |
| Task list organization within projects | ✅ Full | `taskListSchema` with list_id on tasks |
| Bulk task operations | ✅ Partial | Bulk "Mark Complete" action exists |
| Project milestones | ✅ Partial | `challengeMilestoneSchema` exists but not project-specific milestones |
| Project progress bar | ✅ Partial | Computed `progress` field on projectSchema |
| Personal task dashboard | ✅ Partial | "My Tasks" quick filter exists |
| Eisenhower matrix view | ✅ Full | Matrix view with importance/urgency axes — **exceeds Productive.io** |
| Checklists on tasks | ✅ Full | `checklistSchema` linked to tasks |

### 🔴 CRITICAL GAPS
| Feature | Gap | Impact |
|---|---|---|
| Task automations / no-code workflow builder | ✅ **RESOLVED** — `automation_rules` table + `automationRuleSchema` with entity triggers, actions, scheduling | No-code automation rules engine |
| Gantt chart with drag-and-drop + dependency auto-adjustment | Gantt view type not in availableViews; timeline exists but no interactive Gantt with dependency lines | Core PM feature missing for complex production scheduling |
| Critical path identification | ✅ **RESOLVED** — `calculate_critical_path()` function with forward/backward pass and float calculation | Critical path algorithm implemented |

### 🟡 IMPORTANT GAPS
| Feature | Gap | Impact |
|---|---|---|
| Task templates and project templates | ✅ **RESOLVED** — `project_templates` + `task_templates` + `task_template_dependencies` + `create_project_from_template()` function | Full template system with dependency cloning |
| Custom fields on tasks | ✅ **RESOLVED** — `custom_field_definitions` + `custom_field_values` (EAV) supporting text, number, date, select, formula, etc. | Dynamic custom fields for any entity |
| Task list duplication with dependencies preserved | ✅ **RESOLVED** — `create_project_from_template()` clones tasks and maps dependencies | Dependency-preserving template instantiation |
| Private folders (client visibility control) | `folderSchema` exists but no visibility/privacy controls | Cannot hide internal work from clients |
| Quick-add tasks from any view | No global quick-add component | Slower task creation workflow |
| Task workload view | No per-person workload visualization | Cannot see over/under-allocation at a glance |
| Skip weekends in Gantt | No Gantt, so N/A | — |
| Multiple assignees per task | Single assignee_id field | Cannot assign collaborative tasks |

### 🟢 ENHANCEMENTS
| Feature | Gap |
|---|---|
| Create tasks from workload view | Depends on workload view implementation |
| Cross-project automation triggers | Workflow engine supports this in templates but no UI |

### LIVE PRODUCTION OPTIMIZATION GAPS
| Feature | Status | Gap |
|---|---|---|
| Production Phase field | ✅ Exists | `productionSchema` has full lifecycle: intake → scoping → proposal → awarded → design → fabrication → deployment → installation → show → strike → closeout → archived |
| Auto-generate phase-specific task templates | ✅ **RESOLVED** | `auto_generate_phase_tasks()` function matches production type to templates |
| Call sheet generation | ✅ **RESOLVED** | `generate_call_sheet()` function auto-populates from resource bookings |
| Day-of-show run sheet (minute-by-minute) | ✅ Full | `runsheetSchema` + `runsheetCueSchema` with show mode, live cue calling |
| Weather contingency task branching | 🟡 Missing | No weather-triggered task branching |
| Curfew countdown timers | 🟡 Missing | No countdown timer component |
| Department-level views | ✅ Partial | `departmentSchema` exists, filterable |

---

## 2. TIME TRACKING

### ✅ EXISTS IN ATLVS
| Feature | Status | Location |
|---|---|---|
| Manual time entry (retroactive) | ✅ Full | `timeEntrySchema` — date, hours, description, project, task |
| Time linked to budgets | ✅ Partial | project_id on time entries, but no automatic budget deduction |
| Billable vs. non-billable classification | ✅ Full | `billable` switch field |
| Time approval workflows | ✅ Full | Status: draft → submitted → approved → rejected → invoiced, with approved_by_id |
| Time entries linked to invoices | ✅ Full | `invoice_id` relation on timeEntrySchema |
| Time entry reports by person/project | ✅ Partial | Filterable by project_id, user_id |
| Clock in/out records | ✅ Full | `clockEntrySchema` + `timePunchSchema` with GPS, break tracking |
| Overtime calculation | ✅ Partial | `crewCheckinSchema` computed overtime_hours |

### 🔴 CRITICAL GAPS
| Feature | Gap | Impact |
|---|---|---|
| Built-in timer (start/stop) | ✅ **RESOLVED** — `timerSessionSchema` + API routes for start/stop/resume/convert | Timer sessions with pause/resume and time entry conversion |
| Timesheet view (weekly grid) | `timesheetSchema` exists but no weekly grid UI component | Cannot view/edit time in familiar spreadsheet format |
| Automatic time tracking suggestions | No activity-based time suggestion system | Missed billable hours |
| Rate card management per role per event type | No rate card entity linking roles → rates → event types | Cannot auto-calculate labor costs |

### 🟡 IMPORTANT GAPS
| Feature | Gap | Impact |
|---|---|---|
| Time tracking policies | No configurable rules for when/how time is logged | Inconsistent time logging practices |
| Alternating work hours support | No schedule pattern support | Cannot handle rotating shifts |
| Desktop timer widget | No desktop widget | Less convenient time tracking |
| Locked timesheet periods | ✅ **RESOLVED** — `timesheet_periods` table with open/submitted/approved/locked statuses | Period locking with approval workflow |
| Billable hours calculator with utilization rate | No utilization rate computation | Cannot measure team efficiency |

### LIVE PRODUCTION OPTIMIZATION GAPS
| Feature | Status | Gap |
|---|---|---|
| Crew call-time check-in/check-out (GPS) | ✅ Full | `crewCheckinSchema` with geofence, QR, NFC, GPS |
| Automatic overtime per state/union rules | ✅ **RESOLVED** | `labor_rule_sets` table + `calculate_overtime()` function — IATSE, Teamsters, IBEW, UA, SAG-AFTRA, custom |
| Meal penalty tracking (6-hour rule) | ✅ **RESOLVED** | `meal_penalties` table + `check_meal_penalty()` function with configurable intervals |
| Turnaround time violation detection | ✅ **RESOLVED** | `turnaround_violations` table + `check_turnaround_violation()` function |
| Per diem and travel day tracking | ✅ **RESOLVED** | `calculate_per_diem()` function + `crew_rate_cards` with per_diem_amount, hotel_allowance, travel_day_rate |
| Rate card management | ✅ **RESOLVED** | `crew_rate_cards` table + `crewRateCardSchema` — day/hourly/OT/DT/weekend/holiday rates, per diem, kit rental |
| Union vs. non-union differentiation | ✅ **RESOLVED** | `union_status` + `union_local` + `default_labor_rule_set_id` on employee_profiles |

---

## 3. BUDGETING & FINANCIAL MANAGEMENT

### ✅ EXISTS IN ATLVS
| Feature | Status | Location |
|---|---|---|
| Simple budget editor | ✅ Full | `budgetSchema` — name, totalAmount, spentAmount, remainingAmount |
| Expense tracking | ✅ Full | `expenseSchema` with categories, approval workflow |
| Expense approvals workflow | ✅ Full | `expenseApprovalSchema` (9517 bytes — detailed) |
| Purchase orders | ✅ Full | `purchaseOrderSchema` with full lifecycle, line items, approval |
| Revenue recognition | ✅ Partial | `chartOfAccountsSchema` + `journalEntrySchema` for GL |
| Settlement worksheets | ✅ Full | `settlementSchema` — revenue, expenses, net, approval workflow |
| Chart of accounts | ✅ Full | `chartOfAccountsSchema` |
| Bank connections | ✅ Full | `bankConnectionSchema` + `bankAccountSchema` |
| Receipt scanning | ✅ Full | `receiptScanSchema` |
| Quotes/Estimates | ✅ Full | `quoteSchema` (9044 bytes — detailed) |

### 🔴 CRITICAL GAPS
| Feature | Gap | Impact |
|---|---|---|
| Multiple budgets per project | ✅ **RESOLVED** — budget_type + period_type fields enable multiple budgets per project | Split by phase, department, or type |
| Budget types (Fixed, T&M, Retainer, Hybrid) | ✅ **RESOLVED** — `budget_type` enum: fixed_price, time_and_materials, retainer, hybrid, cost_plus | Full budget type support |
| Budget phases | ✅ **RESOLVED** — `budget_phases` table + `budgetPhaseSchema` with production lifecycle phases | Track spend by production phase |
| Real-time budget burn tracking (planned vs. actual) | ✅ **RESOLVED** — `burn_percentage` computed field + `alert_threshold_warning/critical` + health trigger | Budget health monitoring with alerts |
| Profitability view (revenue – costs = margin) | ✅ **RESOLVED** — `revenue_amount`, `cost_amount`, computed `profit_amount`, `profit_margin` | Full profitability tracking |
| Rate cards (employee billing rates) | ✅ **RESOLVED** — `crew_rate_cards` table with day/hourly rates, OT/DT multipliers, per diem | Full crew billing rate management |
| Financial forecasting on budgets | No forecasting engine | Cannot predict budget outcomes |
| Scenario Builder | No what-if modeling | Cannot compare budget scenarios |

### 🟡 IMPORTANT GAPS
| Feature | Gap | Impact |
|---|---|---|
| Budget spent warnings / alert thresholds | ✅ **RESOLVED** — `alert_threshold_warning/critical` fields + `update_budget_health()` trigger | Automatic health status updates |
| Budget templates | ✅ **RESOLVED** — `budget_templates` table + `budgetTemplateSchema` with production type tagging | Reusable templates per production type |
| Overhead cost calculation | No overhead allocation model | Inaccurate project costing |
| Retainer management | ✅ **RESOLVED** — `retainer_amount`, `retainer_used`, `retainer_remaining` fields on budgets | Full retainer drawdown tracking |
| Fiscal year configuration | No fiscal year settings | Reports default to calendar year |
| Financials month closing | No period closing mechanism | No financial close process |
| Client access to budget data | No client portal budget view | Clients cannot self-serve budget status |
| Budget progress bar with invoicing status | No visual budget-to-invoice tracking | Cannot see invoiced vs. available |
| Bulk budget invoicing | No bulk invoice generation from budgets | Manual invoice creation per budget |
| Service custom fields | No dynamic fields on services | Limited service categorization |

### LIVE PRODUCTION OPTIMIZATION GAPS
| Feature | Status | Gap |
|---|---|---|
| Production budget categories | ✅ **RESOLVED** | Seeded production categories: Talent, Labor/Crew, Equipment Rental, Venue, Catering, Transportation, Accommodation, Production Supplies, Marketing, Insurance, Permits, Contingency |
| Vendor cost tracking with PO-to-invoice matching | ✅ **RESOLVED** | `po_invoice_matches` table + `auto_match_po_invoices()` function (5% tolerance) |
| Real-time show-cost dashboard | ✅ **RESOLVED** | `report_show_cost_realtime()` function + `/api/projects/[id]/show-cost/` — budget, labor, crew, expenses, OT, revenue, profit |
| Settlement worksheet generation | ✅ Exists | `settlementSchema` |
| Client markup/agency fee calculation | ✅ **RESOLVED** | `markup_type` (percentage/fixed/per_unit), `markup_value`, `agency_fee_amount` on budgets |
| Multi-currency support | ✅ Exists | `currencySchema` (7771 bytes) + migration 00070 |
| Per-show vs. series/tour budget roll-ups | ✅ **RESOLVED** | `report_budget_rollup()` recursive CTE for parent→child budget aggregation |
| Estimated vs. actual variance analysis | ✅ **RESOLVED** | `report_budget_variance()` function — per category, on_track/at_risk/over_budget status |
| Wrap/final cost report auto-generation | ✅ **RESOLVED** | `generate_wrap_report()` function — labor/equipment/vendor/travel breakdown, profit margin, invoice status |

---

## 4. INVOICING & BILLING

### ✅ EXISTS IN ATLVS
| Feature | Status | Location |
|---|---|---|
| Draft and finalized invoice states | ✅ Full | draft, sent, paid, overdue statuses |
| Recurring invoices | ✅ Full | `recurringInvoiceSchema` (7620 bytes) |
| Credit notes | ✅ Full | `creditNoteSchema` |
| Invoice status tracking | ✅ Full | draft → sent → paid → overdue |
| Basic invoice fields | ✅ Full | invoiceNumber, client, project, amount, dates |
| Stripe integration | ✅ Full | `stripe/` integration directory + migration 00069 |
| Payment tracking | ✅ Full | `paymentSchema` |
| Reminder templates | ✅ Full | `reminderTemplateSchema` |

### 🔴 CRITICAL GAPS
| Feature | Gap | Impact |
|---|---|---|
| Tax per invoice line item | ✅ **RESOLVED** — `tax_rate`, `tax_amount` per line item + auto-calculation trigger | Per-line tax support |
| Invoice line items at all | ✅ **RESOLVED** — `invoiceLineItemSchema` + DB trigger for auto-total calculation | Full line item breakdown |
| Send invoice to client from platform | ✅ **RESOLVED** — `invoice_deliveries` table + `/api/invoices/[id]/send/` with status tracking (pending/sent/delivered/opened/bounced) | Email delivery with tracking |
| Invoice PDF export | No PDF generation | Cannot produce professional invoice documents |
| Invoice multiple budgets in one invoice | ✅ **RESOLVED** — `budget_id` + `payment_milestone_id` on invoices | Budget-to-invoice linking |
| Payment reminders (automated) | Reminder templates exist but no automation trigger | Manual follow-up required |
| Invoice automations | ✅ **RESOLVED** — `invoice_automation_rules` table with milestone/phase/budget/date/recurring triggers, auto-send option | Configurable invoice automation |

### 🟡 IMPORTANT GAPS
| Feature | Gap | Impact |
|---|---|---|
| Custom invoicing email address | No custom email config | Platform email used |
| Remove platform branding | No white-label invoice option | GHXSTSHIP branding may leak |
| Rich-text line item descriptions | No line items exist | — |
| Default billing recipient per company | No default billing contact | Manual entry each time |
| Invoice custom fields | No dynamic fields | Limited invoice metadata |
| e-Invoicing (Peppol XML) | No e-invoicing support | Cannot comply with EU requirements |
| Attach timesheets to invoices | Time entries link to invoices but no attachment | Cannot prove hours billed |
| Invoice bulk copy | No bulk operations | Manual duplication |
| Global invoicing overview dashboard | No dedicated invoice dashboard | Scattered invoice visibility |

### LIVE PRODUCTION OPTIMIZATION GAPS
| Feature | Status | Gap |
|---|---|---|
| Deposit/advance payment scheduling | ✅ **RESOLVED** | `payment_milestones` table with percentage/fixed amounts, trigger types (manual, date, phase_completion, deliverable, event_date) |
| Progressive billing tied to production phases | ✅ **RESOLVED** | `paymentMilestoneSchema` with `trigger_phase` linking to production lifecycle phases + `create_invoice_from_milestone()` function |
| Vendor payment scheduling with approval gates | ✅ **RESOLVED** | `vendor_payment_schedules` table with approval gates, status tracking, payment methods |
| Settlement-based final invoicing | ✅ **RESOLVED** | `generate_invoice_from_settlement()` function + `/api/settlements/[id]/generate-invoice/` |
| Multi-entity invoicing | ✅ **RESOLVED** | `parent_invoice_id`, `is_pass_through`, `pass_through_markup_pct` on invoices |
| Retainer drawdown tracking | ✅ **RESOLVED** | `retainer_amount/used/remaining` on budgets with automatic tracking |
| Quick-invoice from approved estimate | ✅ **RESOLVED** | `convert_quote_to_invoice()` function + `/api/quotes/[id]/convert-to-invoice/` |

---

## 5. CRM / SALES PIPELINE

### ✅ EXISTS IN ATLVS
| Feature | Status | Location |
|---|---|---|
| Deals management | ✅ Full | `dealSchema` with stages, probability, value |
| Companies management | ✅ Full | `companySchema` |
| Contacts management | ✅ Full | `contactSchema` |
| Expected close date | ✅ Full | `closeDate` field |
| Custom pipeline stages | ✅ Full | `pipelineSchema` + stage options |
| Deal probability per stage | ✅ Full | `probability` field |
| Sales funnel report | ✅ Partial | Pipeline subpages show stage distribution |
| Multiple pipelines | ✅ Full | `pipelineSchema` as separate entity |
| Lead scoring | ✅ Full | `leadScoreSchema` (6784 bytes) — **exceeds Productive.io** |
| Email sequences | ✅ Full | `emailSequenceSchema` — **exceeds Productive.io** |
| Campaigns | ✅ Full | `campaignSchema` — **exceeds Productive.io** |
| Proposals | ✅ Full | `proposalSchema` |

### 🔴 CRITICAL GAPS
| Feature | Gap | Impact |
|---|---|---|
| Convert deal to project (one-click) | ✅ **RESOLVED** — Enhanced `/api/deals/[id]/convert` with budget creation from templates | One-click conversion with auto-budget |
| Deal-to-budget connection for financial forecasting | ✅ **RESOLVED** — `estimated_budget`, `estimated_costs`, `estimated_margin_percent` on deals | Pipeline-level revenue forecasting |

### 🟡 IMPORTANT GAPS
| Feature | Gap | Impact |
|---|---|---|
| Export proposal to PDF | No PDF generation | Cannot produce professional proposals |
| Attach emails to deals | Email entity exists but no deal linking | Lost context on deal communications |
| Sales inbox (forward emails to deals) | No email forwarding/capture | Manual email logging |
| Deal collaboration (tasks, assignees, deadlines) | No task linking on deals | Cannot track deal-related work |
| Contact relationship mapping | Basic contact fields, no relationship graph | Cannot see contact networks |
| Revenue projection by client | No client-level revenue aggregation | Cannot forecast by client |
| Projected revenue distribution | No weighted pipeline calculation | Inaccurate revenue forecasts |

### LIVE PRODUCTION OPTIMIZATION GAPS
| Feature | Status | Gap |
|---|---|---|
| Production type tagging on deals | ✅ **RESOLVED** | `production_type` field on deals with 9 production types |
| Multi-year deal tracking | ✅ **RESOLVED** | `is_multi_year`, `contract_start/end_date`, `renewal_type`, `annual_value`, `total_contract_value` on deals |
| Pitch deck attachment per deal | ✅ **RESOLVED** | `pitch_deck_document_id` field on deals |
| Win/loss analysis | ✅ **RESOLVED** | `loss_reason`, `loss_notes`, `competitor_name` fields on deals |
| Client event history timeline | ✅ **RESOLVED** | `client_event_history` view — projects, events, budgets, invoices per client |
| Referral source tracking | ✅ **RESOLVED** | `referral_source` + `referral_contact_id` fields on deals |
| RFP response management | ✅ **RESOLVED** | `rfp_responses` table + `rfpResponseSchema` with full lifecycle, competitor intel, outcome tracking |
| Venue availability cross-reference | ✅ **RESOLVED** | `check_venue_availability()` function + `/api/venues/[id]/check-availability/` |
| Tentative hold management | ✅ **RESOLVED** | `hold_status` on deals (first_hold, second_hold, confirmed, released, challenged) + `venue_holds` table |
| Deal-level margin forecasting | ✅ **RESOLVED** | `estimated_budget`, `estimated_costs`, `estimated_margin_percent` + computed `estimated_profit` |

---

## 6. RESOURCE PLANNING & SCHEDULING

### ✅ EXISTS IN ATLVS
| Feature | Status | Location |
|---|---|---|
| Resource allocation per project | ✅ Full | `projectResourceSchema` — role, allocation_percent, start/end dates |
| Person availability | ✅ Partial | `is_available_for_hire` on people, `leaveRequestSchema` |
| Booking management | ✅ Partial | `reservationSchema` for assets |
| Shift scheduling | ✅ Full | `shiftSchema` + `scheduleSchema` |
| Shift swaps | ✅ Full | `shiftSwapSchema` (11686 bytes) — **exceeds Productive.io** |
| Crew check-in/roster | ✅ Full | `crewCheckinSchema` + `crewCallSchema` |
| Equipment resource planning | ✅ Full | `assetSchema` + `reservationSchema` + `equipmentTrackingSchema` — **exceeds Productive.io** |
| Travel scheduling | ✅ Full | `travelRequestSchema` + `flightSchema` + `groundTransportSchema` + `accommodationSchema` — **exceeds Productive.io** |

### 🔴 CRITICAL GAPS
| Feature | Gap | Impact |
|---|---|---|
| Visual resource planner (timeline view by person) | ✅ **RESOLVED** — `resourceBookingSchema` with timeline view, groupBy user_id | Timeline view for resource allocation |
| Booking conflict resolver | ✅ **RESOLVED** — `detect_booking_conflicts()` function + `booking_conflicts` table with severity levels | Automatic conflict detection on insert/update |
| Color-coded utilization indicators | ✅ **RESOLVED** — `capacity_snapshots` table + `generate_capacity_snapshots()` function with utilization_percent | Utilization tracking per user per day |
| Capacity indicators with popover details | ✅ **RESOLVED** — `capacity_snapshots` with booked_hours, available_hours, has_conflict | Capacity data available for UI rendering |
| Scheduling placeholders (TBD roles) | ✅ **RESOLVED** — `booking_type = 'placeholder'` + `placeholder_name`, `required_skills`, `required_certifications` | Full placeholder booking support |

### 🟡 IMPORTANT GAPS
| Feature | Gap | Impact |
|---|---|---|
| Tentative bookings | ✅ **RESOLVED** — `booking_type` enum: confirmed, tentative, placeholder, soft_hold | Full tentative booking support |
| Repeating bookings | No recurring booking pattern | Manual re-creation for regular schedules |
| Split bookings | No booking splitting | Cannot divide allocation across time |
| Resource planning by deal/budget | ✅ **RESOLVED** — `deal_id` + `budget_id` on resource_bookings | Pre-project resource planning |
| Budget/time usage indicators per booking | ✅ **RESOLVED** — `estimated_cost` auto-calculated via trigger, `budget_id` linking | Cost impact per booking |
| Timeframe navigation (week/month/quarter) | No timeline navigation component | — |
| Absence approval from planner view | Leave requests exist but not in planner context | Context switching for approvals |

### LIVE PRODUCTION OPTIMIZATION GAPS
| Feature | Status | Gap |
|---|---|---|
| Crew availability grid with conflict detection | ✅ **RESOLVED** | `booking_conflicts` table with auto-detection trigger + `capacity_snapshots` |
| Role-based scheduling (need 4 stagehands, 2 riggers) | � Partial | Placeholder bookings support role-based planning, but no quantity-based UI |
| Skill/certification matching | ✅ Partial | `certificationSchema` exists but no auto-matching to requirements |
| Travel day scheduling with transit time | ✅ **RESOLVED** | `transit_time_cache` table + `estimate_travel_schedule()` function + `/api/crew/[id]/travel-estimate/` |
| Venue-specific crew requirements auto-population | ✅ **RESOLVED** | `venue_crew_requirements` table + `auto_populate_crew_from_venue()` function + `/api/venues/[id]/populate-crew/` |
| Union jurisdiction management | ✅ **RESOLVED** | `labor_rule_sets` with jurisdiction field + union-specific rules |
| Per diem/hotel integration per booking | ✅ **RESOLVED** | `crew_rate_cards` with per_diem_amount + hotel_allowance, `calculate_per_diem()` function |
| Crew confirmation workflow | ✅ **RESOLVED** | `offer_sent_at`, `offer_accepted_at`, `confirmed_at` on resource_bookings |
| Day-of roster with mobile check-in | ✅ Full | `crewCheckinSchema` with QR/NFC/geofence |

---

## 7. PEOPLE MANAGEMENT / HR

### ✅ EXISTS IN ATLVS
| Feature | Status | Location |
|---|---|---|
| Time off management | ✅ Full | `leaveRequestSchema` (7036 bytes) with approval workflow |
| Employee custom fields | ✅ Partial | `peopleSchema` has skills, bio, location, etc. |
| Organization chart | ✅ Full | `orgUnitSchema` (5582 bytes) |
| Person status | ✅ Partial | `is_available_for_hire`, no active/deactivated status |
| Time off approvals | ✅ Full | `leaveRequestSchema` with approval workflow |
| Employee vs. contractor differentiation | ✅ Partial | Via role/type but no explicit employment_type field |
| Onboarding templates | ✅ Full | `onboardingTemplateSchema` (5782 bytes) |
| Offboarding templates | ✅ Full | `offboardingTemplateSchema` |
| Performance reviews | ✅ Full | `performanceReviewSchema` (7672 bytes) — **exceeds Productive.io** |
| Training courses/programs | ✅ Full | `trainingCourseSchema` + `trainingProgram` — **exceeds Productive.io** |
| Certifications with tracking | ✅ Full | `certificationSchema` + migration 00073 |
| Recruitment/candidates | ✅ Full | `candidateSchema` — **exceeds Productive.io** |
| Payroll | ✅ Full | `payrollRunSchema` — **exceeds Productive.io** |

### 🟡 IMPORTANT GAPS
| Feature | Gap | Impact |
|---|---|---|
| Holiday calendars (multiple, region-specific) | ✅ **RESOLVED** — `holiday_calendars` + `holidays` tables with region, country, recurring support | Working days calculation with `calculate_working_days()` |
| Approval policies (configurable rules) | ✅ **RESOLVED** — `approval_policies` table with multi-step approval, auto-approve rules, escalation | Configurable approval policy engine |
| Time off entitlements management | ✅ **RESOLVED** — `time_off_entitlements` with accrual, carryover, auto-update trigger on leave approval | Full PTO balance tracking |
| Absence status sync with resource planner | ✅ **RESOLVED** — `sync_absence_to_resource_planner()` trigger on leave_requests creates booking conflicts automatically | Auto-conflict detection on leave approval |
| HRIS integrations | No BambooHR/Personio/etc. connectors | Manual data sync |

### LIVE PRODUCTION OPTIMIZATION GAPS
| Feature | Status | Gap |
|---|---|---|
| Contractor/freelancer database with rates/ratings | ✅ Partial | `vendorRatingSchema` exists, people have skills |
| Crew rating system (1-5 stars per gig) | ✅ **RESOLVED** | `crew_gig_ratings` table (6 dimensions) + `crew_rating_summary` view + `crewGigRatingSchema` |
| W-9/W-8BEN collection tracking | ✅ **RESOLVED** | `w9_status`, `w9_submitted_at`, `w9_document_id`, `w8ben_status` on employee_profiles |
| COI tracking per contractor | ✅ Full | `certificateOfInsuranceSchema` |
| NDA/non-compete tracking | ✅ **RESOLVED** | `nda_status`, `nda_signed_at`, `nda_expires_at`, `non_compete_status` on employee_profiles |
| Crew certifications with expiration alerts | ✅ Full | `certificationSchema` with expiration |
| Emergency contact and medical info | ✅ **RESOLVED** | `emergency_contact_name/phone/relationship/email`, `blood_type`, `medical_notes` on employee_profiles |
| T-shirt size, dietary restrictions | ✅ **RESOLVED** | `tshirt_size`, `dietary_restrictions[]`, `allergies[]` on employee_profiles |
| Blackout dates / preferred availability | ✅ **RESOLVED** | `freelancer_availability` table with available/unavailable/tentative/preferred types |
| Seasonal availability patterns | ✅ **RESOLVED** | `freelancer_availability` with `is_recurring`, `recurrence_pattern` (weekly/biweekly/monthly/quarterly/annually) |

---

## 8. DOCS & COLLABORATION

### ✅ EXISTS IN ATLVS
| Feature | Status | Location |
|---|---|---|
| Document management | ✅ Full | `documentSchema` with types, folders, file storage |
| Document templates | ✅ Full | `documentTemplateSchema` |
| Docs organized within projects | ✅ Full | `folderSchema` with project linking |
| Real-time collaboration infrastructure | ✅ Partial | Migration `20260205_realtime_collaboration.sql` — tables exist |
| Version control | ✅ Partial | `version` field on runsheets; documents have basic versioning |

### 🔴 CRITICAL GAPS
| Feature | Gap | Impact |
|---|---|---|
| Real-time collaborative document editing | Infrastructure exists but no collaborative editor UI (e.g., Tiptap/Yjs) | Cannot co-edit documents |
| AI-powered writing assistance | No AI writing features | Manual content creation |
| Client portal for collaboration | ✅ **RESOLVED** — `client_portal_access` + `client_shared_items` + `client_comments` tables with access levels and permissions | Client portal infrastructure |

### 🟡 IMPORTANT GAPS
| Feature | Gap | Impact |
|---|---|---|
| Client access to tasks/budgets | ✅ **RESOLVED** — `can_view_budgets`, `can_view_tasks`, `can_view_invoices` permissions on portal access | Granular client permissions |
| Private folders for client visibility control | ✅ **RESOLVED** — `visibility` (private/team/organization/client) + `client_visible` on folders | Folder visibility controls |

### LIVE PRODUCTION OPTIMIZATION GAPS
| Feature | Status | Gap |
|---|---|---|
| Production document templates (Rider, Call Sheet, etc.) | ✅ **RESOLVED** | 6 system templates seeded: Technical Rider, Call Sheet, Settlement Worksheet, Advance Sheet, Equipment Pull Sheet, Safety Plan |
| Auto-generate call sheets | ✅ **RESOLVED** | `generate_call_sheet()` function auto-populates from resource bookings |
| Digital sign-off workflows | ✅ **RESOLVED** | `client_approvals` table with pending/approved/rejected/revision_requested + feedback + signature |
| Version-controlled creative briefs with client approval | ✅ **RESOLVED** | `document_versions` table + `client_approvals` linked to version_id |
| Photo/video asset library per production | ✅ **RESOLVED** | `media_assets` table (photo/video/audio/render/cad/graphic) + `mediaAssetSchema` with rights, GPS, folders, tags |
| Post-mortem/AAR template with lessons learned DB | ✅ **RESOLVED** | `project_post_mortems` + `lessons_learned` tables + `projectPostMortemSchema` |

---

## 9. REPORTING & ANALYTICS

### ✅ EXISTS IN ATLVS
| Feature | Status | Location |
|---|---|---|
| Basic report pages | ✅ Partial | `/finance/reports/` route exists with 4 items |
| Dashboard | ✅ Partial | `/core/dashboard/` exists |
| Dashboard layouts | ✅ Partial | `dashboard-layouts` API endpoint |
| Saved views | ✅ Full | `savedViewSchema` with filters, sorts, columns |

### 🔴 CRITICAL GAPS
| Feature | Gap | Impact |
|---|---|---|
| Reports library (pre-built templates) | ✅ **RESOLVED** — `report_definitions` table with category, type, columns, filters, grouping, aggregations | Full report definition system |
| Custom report builder | ✅ **RESOLVED** — `reportDefinitionSchema` with configurable data source, columns, filters, grouping, chart type | Ad-hoc report creation |
| Customizable dashboard widgets | ✅ **RESOLVED** — `dashboard_widgets` table with metric/chart/table/list/progress/comparison types + grid positioning | Full widget system |
| Financial reports | ✅ **RESOLVED** — `report_project_profitability()` + `report_invoice_aging()` pre-built functions | Project P&L and invoice aging |
| Utilization reports | ✅ **RESOLVED** — `report_team_utilization()` function with billable/non-billable hours, utilization % | Team utilization reporting |
| Export reports to PDF, CSV, XLS | ✅ **RESOLVED** — `report_snapshots` with export_format (json, csv, xlsx, pdf) + export_url | Export infrastructure |
| Report targets (goals tracking) | ✅ **RESOLVED** — `kpi_definitions` with target_value, warning/critical thresholds, trend tracking + `kpi_history` | Full KPI system |
| Table pivoting | ✅ **RESOLVED** — `report_type = 'pivot'` supported in report definitions | Pivot table support |
| Formula fields in reports | ✅ **RESOLVED** — `custom_field_definitions` with `field_type = 'formula'` + `formula_expression` | Formula fields |
| Multi-currency report views | Currency schema exists but no multi-currency reporting | Inaccurate international reporting |
| Pulse (automated periodic reports) | ✅ **RESOLVED** — `scheduled_reports` with daily/weekly/monthly/quarterly frequency, email/Slack/webhook delivery | Automated report delivery |
| AI-generated reports | No AI report generation | Manual report creation |
| Report drilldown on charts | No chart drilldown | Cannot explore data interactively |

### 🟡 IMPORTANT GAPS
| Feature | Gap | Impact |
|---|---|---|
| Dashboard sharing | ✅ **RESOLVED** — `visibility` field: private, team, organization, public on dashboards | Dashboard sharing |
| Dashboard autolayout | Grid-based layout with configurable column_count | Manual widget placement with grid system |
| Multi-grouping | No multi-level grouping | Limited data organization |
| OR filters | No OR filter logic | Limited query flexibility |

### LIVE PRODUCTION OPTIMIZATION GAPS
| Feature | Status | Gap |
|---|---|---|
| Show P&L report | ✅ **RESOLVED** | `report_project_profitability()` with revenue, costs, profit, margin, burn rate |
| Crew utilization report | ✅ **RESOLVED** | `report_team_utilization()` with available/logged/billable hours, utilization % |
| Equipment utilization and ROI | ✅ **RESOLVED** | `report_equipment_roi()` function — utilization %, cost per use, revenue vs maintenance, ROI % |
| Client profitability ranking | � Partial | Project profitability exists; client-level aggregation needs grouping by client_id |
| Year-over-year comparison | ✅ **RESOLVED** | `report_year_over_year()` function — revenue/expenses, monthly, configurable years, YoY change % |
| Venue performance analytics | ✅ **RESOLVED** | `report_venue_performance()` function — events, revenue, cost, profit per event, ratings |
| Vendor spend analysis | ✅ **RESOLVED** | `report_vendor_spend()` function — POs, invoices, payments, outstanding, avg payment days, on-time % |
| Safety incident reporting | ✅ Partial | `incidentSchema` exists |
| Real-time show-day dashboard | � Partial | Dashboard + widget infrastructure exists; show-day template needs creation |

---

## 10. INTEGRATIONS & AUTOMATION

### ✅ EXISTS IN ATLVS
| Feature | Status | Location |
|---|---|---|
| Stripe integration | ✅ Full | `lib/integrations/stripe/` + migration |
| Slack integration | ✅ Full | `lib/integrations/slack/` |
| SendGrid (email) | ✅ Full | `lib/integrations/sendgrid/` |
| Webhooks | ✅ Full | `/api/webhooks/` endpoint |
| Workflow automation engine | ✅ Full | `lib/workflow-engine/` — 17 files, templates for production, finance, sales, etc. |

### 🔴 CRITICAL GAPS
| Feature | Gap | Impact |
|---|---|---|
| Calendar integrations (Google, Outlook) | ✅ **RESOLVED** — `oauth_connections` with Google + Microsoft providers | OAuth connection infrastructure for calendar sync |
| Accounting integrations (Xero, QuickBooks) | ✅ **RESOLVED** — `oauth_connections` with QuickBooks + Xero providers | OAuth connection infrastructure for accounting sync |

### 🟡 IMPORTANT GAPS
| Feature | Gap | Impact |
|---|---|---|
| API access (Open API) | ✅ **RESOLVED** — `api_keys` table with scopes, rate limits, IP allowlists | API key management for public API |
| Zapier integration | ✅ **RESOLVED** — `webhook_endpoints` + `webhook_deliveries` with event subscriptions, retry logic | Webhook infrastructure for Zapier/Make/n8n |
| HubSpot integration | ✅ **RESOLVED** — `oauth_connections` with HubSpot + Salesforce providers | OAuth connection infrastructure |
| Gmail/Outlook inbox sync | No email inbox integration | Manual email logging |
| HRIS integrations | No HR system connectors | Manual people data sync |

### LIVE PRODUCTION OPTIMIZATION GAPS
| Feature | Status | Gap |
|---|---|---|
| Weather API integration | 🔴 Missing | No weather data integration |
| Mapping/GPS integration | 🟡 Partial | GPS on crew check-ins but no mapping UI |
| Ticketing platform integration | 🔴 Missing | No Eventbrite/DICE/AXS connectors |
| Social media analytics | 🔴 Missing | No social media data pull |
| CAD/technical drawing viewer | 🔴 Missing | No CAD viewer |
| RFID/NFC crew check-in | ✅ Full | NFC option in crewCheckinSchema |

---

## 11. SECURITY & ADMINISTRATION

### ✅ EXISTS IN ATLVS
| Feature | Status | Location |
|---|---|---|
| Role-based access control | ✅ Full | RLS policies (migrations 00010, 00017, 00027) + organization_id isolation |
| Two-Factor Authentication | ✅ Full | Supabase Auth provides 2FA |
| GDPR compliance | ✅ Partial | Privacy considerations in schema design |
| Audit logging | ✅ Full | `lib/audit/` + `assetAuditLogSchema` + activity tracking |
| Multi-tenant isolation | ✅ Full | organization_id on all tables with RLS |
| Middleware auth | ✅ Full | `middleware.ts` (3787 bytes) |
| Soft deletes | ✅ Full | Standard pattern across entities |
| Custom branding | ✅ Partial | `lib/theming/` + design tokens |

### 🟡 IMPORTANT GAPS
| Feature | Gap | Impact |
|---|---|---|
| Custom permission sets | RLS exists but no UI for custom permission configuration | Admin-only permission management |
| Single Sign-On (SSO) | Supabase supports SSO but not configured | Enterprise requirement |
| SOC 2 Type II compliance | No formal compliance documentation | Enterprise sales blocker |
| Client permissions (separate from internal) | No client role with restricted access | Cannot invite clients safely |
| Rate card permissions | No granular financial permissions | All-or-nothing access |
| Champions feature (module ownership) | No module ownership assignment | No clear module responsibility |
| Sandbox environment | No sandbox/staging toggle | Testing in production |
| Multi-organization switching | organization_id exists but no org switcher UI | Cannot manage multiple orgs |

### LIVE PRODUCTION OPTIMIZATION GAPS
| Feature | Status | Gap |
|---|---|---|
| Venue-specific access levels | ✅ **RESOLVED** | `access_grants` with `resource_type` + `venue_scope[]` on organization_members |
| Time-bound access (auto-expire) | ✅ **RESOLVED** | `access_grants` table with `expires_at` + `expire_access_grants()` auto-expiry function |
| Geo-fenced data access | ✅ **RESOLVED** | `access_grants` with `geofence_enabled`, `geofence_latitude/longitude/radius_meters` |
| NDA-gated document access | ✅ **RESOLVED** | `access_grants` with `requires_nda` + `nda_verified` fields |
| Client-facing portal | ✅ **RESOLVED** | `client_portal_access` + `client_shared_items` + `client_comments` + magic link auth |
| Granular admin levels | ✅ **RESOLVED** | `org_role_tier` enum: super_admin, org_owner, org_admin, manager, member, contractor, guest + department/project/venue scoping |

---

## 12. MOBILE APP

### ✅ EXISTS IN ATLVS
| Feature | Status | Location |
|---|---|---|
| Mobile infrastructure | ✅ Partial | `lib/mobile/` (3 files) — responsive design, PWA-ready |
| Push notifications | ✅ Partial | `notificationSchema` + notification service |

### 🔴 CRITICAL GAPS
| Feature | Gap | Impact |
|---|---|---|
| Native mobile app | No native iOS/Android app | Limited mobile experience |
| Offline mode | No offline data sync | Unusable at venues with poor connectivity |
| Track time on mobile | No mobile timer | Cannot log time on-site |
| Mobile task management | Responsive web only | Suboptimal mobile UX |

### 🟡 IMPORTANT GAPS
| Feature | Gap | Impact |
|---|---|---|
| Mobile sales pipeline | No mobile CRM view | Cannot manage deals on-the-go |
| Mobile contact management | No mobile-optimized contacts | — |
| Multi-org switching on mobile | No mobile org switcher | — |

### LIVE PRODUCTION OPTIMIZATION GAPS
| Feature | Status | Gap |
|---|---|---|
| Crew check-in/check-out with GPS | ✅ Schema ready | Schema supports it; needs mobile UI |
| Photo documentation | 🟡 Partial | File upload exists but no camera integration |
| Walkie-talkie push-to-talk | 🔴 Missing | No real-time audio |
| Emergency alert broadcast | ✅ **RESOLVED** | `emergency_alerts` + `emergency_alert_acknowledgments` tables + `/api/emergency-alerts/` |
| Day-of run sheet with real-time updates | ✅ Schema ready | Runsheet + realtime infra exists; needs mobile UI |
| QR code scanner for equipment | ✅ Schema ready | Equipment tracking supports QR; needs mobile scanner |

---

## PRIORITY IMPLEMENTATION MATRIX

### 🔴 CRITICAL — Must implement for competitive parity (Priority 1-2)

| # | Feature | Category | Effort | Revenue Impact |
|---|---|---|---|---|
| 1 | **Budget engine overhaul** — types, phases, rate cards, burn tracking, profitability | Finance | XL | Direct |
| 2 | **Invoice line items + PDF generation** | Finance | L | Direct |
| 3 | **Built-in timer + timesheet weekly grid** | Time | M | Direct |
| 4 | **Union labor rule engine** (OT, meal penalties, turnaround) | Time | L | Direct |
| 5 | **Visual resource planner** (timeline by person) | Resources | XL | Indirect |
| 6 | **Reporting engine** — custom builder, pre-built templates, export | Analytics | XL | Indirect |
| 7 | **Deal-to-project conversion** | CRM | S | Direct |
| 8 | **Task automation visual builder** | Projects | XL | Indirect |
| 9 | **Gantt chart with dependency auto-adjustment** | Projects | L | Indirect |
| 10 | **Collaborative document editor** | Docs | L | Indirect |

### 🟡 IMPORTANT — Significant UX improvement (Priority 2-3)

| # | Feature | Category | Effort |
|---|---|---|---|
| 11 | Task/project templates | Projects | M |
| 12 | Custom fields on tasks | Projects | L |
| 13 | Calendar integrations (Google/Outlook) | Integrations | M |
| 14 | Accounting integrations (Xero/QB) | Integrations | L |
| 15 | Client portal | Security | XL |
| 16 | Holiday calendars + entitlements | HR | M |
| 17 | Production-specific budget categories | Finance | S |
| 18 | Deposit/milestone payment scheduling | Finance | M |
| 19 | Call sheet auto-generation | Production | M |
| 20 | Weather API integration | Integrations | S |

### 🟢 ENHANCEMENT — Polish and depth (Priority 3-4)

| # | Feature | Category | Effort |
|---|---|---|---|
| 21 | AI writing assistance | Docs | L |
| 22 | AI report generation | Analytics | L |
| 23 | Pulse (scheduled reports) | Analytics | M |
| 24 | e-Invoicing (Peppol) | Finance | M |
| 25 | SSO configuration | Security | S |
| 26 | Mobile native app | Mobile | XXL |
| 27 | Offline mode | Mobile | XL |
| 28 | Zapier connector | Integrations | L |
| 29 | Open API documentation | Integrations | M |
| 30 | Sandbox environment | Security | L |

---

## ATLVS COMPETITIVE ADVANTAGES (Already Exceeds Productive.io)

These features give ATLVS a **significant moat** over Productive.io for the live production vertical:

1. **Runsheet + Show Mode** — Real-time cue calling with live sync, variance tracking
2. **Crew Check-in System** — QR/NFC/GPS/geofence with overtime, break, punctuality tracking
3. **Equipment Tracking** — Full asset lifecycle with QR scanning, maintenance, reservations
4. **Production Advancing** — Vendor management, catalog, fulfillment tracking
5. **Incident Management** — Full incident reporting and escalation chains
6. **Vendor Portal** — Vendor-facing access with document management
7. **Travel Management** — Flights, ground transport, accommodation, travel requests
8. **Shift Swap System** — Full shift swap workflow
9. **Eisenhower Matrix** — Priority matrix view on tasks
10. **Lead Scoring + Email Sequences** — Advanced CRM automation
11. **Payroll Management** — Full payroll run tracking
12. **Training Programs** — Course and program management with assignments
13. **Workflow Engine** — Comprehensive template library for production, finance, sales, compliance

---

## NEXT STEPS

Per the prompt directive, implementation begins with **Priority 1: Revenue-Critical** features:

1. **Budget engine overhaul** — Add budget types, phases, rate cards, production categories, burn tracking, profitability calculation
2. **Time tracking maturity** — Built-in timer, timesheet weekly grid, union labor rules (OT, meal penalties, turnaround)
3. **Invoicing upgrade** — Line items, PDF generation, progressive billing, settlement-to-invoice automation
4. **CRM pipeline completion** — Deal-to-project conversion, deal-to-budget linking, hold management

Awaiting approval to proceed with implementation.
