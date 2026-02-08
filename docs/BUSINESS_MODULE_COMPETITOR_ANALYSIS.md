# ATLVS Business Module: Competitive Analysis & Enhancement Roadmap

**Module**: Business (CRM, Sales Pipeline, Marketing Automation)  
**Analysis Date**: February 2026  
**Version**: 1.0

---

## Executive Summary

The ATLVS Business module provides foundational CRM capabilities including company/contact management, deal pipeline visualization, proposals, contracts, and email campaigns. While the current implementation offers a solid schema-driven architecture with drag-and-drop pipeline boards, **significant gaps exist** compared to industry leaders in AI-powered insights, communication integration, automation workflows, and analytics.

### Competitive Position Overview

| Category | ATLVS Position | Action Required |
|----------|---------------|-----------------|
| Pipeline Management | **Parity** | Minor enhancements |
| Contact/Company Management | **Gap** | Moderate investment |
| AI & Automation | **Critical Gap** | Major investment |
| Communication Tools | **Critical Gap** | Major investment |
| Reporting & Analytics | **Gap** | Moderate investment |
| Marketing Automation | **Parity** | Minor enhancements |

**Overall Assessment**: ATLVS Business module is at ~45% feature parity with industry leaders. Priority investment in AI-powered insights, integrated communications, and workflow automation will close the most impactful gaps.

---

## 1. Competitive Intelligence

### Top 5 Competitors Analyzed

#### 1. HubSpot CRM
**Market Position**: Free-to-start champion, SMB to Enterprise  
**Pricing**: Free – $75/user/month (Enterprise)

**Core Differentiators**:
- Unified marketing + sales + service platform
- Real-time email tracking with open/click notifications
- Built-in meeting scheduler with calendar sync
- Landing page and form builders integrated with CRM
- Content tools (blogs, landing pages) directly connected to contacts

**Recent Features (2025)**:
- AI-powered content generation for emails
- Predictive lead scoring
- Conversation intelligence for calls
- Custom report builder with drag-and-drop

---

#### 2. Salesforce Sales Cloud
**Market Position**: Enterprise leader, most extensible  
**Pricing**: $25 – $150/user/month

**Core Differentiators**:
- Einstein AI for deal scoring, risk flagging, and forecasting
- AppExchange ecosystem (5,000+ integrations)
- Tableau-powered advanced analytics
- Territory and quota management
- CPQ (Configure, Price, Quote) native integration

**Recent Features (2025)**:
- Einstein Copilot for generative AI assistance
- Revenue Intelligence dashboards
- Slack-first collaboration workflows
- Predictive pipeline analytics

---

#### 3. Pipedrive
**Market Position**: Sales-first simplicity, SMB focus  
**Pricing**: $14 – $69/user/month

**Core Differentiators**:
- Best-in-class visual pipeline (drag-and-drop)
- Activity-based selling methodology
- AI assistant for follow-up suggestions and deal risk
- Strong mobile experience (near desktop parity)
- Smart contact data enrichment

**Recent Features (2025)**:
- AI email writer
- Revenue forecasting improvements
- Projects add-on for post-sale delivery
- LeadBooster chatbots

---

#### 4. Freshsales (Freshworks)
**Market Position**: AI-forward mid-market contender  
**Pricing**: Free – $69/user/month

**Core Differentiators**:
- Freddy AI for lead scoring, deal insights, next-best actions
- Built-in phone with call recording and analytics
- Omnichannel: email, SMS, WhatsApp, chat in one timeline
- Auto-enrichment from public business databases
- Deal rotting indicators (visual staleness warnings)

**Recent Features (2025)**:
- AI-generated call summaries
- Predictive contact scoring
- Workflow automation builder
- Territory management

---

#### 5. Close CRM
**Market Position**: Inside sales specialist  
**Pricing**: $49 – $139/user/month

**Core Differentiators**:
- Built-in calling with power dialer
- Automated email sequences with conditional logic
- Two-way email + calendar sync
- Real-time activity logging (zero manual entry)
- Predictive dialer for high-volume outreach

**Recent Features (2025)**:
- AI call coaching
- SMS sequences
- Custom activities and objects
- Zoom/Google Meet integration

---

## 2. Gap Analysis Matrix

| Feature/Capability | ATLVS Current | HubSpot | Salesforce | Pipedrive | Freshsales | Close | Industry Standard | Best-in-Class |
|-------------------|---------------|---------|------------|-----------|------------|-------|-------------------|---------------|
| **PIPELINE & DEALS** |
| Visual Kanban Pipeline | ✅ Full | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Pipedrive |
| Multiple Pipelines | ❌ None | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Freshsales |
| Deal Probability/Weighting | ✅ Basic | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Salesforce |
| Deal Rotting/Staleness | ❌ None | ⚠️ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Freshsales |
| Revenue Forecasting | ❌ None | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Salesforce |
| Win/Loss Analysis | ❌ None | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Salesforce |
| **CONTACTS & COMPANIES** |
| Basic CRUD | ✅ Full | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Activity Timeline | ❌ None | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | HubSpot |
| Auto Data Enrichment | ❌ None | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Freshsales |
| Duplicate Detection | ❌ None | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Freshsales |
| Contact Scoring | ❌ None | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ | Freshsales |
| Relationship Mapping | ❌ None | ⚠️ | ✅ | ❌ | ⚠️ | ❌ | ⚠️ | Salesforce |
| **COMMUNICATION** |
| Email Integration (2-way) | ❌ None | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Close |
| Email Tracking (opens/clicks) | ❌ None | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | HubSpot |
| Email Templates | ⚠️ Basic | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | HubSpot |
| Email Sequences/Drips | ✅ Campaigns | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Close |
| Built-in Calling | ❌ None | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | Close |
| Call Recording/Analytics | ❌ None | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | Close |
| SMS/WhatsApp | ❌ None | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | Freshsales |
| Meeting Scheduler | ❌ None | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | HubSpot |
| **AI & AUTOMATION** |
| AI Lead Scoring | ❌ None | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Freshsales |
| AI Deal Insights | ❌ None | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Salesforce |
| AI Email Writer | ❌ None | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | HubSpot |
| Next-Best Action | ❌ None | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Freshsales |
| Workflow Automation | ❌ None | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | HubSpot |
| Auto Task Creation | ❌ None | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Pipedrive |
| **REPORTING & ANALYTICS** |
| Pipeline Reports | ❌ None | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Salesforce |
| Activity Reports | ❌ None | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Close |
| Custom Dashboards | ❌ None | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ | HubSpot |
| Revenue Forecasting | ❌ None | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Salesforce |
| Goal Tracking | ❌ None | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | Pipedrive |
| **MARKETING** |
| Email Campaigns | ✅ Full | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ | ✅ | HubSpot |
| Landing Pages | ❌ None | ✅ | ⚠️ | ⚠️ | ✅ | ❌ | ⚠️ | HubSpot |
| Form Builder | ❌ None | ✅ | ⚠️ | ⚠️ | ✅ | ❌ | ✅ | HubSpot |
| Lead Capture Widgets | ❌ None | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ | HubSpot |
| A/B Testing | ❌ None | ✅ | ✅ | ⚠️ | ✅ | ❌ | ✅ | HubSpot |

**Legend**: ✅ Full | ⚠️ Partial | ❌ None

---

## 3. Enhancement Recommendations

### Priority Scoring Formula
**Priority Score** = (User Impact × Frequency of Use) ÷ Implementation Effort

- **User Impact**: 1-5 (5 = critical business value)
- **Frequency**: 1-5 (5 = daily use)
- **Effort**: 1-5 (1 = low effort, 5 = high effort)

---

### TOP 10 ENHANCEMENTS

#### 1. Activity Timeline for Contacts/Companies
**Priority Score**: 25 ÷ 2 = **12.5** (CRITICAL)

| Attribute | Value |
|-----------|-------|
| **Feature** | Unified activity timeline showing all interactions (emails, calls, meetings, notes, deals) on contact/company detail pages |
| **Business Value** | Eliminates context-switching; reps see full relationship history instantly; improves handoff between team members |
| **Implementation Complexity** | Medium |
| **Data Model Changes** | New `activities` table with polymorphic references to contacts, companies, deals; activity_type enum |
| **UI/UX Specifications** | Vertical timeline component with icons per type, expandable entries, filter by type/date, infinite scroll |

**Schema Addition**:
```typescript
activities: {
  id, entity_type, entity_id, activity_type, 
  subject, description, occurred_at, duration_minutes,
  created_by, metadata (JSON)
}
```

---

#### 2. Email Integration (2-Way Sync)
**Priority Score**: 25 ÷ 3 = **8.3** (HIGH)

| Attribute | Value |
|-----------|-------|
| **Feature** | Sync emails from Gmail/Outlook to contact records; send emails from within ATLVS; track opens/clicks |
| **Business Value** | Automatic activity logging; no manual data entry; real-time engagement signals |
| **Implementation Complexity** | High |
| **Data Model Changes** | `email_messages` table, `email_accounts` for OAuth tokens, `email_tracking_events` |
| **UI/UX Specifications** | Email composer in contact sidebar, thread view, tracking badges (opened, clicked), settings for sync preferences |

---

#### 3. AI Lead/Contact Scoring
**Priority Score**: 20 ÷ 3 = **6.7** (HIGH)

| Attribute | Value |
|-----------|-------|
| **Feature** | ML-based scoring of leads/contacts based on engagement, firmographics, and historical win patterns |
| **Business Value** | Prioritize high-value prospects; reduce time on unqualified leads; improve conversion rates |
| **Implementation Complexity** | High |
| **Data Model Changes** | `lead_scores` table with score, factors (JSON), calculated_at; scoring_models configuration |
| **UI/UX Specifications** | Score badge on contact cards, score breakdown tooltip, "Hot Leads" filtered view, score trend sparkline |

---

#### 4. Deal Rotting/Staleness Indicators
**Priority Score**: 16 ÷ 1 = **16.0** (CRITICAL)

| Attribute | Value |
|-----------|-------|
| **Feature** | Visual indicator when deals have no activity for configurable period; highlight stale deals in pipeline |
| **Business Value** | Prevents deals from falling through cracks; prompts timely follow-up; improves pipeline hygiene |
| **Implementation Complexity** | Low |
| **Data Model Changes** | Add `last_activity_at` to deals; `rotting_threshold_days` in pipeline settings |
| **UI/UX Specifications** | Red border/badge on stale deal cards, "Needs Attention" filter, configurable thresholds per stage |

---

#### 5. Multiple Pipelines
**Priority Score**: 15 ÷ 2 = **7.5** (HIGH)

| Attribute | Value |
|-----------|-------|
| **Feature** | Support multiple sales pipelines (e.g., New Business, Renewals, Upsells, Partnerships) |
| **Business Value** | Different sales processes for different deal types; cleaner reporting; team specialization |
| **Implementation Complexity** | Medium |
| **Data Model Changes** | New `pipelines` table; `pipeline_id` FK on deals; `pipeline_stages` table |
| **UI/UX Specifications** | Pipeline selector dropdown, pipeline-specific stage configuration, cross-pipeline reporting |

---

#### 6. Workflow Automation Builder
**Priority Score**: 20 ÷ 4 = **5.0** (MEDIUM-HIGH)

| Attribute | Value |
|-----------|-------|
| **Feature** | No-code automation: "When X happens, do Y" (e.g., deal stage change → create task, lead score > 80 → assign to senior rep) |
| **Business Value** | Reduces manual work; ensures consistent processes; scales team capacity |
| **Implementation Complexity** | High |
| **Data Model Changes** | `workflows` table, `workflow_triggers`, `workflow_actions`, `workflow_runs` for audit |
| **UI/UX Specifications** | Visual workflow builder with trigger/action cards, condition logic, test mode, run history |

---

#### 7. Revenue Forecasting Dashboard
**Priority Score**: 16 ÷ 3 = **5.3** (MEDIUM-HIGH)

| Attribute | Value |
|-----------|-------|
| **Feature** | Weighted pipeline forecasting by stage probability; forecast vs. quota tracking; trend analysis |
| **Business Value** | Accurate revenue prediction; quota attainment visibility; strategic planning |
| **Implementation Complexity** | Medium |
| **Data Model Changes** | `quotas` table (user, period, amount); `forecast_snapshots` for historical tracking |
| **UI/UX Specifications** | Forecast widget on dashboard, drill-down by rep/team, comparison charts, confidence intervals |

---

#### 8. Meeting Scheduler
**Priority Score**: 15 ÷ 2 = **7.5** (HIGH)

| Attribute | Value |
|-----------|-------|
| **Feature** | Shareable booking links synced with Google/Outlook calendar; auto-create meeting activities |
| **Business Value** | Eliminates scheduling back-and-forth; professional booking experience; automatic CRM logging |
| **Implementation Complexity** | Medium |
| **Data Model Changes** | `meeting_types`, `meeting_bookings`, calendar OAuth integration |
| **UI/UX Specifications** | Booking page builder, availability settings, confirmation emails, embed widget |

---

#### 9. Contact Data Enrichment
**Priority Score**: 12 ÷ 2 = **6.0** (MEDIUM-HIGH)

| Attribute | Value |
|-----------|-------|
| **Feature** | Auto-populate company/contact fields from external data sources (Clearbit, Apollo, LinkedIn) |
| **Business Value** | Saves research time; improves data quality; enables better segmentation |
| **Implementation Complexity** | Medium |
| **Data Model Changes** | `enrichment_results` table; enrichment_source, enriched_at fields on contacts/companies |
| **UI/UX Specifications** | "Enrich" button, enrichment status indicator, field-level source attribution |

---

#### 10. Duplicate Detection & Merge
**Priority Score**: 12 ÷ 2 = **6.0** (MEDIUM-HIGH)

| Attribute | Value |
|-----------|-------|
| **Feature** | Detect potential duplicate contacts/companies on import and manual entry; merge workflow |
| **Business Value** | Maintains data integrity; prevents embarrassing duplicate outreach; single source of truth |
| **Implementation Complexity** | Medium |
| **Data Model Changes** | `duplicate_candidates` table; merge audit trail |
| **UI/UX Specifications** | Duplicate warning modal, side-by-side comparison, field-by-field merge selection |

---

## 4. Best Practice Integration

### Onboarding Flows
- **Guided Setup Wizard**: Step-by-step pipeline configuration, email integration, first contact import
- **Sample Data Option**: Pre-populated demo data to explore features
- **Contextual Tooltips**: First-time hints on key actions
- **Progress Checklist**: "Complete your setup" widget with completion percentage

### Empty States & Progressive Disclosure
- **Actionable Empty States**: "No deals yet" → "Create your first deal" CTA with benefits
- **Feature Discovery**: Introduce advanced features after basic usage milestones
- **Collapsed Advanced Options**: Hide complexity until user expands

### Keyboard Shortcuts & Power-User Features
| Action | Shortcut |
|--------|----------|
| Global Search | `Cmd/Ctrl + K` |
| New Deal | `Cmd/Ctrl + D` |
| New Contact | `Cmd/Ctrl + N` |
| Quick Actions | `Cmd/Ctrl + .` |
| Navigate Pipeline | `←` `→` arrows |
| Move Deal Stage | `Shift + ←` `→` |

### Mobile/Responsive Considerations
- **Pipeline**: Horizontal scroll with snap-to-column on mobile
- **Contact Cards**: Stack vertically, swipe actions for quick edit/call/email
- **Offline Mode**: Queue actions for sync when reconnected
- **Touch Targets**: Minimum 44px for all interactive elements

### Accessibility Standards (WCAG 2.2 AA)
- **Keyboard Navigation**: Full pipeline traversal without mouse
- **Screen Reader**: ARIA labels on all interactive elements, live regions for updates
- **Color Contrast**: 4.5:1 minimum for text, 3:1 for UI components
- **Focus Indicators**: Visible focus rings on all focusable elements
- **Motion**: Respect `prefers-reduced-motion` for drag animations

### Performance Benchmarks
| Metric | Target | Current |
|--------|--------|---------|
| Pipeline Load (100 deals) | < 500ms | TBD |
| Contact Search | < 200ms | TBD |
| Deal Drag-Drop | < 100ms | ✅ |
| Page Navigation | < 300ms | TBD |

### API Design Patterns
- **RESTful Endpoints**: `/api/deals`, `/api/contacts`, `/api/pipelines`
- **Bulk Operations**: `POST /api/deals/bulk` for batch create/update
- **Filtering**: `?filter[stage]=proposal&filter[value][gte]=10000`
- **Pagination**: Cursor-based for large datasets
- **Webhooks**: Real-time events for deal stage changes, new contacts

---

## 5. Deliverables

### 5.1 Prioritized Enhancement Roadmap

#### NOW (Q1 2026) — Quick Wins & Foundations
| # | Enhancement | Effort | Impact |
|---|-------------|--------|--------|
| 1 | Deal Rotting Indicators | Low | High |
| 2 | Activity Timeline (MVP) | Medium | Critical |
| 3 | Multiple Pipelines | Medium | High |
| 4 | Pipeline Reports (basic) | Low | Medium |

#### NEXT (Q2 2026) — Core Differentiators
| # | Enhancement | Effort | Impact |
|---|-------------|--------|--------|
| 5 | Email Integration (2-way sync) | High | Critical |
| 6 | Meeting Scheduler | Medium | High |
| 7 | Revenue Forecasting | Medium | High |
| 8 | Duplicate Detection | Medium | Medium |

#### LATER (Q3-Q4 2026) — AI & Advanced
| # | Enhancement | Effort | Impact |
|---|-------------|--------|--------|
| 9 | AI Lead Scoring | High | High |
| 10 | Workflow Automation Builder | High | High |
| 11 | Contact Data Enrichment | Medium | Medium |
| 12 | Built-in Calling | High | Medium |

---

### 5.2 Detailed Feature Specifications

#### Feature Spec: Activity Timeline

**User Stories**:
1. As a sales rep, I want to see all interactions with a contact in one place so I can prepare for calls
2. As a manager, I want to see team activity on key accounts so I can coach effectively
3. As a rep taking over an account, I want full history so I don't repeat questions

**Acceptance Criteria**:
- [ ] Timeline displays on contact and company detail pages
- [ ] Shows: emails, calls, meetings, notes, deal stage changes, tasks
- [ ] Entries sorted by date (newest first, configurable)
- [ ] Filter by activity type
- [ ] Infinite scroll pagination
- [ ] Quick-add note/task from timeline
- [ ] Activity count badge on navigation

**Technical Requirements**:
- Polymorphic `activities` table
- Real-time updates via WebSocket
- Optimistic UI for new entries

---

#### Feature Spec: Deal Rotting Indicators

**User Stories**:
1. As a sales rep, I want to see which deals need attention so I don't let them go cold
2. As a manager, I want to identify stale deals across the team

**Acceptance Criteria**:
- [ ] Deals with no activity for X days show visual indicator (red border/badge)
- [ ] X is configurable per pipeline stage (default: 7 days)
- [ ] "Needs Attention" quick filter in pipeline view
- [ ] Rotting deals count in dashboard metrics
- [ ] Hover tooltip shows days since last activity

**Technical Requirements**:
- Add `last_activity_at` timestamp to deals
- Background job to update on activity creation
- Client-side calculation for real-time display

---

#### Feature Spec: Multiple Pipelines

**User Stories**:
1. As a sales leader, I want separate pipelines for new business vs. renewals
2. As a rep, I want to see only my relevant pipeline

**Acceptance Criteria**:
- [ ] Create/edit/delete pipelines
- [ ] Each pipeline has its own stages
- [ ] Deals belong to exactly one pipeline
- [ ] Pipeline selector in pipeline view
- [ ] Reports filterable by pipeline
- [ ] Default pipeline per user preference

**Data Model**:
```typescript
pipelines: {
  id, name, description, is_default, 
  created_at, updated_at
}

pipeline_stages: {
  id, pipeline_id, name, position, 
  probability, color, rotting_days
}

deals: {
  // existing fields...
  pipeline_id, stage_id // replace stage enum
}
```

---

### 5.3 Updated Data Model Recommendations

#### New Tables Required

```sql
-- Activity tracking
CREATE TABLE activities (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'contact', 'company', 'deal'
  entity_id UUID NOT NULL,
  activity_type VARCHAR(50) NOT NULL, -- 'email', 'call', 'meeting', 'note', 'task'
  subject VARCHAR(255),
  description TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  created_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multiple pipelines
CREATE TABLE pipelines (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY,
  pipeline_id UUID REFERENCES pipelines(id),
  name VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL,
  probability INTEGER DEFAULT 0,
  color VARCHAR(20),
  rotting_days INTEGER DEFAULT 7,
  UNIQUE(pipeline_id, position)
);

-- Workflow automation
CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  trigger_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_actions (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id),
  action_type VARCHAR(50) NOT NULL,
  action_config JSONB NOT NULL,
  position INTEGER NOT NULL
);

-- Forecasting
CREATE TABLE quotas (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  UNIQUE(user_id, period_start)
);
```

#### Schema Modifications

```sql
-- Add to deals table
ALTER TABLE deals ADD COLUMN pipeline_id UUID REFERENCES pipelines(id);
ALTER TABLE deals ADD COLUMN stage_id UUID REFERENCES pipeline_stages(id);
ALTER TABLE deals ADD COLUMN last_activity_at TIMESTAMPTZ;

-- Add to contacts table
ALTER TABLE contacts ADD COLUMN lead_score INTEGER;
ALTER TABLE contacts ADD COLUMN lead_score_factors JSONB;
ALTER TABLE contacts ADD COLUMN enriched_at TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN enrichment_source VARCHAR(50);
```

---

### 5.4 UI Wireframe Descriptions

#### Activity Timeline Component
```
┌─────────────────────────────────────────┐
│ Activity Timeline          [Filter ▼]   │
├─────────────────────────────────────────┤
│ ● Today                                 │
│   ├─ 📧 Email sent: "Follow-up on..."  │
│   │   10:30 AM · Opened 2x             │
│   └─ 📞 Call (5 min) - Discussed...    │
│       9:15 AM · by John Smith          │
│                                         │
│ ● Yesterday                             │
│   └─ 📅 Meeting: Product Demo          │
│       2:00 PM · 45 min                 │
│                                         │
│ ● Feb 1, 2026                          │
│   └─ 📝 Note: Interested in...         │
│       by Jane Doe                       │
│                                         │
│ [Load more...]                          │
└─────────────────────────────────────────┘
```

#### Deal Card with Rotting Indicator
```
┌─────────────────────────────────────────┐
│ 🔴 NEEDS ATTENTION                      │
├─────────────────────────────────────────┤
│ Acme Corp                    [75%]      │
│ Enterprise License Deal                 │
│                                         │
│ $45,000          Close: Mar 15         │
│                                         │
│ ⚠️ No activity for 12 days             │
└─────────────────────────────────────────┘
```

#### Pipeline Selector
```
┌─────────────────────────────────────────┐
│ Pipeline: [New Business ▼]              │
│           ├─ New Business    (24 deals) │
│           ├─ Renewals        (12 deals) │
│           ├─ Partnerships    (8 deals)  │
│           └─ + Create Pipeline          │
└─────────────────────────────────────────┘
```

---

## Appendix: Competitive Feature Deep-Dive

### HubSpot Strengths to Emulate
1. **Unified Timeline**: Single scroll for all touchpoints
2. **Email Tracking UX**: Subtle but clear open/click indicators
3. **Meeting Links**: Frictionless scheduling embedded everywhere
4. **Content Hub**: Blog/landing pages connected to CRM

### Salesforce Patterns to Adopt
1. **Einstein Insights Panel**: AI recommendations in context
2. **Path Component**: Visual stage progression with guidance
3. **Kanban Customization**: Compact/comfortable view toggle

### Pipedrive UX to Match
1. **Activity-First Design**: "What's next?" always visible
2. **Drag-Drop Speed**: Instant visual feedback
3. **Mobile Parity**: Full functionality on phone

### Freshsales AI to Benchmark
1. **Score Transparency**: Show factors, not just number
2. **Deal Health Buckets**: At risk, Trending, Likely to close
3. **Auto-Enrichment**: Zero-click data population

---

## Conclusion

The ATLVS Business module has a solid architectural foundation with its schema-driven approach and modern pipeline visualization. To compete effectively with industry leaders, **immediate focus should be on**:

1. **Activity Timeline** — Foundation for relationship intelligence
2. **Deal Rotting** — Quick win with high visibility impact
3. **Multiple Pipelines** — Enables diverse sales processes
4. **Email Integration** — Critical for adoption and data capture

The roadmap positions ATLVS to achieve **75% feature parity by Q2 2026** and **competitive differentiation by Q4 2026** through AI-powered insights and workflow automation.

---

*Document prepared for ATLVS Product Team*  
*Next Review: March 2026*
