# Information Architecture Migration Plan

## ✅ MIGRATION COMPLETE (January 21, 2026)

This document outlines the migration from the current 5-group sidebar IA to the new 8-group structure optimized for event/production company workflows.

**Migration Status:** COMPLETE
**Original Scope:** 277 route directories → 9 top-level items (8 groups + layout)
**Build Status:** ✅ Passing (467 static pages)

---

## Final IA Structure

### Current → New Group Mapping

| Current Group | New Group(s) |
|---------------|--------------|
| Core | Dashboard (standalone), Work |
| Team | Projects, People |
| Management | Business |
| Network | Network (unchanged) |
| Account | Account (unchanged) |
| — | Assets (new standalone) |
| — | Content (new standalone) |

### New Navigation Groups (8 Total)

```
1. Dashboard     → Single entry point (not a collapsible group)
2. Work          → Cross-cutting daily tools
3. Projects      → Project/production management
4. People        → Workforce management
5. Business      → Sales, finance, operations management
6. Assets        → Physical inventory & logistics
7. Content       → Creative & marketing workflows
8. Network       → Community & marketplace
9. Account       → Settings & administration
```

---

## Detailed Page Mapping

### 1. Dashboard (Standalone Entry)
**Path:** `/dashboard`

| Page | Current Path | New Path | Status |
|------|--------------|----------|--------|
| Overview | `/dashboard` | `/dashboard` | No change |
| Analytics | `/dashboard/analytics` | `/dashboard/analytics` | No change |
| Activity | `/dashboard/activity` | `/dashboard/activity` | No change |
| Widgets | `/widgets` | `/dashboard/widgets` | **MOVE** |
| Dashboards | `/dashboards` | `/dashboard/saved` | **MOVE + RENAME** |

---

### 2. Work Group
**Description:** Cross-cutting tools used daily by all roles

| Page | Current Path | New Path | Status |
|------|--------------|----------|--------|
| **Calendar** | `/calendar` | `/work/calendar` | **MOVE** |
| Schedule | `/calendar/schedule` | `/work/calendar/schedule` | **MOVE** |
| Availability | `/calendar/availability` | `/work/calendar/availability` | **MOVE** |
| Resources | `/calendar/resources` | `/work/calendar/resources` | **MOVE** |
| Bookings | `/calendar/bookings` | `/work/calendar/bookings` | **MOVE** |
| **Tasks** | `/tasks` | `/work/tasks` | **MOVE** |
| My Tasks | `/tasks/my-tasks` | `/work/tasks/my-tasks` | **MOVE** |
| Assigned | `/tasks/assigned` | `/work/tasks/assigned` | **MOVE** |
| Watching | `/tasks/watching` | `/work/tasks/watching` | **MOVE** |
| Completed | `/tasks/completed` | `/work/tasks/completed` | **MOVE** |
| Templates | `/tasks/templates` | `/work/tasks/templates` | **MOVE** |
| **Workflows** | `/workflows` | `/work/workflows` | **MOVE** |
| Active | `/workflows/active` | `/work/workflows/active` | **MOVE** |
| Drafts | `/workflows/drafts` | `/work/workflows/drafts` | **MOVE** |
| Runs | `/workflows/runs` | `/work/workflows/runs` | **MOVE** |
| Templates | `/workflows/templates` | `/work/workflows/templates` | **MOVE** |
| Builder | `/workflows/builder` | `/work/workflows/builder` | **MOVE** |
| **Documents** | `/documents` | `/work/documents` | **MOVE** |
| All | `/documents/all` | `/work/documents/all` | **MOVE** |
| Recent | `/documents/recent` | `/work/documents/recent` | **MOVE** |
| Shared | `/documents/shared` | `/work/documents/shared` | **MOVE** |
| Templates | `/documents/templates` | `/work/documents/templates` | **MOVE** |
| Trash | `/documents/trash` | `/work/documents/trash` | **MOVE** |
| **Notifications** | `/notifications` | `/work/notifications` | **MOVE** |
| **Messages** | `/messages` | `/work/messages` | **MOVE** |
| **Notes** | `/notes` | `/work/notes` | **MOVE** |
| **Approvals** | `/approvals` | `/work/approvals` | **MOVE** |

---

### 3. Projects Group
**Description:** Project and production management (formerly "Productions" group concept)

| Page | Current Path | New Path | Status |
|------|--------------|----------|--------|
| **Productions** | `/projects` | `/projects/productions` | **RENAME** |
| Active | `/projects/active` | `/projects/productions/active` | **MOVE** |
| Planning | `/projects/planning` | `/projects/productions/planning` | **MOVE** |
| Completed | `/projects/completed` | `/projects/productions/completed` | **MOVE** |
| Archived | `/projects/archived` | `/projects/productions/archived` | **MOVE** |
| Templates | `/projects/templates` | `/projects/templates` | **MOVE UP** |
| **Programming** | `/programs` | `/projects/programming` | **RENAME** |
| Schedule | `/programs/active` | `/projects/programming/schedule` | **MOVE + RENAME** |
| Run of Show | — | `/projects/programming/run-of-show` | **NEW** |
| Itineraries | — | `/projects/programming/itineraries` | **NEW** |
| Rehearsals | — | `/projects/programming/rehearsals` | **NEW** |
| **Runsheets** | `/runsheets` | `/projects/programming/runsheets` | **MOVE** |
| **Cue Sheets** | `/cue-sheets` | `/projects/programming/cue-sheets` | **MOVE** |
| **Setlists** | `/setlists` | `/projects/programming/setlists` | **MOVE** |
| **Places** | `/places` | `/projects/places` | **MOVE** |
| Venues | `/places/venues`, `/venues` | `/projects/places/venues` | **CONSOLIDATE** |
| Spaces | `/places/spaces` | `/projects/places/spaces` | **MOVE** |
| Floor Plans | `/places/floor-plans`, `/floor-plans` | `/projects/places/floor-plans` | **CONSOLIDATE** |
| Site Surveys | `/places/surveys`, `/site-surveys` | `/projects/places/site-surveys` | **CONSOLIDATE** |
| Stage Plots | `/stage-plots` | `/projects/places/stage-plots` | **MOVE** |
| Seating Charts | `/seating-charts` | `/projects/places/seating-charts` | **MOVE** |
| **Procedures** | `/procedures` | `/projects/procedures` | **MOVE** |
| Active | `/procedures/active` | `/projects/procedures/active` | **MOVE** |
| Drafts | `/procedures/drafts` | `/projects/procedures/drafts` | **MOVE** |
| Checklists | `/procedures/checklists` | `/projects/procedures/checklists` | **MOVE** |
| Training | `/procedures/training` | `/projects/procedures/training` | **MOVE** |
| **Events** | `/events` | `/projects/events` | **MOVE** |
| **Call Sheets** | `/call-sheets` | `/projects/call-sheets` | **MOVE** |
| **Riders** | `/riders` | `/projects/riders` | **MOVE** |
| **Load In/Out** | `/load-in-out` | `/projects/load-in-out` | **MOVE** |
| **Rigging** | `/rigging` | `/projects/rigging` | **MOVE** |
| **Power Distribution** | `/power-distribution` | `/projects/power-distribution` | **MOVE** |

---

### 4. People Group
**Description:** Workforce and team management

| Page | Current Path | New Path | Status |
|------|--------------|----------|--------|
| **Directory** | `/people/directory` | `/people/directory` | No change |
| **Teams** | `/people/teams`, `/team` | `/people/teams` | **CONSOLIDATE** |
| **Org Chart** | `/people/org-chart` | `/people/org-chart` | No change |
| **Availability** | `/people/availability`, `/availability` | `/people/availability` | **CONSOLIDATE** |
| **Certifications** | `/people/certifications`, `/certifications` | `/people/certifications` | **CONSOLIDATE** |
| **Contractors** | `/people/contractors` | `/people/contractors` | No change |
| **Crew** | `/crew` | `/people/crew` | **MOVE** |
| **Crew Calls** | `/people/crew-calls` | `/people/crew-calls` | No change |
| **Crew Scheduling** | `/crew-scheduling` | `/people/scheduling` | **MOVE + RENAME** |
| **Shifts** | `/shifts` | `/people/shifts` | **MOVE** |
| **Timesheets** | `/timesheets` | `/people/timesheets` | **MOVE** |
| **Payroll** | `/payroll` | `/people/payroll` | **MOVE** |
| **Talent** | `/talent` | `/people/talent` | **MOVE** |
| **Artist Management** | `/artist-management` | `/people/artists` | **MOVE + RENAME** |
| **Roles** | `/roles` | `/people/roles` | **MOVE** |
| **Departments** | `/departments` | `/people/departments` | **MOVE** |
| **Performance** | `/performance` | `/people/performance` | **MOVE** |
| **Learning** | `/learning` | `/people/learning` | **MOVE** |

---

### 5. Business Group
**Description:** Sales, finance, and operations management

| Page | Current Path | New Path | Status |
|------|--------------|----------|--------|
| **Pipeline** | `/pipeline` | `/business/pipeline` | **MOVE** |
| Deals | `/pipeline/deals` | `/business/pipeline/deals` | **MOVE** |
| Contacts | `/pipeline/contacts`, `/contacts` | `/business/pipeline/contacts` | **CONSOLIDATE** |
| Companies | `/pipeline/companies` | `/business/pipeline/companies` | **MOVE** |
| Activities | `/pipeline/activities` | `/business/pipeline/activities` | **MOVE** |
| Proposals | `/pipeline/proposals`, `/proposals` | `/business/pipeline/proposals` | **CONSOLIDATE** |
| **CRM** | `/crm` | `/business/crm` | **MOVE** |
| **Quotes** | `/quotes` | `/business/quotes` | **MOVE** |
| **Contracts** | `/contracts` | `/business/contracts` | **MOVE** |
| **Forecast** | `/forecast` | `/business/forecast` | **MOVE** |
| Revenue | `/forecast/revenue` | `/business/forecast/revenue` | **MOVE** |
| Costs | `/forecast/costs` | `/business/forecast/costs` | **MOVE** |
| Resources | `/forecast/resources` | `/business/forecast/resources` | **MOVE** |
| Scenarios | `/forecast/scenarios` | `/business/forecast/scenarios` | **MOVE** |
| **Finance** | `/finance` | `/business/finance` | **MOVE** |
| **Budgets** | `/budgets` | `/business/budgets` | **MOVE** |
| **Invoices** | `/invoices` | `/business/invoices` | **MOVE** |
| **Payments** | `/payments` | `/business/payments` | **MOVE** |
| **Expenses** | `/expenses` | `/business/expenses` | **MOVE** |
| **Reimbursements** | `/reimbursements` | `/business/reimbursements` | **MOVE** |
| **Purchase Orders** | `/purchase-orders` | `/business/purchase-orders` | **MOVE** |
| **Cashflow** | `/cashflow` | `/business/cashflow` | **MOVE** |
| **GL Accounts** | `/gl-accounts` | `/business/gl-accounts` | **MOVE** |
| **Journal Entries** | `/journal-entries` | `/business/journal-entries` | **MOVE** |
| **Financial Statements** | `/financial-statements` | `/business/financial-statements` | **MOVE** |
| **Tax Reports** | `/tax-reports` | `/business/tax-reports` | **MOVE** |
| **Reconciliation** | `/reconciliation` | `/business/reconciliation` | **MOVE** |
| **Rate Cards** | `/rate-cards` | `/business/rate-cards` | **MOVE** |
| **Commissions** | `/commissions` | `/business/commissions` | **MOVE** |
| **Jobs** | `/jobs` | `/business/jobs` | **MOVE** |
| Active | `/jobs/active` | `/business/jobs/active` | **MOVE** |
| Reviews | `/jobs/reviews` | `/business/jobs/reviews` | **MOVE** |
| **Procurement** | `/procurement` | `/business/procurement` | **MOVE** |
| Requisitions | `/procurement/requisitions` | `/business/procurement/requisitions` | **MOVE** |
| Orders | `/procurement/orders` | `/business/procurement/orders` | **MOVE** |
| Vendors | `/procurement/vendors`, `/vendors` | `/business/procurement/vendors` | **CONSOLIDATE** |
| RFQ | `/procurement/rfq` | `/business/procurement/rfq` | **MOVE** |
| **Compliance** | `/compliance` | `/business/compliance` | **MOVE** |
| Policies | `/compliance/policies` | `/business/compliance/policies` | **MOVE** |
| Audits | `/compliance/audits` | `/business/compliance/audits` | **MOVE** |
| Risks | `/compliance/risks` | `/business/compliance/risks` | **MOVE** |
| Incidents | `/compliance/incidents` | `/business/compliance/incidents` | **MOVE** |
| **Insurance** | `/insurance` | `/business/insurance` | **MOVE** |
| **Permits & Licenses** | `/permits-licenses` | `/business/permits-licenses` | **MOVE** |
| **Reports** | `/reports` | `/business/reports` | **MOVE** |
| Library | `/reports/library` | `/business/reports/library` | **MOVE** |
| Scheduled | `/reports/scheduled` | `/business/reports/scheduled` | **MOVE** |
| Builder | `/reports/builder` | `/business/reports/builder` | **MOVE** |
| Exports | `/reports/exports` | `/business/reports/exports` | **MOVE** |
| **Insights** | `/insights` | `/business/insights` | **MOVE** |
| Trends | `/insights/trends` | `/business/insights/trends` | **MOVE** |
| Anomalies | `/insights/anomalies` | `/business/insights/anomalies` | **MOVE** |
| Predictions | `/insights/predictions` | `/business/insights/predictions` | **MOVE** |
| Recommendations | `/insights/recommendations` | `/business/insights/recommendations` | **MOVE** |
| **Analytics** | `/analytics` | `/business/analytics` | **MOVE** |
| **Sponsorships** | `/sponsorships` | `/business/sponsorships` | **MOVE** |
| **Partners** | `/partners` | `/business/partners` | **MOVE** |
| **Affiliates** | `/affiliates` | `/business/affiliates` | **MOVE** |

---

### 6. Assets Group
**Description:** Physical inventory, equipment, and logistics

| Page | Current Path | New Path | Status |
|------|--------------|----------|--------|
| **Inventory** | `/assets/inventory`, `/inventory` | `/assets/inventory` | **CONSOLIDATE** |
| **Checked Out** | `/assets/checked-out` | `/assets/checked-out` | No change |
| **Maintenance** | `/assets/maintenance` | `/assets/maintenance` | No change |
| **Locations** | `/assets/locations` | `/assets/locations` | No change |
| **Categories** | `/assets/categories` | `/assets/categories` | No change |
| **Kits** | `/assets/kits` | `/assets/kits` | No change |
| **Equipment Tracking** | `/equipment-tracking` | `/assets/equipment` | **MOVE + RENAME** |
| **Transport** | `/transport` | `/assets/transport` | **MOVE** |
| **Parking** | `/parking` | `/assets/parking` | **MOVE** |
| **Products** | `/products` | `/assets/products` | **MOVE** |
| Services | `/products/services` | `/assets/products/services` | **MOVE** |
| Packages | `/products/packages` | `/assets/products/packages` | **MOVE** |
| Catalog | `/products/catalog` | `/assets/products/catalog` | **MOVE** |
| Pricing | `/products/pricing` | `/assets/products/pricing` | **MOVE** |
| **Service Catalog** | `/service-catalog` | `/assets/service-catalog` | **MOVE** |
| **Merchandise** | `/merchandise` | `/assets/merchandise` | **MOVE** |
| **Catering** | `/catering` | `/assets/catering` | **MOVE** |
| **Hospitality** | `/hospitality` | `/assets/hospitality` | **MOVE** |
| **Wristbands** | `/wristbands` | `/assets/wristbands` | **MOVE** |
| **Signage** | `/signage` | `/assets/signage` | **MOVE** |
| **Lost & Found** | `/lost-found` | `/assets/lost-found` | **MOVE** |
| **Waste Management** | `/waste-management` | `/assets/waste-management` | **MOVE** |
| **Sustainability** | `/sustainability` | `/assets/sustainability` | **MOVE** |

---

### 7. Content Group
**Description:** Creative and marketing workflows

| Page | Current Path | New Path | Status |
|------|--------------|----------|--------|
| **Media** | `/content/media`, `/media` | `/content/media` | **CONSOLIDATE** |
| **Brand** | `/content/brand`, `/branding` | `/content/brand` | **CONSOLIDATE** |
| **Marketing** | `/content/marketing` | `/content/marketing` | No change |
| **Social** | `/content/social`, `/social-media` | `/content/social` | **CONSOLIDATE** |
| **Approvals** | `/content/approvals` | `/content/approvals` | No change |
| **Campaigns** | `/campaigns` | `/content/campaigns` | **MOVE** |
| **Email Campaigns** | `/email-campaigns` | `/content/email-campaigns` | **MOVE** |
| **Email Templates** | `/email-templates` | `/content/email-templates` | **MOVE** |
| **SMS Templates** | `/sms-templates` | `/content/sms-templates` | **MOVE** |
| **Showcase** | `/showcase` | `/content/showcase` | **MOVE** |
| Portfolio | `/showcase/portfolio` | `/content/showcase/portfolio` | **MOVE** |
| Case Studies | `/showcase/case-studies`, `/case-studies` | `/content/showcase/case-studies` | **CONSOLIDATE** |
| Testimonials | `/showcase/testimonials`, `/testimonials` | `/content/showcase/testimonials` | **CONSOLIDATE** |
| Press | `/showcase/press`, `/press` | `/content/showcase/press` | **CONSOLIDATE** |
| **Announcements** | `/announcements` | `/content/announcements` | **MOVE** |
| **Webinars** | `/webinars` | `/content/webinars` | **MOVE** |
| **Video Tutorials** | `/video-tutorials` | `/content/video-tutorials` | **MOVE** |
| **Production Notes** | `/production-notes` | `/content/production-notes` | **MOVE** |

---

### 8. Network Group
**Description:** Community and marketplace (minimal changes)

| Page | Current Path | New Path | Status |
|------|--------------|----------|--------|
| **Discussions** | `/discussions` | `/network/discussions` | **MOVE** |
| All | `/discussions/all` | `/network/discussions/all` | **MOVE** |
| My Posts | `/discussions/my-posts` | `/network/discussions/my-posts` | **MOVE** |
| Categories | `/discussions/categories` | `/network/discussions/categories` | **MOVE** |
| **Community** | `/community` | `/network/community` | **MOVE** |
| **Community Forum** | `/community-forum` | `/network/forum` | **MOVE + RENAME** |
| **Challenges** | `/challenges` | `/network/challenges` | **MOVE** |
| Active | `/challenges/active` | `/network/challenges/active` | **MOVE** |
| Past | `/challenges/past` | `/network/challenges/past` | **MOVE** |
| My Entries | `/challenges/my-entries` | `/network/challenges/my-entries` | **MOVE** |
| Leaderboard | `/challenges/leaderboard` | `/network/challenges/leaderboard` | **MOVE** |
| **Marketplace** | `/marketplace` | `/network/marketplace` | **MOVE** |
| Browse | `/marketplace/browse` | `/network/marketplace/browse` | **MOVE** |
| My Listings | `/marketplace/my-listings` | `/network/marketplace/my-listings` | **MOVE** |
| Bookings | `/marketplace/bookings` | `/network/marketplace/bookings` | **MOVE** |
| Reviews | `/marketplace/reviews` | `/network/marketplace/reviews` | **MOVE** |
| **Opportunities** | `/opportunities` | `/network/opportunities` | **MOVE** |
| Jobs | `/opportunities/jobs` | `/network/opportunities/jobs` | **MOVE** |
| Gigs | `/opportunities/gigs` | `/network/opportunities/gigs` | **MOVE** |
| Collaborations | `/opportunities/collaborations` | `/network/opportunities/collaborations` | **MOVE** |
| My Applications | `/opportunities/my-applications` | `/network/opportunities/my-applications` | **MOVE** |
| **Connections** | `/connections` | `/network/connections` | **MOVE** |
| Network | `/connections/network` | `/network/connections/network` | **MOVE** |
| Requests | `/connections/requests` | `/network/connections/requests` | **MOVE** |
| Groups | `/connections/groups` | `/network/connections/groups` | **MOVE** |
| Events | `/connections/events` | `/network/connections/events` | **MOVE** |
| **Member Directory** | `/member-directory` | `/network/directory` | **MOVE + RENAME** |
| **Mentorship** | `/mentorship` | `/network/mentorship` | **MOVE** |
| **Referrals** | `/referrals` | `/network/referrals` | **MOVE** |
| **Gamification** | `/gamification` | `/network/gamification` | **MOVE** |
| **Achievements** | `/achievements` | `/network/achievements` | **MOVE** |
| **Rewards** | `/rewards` | `/network/rewards` | **MOVE** |
| **Ratings** | `/ratings` | `/network/ratings` | **MOVE** |
| **Reviews** | `/reviews` | `/network/reviews` | **MOVE** |

---

### 9. Account Group
**Description:** Settings and administration (minimal changes)

| Page | Current Path | New Path | Status |
|------|--------------|----------|--------|
| **Profile** | `/account/profile`, `/profile` | `/account/profile` | **CONSOLIDATE** |
| **Organization** | `/account/organization`, `/organization` | `/account/organization` | **CONSOLIDATE** |
| Settings | `/account/organization/settings`, `/settings` | `/account/organization/settings` | **CONSOLIDATE** |
| Branding | `/account/organization/branding` | `/account/organization/branding` | No change |
| Departments | `/account/organization/departments` | `/account/organization/departments` | No change |
| Roles | `/account/organization/roles` | `/account/organization/roles` | No change |
| Fields | `/account/organization/fields` | `/account/organization/fields` | No change |
| Integrations | `/account/organization/integrations`, `/integrations` | `/account/organization/integrations` | **CONSOLIDATE** |
| **Billing** | `/account/billing`, `/billing` | `/account/billing` | **CONSOLIDATE** |
| Subscription | `/account/billing/subscription`, `/subscription` | `/account/billing/subscription` | **CONSOLIDATE** |
| Usage | `/account/billing/usage`, `/usage` | `/account/billing/usage` | **CONSOLIDATE** |
| Payment Methods | `/account/billing/payment-methods` | `/account/billing/payment-methods` | No change |
| Invoices | `/account/billing/invoices` | `/account/billing/invoices` | No change |
| **History** | `/account/history` | `/account/history` | No change |
| Activity | `/account/history/activity` | `/account/history/activity` | No change |
| Logins | `/account/history/logins`, `/login-history` | `/account/history/logins` | **CONSOLIDATE** |
| Changes | `/account/history/changes` | `/account/history/changes` | No change |
| **Resources** | `/account/resources` | `/account/resources` | No change |
| Docs | `/account/resources/docs` | `/account/resources/docs` | No change |
| Videos | `/account/resources/videos` | `/account/resources/videos` | No change |
| API | `/account/resources/api` | `/account/resources/api` | No change |
| Templates | `/account/resources/templates`, `/templates` | `/account/resources/templates` | **CONSOLIDATE** |
| **Platform** | `/account/platform` | `/account/platform` | No change |
| Features | `/account/platform/features`, `/feature-flags` | `/account/platform/features` | **CONSOLIDATE** |
| API Keys | `/account/platform/api-keys`, `/api-keys` | `/account/platform/api-keys` | **CONSOLIDATE** |
| Webhooks | `/account/platform/webhooks`, `/webhooks` | `/account/platform/webhooks` | **CONSOLIDATE** |
| Domains | `/account/platform/domains`, `/domain-settings` | `/account/platform/domains` | **CONSOLIDATE** |
| Export | `/account/platform/export`, `/data-export` | `/account/platform/export` | **CONSOLIDATE** |
| **Support** | `/account/support` | `/account/support` | No change |
| Tickets | `/account/support/tickets`, `/support-tickets`, `/tickets` | `/account/support/tickets` | **CONSOLIDATE** |
| Knowledge Base | `/account/support/knowledge-base`, `/knowledge-base` | `/account/support/knowledge-base` | **CONSOLIDATE** |
| Status | `/account/support/status`, `/status-page`, `/system-status` | `/account/support/status` | **CONSOLIDATE** |
| **Security** | `/security` | `/account/security` | **MOVE** |
| **Preferences** | `/preferences` | `/account/preferences` | **MOVE** |
| **Connected Apps** | `/connected-apps` | `/account/connected-apps` | **MOVE** |
| **SSO Settings** | `/sso-settings` | `/account/sso` | **MOVE + RENAME** |
| **Privacy Center** | `/privacy-center` | `/account/privacy` | **MOVE + RENAME** |
| **GDPR** | `/gdpr` | `/account/gdpr` | **MOVE** |
| **Data Privacy** | `/data-privacy` | `/account/data-privacy` | **MOVE** |
| **Consent Management** | `/consent-management` | `/account/consent` | **MOVE + RENAME** |

---

## Migration Phases

### Phase 1: Preparation (Week 1)
**Goal:** Set up infrastructure for migration without breaking existing routes

#### Tasks:
1. **Create redirect middleware** (`src/middleware.ts`)
   - Map all old routes to new routes
   - Return 301 permanent redirects for SEO
   
2. **Update navigation config** (`src/config/navigation.ts`)
   - Implement new 8-group structure
   - Update all paths to new locations
   
3. **Create route group folders**
   ```
   src/app/(app)/work/
   src/app/(app)/projects/
   src/app/(app)/people/
   src/app/(app)/business/
   src/app/(app)/assets/
   src/app/(app)/content/
   src/app/(app)/network/
   ```

4. **Set up parallel routing** (optional)
   - Keep old routes functional during migration
   - New routes point to same components initially

---

### Phase 2: Work Group Migration (Week 2)
**Scope:** Calendar, Tasks, Workflows, Documents, Notifications, Messages

#### File Operations:
```bash
# Create work group structure
mkdir -p src/app/(app)/work/{calendar,tasks,workflows,documents}

# Move calendar
mv src/app/(app)/calendar/* src/app/(app)/work/calendar/

# Move tasks
mv src/app/(app)/tasks/* src/app/(app)/work/tasks/

# Move workflows
mv src/app/(app)/workflows/* src/app/(app)/work/workflows/

# Move documents
mv src/app/(app)/documents/* src/app/(app)/work/documents/

# Move standalone pages
mv src/app/(app)/notifications src/app/(app)/work/
mv src/app/(app)/messages src/app/(app)/work/
mv src/app/(app)/notes src/app/(app)/work/
mv src/app/(app)/approvals src/app/(app)/work/
```

#### Redirect Rules:
```typescript
// src/lib/redirects.ts
export const workRedirects = {
  '/calendar': '/work/calendar',
  '/calendar/:path*': '/work/calendar/:path*',
  '/tasks': '/work/tasks',
  '/tasks/:path*': '/work/tasks/:path*',
  '/workflows': '/work/workflows',
  '/workflows/:path*': '/work/workflows/:path*',
  '/documents': '/work/documents',
  '/documents/:path*': '/work/documents/:path*',
  '/notifications': '/work/notifications',
  '/messages': '/work/messages',
  '/notes': '/work/notes',
  '/approvals': '/work/approvals',
};
```

---

### Phase 3: Projects Group Migration (Week 3)
**Scope:** Productions, Programming, Places, Procedures, Events

#### Key Renames:
- `/projects` → `/projects/productions` (Projects page becomes Productions)
- `/programs` → `/projects/programming` (Programs becomes Programming)

#### File Operations:
```bash
# Create projects group structure
mkdir -p src/app/(app)/projects/{productions,programming,places,procedures}

# Rename and move projects to productions
mv src/app/(app)/projects src/app/(app)/projects-temp
mkdir -p src/app/(app)/projects/productions
mv src/app/(app)/projects-temp/* src/app/(app)/projects/productions/

# Move programs to programming
mv src/app/(app)/programs/* src/app/(app)/projects/programming/

# Move production-specific pages
mv src/app/(app)/runsheets src/app/(app)/projects/programming/
mv src/app/(app)/cue-sheets src/app/(app)/projects/programming/
mv src/app/(app)/setlists src/app/(app)/projects/programming/

# Move places
mv src/app/(app)/places/* src/app/(app)/projects/places/
mv src/app/(app)/venues src/app/(app)/projects/places/
mv src/app/(app)/floor-plans src/app/(app)/projects/places/
mv src/app/(app)/site-surveys src/app/(app)/projects/places/
mv src/app/(app)/stage-plots src/app/(app)/projects/places/
mv src/app/(app)/seating-charts src/app/(app)/projects/places/

# Move procedures
mv src/app/(app)/procedures/* src/app/(app)/projects/procedures/

# Move other project-related pages
mv src/app/(app)/events src/app/(app)/projects/
mv src/app/(app)/call-sheets src/app/(app)/projects/
mv src/app/(app)/riders src/app/(app)/projects/
mv src/app/(app)/load-in-out src/app/(app)/projects/
mv src/app/(app)/rigging src/app/(app)/projects/
mv src/app/(app)/power-distribution src/app/(app)/projects/
```

---

### Phase 4: People Group Migration (Week 4)
**Scope:** Directory, Teams, Crew, Timesheets, Payroll, Talent

#### File Operations:
```bash
# People group already exists at /people, restructure it
mv src/app/(app)/crew src/app/(app)/people/
mv src/app/(app)/crew-scheduling src/app/(app)/people/scheduling
mv src/app/(app)/shifts src/app/(app)/people/
mv src/app/(app)/timesheets src/app/(app)/people/
mv src/app/(app)/payroll src/app/(app)/people/
mv src/app/(app)/talent src/app/(app)/people/
mv src/app/(app)/artist-management src/app/(app)/people/artists
mv src/app/(app)/roles src/app/(app)/people/
mv src/app/(app)/departments src/app/(app)/people/
mv src/app/(app)/performance src/app/(app)/people/
mv src/app/(app)/learning src/app/(app)/people/
mv src/app/(app)/team src/app/(app)/people/teams-legacy  # Consolidate with /people/teams
```

---

### Phase 5: Business Group Migration (Week 5)
**Scope:** Pipeline, Forecast, Finance, Procurement, Compliance, Reports

#### File Operations:
```bash
# Create business group structure
mkdir -p src/app/(app)/business/{pipeline,forecast,finance,procurement,compliance,reports,insights,jobs}

# Move CRM/Sales
mv src/app/(app)/pipeline/* src/app/(app)/business/pipeline/
mv src/app/(app)/crm src/app/(app)/business/
mv src/app/(app)/quotes src/app/(app)/business/
mv src/app/(app)/contracts src/app/(app)/business/
mv src/app/(app)/contacts src/app/(app)/business/pipeline/  # Consolidate

# Move Finance
mv src/app/(app)/forecast/* src/app/(app)/business/forecast/
mv src/app/(app)/finance src/app/(app)/business/
mv src/app/(app)/budgets src/app/(app)/business/
mv src/app/(app)/invoices src/app/(app)/business/
mv src/app/(app)/payments src/app/(app)/business/
mv src/app/(app)/expenses src/app/(app)/business/
mv src/app/(app)/reimbursements src/app/(app)/business/
mv src/app/(app)/purchase-orders src/app/(app)/business/
mv src/app/(app)/cashflow src/app/(app)/business/
mv src/app/(app)/gl-accounts src/app/(app)/business/
mv src/app/(app)/journal-entries src/app/(app)/business/
mv src/app/(app)/financial-statements src/app/(app)/business/
mv src/app/(app)/tax-reports src/app/(app)/business/
mv src/app/(app)/reconciliation src/app/(app)/business/
mv src/app/(app)/rate-cards src/app/(app)/business/
mv src/app/(app)/commissions src/app/(app)/business/

# Move Operations
mv src/app/(app)/jobs/* src/app/(app)/business/jobs/
mv src/app/(app)/procurement/* src/app/(app)/business/procurement/
mv src/app/(app)/vendors src/app/(app)/business/procurement/

# Move Compliance
mv src/app/(app)/compliance/* src/app/(app)/business/compliance/
mv src/app/(app)/insurance src/app/(app)/business/
mv src/app/(app)/permits-licenses src/app/(app)/business/

# Move Reporting
mv src/app/(app)/reports/* src/app/(app)/business/reports/
mv src/app/(app)/insights/* src/app/(app)/business/insights/
mv src/app/(app)/analytics src/app/(app)/business/

# Move Business Development
mv src/app/(app)/sponsorships src/app/(app)/business/
mv src/app/(app)/partners src/app/(app)/business/
mv src/app/(app)/affiliates src/app/(app)/business/
```

---

### Phase 6: Assets Group Migration (Week 6)
**Scope:** Inventory, Equipment, Transport, Products

#### File Operations:
```bash
# Assets group already exists, restructure it
mv src/app/(app)/inventory src/app/(app)/assets/  # Consolidate with /assets/inventory
mv src/app/(app)/equipment-tracking src/app/(app)/assets/equipment
mv src/app/(app)/transport src/app/(app)/assets/
mv src/app/(app)/parking src/app/(app)/assets/
mv src/app/(app)/products/* src/app/(app)/assets/products/
mv src/app/(app)/service-catalog src/app/(app)/assets/
mv src/app/(app)/merchandise src/app/(app)/assets/
mv src/app/(app)/catering src/app/(app)/assets/
mv src/app/(app)/hospitality src/app/(app)/assets/
mv src/app/(app)/wristbands src/app/(app)/assets/
mv src/app/(app)/signage src/app/(app)/assets/
mv src/app/(app)/lost-found src/app/(app)/assets/
mv src/app/(app)/waste-management src/app/(app)/assets/
mv src/app/(app)/sustainability src/app/(app)/assets/
```

---

### Phase 7: Content Group Migration (Week 7)
**Scope:** Media, Brand, Marketing, Showcase

#### File Operations:
```bash
# Create content group structure
mkdir -p src/app/(app)/content/{media,brand,marketing,social,showcase}

# Move existing content subpages (content group already exists)
# Consolidate duplicates
mv src/app/(app)/media src/app/(app)/content/  # Consolidate
mv src/app/(app)/branding src/app/(app)/content/brand  # Consolidate
mv src/app/(app)/social-media src/app/(app)/content/social  # Consolidate

# Move campaigns
mv src/app/(app)/campaigns src/app/(app)/content/
mv src/app/(app)/email-campaigns src/app/(app)/content/
mv src/app/(app)/email-templates src/app/(app)/content/
mv src/app/(app)/sms-templates src/app/(app)/content/

# Move showcase
mv src/app/(app)/showcase/* src/app/(app)/content/showcase/
mv src/app/(app)/case-studies src/app/(app)/content/showcase/
mv src/app/(app)/testimonials src/app/(app)/content/showcase/
mv src/app/(app)/press src/app/(app)/content/showcase/

# Move other content
mv src/app/(app)/announcements src/app/(app)/content/
mv src/app/(app)/webinars src/app/(app)/content/
mv src/app/(app)/video-tutorials src/app/(app)/content/
mv src/app/(app)/production-notes src/app/(app)/content/
```

---

### Phase 8: Network Group Migration (Week 8)
**Scope:** Discussions, Marketplace, Opportunities, Connections

#### File Operations:
```bash
# Create network group structure
mkdir -p src/app/(app)/network/{discussions,challenges,marketplace,opportunities,connections}

# Move community features
mv src/app/(app)/discussions/* src/app/(app)/network/discussions/
mv src/app/(app)/community src/app/(app)/network/
mv src/app/(app)/community-forum src/app/(app)/network/forum

# Move challenges
mv src/app/(app)/challenges/* src/app/(app)/network/challenges/

# Move marketplace
mv src/app/(app)/marketplace/* src/app/(app)/network/marketplace/

# Move opportunities
mv src/app/(app)/opportunities/* src/app/(app)/network/opportunities/

# Move connections
mv src/app/(app)/connections/* src/app/(app)/network/connections/

# Move other network features
mv src/app/(app)/member-directory src/app/(app)/network/directory
mv src/app/(app)/mentorship src/app/(app)/network/
mv src/app/(app)/referrals src/app/(app)/network/
mv src/app/(app)/gamification src/app/(app)/network/
mv src/app/(app)/achievements src/app/(app)/network/
mv src/app/(app)/rewards src/app/(app)/network/
mv src/app/(app)/ratings src/app/(app)/network/
mv src/app/(app)/reviews src/app/(app)/network/
```

---

### Phase 9: Account Group & Cleanup (Week 9)
**Scope:** Consolidate Account pages, remove duplicate routes

#### File Operations:
```bash
# Consolidate Account duplicates
mv src/app/(app)/profile src/app/(app)/account/  # If not already there
mv src/app/(app)/organization src/app/(app)/account/  # If not already there
mv src/app/(app)/billing src/app/(app)/account/  # If not already there
mv src/app/(app)/settings src/app/(app)/account/organization/
mv src/app/(app)/integrations src/app/(app)/account/organization/
mv src/app/(app)/subscription src/app/(app)/account/billing/
mv src/app/(app)/usage src/app/(app)/account/billing/

# Move security/privacy
mv src/app/(app)/security src/app/(app)/account/
mv src/app/(app)/preferences src/app/(app)/account/
mv src/app/(app)/connected-apps src/app/(app)/account/
mv src/app/(app)/sso-settings src/app/(app)/account/sso
mv src/app/(app)/privacy-center src/app/(app)/account/privacy
mv src/app/(app)/gdpr src/app/(app)/account/
mv src/app/(app)/data-privacy src/app/(app)/account/
mv src/app/(app)/consent-management src/app/(app)/account/consent

# Consolidate platform settings
mv src/app/(app)/api-keys src/app/(app)/account/platform/
mv src/app/(app)/webhooks src/app/(app)/account/platform/
mv src/app/(app)/domain-settings src/app/(app)/account/platform/domains
mv src/app/(app)/feature-flags src/app/(app)/account/platform/features
mv src/app/(app)/data-export src/app/(app)/account/platform/export

# Consolidate support
mv src/app/(app)/support-tickets src/app/(app)/account/support/tickets
mv src/app/(app)/tickets src/app/(app)/account/support/  # Consolidate
mv src/app/(app)/knowledge-base src/app/(app)/account/support/
mv src/app/(app)/status-page src/app/(app)/account/support/status
mv src/app/(app)/system-status src/app/(app)/account/support/  # Consolidate
```

---

### Phase 10: Validation & Cleanup (Week 10)

#### Tasks:
1. **Run route validation script**
   - Verify all routes resolve correctly
   - Check for 404s
   - Validate redirect chains

2. **Update internal links**
   - Search codebase for old paths
   - Update `<Link>` components
   - Update API endpoints if path-dependent

3. **Update tests**
   - Update route tests
   - Update E2E navigation tests

4. **Remove old route folders**
   - Only after confirming redirects work
   - Keep redirects active for 6+ months for SEO

5. **Update documentation**
   - Update README
   - Update API docs
   - Update user guides

---

## Files to Modify

### Primary Files
| File | Changes |
|------|---------|
| `src/config/navigation.ts` | Complete rewrite with new structure |
| `src/middleware.ts` | Add redirect mappings |
| `src/components/layout/sidebar.tsx` | Update to handle new groups |

### Secondary Files (Search & Replace)
```bash
# Find all files with hardcoded routes
grep -r "href=\"/calendar" src/
grep -r "href=\"/tasks" src/
grep -r "href=\"/projects" src/
# ... etc for each moved route
```

### Test Files
```bash
# Update E2E tests
find e2e/ -name "*.spec.ts" -exec grep -l "calendar\|tasks\|projects" {} \;
```

---

## Redirect Configuration

### Next.js Middleware Approach
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const redirects: Record<string, string> = {
  // Work group
  '/calendar': '/work/calendar',
  '/tasks': '/work/tasks',
  '/workflows': '/work/workflows',
  '/documents': '/work/documents',
  
  // Projects group
  '/projects': '/projects/productions',
  '/programs': '/projects/programming',
  '/places': '/projects/places',
  '/procedures': '/projects/procedures',
  
  // ... all other redirects
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check for exact match
  if (redirects[path]) {
    return NextResponse.redirect(
      new URL(redirects[path], request.url),
      { status: 301 }
    );
  }
  
  // Check for prefix match (for subpages)
  for (const [oldPath, newPath] of Object.entries(redirects)) {
    if (path.startsWith(oldPath + '/')) {
      const newFullPath = path.replace(oldPath, newPath);
      return NextResponse.redirect(
        new URL(newFullPath, request.url),
        { status: 301 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## Rollback Plan

If issues arise during migration:

1. **Immediate rollback**: Revert `navigation.ts` to previous version
2. **Route rollback**: Keep old route folders as fallbacks
3. **Redirect reversal**: Swap redirect directions temporarily

### Git Strategy
```bash
# Create migration branch
git checkout -b feature/ia-migration

# Tag before each phase
git tag pre-phase-1
git tag pre-phase-2
# ... etc

# If rollback needed
git revert --no-commit HEAD~N  # N = commits to revert
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 404 errors | 0 | Monitor error logs |
| Redirect latency | <50ms | Performance monitoring |
| User complaints | <5% increase | Support tickets |
| Navigation time | -20% | Analytics (time to target page) |
| Search usage | Baseline | Track command palette usage |

---

## Timeline Summary

| Week | Phase | Scope |
|------|-------|-------|
| 1 | Preparation | Infrastructure, redirects, navigation config |
| 2 | Work | Calendar, Tasks, Workflows, Documents |
| 3 | Projects | Productions, Programming, Places, Procedures |
| 4 | People | Directory, Crew, Timesheets, Payroll |
| 5 | Business | Pipeline, Finance, Procurement, Reports |
| 6 | Assets | Inventory, Equipment, Products |
| 7 | Content | Media, Brand, Marketing, Showcase |
| 8 | Network | Discussions, Marketplace, Connections |
| 9 | Account | Consolidation, Security, Support |
| 10 | Validation | Testing, Cleanup, Documentation |

**Total Duration:** 10 weeks

---

## Appendix: Complete Redirect Map

See `src/lib/route-redirects.ts` (to be created) for the complete mapping of all 277 routes.
