# ATLVS Core Operations Hub - Competitive Excellence Development Brief

## Objective
Analyze the top 5 industry-leading platforms in the work management and operations command center sector and develop comprehensive specifications that achieve full feature parity while introducing differentiated capabilities tailored to live entertainment and experiential production workflows.

---

**Module Being Analyzed:** Core Operations Hub (Dashboard, Tasks, Calendar, Documents, Inbox, Workflows)

**Module Category:** Work Management and Operations Command Center

**Top 5 Competitors to Analyze:** ClickUp, Asana, Monday.com, Jira, Notion

---

## Current ATLVS Core State (repo evidence)
- Command Center dashboard composed of metrics, schedule, tasks, quick actions, and recent activity widgets. @atlvs/src/app/(app)/core/dashboard/page.tsx#1-35
- Master Calendar is a read-only aggregated view across events, productions, tasks, contracts, and activations. @atlvs/src/app/(app)/core/calendar/page.tsx#1-23
- Calendar Event schema supports event type, start/end, recurrence, attendees, and views (calendar/table/list). @atlvs/src/lib/schemas/calendar.ts#6-182
- Task schema supports status, priority, due date, assignee, project/list relations, and views (table, list, kanban, calendar, matrix). @atlvs/src/lib/schemas/task.ts#6-209
- Document schema supports folders, file upload, tags, shared-with, and version relations. @atlvs/src/lib/schemas/document.ts#6-177
- Workflow schema supports triggers (manual, schedule, event, webhook), runs, and basic actions. @atlvs/src/lib/schemas/workflow.ts#6-173
- Inbox page is present with tabs and an empty state but lacks integrated notifications/approvals. @atlvs/src/app/(app)/core/inbox/page.tsx#1-52

---

## Phase 1: Competitive Intelligence

### 1) Competitor Snapshots
- ClickUp: All-in-one work hub (tasks, docs, dashboards, automations, goals).
- Asana: Task-first work management with strong portfolio and timeline features.
- Monday.com: Work OS with automations, dashboards, and extensive integrations.
- Jira: Issue and project tracking optimized for structured workflows and scale.
- Notion: Doc-first workspace with databases and flexible knowledge management.

### 2) Core Feature Matrix (by workflow)
Legend: Yes / Partial / No

| Workflow Area | ClickUp | Asana | Monday | Jira | Notion | ATLVS Core (current) |
| --- | --- | --- | --- | --- | --- | --- |
| Intake forms + request triage | Yes | Yes | Yes | Partial | Partial | No |
| Task management (status, priority, assignee) | Yes | Yes | Yes | Yes | Partial | Yes (tasks schema) |
| Subtasks + dependencies | Yes | Yes | Yes | Yes | Partial | Partial (no deps schema) |
| Multiple views (list/board/calendar) | Yes | Yes | Yes | Yes | Partial | Yes (task views) |
| Advanced views (timeline/gantt/workload) | Yes | Yes | Partial | Yes | No | No |
| Docs + file library | Yes | Partial | Partial | Partial | Yes | Yes (documents) |
| Versioning + approvals | Yes | Partial | Partial | Partial | Partial | Partial (versions relation) |
| Automations / workflow rules | Yes | Yes | Yes | Yes | Partial | Partial (workflow schema) |
| Unified inbox / approvals | Yes | Yes | Yes | Yes | Partial | No (empty inbox) |
| Dashboards + analytics | Yes | Yes | Yes | Yes | Partial | Partial (widgets only) |
| Time tracking / effort | Yes | Partial | Partial | Partial | No | No |
| Mobile apps + offline | Yes | Yes | Yes | Yes | Partial | No (core web only) |
| Integrations + API | Yes | Yes | Yes | Yes | Partial | Partial (no marketplace) |
| Enterprise admin (SSO, audit) | Yes | Yes | Yes | Yes | Partial | Partial |

### 3) Advanced Capabilities
- ClickUp: Nested goals, advanced automations, custom fields, workload and sprint planning.
- Asana: Portfolios, workload capacity, approval workflows, cross-project reporting.
- Monday.com: Multi-board dashboards, native automations, integrated forms, app marketplace.
- Jira: Advanced workflow schemes, issue types, SLA automation, deep audit controls.
- Notion: Highly flexible databases, templates, doc-based knowledge workflows.

### 4) UX Patterns
- ClickUp: Dense information architecture, customizable views, heavy power-user tooling.
- Asana: Clean, task-first UI with timeline and progress rollups.
- Monday.com: Visual board-centric UI, colorful status indicators, automation-first.
- Jira: Admin-heavy configuration, workflow-centric views, issue-oriented layout.
- Notion: Document-first layout with inline databases and blocks.

### 5) Pricing Tiers (typical gating)
- ClickUp: Free -> Unlimited -> Business -> Enterprise (automation limits and advanced views gated).
- Asana: Basic -> Premium -> Business -> Enterprise (portfolios and advanced analytics gated).
- Monday.com: Free -> Basic -> Standard -> Pro -> Enterprise (automations, dashboards gated).
- Jira: Free -> Standard -> Premium -> Enterprise (advanced permissions and automation gated).
- Notion: Free -> Plus -> Business -> Enterprise (admin, audit, SSO gated).

### 6) Known Limitations (market feedback)
- ClickUp: Complex UX, performance under heavy configs, noisy notifications.
- Asana: Limited docs/knowledge, automation depth below top peers.
- Monday.com: Board sprawl, automations can become brittle at scale.
- Jira: Steep admin complexity, UX overhead for non-technical teams.
- Notion: Limited workflow automations, permission granularity gaps for enterprises.

### 7) Gap Analysis vs ATLVS Core
- Missing intake forms and request triage (no intake entity or UI).
- Inbox/approvals not wired to tasks, docs, or workflow runs. @atlvs/src/app/(app)/core/inbox/page.tsx#1-52
- Workflow automation lacks visual builder, actions catalog, and execution audit UI. @atlvs/src/lib/schemas/workflow.ts#6-173
- No time tracking, workload capacity, or timeline/gantt views. @atlvs/src/lib/schemas/task.ts#6-209
- Master Calendar is read-only and does not support editing or resource lanes. @atlvs/src/app/(app)/core/calendar/page.tsx#1-23
- Document approvals, signatures, and version diffing are not implemented. @atlvs/src/lib/schemas/document.ts#6-177
- Dashboard lacks configurable widgets, filters, or role-based dashboards. @atlvs/src/app/(app)/core/dashboard/page.tsx#1-35

---

## Phase 2: Synthesis and Specification

### 1) Baseline Requirements (table stakes)
- Unified intake forms with routing and approval workflows.
- Task dependencies, subtasks, and templates.
- Timeline, gantt, and workload views.
- Unified inbox with mentions, approvals, and escalation queues.
- Document approvals, versioning, and access controls.
- Visual workflow builder with trigger/action catalog.
- Custom fields and saved views across tasks/docs/calendar.
- Real-time collaboration (presence, live updates, comment threads).
- Enterprise-grade RBAC, audit logs, and SSO.
- Mobile-first experience with offline queue and sync.

### 2) Competitive Differentiators (ATLVS advantages)
- Live production command center with phase-aware status (prepro -> load-in -> show -> strike).
- Master Calendar that merges production milestones, crew calls, equipment moves, and contract windows.
- Run-of-show aware task templates (cue sheets, runsheets, stage plots).
- Show-day alerting with critical path view for time-sensitive tasks.
- Embedded compliance workflows (permits, safety checks, insurance milestones).

### 3) Industry-Specific Enhancements
- Festival/event production: multi-stage timelines, crew call rosters, run-of-show gating by department.
- Brand activation campaigns: site-by-site playbooks, field checklists, proof-of-execution uploads.
- Venue operations: recurring maintenance tasks, booking turnover workflows, load-in calendars.
- Multi-property management: cross-site dashboards, region-specific SOP templates, policy overrides.

### 4) ATLVS Ecosystem Integration
- COMPVSS mobile for crew task execution, offline checklist capture, and push notifications. @atlvs/docs/ENTERPRISE_EXTENSION_PLAN.md#20-25
- GVTEWAY public UI for branded schedules, public-facing event hubs, and approved document distribution. @atlvs/docs/ENTERPRISE_EXTENSION_PLAN.md#20-25
- Tight links to People, Assets, Finance, Vendors, and Events modules for a single operational SSOT.

---

## Phase 3: Technical Architecture

### 1) 3NF Data Model (core entities and relationships)
- core_tasks (task_id, org_id, title, status, priority, due_date, owner_id, project_id)
- core_task_assignees (task_id, user_id) -> many-to-many assignments
- core_task_dependencies (task_id, depends_on_task_id)
- core_task_comments (comment_id, task_id, user_id, body, created_at)
- core_task_checklists (checklist_id, task_id, label, is_done)
- core_calendars (calendar_id, org_id, name, scope)
- core_calendar_events (event_id, calendar_id, title, event_type, start_time, end_time, location)
- core_calendar_attendees (event_id, user_id)
- core_documents (document_id, org_id, folder_id, name, document_type, file_ref)
- core_document_versions (version_id, document_id, file_ref, created_at)
- core_document_shares (document_id, principal_id, principal_type, permission)
- core_folders (folder_id, org_id, parent_folder_id, name)
- core_inbox_items (item_id, org_id, type, source_entity, source_id, status)
- core_notifications (notification_id, item_id, channel, delivered_at)
- core_workflows (workflow_id, org_id, name, trigger_type, is_active)
- core_workflow_triggers (trigger_id, workflow_id, event_type, filter_json)
- core_workflow_steps (step_id, workflow_id, step_type, config_json, order_index)
- core_workflow_runs (run_id, workflow_id, status, started_at, ended_at)
- core_dashboard_widgets (widget_id, dashboard_id, config_json)

Notes:
- All derived metrics (progress %, SLA) are computed, not stored (SSOT).
- All many-to-many relationships use join tables to maintain 3NF.
- Soft deletes + immutable audit events for compliance.

### 2) Data Classification and Retention (privacy by design)
| Entity | Purpose | Sensitivity | Retention |
| --- | --- | --- | --- |
| core_tasks | Operational work execution | Internal | 7 years |
| core_documents | Production artifacts and records | Restricted | 7 years (configurable) |
| core_inbox_items | Approvals and notifications | Internal | 2 years |
| core_workflow_runs | Audit trail of automation | Internal | 3 years |
| core_calendar_events | Scheduling and availability | Internal | 5 years |

### 3) RBAC and Permission Model
- Roles: Owner, Admin, Producer, Department Lead, Coordinator, Viewer, External Guest.
- Permissions: CRUD per entity plus special actions (approve, run_workflow, publish).
- Enforced server-side with row-level security and audit logging.

### 4) API-First Design (white-label ready)
- REST and OpenAPI schemas for each entity (tasks, documents, workflows, inbox, calendars).
- Filters, sorts, pagination, and bulk actions as standard query params.
- Webhook subscriptions for status changes and workflow triggers.

### 5) Real-Time Collaboration
- Presence and live updates for tasks, docs, and workflow runs.
- Comment threads with mention routing to inbox items.
- Conflict resolution with last-write-wins plus audit trail snapshots.

### 6) Offline / Field Capability
- Local-first queue for tasks and checklists.
- Sync on reconnection with deterministic merge rules.
- Offline-safe document capture (photo upload placeholders).

### 7) Compliance, Security, and UX Governance
- Tokenized styling only and no hardcoded copy (i18n keys required).
- WCAG 2.2 AA with keyboard-first flows and reduced motion support.
- All actions emit audit events and workflow state changes.

---

## Handoff Artifacts

### User Stories by Persona
**Producer / Ops Director**
- As a Producer, I need a show-day command center that highlights critical tasks by phase so I can keep the run-of-show on track.
- As an Ops Director, I need a cross-site dashboard to compare readiness across venues.

**Production Coordinator**
- As a Coordinator, I need to convert intake requests into tasks with dependencies and templates so I can execute consistently.
- As a Coordinator, I need approvals routed to the inbox with SLA timers so nothing slips.

**Department Lead**
- As a Lead, I need workload and timeline views so I can rebalance staffing before load-in.
- As a Lead, I need document versioning with approvals to prevent outdated plans on show day.

**Crew Member (Mobile)**
- As a Crew Member, I need offline checklists and push alerts so I can work without connectivity.

**Client / Partner**
- As a Client, I need read-only access to approved documents and schedules via GVTEWAY.

### Data Models with Relationships
(see Phase 3 data model list). Key relationships:
- core_tasks -> core_task_assignees, core_task_dependencies, core_task_comments
- core_documents -> core_document_versions, core_document_shares, core_folders
- core_calendar_events -> core_calendar_attendees
- core_workflows -> core_workflow_triggers, core_workflow_steps, core_workflow_runs
- core_inbox_items -> core_notifications

### UI/UX Wireframe Requirements (component-first)
**Primitives**: Button, Input, Select, Badge, Avatar, Tag, Tooltip, Modal, Drawer.
**Components**: TaskCard, TaskTableRow, CalendarEventChip, DocumentTile, InboxItemRow, WorkflowNode.
**Patterns**: Command Bar, Global Filter Rail, Multi-View Switcher, Approval Drawer.
**Templates**: Command Center, Task Hub, Master Calendar, Document Library, Inbox, Workflow Builder.
**Experiences**:
- Command Center: KPI strip, critical path timeline, approvals queue, today schedule.
- Task Hub: view switcher (list/board/calendar/timeline/matrix) with saved views.
- Master Calendar: resource lanes for crew/assets with phase color tokens.
- Document Library: grid/table toggle, preview drawer, approval banner.
- Inbox: priority tabs (approvals, mentions, alerts) with SLA badges.
- Workflow Builder: node graph with trigger/action palette and test run panel.

### Acceptance Criteria per Feature
| Feature | Acceptance Criteria |
| --- | --- |
| Task Dependencies | Users can link tasks with blocker logic and see critical path indicators. |
| Intake Forms | Forms create tasks and route approvals into Inbox with SLA timers. |
| Workflow Builder | Visual editor supports trigger, conditions, actions, and dry-run validation. |
| Master Calendar | Supports filters by project, crew, asset, and phase; read/write mode. |
| Document Versioning | Each upload creates a version with approval status and rollback. |
| Unified Inbox | All approvals and mentions resolve to source entities with audit trail. |
| Offline Mode | Tasks and checklists editable offline and sync with conflict resolution. |
| Accessibility | Keyboard-only navigation and screen reader labels for all actions. |

### Priority Tiers
**MVP**
- Task dependencies, subtasks, saved views
- Unified inbox wired to tasks/docs/workflows
- Master Calendar read/write mode
- Document versioning with approvals
- Workflow builder v1 (triggers + actions)

**Phase 2**
- Timeline/gantt/workload views
- Advanced automations and webhooks
- Multi-dashboard roles and widgets
- Mobile offline-first execution

**Future**
- AI-assisted run-of-show optimization
- Predictive staffing and conflict detection
- Cross-tenant benchmarking dashboards
