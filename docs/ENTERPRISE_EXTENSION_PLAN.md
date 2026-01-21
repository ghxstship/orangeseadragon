# ATLVS Enterprise Platform Extension Plan

## Executive Summary

Based on analysis of `promptzero.md` and the existing codebase, this plan extends ATLVS to enterprise-grade with capabilities combining HubSpot + NetSuite + Rippling + Ramp + ConnectTeam + ClickUp + LinkedIn for live production.

**Current State:**
- 66 route modules in `src/app/(app)/`
- 11 database migrations (287 tables specified)
- 25 UI components (shadcn/ui)
- 9 management domains partially implemented

---

## 1. Codebase Hardening & Architecture

### 1.1 Monorepo Structure (Turborepo)

```
atlvs/
├── apps/
│   ├── web/                    # ATLVS (Next.js 14 B2B)
│   ├── mobile/                 # COMPVSS (Expo B2B/B2C)
│   ├── gateway/                # GVTEWAY (Next.js B2C)
│   └── docs/                   # Documentation (Nextra)
├── packages/
│   ├── @atlvs/ui/              # Shared components
│   ├── @atlvs/design-tokens/   # Design system
│   ├── @atlvs/api-client/      # OpenAPI client
│   ├── @atlvs/database/        # Supabase types
│   ├── @atlvs/workflows/       # Workflow engine
│   ├── @atlvs/auth/            # Auth utilities
│   └── @atlvs/validators/      # Zod schemas
├── services/
│   ├── api-gateway/            # Kong/Express gateway
│   ├── workflow-engine/        # Temporal.io
│   ├── notification-service/   # Email/Push/SMS
│   └── search-service/         # Meilisearch
├── plugins/
│   ├── enterprise/             # SSO, SCIM, Audit
│   └── integrations/           # ERP, CRM, HRIS connectors
└── infrastructure/
    ├── terraform/
    └── kubernetes/
```

### 1.2 Security (OWASP Top 10)

| Control | Implementation |
|---------|----------------|
| A01 Broken Access Control | RLS policies, RBAC middleware |
| A02 Cryptographic Failures | AES-256-GCM at rest, TLS 1.3 |
| A03 Injection | Zod validation, parameterized queries |
| A04 Insecure Design | Threat modeling, secure defaults |
| A05 Misconfiguration | Security headers, CSP |
| A06 Vulnerable Components | Snyk scanning, SBOM |
| A07 Auth Failures | MFA, session management |
| A08 Integrity | Signed commits, artifact verification |
| A09 Logging | Audit trails, 7-year retention |
| A10 SSRF | Allowlist hosts, block private IPs |

### 1.3 API Gateway Routes

```typescript
const routes = {
  '/api/v1/organizations': { service: 'core', rateLimit: 1000 },
  '/api/v1/projects': { service: 'projects', rateLimit: 500 },
  '/api/v1/events': { service: 'production', rateLimit: 500 },
  '/api/v1/assets': { service: 'assets', rateLimit: 1000 },
  '/api/v1/finance': { service: 'finance', rateLimit: 500 },
  '/api/v1/crm': { service: 'crm', rateLimit: 1000 },
  '/api/v1/workflows': { service: 'workflows', rateLimit: 200 },
};
```

### 1.4 OpenAPI Coverage

- **491 endpoints** across 9 domains
- Full CRUD for all 287 entities
- Bulk operations for all list views
- Webhook endpoints for integrations

---

## 2. UI/UX Design System

### 2.1 Design Tokens

```typescript
const tokens = {
  colors: {
    brand: { 50-950 }, // CSS variable overrides
    semantic: { success, warning, error, info },
    neutral: { 0-950 },
  },
  typography: {
    fontFamily: { sans, mono, display },
    fontSize: { xs-5xl },
  },
  spacing: { 0-96 },
  borderRadius: { none, sm, md, lg, xl, full },
  shadows: { sm, md, lg, xl, 2xl },
  density: { compact, comfortable, spacious },
};
```

### 2.2 White-Label Theme Engine

```typescript
interface WhiteLabelTheme {
  brand: { primaryColor, secondaryColor, logoUrl };
  typography: { fontFamily, headingFontFamily };
  modes: { light: ColorMode, dark: ColorMode };
  components: { borderRadius, buttonStyle, cardStyle };
  layout: { sidebarWidth, headerHeight };
}
```

### 2.3 View Components (12 Types)

| View | Features | Entities |
|------|----------|----------|
| List | Grouping, inline edit | ALL |
| Table | Column resize, bulk actions | ALL |
| Board | Drag-drop, WIP limits | tasks, deals |
| Calendar | Multi-view, resource lanes | events, shifts |
| Timeline | Dependencies, milestones | tasks, projects |
| Gantt | Critical path, baseline | projects |
| Workload | Capacity bars | tasks, shifts |
| Dashboard | Widgets, drill-down | metrics |
| Activity | Chronological feed | audit_logs |
| Map | Markers, clustering | venues, assets |
| Form | Conditional logic | forms |
| Public | Read-only, branded | events |

### 2.4 Global Toolbar Actions

Search, Filter, Sort, Group, Fields, ViewSwitcher, Import, Export, Scan, Create, BulkActions, Refresh

---

## 3. Domain Workflows

### 3.1 Workflow Engine

- **Trigger Types:** entity_created, entity_updated, status_changed, schedule, webhook, manual, scan_event
- **Condition Types:** field_equals, field_contains, field_in_list, user_has_role, time_condition
- **Action Types:** update_field, create_entity, send_notification, send_email, create_task, create_approval_request, trigger_webhook

### 3.2 Template Workflows (73 Total)

| Domain | Workflows |
|--------|-----------|
| Project Management | task_due_reminder, task_overdue_escalation, milestone_approaching |
| Live Production | event_phase_transition, show_call_published, runsheet_delay_adjustment |
| Workforce | shift_confirmation, timesheet_reminder, certification_expiry |
| Assets | checkout_approval, overdue_reminder, maintenance_scheduling |
| Finance | expense_approval_routing, invoice_overdue, budget_threshold |
| Talent | booking_confirmation, rider_review, payment_reminder |
| Experience | ticket_purchase, guest_checkin, hospitality_fulfillment |

---

## 4. Templates, Reports & Demo Data

### 4.1 Professional Templates

- **Project:** Event Production, Tour Management, Festival Planning
- **Finance:** Budget Template, Invoice Template, Expense Report
- **Production:** Show Call, Runsheet, Cue Sheet, Stage Plot
- **HR:** Crew Call, Timesheet, Certification Tracker

### 4.2 Analytics Dashboards

- Executive Overview (KPIs, revenue, utilization)
- Project Health (status, budget variance, timeline)
- Workforce Analytics (availability, certifications, hours)
- Financial Performance (P&L, cash flow, AR/AP aging)
- Event Operations (ticket sales, check-ins, hospitality)

### 4.3 Demo Seed Data

- 1 demo organization with full configuration
- Users for all 12 role types
- Sample data across all 287 tables
- Full lifecycle examples (draft → completed)

---

## 5. Open Source + Enterprise

### 5.1 Core (Open Source)

- Basic task management
- Calendar & scheduling
- Asset tracking (read-only)
- Standard views (list, table, board)

### 5.2 Pro ($79/user/month)

- Full project management
- Custom fields & workflows
- Time tracking & reports
- Basic integrations

### 5.3 Enterprise ($1,499+/month)

- SSO/SAML, SCIM provisioning
- Advanced audit logging
- White-labeling & custom domains
- ERP/CRM/HRIS connectors
- Unlimited AI features

### 5.4 Integration Connectors

| Category | Connectors |
|----------|------------|
| ERP | NetSuite, SAP |
| CRM | HubSpot, Salesforce |
| HRIS | Rippling, Workday |
| FinOps | Ramp, Brex |
| Communication | Slack, Teams |

---

## 6. Quality & Dev Experience

### 6.1 Testing Strategy

- **Unit:** Vitest for components/utilities
- **Integration:** Playwright for E2E flows
- **Contract:** OpenAPI spec validation
- **Performance:** k6 load testing

### 6.2 CI/CD Pipeline

```yaml
stages:
  - lint & typecheck
  - unit tests
  - build
  - integration tests
  - security scan
  - deploy preview
  - production deploy
```

### 6.3 Documentation

- API Reference (OpenAPI-generated)
- Component Storybook
- Architecture Decision Records
- Deployment Runbooks
- Video Tutorials

---

## Implementation Phases

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1 | 4 weeks | Monorepo setup, design tokens, API gateway |
| 2 | 6 weeks | Complete database schema, RLS policies |
| 3 | 8 weeks | Workflow engine, 73 templates |
| 4 | 6 weeks | All 12 view types, toolbar actions |
| 5 | 4 weeks | White-label theming, demo data |
| 6 | 4 weeks | Enterprise plugins, integrations |
| 7 | 4 weeks | Testing, documentation, launch prep |

**Total: 36 weeks**

---

## Success Criteria

- [ ] 287 database tables with constraints
- [ ] 142 RLS policies applied
- [ ] 491 OpenAPI endpoints implemented
- [ ] 73 workflow templates functional
- [ ] 12 view types rendering
- [ ] 13 toolbar actions operational
- [ ] WCAG 2.2 AAA compliance
- [ ] Zero runtime errors on deploy
