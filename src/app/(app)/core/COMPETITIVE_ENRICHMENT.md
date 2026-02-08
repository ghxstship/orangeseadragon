# ATLVS Core Operations Hub - Competitive Enrichment Analysis

**Module:** Core Operations Hub (Dashboard, Tasks, Calendar, Documents, Inbox, Workflows)  
**Analysis Date:** February 2026  
**Version:** 1.0

---

## Executive Summary

### Competitive Position Assessment

ATLVS Core Operations Hub currently operates at **60% feature parity** with industry leaders. The module has strong foundational architecture (schema-driven CRUD, multi-view support, Eisenhower matrix) but lacks critical workflow automation, collaboration, and advanced visualization capabilities that define best-in-class work management platforms.

**Key Strengths:**
- Schema-driven architecture enables rapid feature extension
- Multi-view task management (table, kanban, calendar, matrix)
- Live entertainment domain specialization potential
- Clean component-first UI foundation

**Critical Gaps:**
- No task dependencies or critical path visualization
- Inbox not wired to approvals/notifications
- Workflow builder lacks visual editor and action catalog
- Calendar is read-only with no resource lanes
- No time tracking, workload, or timeline views

**Recommendation:** Prioritize MVP features (dependencies, unified inbox, workflow builder v1) to achieve 80% parity within 2 sprints, then differentiate with live production-specific capabilities.

---

## 1. Competitive Intelligence Gathering

### Top 5 Competitors

| Competitor | Core Focus | Monthly Active Users | Key Differentiator |
|------------|-----------|---------------------|-------------------|
| **ClickUp** | All-in-one work hub | 10M+ | Feature density, customization depth |
| **Asana** | Task-first work management | 140K+ orgs | Portfolio rollups, timeline clarity |
| **Monday.com** | Visual work OS | 225K+ orgs | Automation-first, colorful UX |
| **Jira** | Issue/project tracking | 10M+ | Workflow schemes, enterprise scale |
| **Notion** | Doc-first workspace | 30M+ | Flexible databases, knowledge management |

### Competitor Deep Dives

#### ClickUp
- **Core Features:** Tasks, docs, goals, dashboards, whiteboards, time tracking, automations, forms
- **UX Patterns:** Dense information architecture, customizable everything, command palette (Cmd+K)
- **Data Model:** Hierarchical (Workspace → Space → Folder → List → Task), custom fields, dependencies
- **Integrations:** 1000+ native integrations, robust API, webhooks
- **Pricing Gates:** Automations (100/mo free), goals (Business+), workload (Business+)
- **Recent Releases (12mo):** AI assistant, universal search, connected search, sprint velocity

#### Asana
- **Core Features:** Tasks, projects, portfolios, timeline, workload, goals, forms, rules
- **UX Patterns:** Clean task-first UI, timeline with dependencies, progress rollups
- **Data Model:** Flat (Workspace → Project → Task), multi-homing, custom fields
- **Integrations:** 200+ apps, Zapier, API
- **Pricing Gates:** Timeline (Premium+), portfolios (Business+), goals (Business+)
- **Recent Releases (12mo):** AI smart status, workflow builder, project bundles

#### Monday.com
- **Core Features:** Boards, dashboards, automations, forms, docs, workload
- **UX Patterns:** Board-centric, colorful status columns, automation recipes
- **Data Model:** Board → Group → Item, column types, subitems
- **Integrations:** 200+ apps, marketplace, API
- **Pricing Gates:** Automations (250/mo Standard), dashboards (Pro+), time tracking (Pro+)
- **Recent Releases (12mo):** AI assistant, monday DB, advanced permissions

#### Jira
- **Core Features:** Issues, projects, boards, roadmaps, automation, reports
- **UX Patterns:** Issue-centric, workflow-heavy, admin configuration depth
- **Data Model:** Project → Issue → Subtask, issue types, custom fields, workflow schemes
- **Integrations:** Atlassian ecosystem, 3000+ marketplace apps
- **Pricing Gates:** Advanced roadmaps (Premium+), automation limits, sandbox (Enterprise)
- **Recent Releases (12mo):** Jira Product Discovery, AI summaries, cross-project automation

#### Notion
- **Core Features:** Pages, databases, wikis, projects, AI
- **UX Patterns:** Block-based, inline databases, flexible layouts
- **Data Model:** Page → Database → Page, relations, rollups, formulas
- **Integrations:** 100+ connections, API, Zapier
- **Pricing Gates:** Unlimited blocks (Plus+), admin tools (Business+), SCIM (Enterprise)
- **Recent Releases (12mo):** Notion Projects, AI Q&A, calendar view, automations beta

---

## 2. Gap Analysis Matrix

### Feature Comparison

| Feature/Capability | ATLVS Current | ClickUp | Asana | Monday | Jira | Notion | Industry Standard | Best-in-Class |
|-------------------|---------------|---------|-------|--------|------|--------|-------------------|---------------|
| **Task Management** |
| Basic tasks (title, status, priority) | ✅ Yes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Subtasks | ❌ No | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Nested unlimited |
| Task dependencies | ❌ No | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Visual + critical path |
| Task templates | ❌ No | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | With variables |
| Custom fields | ❌ No | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Field types + formulas |
| Recurring tasks | ❌ No | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | Smart recurrence |
| Time tracking | ❌ No | ✅ | ⚠️ | ✅ | ⚠️ | ❌ | ⚠️ | Native + reports |
| **Views** |
| Table view | ✅ Yes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Kanban board | ✅ Yes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Calendar view | ✅ Yes | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| Timeline/Gantt | ❌ No | ✅ | ✅ | ⚠️ | ✅ | ❌ | ✅ | Dependency lines |
| Workload view | ❌ No | ✅ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ | Capacity planning |
| Matrix view | ✅ Yes | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **ATLVS Advantage** |
| Saved views | ❌ No | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Personal + shared |
| **Calendar** |
| Event CRUD | ⚠️ Read-only | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | Full CRUD |
| Resource lanes | ❌ No | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ⚠️ | Crew/asset lanes |
| Multi-calendar overlay | ⚠️ Partial | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | Filter by source |
| Scheduling conflicts | ❌ No | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | ⚠️ | Auto-detection |
| **Documents** |
| File upload/storage | ✅ Yes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Folder hierarchy | ✅ Yes | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |
| Version history | ⚠️ Schema only | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ | Diff + rollback |
| Document approvals | ❌ No | ✅ | ⚠️ | ⚠️ | ✅ | ❌ | ⚠️ | Multi-stage |
| In-app preview | ❌ No | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅ | PDF, images, video |
| Collaborative editing | ❌ No | ✅ | ❌ | ✅ | ❌ | ✅ | ⚠️ | Real-time |
| **Inbox/Notifications** |
| Unified inbox | ❌ Empty | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| @mentions | ❌ No | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approval workflows | ❌ No | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | SLA timers |
| Push notifications | ❌ No | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Email digests | ❌ No | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Configurable |
| **Workflows/Automation** |
| Visual workflow builder | ❌ No | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Node graph |
| Trigger types | ⚠️ 4 types | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 20+ triggers |
| Action catalog | ❌ No | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 50+ actions |
| Conditional logic | ❌ No | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Branching |
| Workflow templates | ❌ No | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Industry-specific |
| Execution audit | ⚠️ Schema only | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Step-by-step logs |
| **Dashboard** |
| Configurable widgets | ❌ Fixed | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Drag-drop |
| Role-based dashboards | ❌ No | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Per-persona |
| Cross-project metrics | ❌ No | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Portfolio view |
| Real-time updates | ❌ No | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | WebSocket |
| **Collaboration** |
| Comments/threads | ⚠️ Schema only | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Threaded |
| Real-time presence | ❌ No | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | Avatars |
| Activity feed | ✅ Widget | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Enterprise** |
| SSO/SAML | ⚠️ Partial | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Audit logs | ⚠️ Partial | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| API | ⚠️ Partial | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | OpenAPI |
| Webhooks | ⚠️ Schema only | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Gap Summary

| Category | Gaps | Parity | Advantages |
|----------|------|--------|------------|
| Task Management | 6 | 2 | 0 |
| Views | 3 | 4 | 1 (Matrix) |
| Calendar | 3 | 1 | 0 |
| Documents | 4 | 2 | 0 |
| Inbox/Notifications | 5 | 0 | 0 |
| Workflows | 5 | 1 | 0 |
| Dashboard | 4 | 0 | 0 |
| Collaboration | 2 | 1 | 0 |
| Enterprise | 0 | 4 | 0 |
| **Total** | **32** | **15** | **1** |

---

## 3. Enhancement Recommendations

### Priority Scoring Formula
**Priority Score = (User Impact × Frequency of Use) ÷ Implementation Effort**
- User Impact: 1-10 (10 = critical business value)
- Frequency: 1-10 (10 = daily use by all users)
- Effort: 1-10 (10 = 4+ weeks, 1 = 1-2 days)

### Top 10 Enhancements

#### 1. Task Dependencies & Critical Path
| Attribute | Value |
|-----------|-------|
| **Feature** | Link tasks with predecessor/successor relationships, visualize critical path |
| **Business Value** | Production workflows require sequencing; prevents scheduling conflicts and delays |
| **User Impact** | 10 |
| **Frequency** | 9 |
| **Effort** | 6 |
| **Priority Score** | 15.0 |
| **Data Model Changes** | Add `core_task_dependencies` table (task_id, depends_on_task_id, dependency_type) |
| **UI/UX Spec** | Dependency picker in task detail, critical path highlighting in timeline view |

#### 2. Unified Inbox with Approvals
| Attribute | Value |
|-----------|-------|
| **Feature** | Wire inbox to tasks, documents, workflows; add approval actions with SLA timers |
| **Business Value** | Centralized action center prevents missed approvals and delays |
| **User Impact** | 9 |
| **Frequency** | 10 |
| **Effort** | 5 |
| **Priority Score** | 18.0 |
| **Data Model Changes** | Add `core_inbox_items` (type, source_entity, source_id, status, due_at), `core_notifications` |
| **UI/UX Spec** | Priority tabs (approvals, mentions, alerts), SLA badges, bulk actions |

#### 3. Visual Workflow Builder
| Attribute | Value |
|-----------|-------|
| **Feature** | Node-graph editor for triggers, conditions, and actions with dry-run validation |
| **Business Value** | Enables non-technical users to automate repetitive processes |
| **User Impact** | 8 |
| **Frequency** | 6 |
| **Effort** | 8 |
| **Priority Score** | 6.0 |
| **Data Model Changes** | Add `core_workflow_steps` (step_id, workflow_id, step_type, config_json, order_index) |
| **UI/UX Spec** | Drag-drop node canvas, trigger/action palette, test run panel, execution logs |

#### 4. Master Calendar Read/Write Mode
| Attribute | Value |
|-----------|-------|
| **Feature** | Enable event creation/editing directly in calendar, add resource lanes |
| **Business Value** | Reduces context switching; enables real-time scheduling adjustments |
| **User Impact** | 8 |
| **Frequency** | 8 |
| **Effort** | 4 |
| **Priority Score** | 16.0 |
| **Data Model Changes** | None (calendar schema supports CRUD) |
| **UI/UX Spec** | Click-to-create, drag-to-reschedule, resource lane toggle (crew, assets, venues) |

#### 5. Subtasks & Checklists
| Attribute | Value |
|-----------|-------|
| **Feature** | Nested subtasks with independent status, inline checklists |
| **Business Value** | Break down complex tasks; track granular progress |
| **User Impact** | 9 |
| **Frequency** | 9 |
| **Effort** | 4 |
| **Priority Score** | 20.25 |
| **Data Model Changes** | Add `parent_task_id` to tasks, add `core_task_checklists` (checklist_id, task_id, label, is_done, order_index) |
| **UI/UX Spec** | Subtask list in task detail, progress bar, checklist toggle |

#### 6. Document Versioning with Approvals
| Attribute | Value |
|-----------|-------|
| **Feature** | Version history with diff view, approval workflow per version |
| **Business Value** | Prevents outdated documents in production; audit trail for compliance |
| **User Impact** | 8 |
| **Frequency** | 7 |
| **Effort** | 5 |
| **Priority Score** | 11.2 |
| **Data Model Changes** | Add `approval_status`, `approved_by`, `approved_at` to `core_document_versions` |
| **UI/UX Spec** | Version timeline, diff viewer, approval banner, rollback action |

#### 7. Timeline/Gantt View
| Attribute | Value |
|-----------|-------|
| **Feature** | Horizontal timeline with dependency arrows, drag-to-reschedule |
| **Business Value** | Visual project planning; identifies scheduling conflicts |
| **User Impact** | 8 |
| **Frequency** | 6 |
| **Effort** | 7 |
| **Priority Score** | 6.86 |
| **Data Model Changes** | Requires task dependencies (see #1) |
| **UI/UX Spec** | Gantt bars with dependency lines, zoom levels, milestone markers |

#### 8. Custom Fields
| Attribute | Value |
|-----------|-------|
| **Feature** | User-defined fields per entity (text, number, date, select, relation) |
| **Business Value** | Adapts to unique production workflows without code changes |
| **User Impact** | 7 |
| **Frequency** | 7 |
| **Effort** | 6 |
| **Priority Score** | 8.17 |
| **Data Model Changes** | Add `core_custom_field_definitions`, `core_custom_field_values` |
| **UI/UX Spec** | Field builder in settings, dynamic form rendering, filter/sort support |

#### 9. Saved Views
| Attribute | Value |
|-----------|-------|
| **Feature** | Save filter/sort/column configurations as named views (personal or shared) |
| **Business Value** | Reduces repetitive filtering; enables role-specific perspectives |
| **User Impact** | 7 |
| **Frequency** | 8 |
| **Effort** | 3 |
| **Priority Score** | 18.67 |
| **Data Model Changes** | Add `core_saved_views` (view_id, entity, name, config_json, is_shared, owner_id) |
| **UI/UX Spec** | View dropdown, save/rename/delete actions, share toggle |

#### 10. Configurable Dashboard Widgets
| Attribute | Value |
|-----------|-------|
| **Feature** | Drag-drop widget layout, widget library, role-based dashboards |
| **Business Value** | Personalized command center; surfaces relevant metrics per role |
| **User Impact** | 7 |
| **Frequency** | 9 |
| **Effort** | 5 |
| **Priority Score** | 12.6 |
| **Data Model Changes** | Add `core_dashboards`, `core_dashboard_widgets` (widget_id, dashboard_id, widget_type, config_json, position) |
| **UI/UX Spec** | Widget palette, drag-drop grid, resize handles, role assignment |

### Ranked Enhancement List

| Rank | Feature | Priority Score | Tier |
|------|---------|---------------|------|
| 1 | Subtasks & Checklists | 20.25 | MVP |
| 2 | Saved Views | 18.67 | MVP |
| 3 | Unified Inbox with Approvals | 18.00 | MVP |
| 4 | Master Calendar Read/Write | 16.00 | MVP |
| 5 | Task Dependencies & Critical Path | 15.00 | MVP |
| 6 | Configurable Dashboard Widgets | 12.60 | Phase 2 |
| 7 | Document Versioning with Approvals | 11.20 | MVP |
| 8 | Custom Fields | 8.17 | Phase 2 |
| 9 | Timeline/Gantt View | 6.86 | Phase 2 |
| 10 | Visual Workflow Builder | 6.00 | Phase 2 |

---

## 4. Best Practice Integration

### Onboarding Flows
- **Empty State Guidance:** Each module shows contextual empty states with primary action CTA
- **Progressive Disclosure:** Start with basic fields, reveal advanced options on demand
- **Template Library:** Pre-built task lists, workflow templates, document templates for common use cases
- **Interactive Walkthrough:** First-run tooltips highlighting key actions (create task, assign, set due date)
- **Sample Data Option:** One-click demo data population for exploration

### Empty States & Progressive Disclosure
| Module | Empty State Message | Primary Action | Secondary Actions |
|--------|--------------------|--------------|--------------------|
| Tasks | "No tasks yet. Create your first task to get started." | New Task | Import, Use Template |
| Calendar | "Your calendar is empty. Add an event or sync external calendars." | New Event | Sync Calendar |
| Documents | "No documents uploaded. Upload files or create from templates." | Upload | New Folder, Templates |
| Inbox | "You're all caught up! Notifications will appear here." | — | Notification Settings |
| Workflows | "No automations yet. Create a workflow to automate repetitive tasks." | New Workflow | Browse Templates |

### Keyboard Shortcuts & Power-User Features
| Shortcut | Action | Scope |
|----------|--------|-------|
| `Cmd/Ctrl + K` | Command palette | Global |
| `Cmd/Ctrl + N` | New item (context-aware) | Global |
| `Cmd/Ctrl + /` | Keyboard shortcut help | Global |
| `Cmd/Ctrl + Enter` | Save and close | Forms |
| `Esc` | Close modal/drawer | Global |
| `J/K` | Navigate list up/down | Lists |
| `X` | Toggle selection | Lists |
| `E` | Edit selected | Lists |
| `D` | Mark done (tasks) | Tasks |
| `1-4` | Set priority | Tasks |

### Mobile/Responsive Considerations
- **Breakpoints:** 640px (mobile), 768px (tablet), 1024px (desktop), 1280px (wide)
- **Touch Targets:** Minimum 44×44px for all interactive elements
- **Swipe Actions:** Swipe right to complete, swipe left to delete/archive
- **Bottom Navigation:** Primary actions accessible via bottom bar on mobile
- **Offline Queue:** Tasks and checklists editable offline with sync indicator
- **Pull-to-Refresh:** Standard gesture for list updates

### Accessibility Standards (WCAG 2.2 AA)
- **Keyboard Navigation:** All actions accessible via keyboard; visible focus indicators
- **Screen Reader Labels:** ARIA labels for all interactive elements
- **Color Contrast:** Minimum 4.5:1 for text, 3:1 for UI components
- **Motion:** Respect `prefers-reduced-motion`; no auto-playing animations
- **Focus Management:** Logical tab order; focus trap in modals
- **Error Handling:** Clear error messages with suggestions; no color-only indicators

### Performance Benchmarks
| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3.0s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| API Response (list) | < 200ms | P95 |
| API Response (detail) | < 100ms | P95 |
| Real-time Update Latency | < 500ms | WebSocket |

### API Design Patterns
- **RESTful Endpoints:** `/api/{entity}` with standard CRUD verbs
- **Pagination:** Cursor-based with `limit` and `cursor` params
- **Filtering:** `?filter[status]=done&filter[priority]=high`
- **Sorting:** `?sort=-created_at,title`
- **Field Selection:** `?fields=id,title,status`
- **Bulk Operations:** `POST /api/{entity}/bulk` with `{ action, ids, data }`
- **Webhooks:** `POST /api/webhooks` with event subscriptions
- **Rate Limiting:** 1000 req/min per API key with `X-RateLimit-*` headers

---

## 5. Deliverables

### 5.1 Prioritized Enhancement Roadmap

#### NOW (MVP - Sprint 1-2)
| Feature | Effort | Dependencies |
|---------|--------|--------------|
| Subtasks & Checklists | 4 days | None |
| Saved Views | 3 days | None |
| Unified Inbox with Approvals | 5 days | None |
| Master Calendar Read/Write | 4 days | None |
| Task Dependencies | 6 days | Subtasks |
| Document Versioning with Approvals | 5 days | None |

**Total Effort:** ~27 days (2 sprints with buffer)

#### NEXT (Phase 2 - Sprint 3-4)
| Feature | Effort | Dependencies |
|---------|--------|--------------|
| Configurable Dashboard Widgets | 5 days | None |
| Custom Fields | 6 days | None |
| Timeline/Gantt View | 7 days | Task Dependencies |
| Visual Workflow Builder | 8 days | None |
| Real-time Collaboration | 6 days | None |
| Workload View | 5 days | Task Dependencies |

**Total Effort:** ~37 days (2 sprints with buffer)

#### LATER (Phase 3+)
- AI-assisted run-of-show optimization
- Predictive staffing and conflict detection
- Cross-tenant benchmarking dashboards
- Advanced automations with external integrations
- Mobile offline-first execution (COMPVSS)
- Public portal distribution (GVTEWAY)

### 5.2 Detailed Feature Specifications

#### Spec 1: Subtasks & Checklists

**User Stories:**
- As a Coordinator, I need to break down complex tasks into subtasks so I can track granular progress
- As a Crew Member, I need inline checklists so I can mark items complete without navigating away

**Data Model:**
```sql
-- Add to core_tasks
ALTER TABLE core_tasks ADD COLUMN parent_task_id UUID REFERENCES core_tasks(id);
ALTER TABLE core_tasks ADD COLUMN task_depth INTEGER DEFAULT 0;

-- New table
CREATE TABLE core_task_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES core_tasks(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  is_done BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Endpoints:**
- `GET /api/tasks/{id}/subtasks` - List subtasks
- `POST /api/tasks/{id}/subtasks` - Create subtask
- `GET /api/tasks/{id}/checklists` - List checklist items
- `POST /api/tasks/{id}/checklists` - Add checklist item
- `PATCH /api/tasks/{id}/checklists/{item_id}` - Toggle/update item

**UI Components:**
- `SubtaskList` - Collapsible list of subtasks with inline add
- `ChecklistWidget` - Checkbox list with progress bar
- `TaskProgressIndicator` - Shows subtask/checklist completion %

**Acceptance Criteria:**
- [ ] Users can create subtasks up to 3 levels deep
- [ ] Subtask status rolls up to parent progress indicator
- [ ] Checklists support drag-to-reorder
- [ ] Completing all subtasks/checklists auto-suggests marking parent done
- [ ] Subtasks inherit parent's project/list assignment

---

#### Spec 2: Unified Inbox with Approvals

**User Stories:**
- As a Coordinator, I need all approvals in one place so nothing slips through
- As a Producer, I need SLA timers so I can prioritize urgent approvals

**Data Model:**
```sql
CREATE TABLE core_inbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'approval', 'mention', 'alert', 'assignment'
  source_entity TEXT NOT NULL, -- 'task', 'document', 'workflow_run'
  source_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  status TEXT DEFAULT 'unread', -- 'unread', 'read', 'actioned', 'dismissed'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  actioned_at TIMESTAMPTZ
);

CREATE TABLE core_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_item_id UUID NOT NULL REFERENCES core_inbox_items(id),
  channel TEXT NOT NULL, -- 'in_app', 'email', 'push'
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);
```

**API Endpoints:**
- `GET /api/inbox` - List inbox items with filters
- `PATCH /api/inbox/{id}` - Update status (read, actioned, dismissed)
- `POST /api/inbox/{id}/approve` - Approve action
- `POST /api/inbox/{id}/reject` - Reject action
- `POST /api/inbox/mark-all-read` - Bulk mark read

**UI Components:**
- `InboxItemRow` - Item with avatar, title, source link, SLA badge, actions
- `InboxTabs` - All, Unread, Approvals, Mentions, Alerts
- `ApprovalDrawer` - Side panel with context and approve/reject buttons
- `SLABadge` - Color-coded time remaining indicator

**Acceptance Criteria:**
- [ ] Inbox shows items from tasks, documents, and workflow runs
- [ ] Approvals display SLA countdown with color coding (green > yellow > red)
- [ ] Approve/reject actions update source entity and create audit log
- [ ] @mentions in comments create inbox items for mentioned users
- [ ] Mark all read clears unread count
- [ ] Real-time updates via WebSocket

---

#### Spec 3: Task Dependencies & Critical Path

**User Stories:**
- As a Producer, I need to see which tasks block others so I can prioritize correctly
- As a Coordinator, I need critical path highlighting so I know what affects the deadline

**Data Model:**
```sql
CREATE TABLE core_task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES core_tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES core_tasks(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'finish_to_start', -- 'finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'
  lag_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id)
);
```

**API Endpoints:**
- `GET /api/tasks/{id}/dependencies` - List dependencies
- `POST /api/tasks/{id}/dependencies` - Add dependency
- `DELETE /api/tasks/{id}/dependencies/{dep_id}` - Remove dependency
- `GET /api/projects/{id}/critical-path` - Calculate critical path

**UI Components:**
- `DependencyPicker` - Search and select blocking tasks
- `DependencyBadge` - Shows "Blocked by X" or "Blocks Y"
- `CriticalPathIndicator` - Highlight tasks on critical path
- `DependencyArrows` - SVG arrows in timeline/gantt view

**Acceptance Criteria:**
- [ ] Users can link tasks with 4 dependency types
- [ ] Circular dependencies are prevented with validation
- [ ] Blocked tasks show warning when predecessor is incomplete
- [ ] Critical path calculated and highlighted in timeline view
- [ ] Rescheduling a task cascades to dependent tasks (with confirmation)

---

#### Spec 4: Master Calendar Read/Write

**User Stories:**
- As a Coordinator, I need to create events directly in the calendar without switching views
- As a Producer, I need resource lanes to see crew and asset availability

**Data Model:**
No schema changes required - calendar schema already supports CRUD.

**API Endpoints:**
- Existing endpoints support CRUD
- Add `GET /api/calendar/resources` - List resource lanes (crew, assets, venues)

**UI Components:**
- `CalendarEventModal` - Create/edit event form
- `CalendarDragHandle` - Drag to reschedule
- `ResourceLaneToggle` - Switch between standard and resource view
- `ResourceLane` - Horizontal lane per crew member/asset

**Acceptance Criteria:**
- [ ] Click on empty time slot opens create modal
- [ ] Drag event to reschedule (updates start/end times)
- [ ] Drag event edges to resize duration
- [ ] Resource lanes show crew/asset calendars side-by-side
- [ ] Conflict detection highlights overlapping events
- [ ] Filter by event type, project, or resource

---

#### Spec 5: Saved Views

**User Stories:**
- As a Department Lead, I need to save my filtered view so I don't reconfigure daily
- As an Admin, I need to share views with my team for consistency

**Data Model:**
```sql
CREATE TABLE core_saved_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  entity TEXT NOT NULL, -- 'tasks', 'documents', 'calendar', etc.
  name TEXT NOT NULL,
  config_json JSONB NOT NULL, -- { filters, sort, columns, view_type }
  is_shared BOOLEAN DEFAULT FALSE,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Endpoints:**
- `GET /api/views?entity={entity}` - List views for entity
- `POST /api/views` - Create view
- `PATCH /api/views/{id}` - Update view
- `DELETE /api/views/{id}` - Delete view

**UI Components:**
- `ViewSelector` - Dropdown with saved views and "Save current view"
- `SaveViewModal` - Name input, share toggle
- `ViewBadge` - Indicates active saved view

**Acceptance Criteria:**
- [ ] Users can save current filter/sort/column configuration
- [ ] Saved views appear in dropdown for quick switching
- [ ] Shared views visible to all org members
- [ ] Default view can be set per user
- [ ] Views persist across sessions

---

### 5.3 Updated Data Model Recommendations

#### New Tables Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `core_task_dependencies` | Task sequencing | task_id, depends_on_task_id, dependency_type |
| `core_task_checklists` | Inline checklists | task_id, label, is_done, order_index |
| `core_inbox_items` | Unified notifications | type, source_entity, source_id, status, due_at |
| `core_notifications` | Delivery tracking | inbox_item_id, channel, sent_at, delivered_at |
| `core_saved_views` | View configurations | entity, name, config_json, is_shared |
| `core_custom_field_definitions` | Field metadata | entity, field_type, label, options |
| `core_custom_field_values` | Field values | definition_id, record_id, value |
| `core_dashboards` | Dashboard containers | name, owner_id, is_default |
| `core_dashboard_widgets` | Widget instances | dashboard_id, widget_type, config_json, position |

#### Schema Modifications

| Table | Modification | Purpose |
|-------|-------------|---------|
| `core_tasks` | Add `parent_task_id` | Subtask hierarchy |
| `core_tasks` | Add `task_depth` | Prevent deep nesting |
| `core_document_versions` | Add `approval_status`, `approved_by`, `approved_at` | Version approvals |

### 5.4 UI Wireframe Descriptions

#### Command Center (Dashboard)
```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] Command Center                    [Search] [+] [Avatar] │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ KPI Strip: Tasks Due | Approvals Pending | Events Today    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────┐ ┌─────────────────────────┐   │
│ │ Critical Path Timeline        │ │ Approvals Queue         │   │
│ │ [Gantt bars with deps]        │ │ [InboxItemRow]          │   │
│ │                               │ │ [InboxItemRow]          │   │
│ │                               │ │ [InboxItemRow]          │   │
│ └───────────────────────────────┘ └─────────────────────────┘   │
│ ┌───────────────────────────────┐ ┌─────────────────────────┐   │
│ │ Today's Schedule              │ │ Quick Actions           │   │
│ │ [CalendarEventChip]           │ │ [+ Task] [+ Event]      │   │
│ │ [CalendarEventChip]           │ │ [Upload] [New Workflow] │   │
│ └───────────────────────────────┘ └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### Task Hub with Views
```
┌─────────────────────────────────────────────────────────────────┐
│ Tasks                          [View: ▼ My Tasks] [+ New Task] │
├─────────────────────────────────────────────────────────────────┤
│ [All] [To Do] [In Progress] [Done]     [🔍 Search] [Filter ▼]  │
├─────────────────────────────────────────────────────────────────┤
│ View: [Table] [Kanban] [Calendar] [Timeline] [Matrix]          │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ □ Task Title          | Status    | Priority | Due    | 👤 │ │
│ │ ├─ Subtask 1          | Done      | -        | -      | -  │ │
│ │ ├─ Subtask 2          | In Prog   | -        | -      | -  │ │
│ │ □ Another Task        | To Do     | High     | Feb 10 | JC │ │
│ │   ⚠️ Blocked by: Task Title                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### Workflow Builder
```
┌─────────────────────────────────────────────────────────────────┐
│ Edit Workflow: Approval Flow           [Test Run] [Save] [←]   │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐                                                │
│ │ Palette      │  ┌─────────────────────────────────────────┐   │
│ │ ─────────────│  │                                         │   │
│ │ Triggers     │  │   [Trigger: Form Submitted]             │   │
│ │  • Form      │  │            │                            │   │
│ │  • Schedule  │  │            ▼                            │   │
│ │  • Event     │  │   [Condition: Priority = High?]         │   │
│ │ ─────────────│  │        │ Yes        │ No                │   │
│ │ Actions      │  │        ▼            ▼                   │   │
│ │  • Create    │  │   [Create Task] [Send Email]            │   │
│ │  • Update    │  │        │                                │   │
│ │  • Notify    │  │        ▼                                │   │
│ │  • Approve   │  │   [Request Approval]                    │   │
│ └──────────────┘  └─────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Execution Log: Run #42 - Success - 2.3s                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria Summary

| Feature | Acceptance Criteria |
|---------|---------------------|
| Subtasks & Checklists | Nested subtasks up to 3 levels; progress rollup; drag-to-reorder checklists |
| Saved Views | Save/load filter+sort+columns; share toggle; default view per user |
| Unified Inbox | Approvals, mentions, alerts from all entities; SLA timers; bulk actions |
| Master Calendar R/W | Click-to-create; drag-to-reschedule; resource lanes; conflict detection |
| Task Dependencies | 4 dependency types; circular prevention; critical path calculation |
| Document Versioning | Version timeline; approval workflow; diff viewer; rollback |
| Dashboard Widgets | Drag-drop layout; widget library; role-based dashboards |
| Custom Fields | Field builder; dynamic rendering; filter/sort support |
| Timeline/Gantt | Dependency arrows; drag-to-reschedule; zoom levels |
| Workflow Builder | Node graph; trigger/action palette; dry-run; execution logs |

---

## Appendix: Competitive Differentiators for Live Entertainment

### Phase-Aware Status System
Standard work management tools use generic statuses. ATLVS should implement production-phase-aware statuses:
- **Pre-Production:** Planning, Budgeting, Contracting
- **Load-In:** Setup, Technical, Rehearsal
- **Show:** Live, Intermission, Strike-Ready
- **Strike:** Teardown, Load-Out, Wrap

### Run-of-Show Integration
Tasks and calendar events should support run-of-show metadata:
- Cue numbers and timing
- Department assignments (Audio, Lighting, Video, Stage)
- Critical path indicators for show-day tasks

### Crew Call Rosters
Calendar should support crew-specific views:
- Call times by department
- Meal break scheduling
- Overtime tracking integration

### Compliance Workflows
Pre-built workflow templates for:
- Permit applications and renewals
- Safety check sign-offs
- Insurance certificate collection
- Venue access approvals

---

*Document generated as part of ATLVS competitive enrichment process. Ready for sprint planning and implementation.*
