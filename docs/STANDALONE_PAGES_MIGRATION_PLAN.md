# Standalone Pages Migration Plan

## Overview

This document outlines the migration plan for the remaining 157 standalone pages that need to be integrated into the new 8-group IA structure.

**Current State:** 157 top-level routes in `src/app/(app)/`
**Target State:** All routes organized under the 8 navigation groups

---

## Migration Categories

### 1. Account/Platform Administration → `/account/platform/`
**Description:** System administration, API management, developer tools

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/api-keys` | `/account/platform/api-keys` | High |
| `/api-gateway` | `/account/platform/api-gateway` | Medium |
| `/api-playground` | `/account/platform/api-playground` | Low |
| `/api-versions` | `/account/platform/api-versions` | Low |
| `/oauth-clients` | `/account/platform/oauth-clients` | Medium |
| `/webhooks` | `/account/platform/webhooks` | High |
| `/webhook-logs` | `/account/platform/webhook-logs` | Medium |
| `/developer-docs` | `/account/platform/developer-docs` | Medium |
| `/feature-flags` | `/account/platform/feature-flags` | High |
| `/custom-fields` | `/account/platform/custom-fields` | Medium |
| `/domain-settings` | `/account/platform/domains` | Medium |

---

### 2. Account/Security → `/account/security/`
**Description:** Security settings, access control, authentication

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/access-control` | `/account/security/access-control` | High |
| `/access-groups` | `/account/security/access-groups` | High |
| `/permission-matrix` | `/account/security/permissions` | High |
| `/ip-restrictions` | `/account/security/ip-restrictions` | Medium |
| `/password-policy` | `/account/security/password-policy` | Medium |
| `/session-management` | `/account/security/sessions` | Medium |
| `/login-history` | `/account/security/login-history` | Low |
| `/encryption` | `/account/security/encryption` | Low |
| `/ssl-certificates` | `/account/security/ssl-certificates` | Low |
| `/penetration-testing` | `/account/security/pen-testing` | Low |
| `/security-alerts` | `/account/security/alerts` | Medium |
| `/security-scanning` | `/account/security/scanning` | Low |
| `/network-security` | `/account/security/network` | Low |

---

### 3. Account/Organization → `/account/organization/`
**Description:** Organization settings, workspace management

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/organization` | `/account/organization` | Already exists |
| `/workspace-settings` | `/account/organization/workspace-settings` | Medium |
| `/workspaces` | `/account/organization/workspaces` | Medium |
| `/teams-management` | `/account/organization/teams` | Medium |
| `/localization` | `/account/organization/localization` | Low |

---

### 4. Account/Billing → `/account/billing/`
**Description:** Billing, subscription, usage

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/billing` | `/account/billing` | Already exists |
| `/subscription` | `/account/billing/subscription` | High |
| `/usage` | `/account/billing/usage` | Medium |
| `/usage-analytics` | `/account/billing/usage-analytics` | Low |

---

### 5. Account/Support → `/account/support/`
**Description:** Help, support, documentation

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/help` | `/account/support/help` | High |
| `/contact-support` | `/account/support/contact` | High |
| `/support-tickets` | `/account/support/tickets` | High |
| `/tickets` | `/account/support/tickets` | Consolidate |
| `/knowledge-base` | `/account/support/knowledge-base` | Medium |
| `/live-chat` | `/account/support/live-chat` | Medium |
| `/feedback` | `/account/support/feedback` | Low |
| `/feature-requests` | `/account/support/feature-requests` | Low |
| `/release-notes` | `/account/support/release-notes` | Low |
| `/changelog` | `/account/support/changelog` | Low |
| `/roadmap` | `/account/support/roadmap` | Low |
| `/status-page` | `/account/support/status` | Medium |
| `/system-status` | `/account/support/status` | Consolidate |

---

### 6. Account/Data Management → `/account/data/`
**Description:** Data import/export, backups, retention

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/data-import` | `/account/data/import` | High |
| `/data-export` | `/account/data/export` | High |
| `/import-export` | `/account/data/import-export` | Consolidate |
| `/data-retention` | `/account/data/retention` | Medium |
| `/data-quality` | `/account/data/quality` | Low |
| `/data-catalog` | `/account/data/catalog` | Low |
| `/data-lineage` | `/account/data/lineage` | Low |
| `/data-sources` | `/account/data/sources` | Medium |
| `/data-pipelines` | `/account/data/pipelines` | Low |
| `/data-management` | `/account/data/management` | Low |
| `/backups` | `/account/data/backups` | High |
| `/backup-recovery` | `/account/data/backup-recovery` | Medium |
| `/backup-restore` | `/account/data/backup-restore` | Medium |
| `/archive` | `/account/data/archive` | Low |
| `/archives` | `/account/data/archives` | Consolidate |
| `/trash` | `/account/data/trash` | Low |
| `/recycle-bin` | `/account/data/recycle-bin` | Consolidate |

---

### 7. Account/Audit & Logs → `/account/audit/`
**Description:** Audit trails, system logs, monitoring

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/audit-log` | `/account/audit/log` | High |
| `/audit-trail` | `/account/audit/trail` | Consolidate |
| `/activity` | `/account/audit/activity` | Medium |
| `/activity-feed` | `/account/audit/activity-feed` | Consolidate |
| `/event-logs` | `/account/audit/event-logs` | Medium |
| `/system-logs` | `/account/audit/system-logs` | Low |
| `/log-aggregation` | `/account/audit/log-aggregation` | Low |
| `/error-tracking` | `/account/audit/error-tracking` | Medium |

---

### 8. Business/Operations → `/business/operations/`
**Description:** Operational tools, vendor management, queue management

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/vendors` | `/business/procurement/vendors` | High |
| `/queue-management` | `/business/operations/queue-management` | Medium |
| `/ticketing` | `/business/operations/ticketing` | High |
| `/check-in` | `/business/operations/check-in` | High |
| `/guest-lists` | `/business/operations/guest-lists` | High |
| `/accreditation` | `/business/operations/accreditation` | Medium |
| `/crowd-management` | `/business/operations/crowd-management` | Medium |

---

### 9. Business/Compliance → `/business/compliance/`
**Description:** Safety, emergency, incident management

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/safety` | `/business/compliance/safety` | High |
| `/emergency-plans` | `/business/compliance/emergency-plans` | High |
| `/incident-reports` | `/business/compliance/incident-reports` | High |
| `/incident-response` | `/business/compliance/incident-response` | Medium |
| `/medical` | `/business/compliance/medical` | Medium |
| `/certificates` | `/business/compliance/certificates` | Medium |
| `/certifications` | `/business/compliance/certifications` | Consolidate |

---

### 10. Business/Analytics → `/business/analytics/`
**Description:** Dashboards, metrics, forecasting

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/dashboards` | `/business/analytics/dashboards` | High |
| `/widgets` | `/business/analytics/widgets` | Medium |
| `/metrics-dashboard` | `/business/analytics/metrics` | Medium |
| `/forecasting` | `/business/analytics/forecasting` | Medium |
| `/query-builder` | `/business/analytics/query-builder` | Low |

---

### 11. Projects/Events → `/projects/events/`
**Description:** Event-specific tools

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/venue-management` | `/projects/places/venue-management` | High |
| `/weather` | `/projects/events/weather` | Medium |
| `/noise-monitoring` | `/projects/events/noise-monitoring` | Low |
| `/input-lists` | `/projects/programming/input-lists` | Medium |
| `/patch-lists` | `/projects/programming/patch-lists` | Medium |

---

### 12. People/HR → `/people/hr/`
**Description:** HR-related tools

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/team` | `/people/teams` | Consolidate |

---

### 13. Work/Productivity → `/work/`
**Description:** Personal productivity tools

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/favorites` | `/work/favorites` | Medium |
| `/pinned` | `/work/pinned` | Medium |
| `/recent` | `/work/recent` | Medium |
| `/saved-filters` | `/work/saved-filters` | Low |
| `/saved-views` | `/work/saved-views` | Low |
| `/shortcuts` | `/work/shortcuts` | Low |
| `/quick-actions` | `/work/quick-actions` | Low |
| `/command-palette` | `/work/command-palette` | Low |
| `/global-search` | `/work/search` | Medium |
| `/chat` | `/work/chat` | High |
| `/comms` | `/work/comms` | Medium |
| `/alerts` | `/work/alerts` | High |
| `/notification-rules` | `/work/notification-rules` | Medium |
| `/alerting-rules` | `/work/alerting-rules` | Low |
| `/approval-workflows` | `/work/approval-workflows` | Medium |
| `/automation` | `/work/automation` | Medium |
| `/scheduled-jobs` | `/work/scheduled-jobs` | Low |
| `/surveys-feedback` | `/work/surveys` | Low |
| `/discovery` | `/work/discovery` | Low |
| `/runbooks` | `/work/runbooks` | Low |

---

### 14. Infrastructure/DevOps → `/account/infrastructure/`
**Description:** Infrastructure management (admin-only)

| Current Path | New Path | Priority |
|--------------|----------|----------|
| `/infrastructure` | `/account/infrastructure` | Low |
| `/kubernetes` | `/account/infrastructure/kubernetes` | Low |
| `/container-registry` | `/account/infrastructure/container-registry` | Low |
| `/ci-cd-pipelines` | `/account/infrastructure/ci-cd` | Low |
| `/deployment-history` | `/account/infrastructure/deployments` | Low |
| `/environment-config` | `/account/infrastructure/environments` | Low |
| `/database-management` | `/account/infrastructure/database` | Low |
| `/storage-management` | `/account/infrastructure/storage` | Low |
| `/cache-management` | `/account/infrastructure/cache` | Low |
| `/cdn-management` | `/account/infrastructure/cdn` | Low |
| `/dns-management` | `/account/infrastructure/dns` | Low |
| `/load-balancer` | `/account/infrastructure/load-balancer` | Low |
| `/service-mesh` | `/account/infrastructure/service-mesh` | Low |
| `/secrets-management` | `/account/infrastructure/secrets` | Low |
| `/resource-scaling` | `/account/infrastructure/scaling` | Low |
| `/health-checks` | `/account/infrastructure/health-checks` | Low |
| `/uptime-monitoring` | `/account/infrastructure/uptime` | Low |
| `/rate-limits` | `/account/infrastructure/rate-limits` | Low |
| `/sla-management` | `/account/infrastructure/sla` | Low |
| `/on-call-schedule` | `/account/infrastructure/on-call` | Low |
| `/disaster-recovery` | `/account/infrastructure/disaster-recovery` | Low |
| `/business-continuity` | `/account/infrastructure/business-continuity` | Low |
| `/sandbox` | `/account/infrastructure/sandbox` | Low |
| `/dependency-graph` | `/account/infrastructure/dependencies` | Low |

---

## Consolidation Opportunities

The following routes should be consolidated (duplicates or near-duplicates):

| Routes to Consolidate | Target Path |
|-----------------------|-------------|
| `/tickets`, `/support-tickets` | `/account/support/tickets` |
| `/audit-log`, `/audit-trail` | `/account/audit/log` |
| `/activity`, `/activity-feed` | `/account/audit/activity` |
| `/archive`, `/archives` | `/account/data/archive` |
| `/trash`, `/recycle-bin` | `/account/data/trash` |
| `/certificates`, `/certifications` | `/business/compliance/certifications` |
| `/status-page`, `/system-status` | `/account/support/status` |
| `/team`, `/teams-management` | `/people/teams` |
| `/data-import`, `/data-export`, `/import-export` | `/account/data/import`, `/account/data/export` |

---

## Routes to Potentially Remove

These routes may be redundant or unused:

| Route | Reason |
|-------|--------|
| `/media` | Duplicate of `/content/media` |
| `/inventory` | Duplicate of `/assets/inventory` |
| `/places` | Duplicate of `/projects/places` |
| `/procedures` | Duplicate of `/projects/procedures` |

---

## Migration Priority

### Phase 1: High Priority (Core User-Facing)
- Work productivity tools (chat, alerts, favorites)
- Business operations (ticketing, check-in, guest-lists)
- Account essentials (support, data import/export)

### Phase 2: Medium Priority (Power User Features)
- Analytics and dashboards
- Automation and workflows
- Security settings
- Audit and logging

### Phase 3: Low Priority (Admin/DevOps)
- Infrastructure management
- Developer tools
- Advanced platform settings

---

## Implementation Notes

1. **No Redirects:** Per original requirements, no backwards compatibility redirects will be implemented
2. **Navigation Config:** Update `src/config/navigation.ts` to add new subpages as needed
3. **File Moves:** Use `mv` commands to relocate page directories
4. **Consolidation:** When consolidating duplicates, keep the more complete implementation
5. **Testing:** Verify build passes after each phase

---

## Estimated Effort

| Phase | Routes | Estimated Time |
|-------|--------|----------------|
| Phase 1 | ~25 routes | 1-2 hours |
| Phase 2 | ~40 routes | 2-3 hours |
| Phase 3 | ~35 routes | 2-3 hours |
| Consolidation | ~15 routes | 1 hour |
| **Total** | **~115 routes** | **6-9 hours** |

---

## Next Steps

1. Review and approve this migration plan
2. Execute Phase 1 migrations
3. Verify build and test navigation
4. Execute Phase 2 migrations
5. Execute Phase 3 migrations
6. Clean up consolidated/removed routes
7. Update navigation config with new subpages
8. Final testing and documentation update
