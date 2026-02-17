# ATLVS Page Audit — Gap Analysis Report

**Date:** 2026-01-27
**Scope:** All `page.tsx` files under `src/app/(app)/`
**Total pages audited:** ~299

---

## 1. Module Summary

| Module | Pages | Pattern |
|---|---|---|
| Auth | 9 | Custom auth flows (login, register, forgot-password, SSO callbacks) |
| Onboarding | 8 | Multi-step wizard with Zustand store |
| Core | 40 | Mix of CrudList, dashboards, calendar, kanban, messages |
| Productions | 28 | CrudList/CrudDetail + custom dashboards (call sheets, budgets) |
| People | 43 | CrudList/CrudDetail + custom pages (scheduling, travel map, compliance) |
| Finance | 43 | CrudList/CrudDetail + custom dashboards (invoice builder, expense approvals, reports) |
| Business | 35 | CrudList/CrudDetail + custom pages (pipeline board, company detail) |
| Network | 32 | CrudList/CrudDetail/CrudForm + custom discover page |
| Assets | 29 | CrudList/CrudDetail + custom pages (warehouse map, asset dashboard) |
| Operations | 23 | CrudList + custom pages (shows, runsheets, incidents, kiosk, control room) |
| Account | 10 | SettingsTemplate + custom pages (privacy/GDPR, audit log, history) |
| Analytics | 6 | Custom pages (dashboard builder, report builder, library, scheduled) |

---

## 2. Architectural Patterns Observed

### 2.1 CrudList / CrudDetail / CrudForm (majority of pages)
- ~180 pages use `<CrudList schema={...} />` or `<CrudDetail schema={...} id={...} />`
- Network module uniquely uses `<CrudForm schema={...} mode="create|edit" />` for new/edit pages
- Consistent pattern: schema imported from `@/lib/schemas/*`, filter prop for sub-type pages

### 2.2 Custom Dashboard Pages
- Module landing pages (finance, assets, operations, analytics, business) use `PageShell` + `StatCard`/`StatGrid` + `NavCard` pattern
- Finance dashboard uses `CashFlowChart`, `FinancialHealthCard`, `ActionCenter`
- Operations uses `useEvents`, `useRunsheets`, `useIncidents` hooks for live data

### 2.3 WorkspaceLayout Pages
- Invoice builder, warehouse map, dashboard builder, report builder use `WorkspaceLayout` with tabs + sidebar
- These are the most complex pages with local state management

### 2.4 SettingsTemplate Pages
- Profile, organization, billing, platform, sandbox, scheduled reports, rate cards use `SettingsTemplate`
- Declarative field definitions with save handlers

---

## 3. Gaps & Issues Identified

### 3.1 CRITICAL — Schema Misuse / Wrong Schema

| Page | Issue | Severity |
|---|---|---|
| `business/products/page.tsx` | Uses `serviceTicketSchema` for a Products page — should have a dedicated `productSchema` | High |
| `business/products/list/page.tsx` | Uses `serviceTicketSchema` filtered by `ticket_type: 'product'` — products are not tickets | High |
| `business/products/services/page.tsx` | Uses `serviceTicketSchema` filtered by `ticket_type: 'service'` — conflates services with tickets | High |
| `assets/catalog/consumables/page.tsx` | Uses `assetSchema` with no filter — identical to inventory page | Medium |
| `assets/catalog/inventory/page.tsx` | Uses `assetSchema` with no filter — duplicate of `assets/inventory/page.tsx` | Medium |
| `assets/logistics/advances/page.tsx` | Uses `shipmentSchema` — should use `productionAdvanceSchema` like `assets/advances/page.tsx` | Medium |
| `assets/logistics/deployment/page.tsx` | Uses `assetSchema` with no filter — should filter by deployment status | Medium |
| `assets/logistics/vehicles/page.tsx` | Uses `shipmentSchema` — should have a `vehicleSchema` | Medium |
| `operations/comms/weather/page.tsx` | Uses `radioChannelSchema` — weather is not a radio channel | Medium |
| `operations/venues/checkpoints/page.tsx` | Uses `venueSchema` with no filter — should have `checkpointSchema` | Medium |
| `operations/venues/floor-plans/page.tsx` | Uses `venueSchema` with no filter — should have `floorPlanSchema` | Medium |
| `operations/venues/zones/page.tsx` | Uses `venueSchema` with no filter — should have `zoneSchema` or filter | Medium |
| `finance/budgets/line-items/page.tsx` | Uses `budgetSchema` — should use a `budgetLineItemSchema` | Medium |
| `finance/invoices/line-items/page.tsx` | Uses `invoiceSchema` — should use `invoiceLineItemSchema` | Medium |
| `finance/expenses/receipts/page.tsx` | Uses `expenseSchema` — should use `receiptScanSchema` | Medium |
| `finance/expenses/reimbursements/page.tsx` | Uses `expenseSchema` — should filter or use dedicated schema | Medium |
| `finance/payroll/deductions/page.tsx` | Uses `payrollRunSchema` — should use `payrollDeductionSchema` | Medium |
| `finance/payroll/rates/page.tsx` | Uses `payrollRunSchema` — should use `payrollRateSchema` | Medium |
| `finance/payroll/stubs/page.tsx` | Uses `payrollRunSchema` — should use `payStubSchema` | Medium |
| `business/campaigns/content/page.tsx` | Uses `campaignSchema` with no filter — identical to campaigns list | Low |
| `business/campaigns/forms/page.tsx` | Uses `campaignSchema` with no filter — should filter or use form schema | Low |

### 3.2 CRITICAL — Duplicate / Redundant Pages

| Pages | Issue |
|---|---|
| `assets/locations/page.tsx` & `assets/locations/warehouses/page.tsx` | Both render `venueSchema` filtered by `venue_type: 'warehouse'` — identical |
| `assets/status/page.tsx` & `assets/status/check/page.tsx` & `assets/reservations/check/page.tsx` | All three render `checkInOutSchema` with no filter — identical |
| `operations/comms/page.tsx` & `operations/comms/radio/page.tsx` | Both render `radioChannelSchema` with no filter — identical |
| `assets/catalog/page.tsx` & `assets/catalog/categories/page.tsx` | Both render `categorySchema` with no filter — identical |
| `finance/budgets/procurement/page.tsx` & `finance/budgets/purchase-orders/page.tsx` & `finance/procurement/page.tsx` | All three render `purchaseOrderSchema` — triplicate |
| `business/campaigns/subscribers/page.tsx` & `business/subscribers/page.tsx` | Both render `subscriberSchema` — duplicate |

### 3.3 HIGH — Missing Dedicated Schemas

These pages reuse a parent schema where a child/related schema should exist:

- **Budget line items** — needs `budgetLineItemSchema`
- **Invoice line items** — needs `invoiceLineItemSchema`
- **Payroll deductions/rates/stubs** — need dedicated schemas
- **Vehicles** — needs `vehicleSchema`
- **Checkpoints/zones/floor plans** — need dedicated schemas
- **Products** — needs `productSchema` (not `serviceTicketSchema`)
- **Weather** — needs `weatherAlertSchema` or similar

### 3.4 MEDIUM — Hardcoded / Static Data

| Page | Issue |
|---|---|
| `assets/warehouse/page.tsx` | 5 storage zones with items hardcoded as constants — should fetch from DB |
| `people/travel/page.tsx` | Staff location markers hardcoded as `STAFF_LOCATIONS` constant |
| `analytics/dashboards/page.tsx` | 6 dashboard items hardcoded — should fetch from `dashboard_layouts` table |
| `analytics/reports/page.tsx` | 12 report cards hardcoded — should be dynamic |
| `finance/dashboard/page.tsx` | KPI values hardcoded (revenue $2.4M, expenses $1.8M, etc.) |
| `operations/page.tsx` | Stat values hardcoded (3 active shows, 2 incidents, etc.) |
| `assets/page.tsx` | Stat values hardcoded (1,247 total assets, 892 available, etc.) |

### 3.5 MEDIUM — Missing Detail/Edit Pages

Network module has full CRUD (list → [id] → [id]/edit → new) for:
connections, challenges, discussions, marketplace, opportunities, showcase

**Other modules lack this pattern:**
- `business/contracts/[id]/page.tsx` — missing
- `business/proposals/[id]/page.tsx` — missing
- `business/subscribers/[id]/page.tsx` — missing
- `assets/maintenance/[id]/page.tsx` — missing
- `assets/reservations/[id]/page.tsx` — missing
- `operations/work-orders/[id]/page.tsx` — missing
- `operations/incidents/[id]/page.tsx` — missing (incidents list is custom but no detail)
- `operations/shows/[id]/page.tsx` — missing (shows list is custom but no detail)

### 3.6 LOW — Inconsistent Page Wrapping

| Pattern | Pages Using It |
|---|---|
| `PageShell` | Module landing pages, history, audit log, shows, runsheets, incidents |
| `WorkspaceLayout` | Invoice builder, warehouse map, dashboard builder, report builder |
| `SettingsTemplate` | Profile, org, billing, platform, sandbox, scheduled, rate cards |
| Raw `<div>` container | Discover page, privacy page, kiosk, control room |
| No wrapper (bare CrudList) | ~180 CRUD pages |

The bare CrudList pages rely on CrudList internally providing layout. The raw `<div>` pages should be wrapped in `PageShell` for consistency.

### 3.7 LOW — Placeholder / Stub Pages

| Page | Issue |
|---|---|
| `finance/reports/ar-ap/page.tsx` | "Reporting coming soon" placeholder |
| `finance/reports/cash-flow/page.tsx` | "Reporting coming soon" placeholder |
| `finance/reports/pnl/page.tsx` | "Reporting coming soon" placeholder |
| `account/resources/page.tsx` | Placeholder content ("Guides will appear here") |
| `account/support/page.tsx` | Placeholder content ("Track status of requests") |
| `business/page.tsx` | Activity timeline placeholder ("will appear here once you start logging") |

### 3.8 LOW — params Pattern Inconsistency

Most `[id]` pages receive params as `{ params: { id: string } }` directly. However:
- `network/messages/[id]/page.tsx` uses `Promise<{ id: string }>` with React `use()` — this is the Next.js 15 async params pattern
- All other `[id]` pages use the synchronous pattern

This should be standardized to one approach.

---

## 4. Positive Observations

- **Consistent schema-driven architecture** — the CrudList/CrudDetail pattern scales well
- **Module landing pages are well-designed** — StatGrid + NavCard + PageShell is a strong pattern
- **Complex pages are well-structured** — invoice builder, report builder, dashboard builder, warehouse map all use WorkspaceLayout effectively
- **Privacy/GDPR page is comprehensive** — cookie consent, data export, deletion request with cooling-off
- **Audit log is production-ready** — fetches from `audit_logs` table with user name resolution
- **Operations module has strong custom UX** — show mode with live cue management, incident control room, crew check-in kiosk
- **Network module has complete CRUD** — list/detail/edit/new for all entities

---

## 5. Recommended Actions (Priority Order)

1. **Create missing schemas** for products, vehicles, checkpoints, zones, floor plans, budget line items, invoice line items, payroll sub-entities, weather alerts
2. **Fix schema misuse** — replace `serviceTicketSchema` on product pages, `radioChannelSchema` on weather page, etc.
3. **Deduplicate pages** — remove or differentiate the 6 sets of duplicate pages identified
4. **Add missing detail pages** — contracts, proposals, subscribers, maintenance, reservations, work orders, incidents, shows
5. **Replace hardcoded data** with Supabase queries on warehouse, travel, dashboards, reports, and stat pages
6. **Wrap raw `<div>` pages** in `PageShell` for consistency
7. **Standardize params pattern** — choose sync or async and apply uniformly
8. **Implement placeholder pages** — finance reports (P&L, cash flow, AR/AP), resources, support tickets
