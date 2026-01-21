# ATLVS Demo Seed Data Specification

## Overview

Multi-tenant demo datasets covering all 9 management domains with realistic data for production, crew, finances, CRM, resource allocation, and event calendar.

---

## Demo Organization

```yaml
organization:
  id: "demo-org-001"
  name: "Apex Productions"
  slug: "apex-productions"
  industry: "Live Events & Entertainment"
  subscription_tier: enterprise
  timezone: "America/New_York"
  currency: "USD"
  
  settings:
    modules_enabled: [all]
    white_label:
      primary_color: "#6366f1"
      logo_url: "/demo/apex-logo.svg"
```

---

## User Accounts (All Roles)

| Role | Email | Name | Department |
|------|-------|------|------------|
| OrganizationOwner | owner@apex.demo | Sarah Chen | Executive |
| OrganizationAdmin | admin@apex.demo | Marcus Johnson | Operations |
| DepartmentHead | dept.head@apex.demo | Lisa Rodriguez | Production |
| ProjectManager | pm@apex.demo | David Kim | Production |
| ProductionManager | prod.mgr@apex.demo | James Wilson | Production |
| TeamLead | lead@apex.demo | Emily Davis | Technical |
| FinanceManager | finance@apex.demo | Robert Taylor | Finance |
| CrewMember | crew1@apex.demo | Alex Thompson | Audio |
| CrewMember | crew2@apex.demo | Jordan Lee | Lighting |
| Artist | artist@apex.demo | The Midnight Collective | Talent |
| Vendor | vendor@apex.demo | SoundTech Rentals | Vendors |
| Volunteer | volunteer@apex.demo | Casey Morgan | Operations |

---

## Projects (5 Active)

### 1. Summer Music Festival 2026

```yaml
project:
  name: "Summer Sounds Festival 2026"
  status: active
  phase: pre_production
  start_date: "2026-06-15"
  end_date: "2026-06-17"
  budget: 2500000
  
  milestones:
    - name: "Headliner Confirmed"
      date: "2026-02-01"
      status: completed
    - name: "Venue Contract Signed"
      date: "2026-02-15"
      status: completed
    - name: "Ticket Sales Launch"
      date: "2026-03-01"
      status: pending
    - name: "Production Load-In"
      date: "2026-06-13"
      status: pending
```

### 2. Corporate Conference

```yaml
project:
  name: "TechCorp Annual Summit"
  status: active
  phase: planning
  start_date: "2026-04-10"
  end_date: "2026-04-12"
  budget: 850000
```

### 3. Concert Tour (Multi-City)

```yaml
project:
  name: "Neon Dreams World Tour"
  status: active
  phase: active
  start_date: "2026-03-01"
  end_date: "2026-08-30"
  budget: 5000000
  
  events:
    - city: "New York"
      venue: "Madison Square Garden"
      date: "2026-03-15"
    - city: "Los Angeles"
      venue: "The Forum"
      date: "2026-03-22"
    - city: "Chicago"
      venue: "United Center"
      date: "2026-04-05"
```

### 4. Brand Activation

```yaml
project:
  name: "Nike Air Max Day Activation"
  status: planning
  phase: concept
  start_date: "2026-03-26"
  end_date: "2026-03-26"
  budget: 350000
```

### 5. Private Event

```yaml
project:
  name: "Johnson-Williams Wedding"
  status: active
  phase: pre_production
  start_date: "2026-05-20"
  end_date: "2026-05-20"
  budget: 125000
```

---

## Events (10 Total)

| Event | Type | Phase | Date | Venue | Capacity |
|-------|------|-------|------|-------|----------|
| Summer Sounds Day 1 | festival | pre_production | 2026-06-15 | Central Park | 50000 |
| Summer Sounds Day 2 | festival | pre_production | 2026-06-16 | Central Park | 50000 |
| Summer Sounds Day 3 | festival | pre_production | 2026-06-17 | Central Park | 50000 |
| TechCorp Keynote | conference | planning | 2026-04-10 | Javits Center | 5000 |
| TechCorp Workshops | conference | planning | 2026-04-11 | Javits Center | 2000 |
| Neon Dreams NYC | concert | active | 2026-03-15 | MSG | 20000 |
| Neon Dreams LA | concert | planning | 2026-03-22 | The Forum | 17500 |
| Nike Activation | activation | concept | 2026-03-26 | SoHo Pop-Up | 500 |
| Johnson Wedding | wedding | pre_production | 2026-05-20 | The Plaza | 250 |
| Quarterly Review | corporate | completed | 2026-01-15 | HQ Office | 100 |

---

## Tasks (50 Sample)

### By Status Distribution

| Status | Count | Examples |
|--------|-------|----------|
| backlog | 8 | Future planning items |
| todo | 15 | Ready to start |
| in_progress | 12 | Currently active |
| in_review | 5 | Pending approval |
| blocked | 2 | Waiting on dependencies |
| done | 8 | Completed |

### Sample Tasks

```yaml
tasks:
  - title: "Finalize headliner contract"
    status: done
    priority: urgent
    project: "Summer Sounds Festival"
    assignee: "David Kim"
    
  - title: "Design stage layout"
    status: in_progress
    priority: high
    project: "Summer Sounds Festival"
    assignee: "Emily Davis"
    
  - title: "Book catering vendors"
    status: todo
    priority: medium
    project: "TechCorp Summit"
    assignee: "Lisa Rodriguez"
    
  - title: "Create run of show"
    status: blocked
    priority: high
    project: "Neon Dreams Tour"
    blocked_reason: "Waiting for artist setlist"
```

---

## Assets (100 Items)

### Categories

| Category | Count | Value Range |
|----------|-------|-------------|
| Audio | 35 | $500 - $50,000 |
| Lighting | 25 | $200 - $25,000 |
| Video | 15 | $1,000 - $75,000 |
| Staging | 10 | $5,000 - $100,000 |
| Rigging | 8 | $500 - $15,000 |
| Power | 7 | $1,000 - $20,000 |

### Sample Assets

```yaml
assets:
  - name: "L-Acoustics K2 Line Array"
    category: Audio
    status: available
    purchase_price: 45000
    condition: excellent
    location: "Warehouse A"
    
  - name: "Robe MegaPointe"
    category: Lighting
    status: in_use
    assigned_event: "Neon Dreams NYC"
    quantity: 24
    
  - name: "ROE Visual CB5 LED Panels"
    category: Video
    status: reserved
    reserved_for: "Summer Sounds Festival"
    quantity: 200
```

---

## Crew & Workforce

### Departments

| Department | Head Count | Avg Rate |
|------------|------------|----------|
| Audio | 12 | $45/hr |
| Lighting | 10 | $42/hr |
| Video | 8 | $50/hr |
| Staging | 15 | $35/hr |
| Production | 6 | $65/hr |
| Hospitality | 8 | $28/hr |

### Certifications

```yaml
certifications:
  - name: "OSHA 30"
    required_for: [Staging, Rigging]
    validity: 60 months
    
  - name: "Rigging Certification"
    required_for: [Rigging]
    validity: 24 months
    
  - name: "Forklift License"
    required_for: [Staging, Warehouse]
    validity: 36 months
```

### Sample Crew Calls

```yaml
crew_calls:
  - name: "Summer Sounds Load-In Day 1"
    date: "2026-06-13"
    call_time: "06:00"
    positions:
      - role: "Audio Tech"
        quantity: 8
        rate: 45
      - role: "Lighting Tech"
        quantity: 6
        rate: 42
      - role: "Stagehand"
        quantity: 20
        rate: 35
```

---

## Finance Data

### Budgets

| Project | Budget | Committed | Actual | Variance |
|---------|--------|-----------|--------|----------|
| Summer Sounds | $2,500,000 | $1,850,000 | $1,200,000 | +$1,300,000 |
| TechCorp Summit | $850,000 | $420,000 | $180,000 | +$670,000 |
| Neon Dreams Tour | $5,000,000 | $3,200,000 | $2,100,000 | +$2,900,000 |

### Sample Invoices

```yaml
invoices:
  - number: "INV-2026-0042"
    client: "TechCorp Inc."
    amount: 425000
    status: sent
    due_date: "2026-02-28"
    
  - number: "INV-2026-0038"
    client: "Nike Brand Events"
    amount: 175000
    status: paid
    paid_date: "2026-01-20"
```

### Expenses

```yaml
expenses:
  - description: "Equipment rental - Audio"
    amount: 28500
    category: "Production Equipment"
    status: approved
    project: "Summer Sounds Festival"
    
  - description: "Travel - Site Survey"
    amount: 1250
    category: "Travel"
    status: submitted
    project: "TechCorp Summit"
```

---

## CRM Data

### Companies (25)

| Type | Count |
|------|-------|
| Client | 12 |
| Prospect | 8 |
| Vendor | 5 |

### Contacts (75)

| Role | Count |
|------|-------|
| Decision Maker | 20 |
| Influencer | 25 |
| Technical Contact | 15 |
| Billing Contact | 15 |

### Deals Pipeline

| Stage | Count | Value |
|-------|-------|-------|
| Qualification | 5 | $1.2M |
| Proposal | 3 | $850K |
| Negotiation | 2 | $1.5M |
| Closed Won | 8 | $4.2M |
| Closed Lost | 2 | $400K |

---

## Talent & Bookings

### Artists (15)

```yaml
talents:
  - name: "The Midnight Collective"
    type: band
    genre: "Electronic/Synth"
    fee_range: "$75,000 - $150,000"
    booking_status: confirmed
    
  - name: "DJ Aurora"
    type: dj
    genre: "House/Techno"
    fee_range: "$25,000 - $50,000"
    booking_status: available
    
  - name: "Sarah Mitchell"
    type: speaker
    genre: "Tech/Innovation"
    fee_range: "$15,000 - $30,000"
    booking_status: confirmed
```

### Bookings

| Artist | Event | Fee | Status |
|--------|-------|-----|--------|
| The Midnight Collective | Summer Sounds Day 2 | $125,000 | contracted |
| DJ Aurora | Summer Sounds Day 1 | $35,000 | confirmed |
| Neon Dreams | Tour (All Dates) | $2,500,000 | contracted |

---

## Tickets & Experience

### Ticket Types (Summer Sounds)

| Type | Price | Quantity | Sold |
|------|-------|----------|------|
| General Admission | $150 | 40,000 | 28,500 |
| VIP | $450 | 5,000 | 3,200 |
| Platinum | $1,200 | 500 | 420 |
| Artist Guest | $0 | 200 | 85 |

### Guest Lists

```yaml
guest_lists:
  - name: "Artist Guest List - Day 2"
    type: artist
    max_guests: 50
    entries: 32
    
  - name: "Sponsor VIP - TechCorp"
    type: sponsor
    max_guests: 100
    entries: 75
```

---

## KPIs & Metrics

### Dashboard Widgets

```yaml
kpis:
  revenue:
    ytd: 8500000
    target: 12000000
    trend: "+15%"
    
  projects:
    active: 5
    on_track: 4
    at_risk: 1
    
  utilization:
    crew: "78%"
    assets: "65%"
    
  tickets:
    sold: 32205
    revenue: 5842500
    
  pipeline:
    value: 3950000
    weighted: 2150000
```

---

## Seed Data SQL

```sql
-- See: supabase/migrations/00011_seed_data.sql
-- Contains full INSERT statements for all demo data
-- Run with: supabase db reset
```
