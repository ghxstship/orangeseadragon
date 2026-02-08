# ATLVS Operations Module: Competitive Analysis & Enhancement Roadmap

**Module**: Operations  
**Analysis Date**: February 2026  
**Version**: 1.0

---

## Executive Summary

The ATLVS Operations module provides foundational event operations management capabilities including runsheets, incidents, shows, venues, work orders, daily reports, crew calls, and communications. This analysis benchmarks ATLVS against five industry-leading competitors to identify gaps, validate strengths, and prioritize enhancements that will establish ATLVS as a best-in-class operations platform.

### Current Competitive Position

| Category | Position | Assessment |
|----------|----------|------------|
| **Runsheet/Cue Management** | Behind | Missing real-time sync, live cue calling, teleprompter integration |
| **Incident Management** | Parity | Basic tracking present; lacks control room features, compliance workflows |
| **Venue Management** | Parity | Core functionality exists; missing floor plans, CAD integration, capacity optimization |
| **Crew/Labor Management** | Behind | Basic crew calls; missing scheduling optimization, time tracking, payroll integration |
| **Work Orders** | Advantage | Strong schema with kanban, timeline views; needs mobile-first enhancements |
| **Real-time Collaboration** | Behind | No live sync, push notifications, or offline capabilities |
| **Mobile Experience** | Gap | No dedicated mobile app or responsive operations views |

---

## 1. Competitive Intelligence

### Top 5 Competitors Analyzed

#### 1. LASSO (Shoflo Rundown + Crew Management)
**Focus**: Live event production, crew management, rundowns

**Core Features**:
- Real-time rundown builder with drag-and-drop
- Live cue calling with automatic time calculations
- Multi-view support (agenda, timers, teleprompter, display)
- Global Elements Manager for reusable segments
- Role-based access controls
- Crew scheduling with availability matching
- Time tracking with mobile app
- Travel logistics management
- Payroll integration
- Crew marketplace (500,000+ crew database)

**Unique Differentiators**:
- Real-time sync across all devices
- Teleprompter integration built-in
- Industry templates (sports, corporate, worship)
- Offline editing with auto-sync

**Pricing**: Tiered by feature bundles

---

#### 2. Momentus Technologies (Enterprise + Elite + WeTrack)
**Focus**: Venue and event management, incident control

**Core Features**:
- Unified calendar with gap identification
- Multi-venue portfolio management
- Real-time event analytics and insights
- AI-powered forecasting
- Incident management (WeTrack)
- Risk compliance workflows (Martyn's Law, ISO 31000)
- Control room operations
- Jobs and checklists
- Audit trails and regulatory compliance
- Integration with catering, AV, security systems

**Unique Differentiators**:
- Purpose-built for stadiums, arenas, convention centers
- Compliance-first design (ESG, safety regulations)
- Real-time visibility across large-scale operations
- Single source of truth across departments

**Pricing**: Enterprise licensing

---

#### 3. Prism.fm
**Focus**: Live music venue booking and management

**Core Features**:
- Intuitive event calendar
- Deal and contract tracking
- Offer and contract generation
- Financial management and accounting
- Show settlement workflows
- Box office data integration
- Multi-venue management
- Reporting and insights

**Unique Differentiators**:
- Music industry-specific workflows
- Real box office data sharing (Insights.live)
- Automated settlement calculations
- Agent/promoter collaboration tools

**Pricing**: Per-venue licensing

---

#### 4. Master Tour (Eventric)
**Focus**: Tour and production management

**Core Features**:
- Itinerary management
- Personnel directory (150,000+ contacts)
- Real-time collaboration
- Reminders and alerts
- Offline editing with sync
- Guest list management
- Venue database (15,000+ venues)
- Advancing workflows
- Print customization (day sheets)
- Cross-platform apps (Mac, Windows, Linux, iOS, Android)

**Unique Differentiators**:
- 20+ years of tour management expertise
- Comprehensive personnel/venue databases
- Offline-first architecture
- Production advancing built-in

**Pricing**: $64.99-$74.99/month per user

---

#### 5. Cue Manager
**Focus**: Rundowns and production management

**Core Features**:
- Real-time cue sheets/rundowns
- Live cue calling and following
- Audio playback integration per cue
- Schedules and checklists
- Gantt chart timelines
- Built-in team chat
- Guest collaboration
- Integrations (Current-RMS, Rentman, Bitfocus Companion, MIDI, API)

**Unique Differentiators**:
- Affordable Shoflo alternative
- Audio playback directly in rundowns
- MIDI integration for show control
- Project management tools included

**Pricing**: Subscription-based, lower cost tier

---

## 2. Gap Analysis Matrix

| Feature/Capability | ATLVS Current | LASSO | Momentus | Prism.fm | Master Tour | Cue Manager | Industry Standard | Best-in-Class |
|-------------------|---------------|-------|----------|----------|-------------|-------------|-------------------|---------------|
| **RUNSHEETS & CUE MANAGEMENT** |
| Basic runsheet creation | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Real-time sync across devices | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Live cue calling/following | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| Automatic time calculations | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| Teleprompter integration | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Reusable elements/templates | ❌ | ✅ | ⚠️ | ❌ | ✅ | ⚠️ | ⚠️ | ✅ |
| Multi-view modes | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| Audio/video cue triggers | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **INCIDENT MANAGEMENT** |
| Incident logging | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Severity/priority tracking | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Status workflow | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Control room dashboard | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Real-time dispatch | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Compliance workflows | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Audit trails | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Photo/evidence capture | ⚠️ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **VENUE MANAGEMENT** |
| Venue database | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Capacity tracking | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Floor plan management | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Stage/zone management | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Technical specs (power, rigging) | ✅ | ❌ | ✅ | ⚠️ | ✅ | ❌ | ⚠️ | ✅ |
| Map/location integration | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ⚠️ | ✅ |
| Checkpoint management | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| **CREW & LABOR MANAGEMENT** |
| Crew call sheets | ✅ | ✅ | ⚠️ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Availability-based scheduling | ❌ | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ⚠️ | ✅ |
| Skills/certification matching | ❌ | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ⚠️ | ✅ |
| Time tracking | ❌ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Payroll integration | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Travel logistics | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ⚠️ | ✅ |
| Crew marketplace/database | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **WORK ORDERS** |
| Work order creation | ✅ | ⚠️ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Status workflow | ✅ | ⚠️ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Kanban view | ✅ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Timeline/Gantt view | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| Punch list integration | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Mobile work orders | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **SHOWS/EVENTS** |
| Event dashboard | ✅ | ⚠️ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Status tracking (setup/live/strike) | ✅ | ⚠️ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Attendee/crew counts | ✅ | ⚠️ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Multi-stage management | ✅ | ⚠️ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **COMMUNICATIONS** |
| Radio channel management | ✅ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Weather integration | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Built-in team chat | ❌ | ⚠️ | ⚠️ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| Push notifications | ❌ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ | ✅ |
| **PLATFORM CAPABILITIES** |
| Mobile app | ❌ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ | ✅ |
| Offline mode | ❌ | ✅ | ⚠️ | ❌ | ✅ | ❌ | ⚠️ | ✅ |
| Real-time collaboration | ❌ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Role-based permissions | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| API/integrations | ⚠️ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |

**Legend**: ✅ = Full support | ⚠️ = Partial/Basic | ❌ = Not available

---

## 3. Enhancement Recommendations

### Priority Scoring Formula
**Priority Score** = (User Impact × Frequency of Use) ÷ Implementation Effort

- **User Impact**: 1-5 (5 = critical business value)
- **Frequency**: 1-5 (5 = used every event)
- **Effort**: 1-5 (1 = low effort, 5 = high effort)

---

### NOW (0-3 Months) - Critical Gaps

#### 1. Real-Time Runsheet Sync
**Feature**: Live synchronization of runsheet changes across all connected devices

**Business Value**: Event crews need instant updates when schedules change. Currently, ATLVS runsheets are static, forcing teams to rely on verbal communication or reprints.

| Metric | Score |
|--------|-------|
| User Impact | 5 |
| Frequency | 5 |
| Effort | 3 |
| **Priority Score** | **8.3** |

**Data Model Changes**:
```typescript
// Add to runsheet schema
websocket_channel: { type: 'text', label: 'Sync Channel' },
last_sync_at: { type: 'datetime', label: 'Last Synced' },
active_editors: { type: 'json', label: 'Active Editors' }, // [{userId, cursor, timestamp}]
version: { type: 'number', label: 'Version', default: 1 },
```

**UI/UX Specifications**:
- Presence indicators showing who's viewing/editing
- Conflict resolution for simultaneous edits
- Visual diff highlighting for changes
- "Changes saved" toast notifications
- Connection status indicator

---

#### 2. Live Cue Calling Mode
**Feature**: Dedicated show-time interface for calling cues with timing display

**Business Value**: Stage managers and technical directors need a focused interface during live shows. Competitors like LASSO and Cue Manager have this as a core feature.

| Metric | Score |
|--------|-------|
| User Impact | 5 |
| Frequency | 4 |
| Effort | 3 |
| **Priority Score** | **6.7** |

**Data Model Changes**:
```typescript
// New schema: runsheet_cue.ts
export const runsheetCueSchema = defineSchema({
  identity: { name: 'runsheet_cue', namePlural: 'Cues', slug: 'operations/runsheets/cues', icon: 'Play' },
  data: {
    fields: {
      runsheet_id: { type: 'relation', label: 'Runsheet', required: true },
      sequence: { type: 'number', label: 'Sequence', required: true },
      name: { type: 'text', label: 'Cue Name', required: true },
      duration_seconds: { type: 'number', label: 'Duration (sec)' },
      scheduled_time: { type: 'text', label: 'Scheduled Time' },
      actual_time: { type: 'datetime', label: 'Actual Time' },
      status: { type: 'select', options: ['pending', 'standby', 'go', 'complete', 'skipped'] },
      cue_type: { type: 'select', options: ['audio', 'video', 'lighting', 'action', 'transition', 'break'] },
      notes: { type: 'textarea', label: 'Notes' },
      assigned_to: { type: 'relation', label: 'Assigned To' },
    }
  }
});
```

**UI/UX Specifications**:
- Full-screen "Show Mode" with large, readable cue list
- Current/next/previous cue highlighting
- Running clock with countdown to next cue
- One-click "GO" button with keyboard shortcut (spacebar)
- Color-coded cue types
- Audio/visual alerts for upcoming cues

---

#### 3. Mobile Operations App (PWA)
**Feature**: Progressive Web App for field operations

**Business Value**: Operations staff are rarely at desks. Mobile access to incidents, work orders, and runsheets is essential for modern event operations.

| Metric | Score |
|--------|-------|
| User Impact | 5 |
| Frequency | 5 |
| Effort | 4 |
| **Priority Score** | **6.25** |

**Data Model Changes**: None required (consume existing APIs)

**UI/UX Specifications**:
- Responsive layouts optimized for mobile
- Bottom navigation for key modules
- Swipe gestures for status updates
- Camera integration for incident photos
- Offline queue for poor connectivity
- Push notification support
- Quick-action buttons (log incident, update status)

---

#### 4. Incident Control Room Dashboard
**Feature**: Real-time incident monitoring dashboard for control rooms

**Business Value**: Large venues need centralized visibility of all active incidents. Momentus WeTrack dominates this space.

| Metric | Score |
|--------|-------|
| User Impact | 4 |
| Frequency | 4 |
| Effort | 3 |
| **Priority Score** | **5.3** |

**Data Model Changes**:
```typescript
// Add to incident schema
location_coordinates: { type: 'json', label: 'GPS Coordinates' },
response_team: { type: 'relation', label: 'Response Team', multiple: true },
escalation_level: { type: 'number', label: 'Escalation Level', default: 0 },
response_time_seconds: { type: 'number', label: 'Response Time' },
resolution_time_seconds: { type: 'number', label: 'Resolution Time' },
```

**UI/UX Specifications**:
- Map view with incident pins (color by severity)
- Live incident feed with auto-refresh
- Severity-based filtering
- Response time metrics
- One-click dispatch to response teams
- Audio alerts for critical incidents
- Full-screen mode for control room displays

---

### NEXT (3-6 Months) - Competitive Parity

#### 5. Automatic Time Calculations
**Feature**: Auto-calculate runsheet timing based on cue durations

| Metric | Score |
|--------|-------|
| User Impact | 4 |
| Frequency | 5 |
| Effort | 2 |
| **Priority Score** | **10.0** |

**Implementation**: Add duration fields to cues, compute cumulative times, highlight over/under running.

---

#### 6. Crew Availability Scheduling
**Feature**: Schedule crew based on availability, skills, and certifications

| Metric | Score |
|--------|-------|
| User Impact | 4 |
| Frequency | 4 |
| Effort | 4 |
| **Priority Score** | **4.0** |

**Data Model Changes**:
```typescript
// New schema: crew_availability.ts
availability_date: { type: 'date' },
crew_member_id: { type: 'relation' },
status: { type: 'select', options: ['available', 'unavailable', 'tentative'] },
time_slots: { type: 'json' }, // [{start, end}]
```

---

#### 7. Time Tracking Integration
**Feature**: Clock in/out for crew with GPS verification

| Metric | Score |
|--------|-------|
| User Impact | 4 |
| Frequency | 4 |
| Effort | 3 |
| **Priority Score** | **5.3** |

---

#### 8. Floor Plan Editor
**Feature**: Visual floor plan management with drag-and-drop elements

| Metric | Score |
|--------|-------|
| User Impact | 3 |
| Frequency | 3 |
| Effort | 5 |
| **Priority Score** | **1.8** |

---

#### 9. Compliance & Audit Trails
**Feature**: Immutable audit logs for incidents and safety compliance

| Metric | Score |
|--------|-------|
| User Impact | 4 |
| Frequency | 3 |
| Effort | 3 |
| **Priority Score** | **4.0** |

---

#### 10. Push Notifications
**Feature**: Real-time alerts for incidents, schedule changes, assignments

| Metric | Score |
|--------|-------|
| User Impact | 4 |
| Frequency | 5 |
| Effort | 3 |
| **Priority Score** | **6.7** |

---

### LATER (6-12 Months) - Competitive Advantage

#### 11. Teleprompter Mode
**Feature**: Built-in teleprompter view synced to runsheet

| Metric | Score |
|--------|-------|
| User Impact | 3 |
| Frequency | 3 |
| Effort | 3 |
| **Priority Score** | **3.0** |

---

#### 12. Global Elements Manager
**Feature**: Reusable runsheet segments (intros, sponsor reads, transitions)

| Metric | Score |
|--------|-------|
| User Impact | 3 |
| Frequency | 4 |
| Effort | 3 |
| **Priority Score** | **4.0** |

---

#### 13. AI-Powered Scheduling
**Feature**: Optimize crew assignments based on skills, costs, and availability

| Metric | Score |
|--------|-------|
| User Impact | 4 |
| Frequency | 3 |
| Effort | 5 |
| **Priority Score** | **2.4** |

---

#### 14. Show Control Integration (MIDI/OSC)
**Feature**: Trigger external show control systems from runsheet cues

| Metric | Score |
|--------|-------|
| User Impact | 3 |
| Frequency | 2 |
| Effort | 4 |
| **Priority Score** | **1.5** |

---

#### 15. Crew Marketplace
**Feature**: Database of available freelance crew with ratings

| Metric | Score |
|--------|-------|
| User Impact | 3 |
| Frequency | 2 |
| Effort | 5 |
| **Priority Score** | **1.2** |

---

## 4. Best Practice Integration

### Onboarding Flows
- **Progressive disclosure**: Start with simple event creation, reveal advanced features as needed
- **Template library**: Pre-built runsheet templates for common event types (corporate, concert, wedding)
- **Interactive tutorials**: Guided walkthrough for first runsheet, first incident, first work order
- **Sample data**: Demo event with realistic data to explore features

### Empty States
- **Actionable messaging**: "No runsheets yet. Create your first runsheet to manage your show flow."
- **Quick-start buttons**: Primary CTA in empty state
- **Template suggestions**: "Start from a template" option
- **Help links**: Contextual documentation links

### Keyboard Shortcuts
| Action | Shortcut |
|--------|----------|
| New runsheet | `Cmd/Ctrl + N` |
| Go to next cue | `Space` |
| Mark cue complete | `Enter` |
| Log incident | `Cmd/Ctrl + I` |
| Search | `Cmd/Ctrl + K` |
| Toggle show mode | `F11` |

### Mobile/Responsive Considerations
- **Touch-optimized**: Large tap targets (min 44px)
- **Swipe actions**: Swipe to update status, swipe to dismiss
- **Offline-first**: Queue actions when offline, sync when connected
- **Reduced motion**: Respect `prefers-reduced-motion`
- **Dark mode**: Essential for backstage/control room use

### Accessibility Standards
- **WCAG 2.2 AA compliance**
- **Screen reader support**: Proper ARIA labels for all interactive elements
- **Keyboard navigation**: Full functionality without mouse
- **Color contrast**: 4.5:1 minimum for text
- **Focus indicators**: Visible focus states

### Performance Benchmarks
| Metric | Target |
|--------|--------|
| Initial load | < 2s |
| Cue transition | < 100ms |
| Real-time sync latency | < 500ms |
| Offline queue sync | < 5s |
| Search results | < 200ms |

### API Design Patterns
- **RESTful endpoints** with consistent naming
- **WebSocket channels** for real-time features
- **Pagination** with cursor-based navigation
- **Filtering** via query parameters
- **Bulk operations** for efficiency
- **Webhook support** for integrations

---

## 5. Detailed Feature Specifications (Top 10)

### Specification 1: Real-Time Runsheet Sync

**Overview**: Enable live synchronization of runsheet changes across all connected devices using WebSocket connections.

**Acceptance Criteria**:
- [ ] Changes appear on all connected devices within 500ms
- [ ] Presence indicators show active viewers/editors
- [ ] Conflict resolution handles simultaneous edits gracefully
- [ ] Connection status clearly visible
- [ ] Reconnection automatic after network interruption
- [ ] Offline changes queued and synced on reconnect

**Technical Approach**:
1. Implement WebSocket server for runsheet channels
2. Add optimistic updates with rollback on conflict
3. Use operational transformation or CRDT for conflict resolution
4. Store version history for undo/redo

---

### Specification 2: Live Cue Calling Mode

**Overview**: Full-screen interface for calling cues during live shows with timing display and keyboard controls.

**Acceptance Criteria**:
- [ ] Full-screen mode with distraction-free UI
- [ ] Current cue prominently displayed with countdown
- [ ] Next 3-5 cues visible in queue
- [ ] Spacebar triggers "GO" for current cue
- [ ] Running clock shows actual vs scheduled time
- [ ] Color coding for cue status (pending, standby, go, complete)
- [ ] Audio/visual warnings for upcoming cues

**Wireframe Description**:
```
┌─────────────────────────────────────────────────────────────┐
│  [SHOW MODE]                              🔴 LIVE  14:32:45 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PREVIOUS: Opening Video                         ✓ COMPLETE │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  NOW: CEO Welcome Speech                                ││
│  │  Duration: 5:00  |  Elapsed: 2:34  |  Remaining: 2:26   ││
│  │  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ││
│  │                                                         ││
│  │  Notes: Cue lighting change at 3:00 mark                ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  NEXT: Product Demo Video                        ⏱ 3:30     │
│  THEN: Panel Discussion                          ⏱ 15:00    │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    [  GO  ]                             ││
│  │                   (SPACEBAR)                            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

### Specification 3: Mobile Operations PWA

**Overview**: Progressive Web App providing mobile access to core operations features.

**Acceptance Criteria**:
- [ ] Installable on iOS and Android
- [ ] Works offline with sync queue
- [ ] Push notifications for incidents and assignments
- [ ] Camera access for incident photos
- [ ] GPS for location tagging
- [ ] Biometric authentication support
- [ ] < 3s load time on 3G

**Key Screens**:
1. **Dashboard**: Active shows, open incidents, my assignments
2. **Incidents**: Log new, view active, update status
3. **Runsheet**: View-only with cue status
4. **Work Orders**: View assigned, update status
5. **Check-in**: Clock in/out with GPS

---

### Specification 4: Incident Control Room Dashboard

**Overview**: Real-time monitoring dashboard for security and operations control rooms.

**Acceptance Criteria**:
- [ ] Map view with incident locations
- [ ] Live feed of all active incidents
- [ ] Filtering by severity, type, status
- [ ] One-click dispatch to response teams
- [ ] Response time metrics
- [ ] Full-screen mode for large displays
- [ ] Audio alerts for critical incidents
- [ ] Auto-refresh every 5 seconds

---

### Specification 5: Automatic Time Calculations

**Overview**: Automatically calculate cumulative timing for runsheet cues.

**Acceptance Criteria**:
- [ ] Each cue has duration field
- [ ] Scheduled times auto-calculate based on start time + cumulative durations
- [ ] Visual indicator when running over/under
- [ ] "Ripple" time changes through subsequent cues
- [ ] Lock individual cue times to prevent ripple

---

### Specification 6: Crew Availability Scheduling

**Overview**: Schedule crew based on their submitted availability.

**Acceptance Criteria**:
- [ ] Crew can submit availability via calendar
- [ ] Scheduler sees availability when assigning
- [ ] Conflict warnings for double-booking
- [ ] Skills/certification filtering
- [ ] Bulk scheduling for multi-day events

---

### Specification 7: Time Tracking

**Overview**: Mobile clock in/out with GPS verification.

**Acceptance Criteria**:
- [ ] Clock in/out via mobile app
- [ ] GPS location captured at clock events
- [ ] Geofence validation (optional)
- [ ] Break tracking
- [ ] Overtime calculations
- [ ] Export to payroll systems

---

### Specification 8: Push Notifications

**Overview**: Real-time alerts for critical events.

**Acceptance Criteria**:
- [ ] Incident alerts by severity threshold
- [ ] Assignment notifications
- [ ] Schedule change alerts
- [ ] Cue reminders (5 min before)
- [ ] User-configurable preferences
- [ ] Do-not-disturb scheduling

---

### Specification 9: Compliance Audit Trails

**Overview**: Immutable logs for regulatory compliance.

**Acceptance Criteria**:
- [ ] All incident actions logged with timestamp and user
- [ ] Logs cannot be modified or deleted
- [ ] Export to PDF/CSV for audits
- [ ] Retention policy configuration
- [ ] Search and filter audit logs

---

### Specification 10: Global Elements Manager

**Overview**: Reusable runsheet segments that sync across events.

**Acceptance Criteria**:
- [ ] Create reusable elements (intro, sponsor read, etc.)
- [ ] Insert elements into any runsheet
- [ ] Edit element updates all instances
- [ ] Version history for elements
- [ ] Element library with search

---

## 6. Updated Data Model Recommendations

### New Schemas Required

```typescript
// 1. runsheet_cue.ts - Individual cues within runsheets
// 2. crew_availability.ts - Crew availability calendar
// 3. time_entry.ts - Clock in/out records
// 4. audit_log.ts - Immutable audit trail
// 5. global_element.ts - Reusable runsheet segments
// 6. notification_preference.ts - User notification settings
```

### Schema Modifications

```typescript
// runsheet.ts additions
websocket_channel: { type: 'text' },
version: { type: 'number', default: 1 },
show_mode_active: { type: 'boolean', default: false },
current_cue_id: { type: 'relation' },

// incident.ts additions
location_coordinates: { type: 'json' },
response_team: { type: 'relation', multiple: true },
escalation_level: { type: 'number' },
response_time_seconds: { type: 'number' },
resolution_time_seconds: { type: 'number' },
audit_trail: { type: 'relation', multiple: true },

// crew_call.ts additions
availability_status: { type: 'select', options: ['pending', 'confirmed', 'declined'] },
check_in_time: { type: 'datetime' },
check_out_time: { type: 'datetime' },
gps_check_in: { type: 'json' },
```

---

## 7. Prioritized Enhancement Roadmap

### Phase 1: NOW (0-3 Months)
| # | Enhancement | Priority Score | Effort | Dependencies |
|---|-------------|----------------|--------|--------------|
| 1 | Automatic Time Calculations | 10.0 | Low | None |
| 2 | Real-Time Runsheet Sync | 8.3 | Medium | WebSocket infrastructure |
| 3 | Live Cue Calling Mode | 6.7 | Medium | Runsheet cue schema |
| 4 | Push Notifications | 6.7 | Medium | Service worker |
| 5 | Mobile Operations PWA | 6.25 | High | Responsive layouts |

### Phase 2: NEXT (3-6 Months)
| # | Enhancement | Priority Score | Effort | Dependencies |
|---|-------------|----------------|--------|--------------|
| 6 | Incident Control Room Dashboard | 5.3 | Medium | Real-time sync |
| 7 | Time Tracking | 5.3 | Medium | Mobile app |
| 8 | Crew Availability Scheduling | 4.0 | High | Availability schema |
| 9 | Compliance Audit Trails | 4.0 | Medium | Audit log schema |
| 10 | Global Elements Manager | 4.0 | Medium | Element schema |

### Phase 3: LATER (6-12 Months)
| # | Enhancement | Priority Score | Effort | Dependencies |
|---|-------------|----------------|--------|--------------|
| 11 | Teleprompter Mode | 3.0 | Medium | Cue calling mode |
| 12 | AI-Powered Scheduling | 2.4 | High | Availability data |
| 13 | Floor Plan Editor | 1.8 | High | Canvas library |
| 14 | Show Control Integration | 1.5 | High | External APIs |
| 15 | Crew Marketplace | 1.2 | High | User profiles |

---

## Conclusion

The ATLVS Operations module has a solid foundation with comprehensive schemas for venues, events, work orders, and incidents. The primary gaps are in **real-time collaboration**, **mobile accessibility**, and **live show execution tools**.

By implementing the Phase 1 enhancements, ATLVS will achieve competitive parity with LASSO and Cue Manager for runsheet management while establishing a foundation for the advanced incident management capabilities that Momentus WeTrack offers.

The recommended approach prioritizes high-impact, lower-effort improvements first (automatic time calculations, real-time sync) before tackling larger infrastructure projects (mobile PWA, crew marketplace).

---

*Document generated by competitive analysis workflow. Last updated: February 2026*
