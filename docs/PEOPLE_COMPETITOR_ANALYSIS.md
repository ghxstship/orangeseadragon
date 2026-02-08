# ATLVS People Module: Competitive Enrichment Analysis

**Module**: People (HR & Workforce Management)  
**Analysis Date**: February 2026  
**Version**: 1.0

---

## Executive Summary

The ATLVS People module provides workforce management capabilities including rosters, recruitment, scheduling, training, travel, and performance management. For event production companies, this module is mission-critical as labor often represents 40-60% of production costs. Competitive analysis against industry leaders reveals significant opportunities for enhancement in scheduling automation, mobile workforce management, compliance tracking, and AI-powered workforce optimization.

### Competitive Position Overview

| Category | Current Position | Target Position |
|----------|-----------------|-----------------|
| **Roster Management** | Basic | Industry Standard |
| **Scheduling & Shifts** | Basic | Best-in-Class |
| **Time & Attendance** | Gap | Industry Standard |
| **Recruitment/ATS** | Basic | Industry Standard |
| **Onboarding** | Gap | Best-in-Class |
| **Training/LMS** | Basic | Industry Standard |
| **Compliance** | Gap | Best-in-Class |
| **Mobile Experience** | Gap | Best-in-Class |
| **AI/Automation** | Gap | Industry Standard |

---

## 1. Competitive Intelligence

### Top 5 Competitors Analyzed

#### 1.1 Deputy
**Market Position**: Leader in shift-based workforce management, 350,000+ workplaces

**Core Features & Differentiators**:
- AI-powered auto-scheduling based on demand forecasting
- Real-time labor cost tracking against budget
- Geofenced clock-in/out with photo verification
- Break compliance automation
- Shift swapping with manager approval workflows
- Fatigue management and safe scheduling
- Integration with 50+ payroll systems

**UX Patterns**:
- Mobile-first design (90% of interactions on mobile)
- Drag-and-drop schedule builder
- One-tap shift acceptance
- Real-time notifications for schedule changes
- Visual labor cost indicators

**Data Model Highlights**:
- Skill-based scheduling
- Availability patterns with recurring rules
- Leave balances and accruals
- Shift templates and rotations
- Location-based assignments

**Recent Features (2025-2026)**:
- AI demand forecasting
- Predictive no-show alerts
- Automated compliance reporting
- Enhanced fatigue management

---

#### 1.2 When I Work
**Market Position**: SMB scheduling leader, 200,000+ workplaces

**Core Features & Differentiators**:
- Open shift marketplace
- Team messaging integrated with schedule
- Availability management with conflict detection
- Labor forecasting based on sales data
- Shift bidding for premium shifts
- Multi-location scheduling

**UX Patterns**:
- Color-coded schedule views
- Swipe gestures for quick actions
- In-app team chat
- Push notifications for all schedule events
- Calendar sync (Google, Apple, Outlook)

**Data Model Highlights**:
- Position-based scheduling
- Shift pools and templates
- Overtime tracking and alerts
- PTO request workflows

**Recent Features (2025-2026)**:
- AI schedule optimization
- Enhanced labor cost analytics
- Improved multi-location support

---

#### 1.3 BambooHR
**Market Position**: SMB HR platform leader, 30,000+ companies

**Core Features & Differentiators**:
- Complete employee lifecycle management
- Customizable onboarding workflows
- Performance management with 360 reviews
- Compensation benchmarking
- Employee self-service portal
- Document management with e-signatures
- Built-in ATS

**UX Patterns**:
- Employee-centric dashboard
- Org chart visualization
- Anniversary and birthday celebrations
- Mobile app for approvals and time-off
- Customizable workflows

**Data Model Highlights**:
- Custom fields on all entities
- Hierarchical org structure
- Job history tracking
- Compensation history
- Document versioning

**Recent Features (2025-2026)**:
- AI-powered performance insights
- Enhanced DEI analytics
- Improved compensation planning

---

#### 1.4 Gusto
**Market Position**: SMB payroll + HR leader, 300,000+ businesses

**Core Features & Differentiators**:
- Integrated payroll with automatic tax filing
- Benefits administration (health, 401k, etc.)
- Contractor payments and 1099 generation
- Compliance alerts and guidance
- New hire reporting automation
- Workers' comp integration

**UX Patterns**:
- Guided payroll runs
- Compliance checklist dashboard
- Employee self-onboarding
- Mobile pay stubs and tax documents
- Proactive compliance notifications

**Data Model Highlights**:
- Pay schedules and run history
- Tax jurisdiction tracking
- Benefits enrollment
- Garnishment management
- Contractor vs employee classification

**Recent Features (2025-2026)**:
- AI-powered compliance recommendations
- Enhanced contractor management
- Global contractor payments

---

#### 1.5 Crew (for Events/Entertainment)
**Market Position**: Niche leader in entertainment crew management

**Core Features & Differentiators**:
- Day-rate and hourly crew booking
- Crew availability calendars
- Kit fee and equipment tracking
- Call sheet generation
- Union rate cards and compliance
- Crew rating and reviews
- Portfolio and resume management

**UX Patterns**:
- Project-centric crew booking
- Visual availability calendar
- Quick crew search by skill/location
- Mobile call sheet access
- Crew messaging

**Data Model Highlights**:
- Skill taxonomy for entertainment
- Rate cards by union/non-union
- Equipment/kit ownership
- Availability with holds vs confirms
- Project history and credits

**Recent Features (2025-2026)**:
- AI crew recommendations
- Enhanced union compliance
- Improved mobile experience

---

## 2. Gap Analysis Matrix

| Feature/Capability | ATLVS Current | Deputy | When I Work | BambooHR | Gusto | Crew | Industry Standard |
|-------------------|---------------|--------|-------------|----------|-------|------|-------------------|
| **Scheduling** |
| Drag-drop schedule builder | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| AI auto-scheduling | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Shift templates | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Open shift marketplace | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Shift swap requests | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Availability management | Basic | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Conflict detection | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Time & Attendance** |
| Mobile clock in/out | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Geofenced time tracking | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Photo verification | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚪ |
| Break tracking | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Overtime alerts | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Onboarding** |
| Digital document signing | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Onboarding checklists | Basic | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| New hire portal | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| I-9/W-4 collection | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Equipment provisioning | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ⚪ |
| **Compliance** |
| Certification tracking | Basic | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Expiration alerts | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Labor law compliance | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Union rate compliance | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ⚪ |
| Fatigue management | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚪ |
| **Mobile** |
| Native mobile app | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Offline capability | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚪ |
| Push notifications | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Communication** |
| Team messaging | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Broadcast announcements | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Read receipts | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚪ |

**Legend**: ✅ Full support | ⚪ Partial | ❌ Not available | Basic = Minimal implementation

---

## 3. Enhancement Recommendations

### Priority 1: Critical Gaps (Now)

#### 3.1 Mobile Clock In/Out with Geofencing
**Feature**: Allow crew to clock in/out via mobile with GPS verification at venue locations

**Business Value**: 
- Eliminates time theft and buddy punching
- Provides accurate labor cost data in real-time
- Required for compliance with labor laws
- Reduces payroll disputes

**Implementation Complexity**: Medium

**Priority Score**: 9.5/10 (High impact × High frequency ÷ Medium effort)

**Data Model Changes**:
```sql
CREATE TABLE time_punches (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employee_profiles(id),
  event_id UUID REFERENCES events(id),
  punch_type VARCHAR(20), -- 'clock_in', 'clock_out', 'break_start', 'break_end'
  punch_time TIMESTAMPTZ NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  accuracy_meters DECIMAL(10,2),
  venue_id UUID REFERENCES venues(id),
  is_within_geofence BOOLEAN,
  photo_url TEXT,
  device_id TEXT,
  ip_address INET,
  notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ
);

CREATE TABLE venue_geofences (
  id UUID PRIMARY KEY,
  venue_id UUID REFERENCES venues(id),
  center_latitude DECIMAL(10,8),
  center_longitude DECIMAL(11,8),
  radius_meters INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE
);
```

**UI/UX Specifications**:
- Large clock in/out button on mobile home screen
- Real-time GPS indicator showing if within geofence
- Photo capture option for verification
- Break timer with compliance warnings
- Shift summary with hours worked

---

#### 3.2 Shift Swap & Open Shift Marketplace
**Feature**: Allow crew to request shift swaps and claim open shifts with approval workflows

**Business Value**:
- Reduces manager workload for schedule changes
- Improves crew satisfaction and retention
- Fills shifts faster with qualified workers
- Maintains compliance with skill requirements

**Implementation Complexity**: Medium

**Priority Score**: 9.0/10

**Data Model Changes**:
```sql
CREATE TABLE shift_swap_requests (
  id UUID PRIMARY KEY,
  original_shift_id UUID REFERENCES shifts(id),
  requesting_employee_id UUID REFERENCES employee_profiles(id),
  target_employee_id UUID,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
  reason TEXT,
  manager_notes TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  responded_by UUID
);

CREATE TABLE open_shifts (
  id UUID PRIMARY KEY,
  shift_id UUID REFERENCES shifts(id),
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  posted_by UUID,
  expires_at TIMESTAMPTZ,
  required_skills TEXT[],
  priority VARCHAR(20) DEFAULT 'normal',
  bonus_amount DECIMAL(10,2),
  claimed_by UUID,
  claimed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'open'
);
```

**UI/UX Specifications**:
- "Available Shifts" tab in mobile app
- Filter by date, location, skill
- One-tap claim with confirmation
- Push notification for new open shifts
- Manager approval queue

---

#### 3.3 Digital Onboarding Portal
**Feature**: Self-service onboarding for new hires with document collection, e-signatures, and task tracking

**Business Value**:
- Reduces HR admin time by 80%
- Ensures compliance with required documentation
- Improves new hire experience
- Faster time-to-productivity

**Implementation Complexity**: High

**Priority Score**: 8.5/10

**Data Model Changes**:
```sql
CREATE TABLE onboarding_workflows (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  position_type_id UUID REFERENCES position_types(id),
  department_id UUID REFERENCES departments(id),
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE onboarding_steps (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES onboarding_workflows(id),
  step_order INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  step_type VARCHAR(50), -- 'document', 'form', 'task', 'training', 'equipment'
  is_required BOOLEAN DEFAULT TRUE,
  due_days INTEGER, -- days after start date
  assignee_type VARCHAR(50), -- 'new_hire', 'manager', 'hr', 'it'
  document_template_id UUID,
  form_schema JSONB
);

CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employee_profiles(id),
  workflow_id UUID REFERENCES onboarding_workflows(id),
  step_id UUID REFERENCES onboarding_steps(id),
  status VARCHAR(20) DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  completed_by UUID,
  data JSONB,
  document_url TEXT,
  signature_url TEXT
);

CREATE TABLE employee_documents (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employee_profiles(id),
  document_type VARCHAR(100), -- 'w4', 'i9', 'id', 'contract', 'nda', 'handbook_ack'
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at DATE,
  is_signed BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMPTZ,
  signature_ip INET
);
```

**UI/UX Specifications**:
- Welcome portal with progress tracker
- Document upload with camera capture
- E-signature with legal acknowledgment
- Task checklist with due dates
- Manager dashboard for onboarding status

---

#### 3.4 Certification & Compliance Tracking
**Feature**: Track required certifications, licenses, and training with expiration alerts

**Business Value**:
- Ensures legal compliance for regulated work
- Prevents scheduling unqualified workers
- Automates renewal reminders
- Audit-ready documentation

**Implementation Complexity**: Medium

**Priority Score**: 8.5/10

**Data Model Changes**:
```sql
CREATE TABLE certification_types (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'safety', 'technical', 'legal', 'medical'
  validity_months INTEGER,
  is_required_for_hire BOOLEAN DEFAULT FALSE,
  required_for_positions UUID[], -- position_type_ids
  renewal_reminder_days INTEGER DEFAULT 30
);

CREATE TABLE employee_certifications (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employee_profiles(id),
  certification_type_id UUID REFERENCES certification_types(id),
  certificate_number VARCHAR(100),
  issued_date DATE,
  expiry_date DATE,
  issuing_authority VARCHAR(255),
  document_url TEXT,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'revoked', 'pending'
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE compliance_alerts (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employee_profiles(id),
  certification_id UUID REFERENCES employee_certifications(id),
  alert_type VARCHAR(50), -- 'expiring_soon', 'expired', 'missing_required'
  alert_date DATE,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ
);
```

**UI/UX Specifications**:
- Compliance dashboard with status indicators
- Calendar view of upcoming expirations
- Bulk reminder sending
- Document upload for renewals
- Scheduling block for expired certs

---

### Priority 2: Important Enhancements (Next)

#### 3.5 Drag-Drop Schedule Builder
**Feature**: Visual schedule builder with drag-drop shift assignment

**Business Value**: Reduces scheduling time by 60%, improves visibility

**Implementation Complexity**: High

**Priority Score**: 8.0/10

---

#### 3.6 Availability Management with Patterns
**Feature**: Recurring availability patterns with exception handling

**Business Value**: Reduces scheduling conflicts, improves crew satisfaction

**Implementation Complexity**: Medium

**Priority Score**: 7.5/10

---

#### 3.7 Team Messaging & Announcements
**Feature**: In-app messaging for teams with broadcast capabilities

**Business Value**: Centralizes communication, improves response times

**Implementation Complexity**: Medium

**Priority Score**: 7.5/10

---

#### 3.8 Overtime & Labor Cost Tracking
**Feature**: Real-time overtime alerts and labor cost visualization

**Business Value**: Prevents budget overruns, ensures compliance

**Implementation Complexity**: Medium

**Priority Score**: 7.0/10

---

### Priority 3: Future Enhancements (Later)

#### 3.9 AI-Powered Auto-Scheduling
**Feature**: Automatic schedule generation based on demand, skills, and preferences

**Implementation Complexity**: Very High

**Priority Score**: 6.5/10

---

#### 3.10 Fatigue Management
**Feature**: Track hours worked and enforce rest requirements

**Implementation Complexity**: Medium

**Priority Score**: 6.0/10

---

## 4. Best Practice Integration

### Onboarding Flows
- Progressive disclosure: show only relevant steps
- Mobile-first document capture
- Gamification with progress indicators
- Manager notifications at key milestones

### Mobile Experience
- Offline-first architecture for clock in/out
- Large touch targets for field conditions
- Dark mode for low-light environments
- Battery-efficient location tracking

### Accessibility Standards
- WCAG 2.2 AA compliance
- Screen reader support for schedules
- High contrast mode
- Voice commands for clock in/out

### Performance Benchmarks
- Schedule load: < 500ms for 4-week view
- Clock in/out: < 2 seconds including GPS
- Push notification delivery: < 5 seconds
- Offline sync: < 30 seconds when reconnected

---

## 5. Implementation Roadmap

### Phase 1: Now (Weeks 1-4)
1. Mobile clock in/out with geofencing
2. Certification tracking with expiration alerts
3. Basic shift swap requests

### Phase 2: Next (Weeks 5-8)
4. Digital onboarding portal
5. Open shift marketplace
6. Availability management

### Phase 3: Later (Weeks 9-12)
7. Drag-drop schedule builder
8. Team messaging
9. Labor cost tracking
10. AI scheduling foundation
