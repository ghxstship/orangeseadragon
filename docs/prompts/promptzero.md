# 🧭 MASTER BUILD PROMPT — SURGICAL ENTERPRISE-GRADE SPECIFICATION

## Unified Operations Platform
### ATLVS (Web B2B) · COMPVSS (Mobile B2B/B2C) · GVTEWAY (Web B2C)
### Supabase · Vercel · OpenAPI 3.1 · Google OAuth

---

## 0. PREAMBLE & EXECUTION CONTRACT

**THIS DOCUMENT IS THE SINGLE SOURCE OF TRUTH FOR ALL BUILD DECISIONS.**

### 0.1 Platform Vision

Build a **unified operations platform** that consolidates nine management domains into a single, cohesive system:

| Domain | Description | Primary Users |
|--------|-------------|---------------|
| **Project Management** | Tasks, milestones, dependencies, sprints, deliverables | All roles |
| **Live Production Management** | Event lifecycle, show calls, runsheets, cue sheets, stage management | Production teams |
| **Workforce Management** | Scheduling, timesheets, availability, certifications, crew calls | HR, Operations |
| **Asset Management** | Equipment, inventory, maintenance, check-in/out, depreciation | Operations, Finance |
| **Finance Management** | Budgets, invoices, expenses, purchase orders, payroll, contracts | Finance, Executive |
| **Content Management** | Digital assets, brand guidelines, marketing materials, publications | Marketing, Creative |
| **Business Management** | CRM, sales pipeline, proposals, contracts, client relationships | Sales, Executive |
| **Experience Management** | Events, hospitality, F&B, ticketing, guest services, community | Experience, Operations |
| **Talent Management** | Artists, performers, booking, riders, scheduling, payments | Talent, Production |

### 0.2 Execution Rules

```
DETERMINISTIC: Every output must be reproducible given identical inputs
EXPLICIT: No inference, assumption, or placeholder permitted
ATOMIC: Each phase must complete fully before proceeding
VALIDATED: Inline self-checks must pass before phase advancement
TRACEABLE: Every UI element, API endpoint, and database field must trace to this specification
```

### 0.3 Halt Conditions

```
├── Schema validation failure
├── IA entity mismatch
├── Missing foreign key constraint
├── Undefined workflow reference
├── Orphaned UI component (no backing entity)
├── RLS policy gap
├── OpenAPI spec divergence from schema
├── Navigation item without backing module
└── Any TODO, FIXME, or placeholder string
```

### 0.4 Success Criteria

```
├── All 287 database tables created with constraints
├── All 142 RLS policies applied
├── All 456 OpenAPI endpoints implemented
├── All 73 workflow templates functional
├── All 12 view types rendering across all entities
├── All 13 toolbar actions operational
├── All 9 management domains fully functional
├── Navigation structure complete (Top Bar, Sidebar, Mobile)
├── Demo data seeded and navigable
├── WCAG 2.2 AAA audit passing
└── Zero runtime errors on fresh deploy
```

---

## 1. CORE PRINCIPLES

### 1.1 Single Source of Truth (SSOT)

```typescript
const SSOT_HIERARCHY = {
  L1_AUTHORITATIVE: 'This Prompt Document',
  L2_SCHEMA: 'Supabase SQL Schema',
  L3_CONTRACT: 'OpenAPI 3.1 Specification',
  L4_TYPES: 'Generated TypeScript Types',
  L5_UI: 'React Components (derived)',
} as const;

// Conflict Resolution: Lower level ALWAYS yields to higher level
```

### 1.2 Third Normal Form (3NF) Database

- No repeating groups (no arrays for relational data)
- No partial dependencies
- No transitive dependencies
- All denormalization must be justified and documented

### 1.3 Multi-Tenant Architecture

- Every tenant-scoped table includes `organization_id`
- RLS policies enforce tenant isolation
- Cross-tenant access is impossible at database level

### 1.4 API-First Contract

- OpenAPI 3.1 specification is authoritative
- All implementations must match spec exactly
- Contract testing validates API against spec

### 1.5 Configuration Over Code

- Views, workflows, fields are config-driven
- No hardcoded business logic
- White-label ready by default

---

## 2. TECHNOLOGY STACK

### 2.1 Frontend (ATLVS Web)

```json
{
  "next": "14.2.x",
  "react": "18.3.x",
  "typescript": "5.4.x",
  "tailwindcss": "3.4.x",
  "@tanstack/react-query": "5.x",
  "@tanstack/react-table": "8.x",
  "zustand": "4.5.x",
  "react-hook-form": "7.51.x",
  "zod": "3.23.x",
  "@supabase/supabase-js": "2.43.x",
  "date-fns": "3.6.x",
  "lucide-react": "0.378.x",
  "@dnd-kit/core": "6.1.x",
  "recharts": "2.12.x",
  "cmdk": "1.0.x",
  "@radix-ui/react-*": "latest"
}
```

### 2.2 Mobile (COMPVSS)

```json
{
  "expo": "~51.0.x",
  "react-native": "0.74.x",
  "expo-router": "~3.5.x",
  "react-native-reanimated": "~3.10.x",
  "@gorhom/bottom-sheet": "^4.6.x",
  "expo-camera": "~15.0.x",
  "expo-barcode-scanner": "~13.0.x",
  "react-native-mmkv": "2.12.x"
}
```

### 2.3 Backend (Supabase)

```yaml
Extensions:
  - uuid-ossp
  - pgcrypto
  - pg_trgm
  - btree_gin
  - pg_stat_statements
  - ltree

Auth:
  providers: [google]
  jwt_expiry: 3600
  refresh_token_rotation: true

Storage Buckets:
  - avatars (public, 5MB)
  - attachments (private, 50MB)
  - exports (private, 100MB)
  - media (private, 500MB)
  - brand-assets (private, 20MB)
```

### 2.4 Deployment (Vercel)

```yaml
Framework: nextjs
Regions: [iad1, sfo1, cdg1]
Functions:
  maxDuration: 30
  memory: 1024
Crons:
  - /api/cron/workflow-scheduler (*/5 * * * *)
  - /api/cron/notification-digest (0 9 * * *)
  - /api/cron/data-retention (0 2 * * *)
  - /api/cron/scheduled-reports (0 6 * * 1)
```

---

## 3. INFORMATION ARCHITECTURE — COMPLETE NAVIGATION SPECIFICATION

### 3.1 Top Bar Navigation

```yaml
TopBarNav:
  Left:
    - Breadcrumbs:
        component: BreadcrumbTrail
        behavior: Dynamic path based on current location
        max_items: 4
        truncation: middle
        
  Center:
    - AICommandBar:
        component: CommandPalette
        shortcut: Cmd+K / Ctrl+K
        features:
          - Global search (entities, documents, people)
          - Quick actions (create task, schedule meeting)
          - AI assistant (natural language commands)
          - Navigation shortcuts
          - Recent items
        placeholder: "Search or type a command..."
        
  Right:
    - Notifications:
        component: NotificationCenter
        icon: Bell
        badge: unread_count
        dropdown:
          - All notifications
          - Mentions
          - Assigned to me
          - Due soon
          - System alerts
        actions: [mark_read, archive, settings]
        
    - Inbox:
        component: InboxTray
        icon: Inbox
        badge: unread_count
        sections:
          - Messages
          - Approvals pending
          - Review requests
          - Mentions
          
    - Settings:
        component: SettingsMenu
        icon: Settings
        dropdown:
          - Workspace settings
          - Integrations
          - API keys
          - Webhooks
          - Import/Export
          
    - Support:
        component: SupportWidget
        icon: HelpCircle
        dropdown:
          - Documentation
          - Video tutorials
          - Contact support
          - Report bug
          - Feature request
          - System status
          
    - Language:
        component: LanguageSelector
        icon: Globe
        options: [en, es, fr, de, pt, zh, ja, ko, ar]
        
    - Theme:
        component: ThemeToggle
        icon: Sun/Moon
        options: [light, dark, system]
        
    - User:
        component: UserMenu
        display: Avatar + Name
        dropdown:
          - View profile
          - Account settings
          - Preferences
          - Activity log
          - Switch organization
          - Sign out
```

### 3.2 Sidebar Navigation — Complete Module Structure

```yaml
SidebarNav:
  behavior:
    collapsible: true
    persist_state: true
    shortcuts: true
    favorites: true
    
  sections:
    
    # ═══════════════════════════════════════════
    # CORE SECTION
    # ═══════════════════════════════════════════
    Core:
      icon_style: filled
      default_expanded: true
      
      Dashboard:
        path: /dashboard
        icon: LayoutDashboard
        description: Overview and key metrics
        permission: dashboard.read
        features:
          - Customizable widgets
          - Real-time metrics
          - Activity feed
          - Quick actions
          - Alerts summary
        subpages:
          - /dashboard/overview
          - /dashboard/analytics
          - /dashboard/activity
          
      Calendar:
        path: /calendar
        icon: Calendar
        description: Unified calendar across all modules
        permission: calendar.read
        features:
          - Multi-view (day, week, month, year, agenda)
          - Resource scheduling
          - Availability overlay
          - Recurring events
          - External calendar sync
          - Room/equipment booking
        subpages:
          - /calendar/schedule
          - /calendar/availability
          - /calendar/resources
          - /calendar/bookings
        entities:
          - calendar_events
          - calendar_resources
          - calendar_bookings
          - availability_windows
          
      Tasks:
        path: /tasks
        icon: CheckSquare
        description: Task management across all projects
        permission: tasks.read
        features:
          - Multiple views (list, board, calendar, timeline)
          - Custom fields
          - Dependencies
          - Time tracking
          - Subtasks (unlimited depth)
          - Templates
          - Automations
        subpages:
          - /tasks/my-tasks
          - /tasks/assigned
          - /tasks/watching
          - /tasks/completed
          - /tasks/templates
        views: [list, table, board, calendar, timeline, gantt]
        toolbar: [search, filter, sort, group, fields, view, import, export, scan, create, bulk, refresh]
        entities:
          - tasks
          - subtasks
          - task_lists
          - task_dependencies
          - task_assignments
          - task_time_entries
          - task_templates
          
      Workflows:
        path: /workflows
        icon: GitBranch
        description: Automation and process management
        permission: workflows.read
        features:
          - Visual workflow builder
          - Trigger configuration
          - Conditional logic
          - Multi-stage approvals
          - Notifications
          - Integrations
          - Version history
          - Run monitoring
        subpages:
          - /workflows/active
          - /workflows/drafts
          - /workflows/runs
          - /workflows/templates
          - /workflows/builder
        entities:
          - workflow_definitions
          - workflow_versions
          - workflow_triggers
          - workflow_conditions
          - workflow_actions
          - workflow_runs
          - workflow_run_steps
          - approval_workflows
          - approval_stages
          - approval_requests
          
      Assets:
        path: /assets
        icon: Package
        description: Equipment and inventory management
        permission: assets.read
        features:
          - Asset registry
          - QR/Barcode/RFID tracking
          - Check-in/out workflow
          - Maintenance scheduling
          - Depreciation tracking
          - Location tracking
          - Assignment history
          - Condition monitoring
        subpages:
          - /assets/inventory
          - /assets/checked-out
          - /assets/maintenance
          - /assets/locations
          - /assets/categories
          - /assets/kits
        views: [list, table, board, calendar, map]
        toolbar: [search, filter, sort, group, fields, view, import, export, scan, create, bulk, refresh]
        entities:
          - assets
          - asset_categories
          - asset_locations
          - asset_assignments
          - asset_maintenance
          - asset_check_in_out
          - asset_kits
          - asset_kit_items
          - inventory_items
          - inventory_transactions
          
      Documents:
        path: /documents
        icon: FileText
        description: Document and knowledge management
        permission: documents.read
        features:
          - Rich text editor
          - Real-time collaboration
          - Version history
          - Templates
          - Nested folders
          - Full-text search
          - Comments and mentions
          - Export (PDF, DOCX, MD)
        subpages:
          - /documents/all
          - /documents/recent
          - /documents/shared
          - /documents/templates
          - /documents/trash
        entities:
          - documents
          - document_versions
          - document_blocks
          - document_collaborators
          - document_comments
          - document_folders
          
    # ═══════════════════════════════════════════
    # TEAM SECTION
    # ═══════════════════════════════════════════
    Team:
      icon_style: outlined
      default_expanded: true
      
      Projects:
        path: /projects
        icon: FolderKanban
        description: Project portfolio management
        permission: projects.read
        features:
          - Hierarchical projects
          - Custom statuses
          - Budget tracking
          - Timeline/Gantt
          - Resource allocation
          - Risk register
          - Milestones
          - Dependencies
        subpages:
          - /projects/active
          - /projects/planning
          - /projects/completed
          - /projects/archived
          - /projects/templates
        views: [list, table, board, calendar, timeline, gantt, workload]
        entities:
          - projects
          - project_members
          - project_phases
          - project_milestones
          - project_risks
          - project_budgets
          - project_templates
          
      Programs:
        path: /programs
        icon: Layers
        description: Program and portfolio management
        permission: programs.read
        features:
          - Multi-project grouping
          - Cross-project dependencies
          - Aggregate reporting
          - Resource sharing
          - Strategic alignment
        subpages:
          - /programs/active
          - /programs/planning
          - /programs/review
        entities:
          - programs
          - program_projects
          - program_objectives
          - program_metrics
          
      People:
        path: /people
        icon: Users
        description: Workforce and team management
        permission: people.read
        features:
          - Team directory
          - Org chart
          - Skills matrix
          - Availability calendar
          - Certifications
          - Performance tracking
          - Crew calls
          - Contractor management
        subpages:
          - /people/directory
          - /people/teams
          - /people/org-chart
          - /people/availability
          - /people/certifications
          - /people/contractors
          - /people/crew-calls
        views: [list, table, board, calendar, org-chart]
        entities:
          - users
          - user_profiles
          - teams
          - team_members
          - departments
          - positions
          - certifications
          - user_certifications
          - availability_windows
          - crew_calls
          - crew_call_responses
          - contractors
          - contractor_agreements
          
      Products:
        path: /products
        icon: Box
        description: Product and service catalog
        permission: products.read
        features:
          - Service catalog
          - Package builder
          - Pricing tiers
          - Inventory link
          - Vendor catalog
        subpages:
          - /products/services
          - /products/packages
          - /products/catalog
          - /products/pricing
        entities:
          - products
          - product_categories
          - product_variants
          - product_pricing
          - service_packages
          - package_items
          
      Places:
        path: /places
        icon: MapPin
        description: Venue and location management
        permission: places.read
        features:
          - Venue database
          - Floor plans
          - Capacity management
          - Equipment specs
          - Contact management
          - Booking calendar
          - Site surveys
        subpages:
          - /places/venues
          - /places/spaces
          - /places/floor-plans
          - /places/surveys
        views: [list, table, map]
        entities:
          - venues
          - venue_spaces
          - venue_contacts
          - venue_equipment
          - floor_plans
          - site_surveys
          - venue_bookings
          
      Procedures:
        path: /procedures
        icon: ClipboardList
        description: SOPs and operational procedures
        permission: procedures.read
        features:
          - Step-by-step procedures
          - Checklists
          - Acknowledgment tracking
          - Version control
          - Training materials
          - Compliance tracking
        subpages:
          - /procedures/active
          - /procedures/drafts
          - /procedures/checklists
          - /procedures/training
        entities:
          - procedures
          - procedure_steps
          - procedure_acknowledgments
          - checklists
          - checklist_items
          - checklist_completions
          - training_materials
          - training_completions
          
    # ═══════════════════════════════════════════
    # MANAGEMENT SECTION
    # ═══════════════════════════════════════════
    Management:
      icon_style: outlined
      default_expanded: false
      
      Forecast:
        path: /forecast
        icon: TrendingUp
        description: Financial and resource forecasting
        permission: forecast.read
        features:
          - Revenue projections
          - Cost forecasting
          - Resource demand
          - Capacity planning
          - Scenario modeling
          - Budget vs actual
        subpages:
          - /forecast/revenue
          - /forecast/costs
          - /forecast/resources
          - /forecast/scenarios
        entities:
          - forecasts
          - forecast_periods
          - forecast_items
          - forecast_scenarios
          - budget_vs_actual
          
      Pipeline:
        path: /pipeline
        icon: Filter
        description: Sales and opportunity pipeline
        permission: pipeline.read
        features:
          - Deal stages
          - Win probability
          - Revenue tracking
          - Activity logging
          - Contact management
          - Proposal generation
        subpages:
          - /pipeline/deals
          - /pipeline/contacts
          - /pipeline/companies
          - /pipeline/activities
          - /pipeline/proposals
        views: [list, table, board, funnel]
        entities:
          - deals
          - deal_stages
          - deal_activities
          - contacts
          - companies
          - proposals
          - proposal_items
          - proposal_versions
          
      Jobs:
        path: /jobs
        icon: Briefcase
        description: Job and gig management
        permission: jobs.read
        features:
          - Job postings
          - Shift scheduling
          - Time tracking
          - Payroll integration
          - Performance reviews
          - Crew coordination
        subpages:
          - /jobs/active
          - /jobs/shifts
          - /jobs/timesheets
          - /jobs/payroll
          - /jobs/reviews
        views: [list, table, calendar, timeline]
        entities:
          - jobs
          - job_positions
          - job_applications
          - shifts
          - shift_assignments
          - timesheets
          - timesheet_entries
          - payroll_runs
          - payroll_items
          - performance_reviews
          
      Procurement:
        path: /procurement
        icon: ShoppingCart
        description: Purchasing and vendor management
        permission: procurement.read
        features:
          - Purchase requisitions
          - Purchase orders
          - Vendor management
          - RFQ/RFP process
          - Invoice matching
          - Spend analytics
        subpages:
          - /procurement/requisitions
          - /procurement/orders
          - /procurement/vendors
          - /procurement/rfq
          - /procurement/invoices
        views: [list, table, board]
        entities:
          - purchase_requisitions
          - requisition_items
          - purchase_orders
          - purchase_order_items
          - vendors
          - vendor_contacts
          - vendor_ratings
          - rfq_requests
          - rfq_responses
          - invoices
          - invoice_items
          - invoice_payments
          
      Content:
        path: /content
        icon: Image
        description: Digital asset and content management
        permission: content.read
        features:
          - Media library
          - Brand guidelines
          - Marketing materials
          - Social media calendar
          - Content approvals
          - Version control
        subpages:
          - /content/media
          - /content/brand
          - /content/marketing
          - /content/social
          - /content/approvals
        views: [list, grid, calendar]
        entities:
          - media_assets
          - media_folders
          - media_tags
          - brand_guidelines
          - marketing_campaigns
          - marketing_materials
          - social_posts
          - social_accounts
          - content_approvals
          
      Compliance:
        path: /compliance
        icon: Shield
        description: Compliance and risk management
        permission: compliance.read
        features:
          - Policy management
          - Audit trails
          - Risk register
          - Incident reporting
          - Training tracking
          - Certification management
        subpages:
          - /compliance/policies
          - /compliance/audits
          - /compliance/risks
          - /compliance/incidents
          - /compliance/training
        entities:
          - compliance_policies
          - policy_acknowledgments
          - audit_schedules
          - audit_findings
          - risk_assessments
          - risk_mitigations
          - incidents
          - incident_reports
          
      Reports:
        path: /reports
        icon: BarChart3
        description: Reporting and analytics
        permission: reports.read
        features:
          - Report builder
          - Scheduled reports
          - Export formats
          - Data visualization
          - Custom metrics
          - Dashboards
        subpages:
          - /reports/library
          - /reports/scheduled
          - /reports/builder
          - /reports/exports
        entities:
          - reports
          - report_definitions
          - report_schedules
          - report_exports
          - report_subscriptions
          
      Insights:
        path: /insights
        icon: Lightbulb
        description: AI-powered analytics and recommendations
        permission: insights.read
        features:
          - Trend analysis
          - Anomaly detection
          - Predictive analytics
          - Recommendations
          - Performance benchmarks
        subpages:
          - /insights/trends
          - /insights/anomalies
          - /insights/predictions
          - /insights/recommendations
        entities:
          - insight_reports
          - anomaly_alerts
          - predictions
          - recommendations
          
    # ═══════════════════════════════════════════
    # NETWORK SECTION (B2C / Community)
    # ═══════════════════════════════════════════
    Network:
      icon_style: outlined
      default_expanded: false
      visibility: gvteway_enabled
      
      Showcase:
        path: /showcase
        icon: Award
        description: Portfolio and work showcase
        permission: showcase.read
        public_access: true
        features:
          - Project galleries
          - Case studies
          - Testimonials
          - Awards/recognition
          - Media coverage
        subpages:
          - /showcase/portfolio
          - /showcase/case-studies
          - /showcase/testimonials
          - /showcase/press
        entities:
          - showcase_items
          - case_studies
          - testimonials
          - press_mentions
          
      Discussions:
        path: /discussions
        icon: MessageSquare
        description: Community forums and discussions
        permission: discussions.read
        public_access: configurable
        features:
          - Topic threads
          - Categories
          - Moderation tools
          - Reactions
          - Rich media
        subpages:
          - /discussions/all
          - /discussions/my-posts
          - /discussions/categories
        entities:
          - discussion_categories
          - discussion_threads
          - discussion_posts
          - discussion_reactions
          - discussion_reports
          
      Challenges:
        path: /challenges
        icon: Trophy
        description: Competitions and challenges
        permission: challenges.read
        public_access: true
        features:
          - Challenge creation
          - Submissions
          - Voting
          - Leaderboards
          - Prizes
        subpages:
          - /challenges/active
          - /challenges/past
          - /challenges/my-entries
          - /challenges/leaderboard
        entities:
          - challenges
          - challenge_submissions
          - challenge_votes
          - challenge_prizes
          
      Marketplace:
        path: /marketplace
        icon: Store
        description: Services and product marketplace
        permission: marketplace.read
        public_access: true
        features:
          - Service listings
          - Vendor profiles
          - Reviews/ratings
          - Booking
          - Payments
        subpages:
          - /marketplace/browse
          - /marketplace/my-listings
          - /marketplace/bookings
          - /marketplace/reviews
        entities:
          - marketplace_listings
          - marketplace_categories
          - listing_reviews
          - listing_bookings
          - vendor_profiles
          
      Opportunities:
        path: /opportunities
        icon: Compass
        description: Job board and opportunities
        permission: opportunities.read
        public_access: true
        features:
          - Job postings
          - Gig listings
          - Collaboration requests
          - Applications
        subpages:
          - /opportunities/jobs
          - /opportunities/gigs
          - /opportunities/collaborations
          - /opportunities/my-applications
        entities:
          - opportunity_listings
          - opportunity_applications
          - collaboration_requests
          
      Connections:
        path: /connections
        icon: Link
        description: Professional networking
        permission: connections.read
        public_access: configurable
        features:
          - Profile directory
          - Connection requests
          - Messaging
          - Groups
          - Events
        subpages:
          - /connections/network
          - /connections/requests
          - /connections/groups
          - /connections/events
        entities:
          - user_connections
          - connection_requests
          - network_groups
          - group_members
          - network_events
          
    # ═══════════════════════════════════════════
    # ACCOUNT SECTION
    # ═══════════════════════════════════════════
    Account:
      icon_style: outlined
      default_expanded: false
      
      Profile:
        path: /account/profile
        icon: User
        description: Personal profile management
        permission: profile.read
        features:
          - Profile editing
          - Skills/expertise
          - Portfolio
          - Availability
          - Preferences
        entities:
          - user_profiles
          - user_skills
          - user_portfolio
          - user_preferences
          
      Organization:
        path: /account/organization
        icon: Building2
        description: Organization settings
        permission: organization.manage
        features:
          - Organization details
          - Branding
          - Departments
          - Roles & permissions
          - Custom fields
          - Integrations
        subpages:
          - /account/organization/settings
          - /account/organization/branding
          - /account/organization/departments
          - /account/organization/roles
          - /account/organization/fields
          - /account/organization/integrations
        entities:
          - organizations
          - organization_settings
          - departments
          - roles
          - permissions
          - custom_field_definitions
          - integrations
          
      Billing:
        path: /account/billing
        icon: CreditCard
        description: Subscription and billing management
        permission: billing.manage
        features:
          - Current plan
          - Usage metrics
          - Payment methods
          - Invoices
          - Upgrade/downgrade
        subpages:
          - /account/billing/subscription
          - /account/billing/usage
          - /account/billing/payment-methods
          - /account/billing/invoices
        entities:
          - subscriptions
          - subscription_usage
          - payment_methods
          - billing_invoices
          
      History:
        path: /account/history
        icon: History
        description: Activity and audit history
        permission: history.read
        features:
          - Activity log
          - Login history
          - Changes made
          - Export history
        subpages:
          - /account/history/activity
          - /account/history/logins
          - /account/history/changes
        entities:
          - audit_logs
          - login_history
          - change_history
          
      Resources:
        path: /account/resources
        icon: BookOpen
        description: Help and learning resources
        permission: resources.read
        features:
          - Documentation
          - Video tutorials
          - API reference
          - Templates
          - Community
        subpages:
          - /account/resources/docs
          - /account/resources/videos
          - /account/resources/api
          - /account/resources/templates
          
      Platform:
        path: /account/platform
        icon: Cpu
        description: Platform configuration
        permission: platform.manage
        features:
          - Feature flags
          - API keys
          - Webhooks
          - Custom domains
          - Data export
        subpages:
          - /account/platform/features
          - /account/platform/api-keys
          - /account/platform/webhooks
          - /account/platform/domains
          - /account/platform/export
        entities:
          - feature_flags
          - api_keys
          - webhooks
          - webhook_deliveries
          - custom_domains
          
      Support:
        path: /account/support
        icon: LifeBuoy
        description: Help and support
        permission: support.access
        features:
          - Submit ticket
          - Knowledge base
          - Live chat
          - System status
        subpages:
          - /account/support/tickets
          - /account/support/knowledge-base
          - /account/support/status
        entities:
          - support_tickets
          - ticket_messages
          - knowledge_articles
```

### 3.3 Mobile Bottom Navigation (COMPVSS)

```yaml
MobileBottomNav:
  position: fixed
  safe_area: true
  haptic_feedback: true
  
  items:
    - Dashboard:
        path: /dashboard
        icon: LayoutDashboard
        active_icon: LayoutDashboard (filled)
        
    - Calendar:
        path: /calendar
        icon: Calendar
        active_icon: Calendar (filled)
        badge: today_events_count
        
    - Tasks:
        path: /tasks
        icon: CheckSquare
        active_icon: CheckSquare (filled)
        badge: overdue_count
        
    - Workflows:
        path: /workflows
        icon: GitBranch
        active_icon: GitBranch (filled)
        badge: pending_approvals
        
    - Inbox:
        path: /inbox
        icon: Inbox
        active_icon: Inbox (filled)
        badge: unread_count
        
    - More:
        path: null
        icon: MoreHorizontal
        action: open_more_menu
        
MoreMenu:
  behavior: bottom_sheet
  sections:
    - Core:
        - Assets
        - Documents
    - Team:
        - Projects
        - Programs
        - People
        - Products
        - Places
        - Procedures
    - Quick Actions:
        - Scan QR/Barcode
        - New Task
        - New Note
        - Time Entry
    - Account:
        - Profile
        - Settings
        - Sign Out
```

---

## 4. MANAGEMENT DOMAIN SPECIFICATIONS

### 4.1 Project Management Domain

```yaml
ProjectManagement:
  description: Comprehensive project and task management
  
  entities:
    projects:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - workspace_id: UUID FK workspaces
        - parent_id: UUID FK projects (self-reference)
        - name: VARCHAR(255) NOT NULL
        - slug: VARCHAR(100) NOT NULL UNIQUE
        - description: TEXT
        - status: ENUM (draft, planning, active, on_hold, completed, cancelled, archived)
        - visibility: ENUM (private, team, organization, public)
        - priority: ENUM (critical, high, medium, low)
        - color: VARCHAR(7)
        - icon: VARCHAR(50)
        - start_date: DATE
        - end_date: DATE
        - budget_amount: DECIMAL(12,2)
        - budget_currency: VARCHAR(3)
        - settings: JSONB
        - metadata: JSONB
        - created_at: TIMESTAMPTZ
        - updated_at: TIMESTAMPTZ
        - created_by: UUID FK users
        - deleted_at: TIMESTAMPTZ
        
    tasks:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - project_id: UUID FK projects
        - task_list_id: UUID FK task_lists
        - parent_id: UUID FK tasks (subtasks)
        - title: VARCHAR(500) NOT NULL
        - description: TEXT
        - status: ENUM (backlog, todo, in_progress, in_review, blocked, done, cancelled)
        - priority: ENUM (urgent, high, medium, low, none)
        - task_type: ENUM (task, bug, feature, epic, story, milestone)
        - position: FLOAT
        - depth: INTEGER DEFAULT 0
        - start_date: TIMESTAMPTZ
        - due_date: TIMESTAMPTZ
        - completed_at: TIMESTAMPTZ
        - estimated_hours: DECIMAL(10,2)
        - logged_hours: DECIMAL(10,2)
        - custom_id: VARCHAR(50)
        - tags: TEXT[]
        - created_at: TIMESTAMPTZ
        - updated_at: TIMESTAMPTZ
        - created_by: UUID FK users
        - deleted_at: TIMESTAMPTZ
        
    task_dependencies:
      fields:
        - id: UUID PRIMARY KEY
        - task_id: UUID FK tasks
        - depends_on_task_id: UUID FK tasks
        - dependency_type: ENUM (finish_to_start, start_to_start, finish_to_finish, start_to_finish)
        - lag_hours: INTEGER DEFAULT 0
        
    milestones:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - project_id: UUID FK projects
        - name: VARCHAR(255) NOT NULL
        - description: TEXT
        - due_date: DATE NOT NULL
        - status: ENUM (pending, completed, missed)
        - completed_at: TIMESTAMPTZ
        
  workflows:
    - task_created: Notify assignees, update project metrics
    - task_status_changed: Update dependencies, notify watchers
    - task_overdue: Send reminders, escalate if needed
    - milestone_approaching: Send notifications, generate report
    - project_budget_exceeded: Alert project manager, pause spending
    
  views:
    - list: Standard list with grouping
    - table: Spreadsheet-style with inline editing
    - board: Kanban by status/assignee/priority
    - calendar: Tasks by due date
    - timeline: Gantt chart with dependencies
    - workload: Resource allocation view
```

### 4.2 Live Production Management Domain

```yaml
LiveProductionManagement:
  description: Event lifecycle, show management, and production operations
  
  entities:
    events:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - project_id: UUID FK projects
        - name: VARCHAR(255) NOT NULL
        - slug: VARCHAR(100) NOT NULL
        - description: TEXT
        - event_type: ENUM (festival, conference, concert, activation, corporate, wedding, private, tour, production)
        - phase: ENUM (concept, planning, pre_production, setup, active, live, teardown, post_mortem, archived)
        - start_date: TIMESTAMPTZ NOT NULL
        - end_date: TIMESTAMPTZ NOT NULL
        - doors_open: TIMESTAMPTZ
        - setup_start: DATE
        - teardown_end: DATE
        - venue_id: UUID FK venues
        - is_virtual: BOOLEAN
        - virtual_platform_url: TEXT
        - expected_attendance: INTEGER
        - max_capacity: INTEGER
        - is_public: BOOLEAN
        - public_url: VARCHAR(255)
        - settings: JSONB
        - created_at: TIMESTAMPTZ
        - updated_at: TIMESTAMPTZ
        - deleted_at: TIMESTAMPTZ
        
    event_phases:
      fields:
        - id: UUID PRIMARY KEY
        - event_id: UUID FK events
        - phase: ENUM (same as above)
        - started_at: TIMESTAMPTZ
        - completed_at: TIMESTAMPTZ
        - notes: TEXT
        - transitioned_by: UUID FK users
        
    show_calls:
      description: Daily production schedules
      fields:
        - id: UUID PRIMARY KEY
        - event_id: UUID FK events
        - date: DATE NOT NULL
        - call_time: TIME NOT NULL
        - venue_open: TIME
        - doors_open: TIME
        - show_start: TIME
        - show_end: TIME
        - venue_close: TIME
        - notes: TEXT
        - weather_contingency: TEXT
        - status: ENUM (draft, published, active, completed)
        
    runsheets:
      description: Minute-by-minute event flow
      fields:
        - id: UUID PRIMARY KEY
        - event_id: UUID FK events
        - show_call_id: UUID FK show_calls
        - name: VARCHAR(255)
        - version: INTEGER
        - status: ENUM (draft, approved, active, locked)
        
    runsheet_items:
      fields:
        - id: UUID PRIMARY KEY
        - runsheet_id: UUID FK runsheets
        - position: INTEGER
        - scheduled_time: TIME NOT NULL
        - duration_minutes: INTEGER
        - item_type: ENUM (performance, transition, break, announcement, technical, ceremony, speech, other)
        - title: VARCHAR(255) NOT NULL
        - description: TEXT
        - location_id: UUID FK venue_spaces
        - responsible_department: UUID FK departments
        - notes: TEXT
        - technical_notes: TEXT
        - backup_plan: TEXT
        - actual_start: TIME
        - actual_end: TIME
        - status: ENUM (pending, in_progress, completed, skipped, delayed)
        
    cue_sheets:
      description: Technical cue lists for production
      fields:
        - id: UUID PRIMARY KEY
        - event_id: UUID FK events
        - department: ENUM (lighting, audio, video, pyro, sfx, rigging, staging)
        - name: VARCHAR(255)
        - version: INTEGER
        
    cue_items:
      fields:
        - id: UUID PRIMARY KEY
        - cue_sheet_id: UUID FK cue_sheets
        - cue_number: VARCHAR(20) NOT NULL
        - cue_type: ENUM (go, standby, warning, hold, cut)
        - trigger_type: ENUM (manual, timecode, midi, osc, follow)
        - trigger_value: VARCHAR(100)
        - description: TEXT NOT NULL
        - duration: VARCHAR(20)
        - notes: TEXT
        - position: INTEGER
        
    stage_plots:
      description: Stage layout configurations
      fields:
        - id: UUID PRIMARY KEY
        - event_id: UUID FK events
        - venue_space_id: UUID FK venue_spaces
        - name: VARCHAR(255)
        - layout_data: JSONB # SVG or coordinate data
        - equipment_placements: JSONB
        - input_list: JSONB
        
  workflows:
    - event_phase_transition: Validate prerequisites, notify stakeholders, trigger checklists
    - show_call_published: Notify all departments, distribute schedules
    - runsheet_item_delayed: Adjust subsequent items, notify affected parties
    - cue_executed: Log timestamp, update runsheet status
    
  views:
    - timeline: Visual show timeline
    - calendar: Multi-day event calendar
    - runsheet: Live runsheet view with status
    - stage_plot: Interactive stage layout
```

### 4.3 Workforce Management Domain

```yaml
WorkforceManagement:
  description: Scheduling, timekeeping, certifications, and crew management
  
  entities:
    crew_calls:
      description: Crew scheduling and call sheets
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - event_id: UUID FK events
        - project_id: UUID FK projects
        - name: VARCHAR(255) NOT NULL
        - date: DATE NOT NULL
        - call_time: TIME NOT NULL
        - end_time: TIME
        - location_id: UUID FK venues
        - notes: TEXT
        - uniform_requirements: TEXT
        - meal_info: TEXT
        - parking_info: TEXT
        - status: ENUM (draft, published, confirmed, active, completed, cancelled)
        - published_at: TIMESTAMPTZ
        - created_by: UUID FK users
        
    crew_call_positions:
      fields:
        - id: UUID PRIMARY KEY
        - crew_call_id: UUID FK crew_calls
        - position_id: UUID FK positions
        - department_id: UUID FK departments
        - quantity_needed: INTEGER
        - quantity_confirmed: INTEGER
        - call_time: TIME
        - rate_type: ENUM (hourly, daily, flat)
        - rate_amount: DECIMAL(10,2)
        - notes: TEXT
        
    crew_call_assignments:
      fields:
        - id: UUID PRIMARY KEY
        - crew_call_position_id: UUID FK crew_call_positions
        - user_id: UUID FK users
        - contractor_id: UUID FK contractors
        - status: ENUM (invited, confirmed, declined, checked_in, checked_out, no_show)
        - confirmed_at: TIMESTAMPTZ
        - check_in_time: TIMESTAMPTZ
        - check_out_time: TIMESTAMPTZ
        - notes: TEXT
        
    shifts:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - department_id: UUID FK departments
        - position_id: UUID FK positions
        - user_id: UUID FK users
        - start_time: TIMESTAMPTZ NOT NULL
        - end_time: TIMESTAMPTZ NOT NULL
        - break_minutes: INTEGER
        - status: ENUM (scheduled, confirmed, in_progress, completed, cancelled, no_show)
        - notes: TEXT
        
    timesheets:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - user_id: UUID FK users
        - period_start: DATE NOT NULL
        - period_end: DATE NOT NULL
        - status: ENUM (draft, submitted, approved, rejected, paid)
        - submitted_at: TIMESTAMPTZ
        - approved_at: TIMESTAMPTZ
        - approved_by: UUID FK users
        - total_hours: DECIMAL(10,2)
        - overtime_hours: DECIMAL(10,2)
        - notes: TEXT
        
    timesheet_entries:
      fields:
        - id: UUID PRIMARY KEY
        - timesheet_id: UUID FK timesheets
        - project_id: UUID FK projects
        - task_id: UUID FK tasks
        - event_id: UUID FK events
        - date: DATE NOT NULL
        - start_time: TIME
        - end_time: TIME
        - break_minutes: INTEGER
        - hours: DECIMAL(10,2) NOT NULL
        - description: TEXT
        - billable: BOOLEAN DEFAULT TRUE
        - rate_amount: DECIMAL(10,2)
        
    certifications:
      description: Required certifications and licenses
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - name: VARCHAR(255) NOT NULL
        - description: TEXT
        - issuing_body: VARCHAR(255)
        - validity_period_months: INTEGER
        - is_required: BOOLEAN
        - departments: UUID[] # Applicable departments
        - positions: UUID[] # Applicable positions
        
    user_certifications:
      fields:
        - id: UUID PRIMARY KEY
        - user_id: UUID FK users
        - certification_id: UUID FK certifications
        - certificate_number: VARCHAR(100)
        - issued_date: DATE
        - expiry_date: DATE
        - document_url: TEXT
        - status: ENUM (pending, active, expired, revoked)
        - verified_by: UUID FK users
        - verified_at: TIMESTAMPTZ
        
    availability_windows:
      fields:
        - id: UUID PRIMARY KEY
        - user_id: UUID FK users
        - start_date: DATE NOT NULL
        - end_date: DATE NOT NULL
        - availability_type: ENUM (available, unavailable, tentative, preferred)
        - recurrence_rule: VARCHAR(255) # iCal RRULE
        - notes: TEXT
        
  workflows:
    - crew_call_published: Send invitations, track responses
    - shift_upcoming: Send reminders, request confirmation
    - certification_expiring: Notify user and manager, schedule renewal
    - timesheet_submitted: Route for approval, validate hours
    - timesheet_approved: Update payroll, generate reports
    
  views:
    - calendar: Shift and availability calendar
    - roster: Crew roster by event/date
    - availability: Availability matrix
    - timesheets: Timesheet grid view
```

### 4.4 Asset Management Domain

```yaml
AssetManagement:
  description: Equipment, inventory, and resource tracking
  
  entities:
    assets:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - name: VARCHAR(255) NOT NULL
        - description: TEXT
        - asset_tag: VARCHAR(100) UNIQUE
        - serial_number: VARCHAR(100)
        - category_id: UUID FK asset_categories
        - status: ENUM (available, in_use, maintenance, reserved, retired, lost, damaged)
        - condition: ENUM (excellent, good, fair, poor, broken)
        - current_location_id: UUID FK asset_locations
        - home_location_id: UUID FK asset_locations
        - assigned_to_user_id: UUID FK users
        - assigned_to_event_id: UUID FK events
        - purchase_date: DATE
        - purchase_price: DECIMAL(12,2)
        - purchase_vendor_id: UUID FK vendors
        - warranty_expiry: DATE
        - current_value: DECIMAL(12,2)
        - depreciation_method: ENUM (straight_line, declining_balance, none)
        - useful_life_years: INTEGER
        - last_maintenance_date: DATE
        - next_maintenance_date: DATE
        - specifications: JSONB
        - qr_code_url: TEXT
        - barcode: VARCHAR(100)
        - rfid_tag: VARCHAR(100)
        - nfc_tag: VARCHAR(100)
        - images: JSONB
        - documents: JSONB
        - created_at: TIMESTAMPTZ
        - updated_at: TIMESTAMPTZ
        - deleted_at: TIMESTAMPTZ
        
    asset_categories:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - parent_id: UUID FK asset_categories
        - name: VARCHAR(255) NOT NULL
        - slug: VARCHAR(100) NOT NULL
        - description: TEXT
        - icon: VARCHAR(50)
        - color: VARCHAR(7)
        - default_depreciation_method: ENUM
        - default_useful_life_years: INTEGER
        - maintenance_interval_days: INTEGER
        - required_certifications: UUID[]
        
    asset_locations:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - parent_id: UUID FK asset_locations
        - name: VARCHAR(255) NOT NULL
        - type: ENUM (warehouse, venue, vehicle, office, external, virtual)
        - address: TEXT
        - coordinates: POINT
        - contact_name: VARCHAR(255)
        - contact_phone: VARCHAR(50)
        - contact_email: VARCHAR(255)
        
    asset_check_in_out:
      fields:
        - id: UUID PRIMARY KEY
        - asset_id: UUID FK assets
        - organization_id: UUID FK organizations
        - action_type: ENUM (check_out, check_in, transfer, reserve, release)
        - user_id: UUID FK users
        - event_id: UUID FK events
        - project_id: UUID FK projects
        - from_location_id: UUID FK asset_locations
        - to_location_id: UUID FK asset_locations
        - expected_return: TIMESTAMPTZ
        - actual_return: TIMESTAMPTZ
        - condition_on_checkout: ENUM
        - condition_on_return: ENUM
        - notes: TEXT
        - scanned_via: ENUM (qr, barcode, rfid, nfc, manual)
        - scan_location: JSONB
        - created_at: TIMESTAMPTZ
        - created_by: UUID FK users
        
    asset_maintenance:
      fields:
        - id: UUID PRIMARY KEY
        - asset_id: UUID FK assets
        - organization_id: UUID FK organizations
        - maintenance_type: ENUM (preventive, corrective, inspection, calibration)
        - status: ENUM (scheduled, in_progress, completed, cancelled)
        - scheduled_date: DATE
        - completed_date: DATE
        - performed_by: UUID FK users
        - vendor_id: UUID FK vendors
        - description: TEXT
        - findings: TEXT
        - cost: DECIMAL(10,2)
        - next_maintenance: DATE
        
    asset_kits:
      description: Pre-configured equipment packages
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - name: VARCHAR(255) NOT NULL
        - description: TEXT
        - category_id: UUID FK asset_categories
        - status: ENUM (active, inactive)
        
    asset_kit_items:
      fields:
        - id: UUID PRIMARY KEY
        - kit_id: UUID FK asset_kits
        - asset_id: UUID FK assets
        - asset_category_id: UUID FK asset_categories
        - quantity: INTEGER DEFAULT 1
        - is_required: BOOLEAN DEFAULT TRUE
        - notes: TEXT
        
    inventory_items:
      description: Consumable inventory
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - name: VARCHAR(255) NOT NULL
        - sku: VARCHAR(100)
        - category_id: UUID FK asset_categories
        - unit_of_measure: VARCHAR(50)
        - quantity_on_hand: INTEGER
        - quantity_reserved: INTEGER
        - quantity_available: INTEGER GENERATED
        - reorder_point: INTEGER
        - reorder_quantity: INTEGER
        - unit_cost: DECIMAL(10,2)
        - location_id: UUID FK asset_locations
        - vendor_id: UUID FK vendors
        
    inventory_transactions:
      fields:
        - id: UUID PRIMARY KEY
        - inventory_item_id: UUID FK inventory_items
        - transaction_type: ENUM (receipt, issue, adjustment, transfer, return, waste)
        - quantity: INTEGER NOT NULL
        - unit_cost: DECIMAL(10,2)
        - reference_type: VARCHAR(50)
        - reference_id: UUID
        - notes: TEXT
        - created_at: TIMESTAMPTZ
        - created_by: UUID FK users
        
  workflows:
    - asset_checked_out: Update status, notify owner, log transaction
    - asset_overdue: Send reminders, escalate to manager
    - asset_maintenance_due: Create maintenance task, notify technician
    - inventory_low: Create purchase requisition, notify procurement
    - asset_condition_changed: Log condition, schedule inspection if needed
    
  views:
    - inventory: Grid view with status indicators
    - availability: Availability calendar by asset
    - location: Map view of asset locations
    - maintenance: Maintenance schedule calendar
```

### 4.5 Finance Management Domain

```yaml
FinanceManagement:
  description: Budgeting, invoicing, expenses, and financial operations
  
  entities:
    budgets:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - project_id: UUID FK projects
        - event_id: UUID FK events
        - name: VARCHAR(255) NOT NULL
        - fiscal_year: INTEGER
        - period_type: ENUM (annual, quarterly, monthly, project, event)
        - start_date: DATE
        - end_date: DATE
        - total_amount: DECIMAL(14,2) NOT NULL
        - currency: VARCHAR(3) DEFAULT 'USD'
        - status: ENUM (draft, pending_approval, approved, active, closed)
        - approved_by: UUID FK users
        - approved_at: TIMESTAMPTZ
        - notes: TEXT
        
    budget_categories:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - parent_id: UUID FK budget_categories
        - name: VARCHAR(255) NOT NULL
        - code: VARCHAR(50)
        - type: ENUM (income, expense, capital)
        - description: TEXT
        
    budget_line_items:
      fields:
        - id: UUID PRIMARY KEY
        - budget_id: UUID FK budgets
        - category_id: UUID FK budget_categories
        - department_id: UUID FK departments
        - name: VARCHAR(255) NOT NULL
        - description: TEXT
        - planned_amount: DECIMAL(12,2) NOT NULL
        - actual_amount: DECIMAL(12,2) DEFAULT 0
        - committed_amount: DECIMAL(12,2) DEFAULT 0
        - variance: DECIMAL(12,2) GENERATED
        - notes: TEXT
        
    invoices:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - invoice_number: VARCHAR(50) NOT NULL UNIQUE
        - invoice_type: ENUM (standard, credit, proforma, recurring)
        - direction: ENUM (receivable, payable)
        - contact_id: UUID FK contacts
        - company_id: UUID FK companies
        - project_id: UUID FK projects
        - event_id: UUID FK events
        - issue_date: DATE NOT NULL
        - due_date: DATE NOT NULL
        - currency: VARCHAR(3)
        - subtotal: DECIMAL(12,2)
        - tax_amount: DECIMAL(12,2)
        - discount_amount: DECIMAL(12,2)
        - total_amount: DECIMAL(12,2) NOT NULL
        - amount_paid: DECIMAL(12,2) DEFAULT 0
        - balance_due: DECIMAL(12,2) GENERATED
        - status: ENUM (draft, sent, viewed, partially_paid, paid, overdue, cancelled, disputed)
        - payment_terms: VARCHAR(100)
        - notes: TEXT
        - internal_notes: TEXT
        - sent_at: TIMESTAMPTZ
        - paid_at: TIMESTAMPTZ
        
    invoice_items:
      fields:
        - id: UUID PRIMARY KEY
        - invoice_id: UUID FK invoices
        - product_id: UUID FK products
        - description: TEXT NOT NULL
        - quantity: DECIMAL(10,2) NOT NULL
        - unit_price: DECIMAL(12,2) NOT NULL
        - discount_percent: DECIMAL(5,2)
        - tax_rate: DECIMAL(5,2)
        - amount: DECIMAL(12,2) GENERATED
        - budget_category_id: UUID FK budget_categories
        
    payments:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - invoice_id: UUID FK invoices
        - payment_date: DATE NOT NULL
        - amount: DECIMAL(12,2) NOT NULL
        - payment_method: ENUM (bank_transfer, credit_card, check, cash, paypal, stripe, other)
        - reference_number: VARCHAR(100)
        - notes: TEXT
        - recorded_by: UUID FK users
        
    expenses:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - user_id: UUID FK users
        - project_id: UUID FK projects
        - event_id: UUID FK events
        - budget_category_id: UUID FK budget_categories
        - vendor_id: UUID FK vendors
        - expense_date: DATE NOT NULL
        - description: TEXT NOT NULL
        - amount: DECIMAL(12,2) NOT NULL
        - currency: VARCHAR(3)
        - receipt_url: TEXT
        - status: ENUM (draft, submitted, pending_approval, approved, rejected, reimbursed)
        - submitted_at: TIMESTAMPTZ
        - approved_by: UUID FK users
        - approved_at: TIMESTAMPTZ
        - reimbursed_at: TIMESTAMPTZ
        - notes: TEXT
        
    purchase_requisitions:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - requisition_number: VARCHAR(50) NOT NULL
        - requester_id: UUID FK users
        - department_id: UUID FK departments
        - project_id: UUID FK projects
        - event_id: UUID FK events
        - budget_id: UUID FK budgets
        - required_date: DATE
        - priority: ENUM (urgent, high, normal, low)
        - total_amount: DECIMAL(12,2)
        - status: ENUM (draft, submitted, pending_approval, approved, rejected, ordered, received, cancelled)
        - justification: TEXT
        - submitted_at: TIMESTAMPTZ
        - approved_by: UUID FK users
        - approved_at: TIMESTAMPTZ
        
    purchase_orders:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - po_number: VARCHAR(50) NOT NULL UNIQUE
        - requisition_id: UUID FK purchase_requisitions
        - vendor_id: UUID FK vendors NOT NULL
        - project_id: UUID FK projects
        - event_id: UUID FK events
        - budget_id: UUID FK budgets
        - issue_date: DATE NOT NULL
        - required_date: DATE
        - shipping_address: TEXT
        - billing_address: TEXT
        - currency: VARCHAR(3)
        - subtotal: DECIMAL(12,2)
        - tax_amount: DECIMAL(12,2)
        - shipping_amount: DECIMAL(12,2)
        - total_amount: DECIMAL(12,2) NOT NULL
        - status: ENUM (draft, sent, acknowledged, partially_received, received, invoiced, paid, cancelled)
        - payment_terms: VARCHAR(100)
        - notes: TEXT
        
    contracts:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - contract_number: VARCHAR(50) NOT NULL
        - contract_type: ENUM (vendor, client, employment, nda, service, licensing, rental, sponsorship)
        - title: VARCHAR(255) NOT NULL
        - description: TEXT
        - counterparty_type: ENUM (company, contact, vendor, user)
        - counterparty_id: UUID
        - project_id: UUID FK projects
        - event_id: UUID FK events
        - start_date: DATE NOT NULL
        - end_date: DATE
        - value: DECIMAL(14,2)
        - currency: VARCHAR(3)
        - status: ENUM (draft, pending_review, pending_signature, active, expired, terminated, renewed)
        - document_url: TEXT
        - signed_date: DATE
        - signed_by_us: UUID FK users
        - renewal_type: ENUM (none, auto, manual)
        - renewal_notice_days: INTEGER
        - terms: TEXT
        - notes: TEXT
        
  workflows:
    - budget_threshold_exceeded: Alert budget owner, require approval for overage
    - invoice_overdue: Send reminders, escalate to collections
    - expense_submitted: Route for approval based on amount thresholds
    - purchase_order_approved: Send to vendor, update budget committed
    - contract_expiring: Notify stakeholders, initiate renewal process
    
  views:
    - budget_vs_actual: Variance analysis view
    - cash_flow: Cash flow projections
    - ar_aging: Accounts receivable aging
    - ap_aging: Accounts payable aging
```

### 4.6 Content Management Domain

```yaml
ContentManagement:
  description: Digital assets, brand materials, and marketing content
  
  entities:
    media_assets:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - folder_id: UUID FK media_folders
        - name: VARCHAR(255) NOT NULL
        - description: TEXT
        - file_url: TEXT NOT NULL
        - file_name: VARCHAR(255) NOT NULL
        - file_type: VARCHAR(100)
        - file_size: BIGINT
        - mime_type: VARCHAR(100)
        - width: INTEGER
        - height: INTEGER
        - duration_seconds: INTEGER
        - alt_text: TEXT
        - tags: TEXT[]
        - metadata: JSONB
        - thumbnail_url: TEXT
        - status: ENUM (processing, active, archived)
        - uploaded_by: UUID FK users
        - created_at: TIMESTAMPTZ
        
    media_folders:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - parent_id: UUID FK media_folders
        - name: VARCHAR(255) NOT NULL
        - color: VARCHAR(7)
        - position: INTEGER
        
    brand_guidelines:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - name: VARCHAR(255) NOT NULL
        - version: VARCHAR(50)
        - status: ENUM (draft, active, archived)
        - content: JSONB # Structured brand guide content
        - primary_colors: JSONB
        - secondary_colors: JSONB
        - typography: JSONB
        - logo_usage: TEXT
        - voice_tone: TEXT
        - do_dont: JSONB
        - published_at: TIMESTAMPTZ
        - published_by: UUID FK users
        
    marketing_campaigns:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - name: VARCHAR(255) NOT NULL
        - description: TEXT
        - campaign_type: ENUM (launch, awareness, engagement, conversion, retention, event, seasonal)
        - status: ENUM (planning, active, paused, completed, cancelled)
        - start_date: DATE
        - end_date: DATE
        - budget: DECIMAL(12,2)
        - target_audience: JSONB
        - channels: TEXT[]
        - goals: JSONB
        - kpis: JSONB
        - results: JSONB
        
    marketing_materials:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - campaign_id: UUID FK marketing_campaigns
        - name: VARCHAR(255) NOT NULL
        - material_type: ENUM (flyer, poster, banner, social_post, email, video, brochure, presentation, press_release)
        - status: ENUM (draft, pending_review, approved, published, archived)
        - content: JSONB
        - media_assets: UUID[]
        - target_platforms: TEXT[]
        - dimensions: JSONB
        - approved_by: UUID FK users
        - approved_at: TIMESTAMPTZ
        
    social_accounts:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - platform: ENUM (instagram, facebook, twitter, linkedin, tiktok, youtube, pinterest, threads)
        - account_name: VARCHAR(255) NOT NULL
        - account_id: VARCHAR(255)
        - access_token: TEXT # Encrypted
        - refresh_token: TEXT # Encrypted
        - token_expires_at: TIMESTAMPTZ
        - is_connected: BOOLEAN
        - followers_count: INTEGER
        - settings: JSONB
        
    social_posts:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - account_id: UUID FK social_accounts
        - campaign_id: UUID FK marketing_campaigns
        - content: TEXT NOT NULL
        - media_assets: UUID[]
        - hashtags: TEXT[]
        - mentions: TEXT[]
        - link_url: TEXT
        - scheduled_at: TIMESTAMPTZ
        - published_at: TIMESTAMPTZ
        - status: ENUM (draft, scheduled, published, failed, deleted)
        - external_post_id: VARCHAR(255)
        - engagement_metrics: JSONB
        
    content_approvals:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - content_type: VARCHAR(50) NOT NULL
        - content_id: UUID NOT NULL
        - approval_stage: INTEGER
        - approver_id: UUID FK users
        - status: ENUM (pending, approved, rejected, revision_requested)
        - comments: TEXT
        - decided_at: TIMESTAMPTZ
        
  workflows:
    - content_submitted: Route for approval based on content type
    - content_approved: Enable publishing, notify creator
    - social_post_scheduled: Queue for publishing, verify account connection
    - brand_guideline_updated: Notify team, version previous
    
  views:
    - media_grid: Visual grid of media assets
    - content_calendar: Publishing calendar
    - campaign_board: Campaign kanban by status
```

### 4.7 Business Management Domain

```yaml
BusinessManagement:
  description: CRM, sales pipeline, and client relationship management
  
  entities:
    companies:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - name: VARCHAR(255) NOT NULL
        - legal_name: VARCHAR(255)
        - company_type: ENUM (prospect, client, partner, vendor, competitor)
        - industry: VARCHAR(100)
        - website: VARCHAR(255)
        - email: VARCHAR(255)
        - phone: VARCHAR(50)
        - address: TEXT
        - city: VARCHAR(100)
        - state: VARCHAR(100)
        - country: VARCHAR(100)
        - postal_code: VARCHAR(20)
        - employee_count: INTEGER
        - annual_revenue: DECIMAL(14,2)
        - description: TEXT
        - logo_url: TEXT
        - tags: TEXT[]
        - custom_fields: JSONB
        - owner_id: UUID FK users
        - source: VARCHAR(100)
        - created_at: TIMESTAMPTZ
        - updated_at: TIMESTAMPTZ
        
    contacts:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - company_id: UUID FK companies
        - first_name: VARCHAR(100) NOT NULL
        - last_name: VARCHAR(100) NOT NULL
        - email: VARCHAR(255)
        - phone: VARCHAR(50)
        - mobile: VARCHAR(50)
        - job_title: VARCHAR(100)
        - department: VARCHAR(100)
        - is_primary: BOOLEAN DEFAULT FALSE
        - linkedin_url: VARCHAR(255)
        - notes: TEXT
        - tags: TEXT[]
        - custom_fields: JSONB
        - owner_id: UUID FK users
        - source: VARCHAR(100)
        - last_contacted_at: TIMESTAMPTZ
        
    deals:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - name: VARCHAR(255) NOT NULL
        - company_id: UUID FK companies
        - contact_id: UUID FK contacts
        - owner_id: UUID FK users
        - deal_stage_id: UUID FK deal_stages
        - pipeline_id: UUID FK pipelines
        - amount: DECIMAL(14,2)
        - currency: VARCHAR(3)
        - probability: INTEGER
        - expected_close_date: DATE
        - actual_close_date: DATE
        - deal_type: ENUM (new_business, expansion, renewal, other)
        - source: VARCHAR(100)
        - description: TEXT
        - lost_reason: VARCHAR(255)
        - competitor: VARCHAR(255)
        - tags: TEXT[]
        - custom_fields: JSONB
        - created_at: TIMESTAMPTZ
        - updated_at: TIMESTAMPTZ
        - closed_at: TIMESTAMPTZ
        
    pipelines:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - name: VARCHAR(255) NOT NULL
        - is_default: BOOLEAN DEFAULT FALSE
        - deal_type: VARCHAR(50)
        
    deal_stages:
      fields:
        - id: UUID PRIMARY KEY
        - pipeline_id: UUID FK pipelines
        - name: VARCHAR(100) NOT NULL
        - position: INTEGER
        - probability: INTEGER
        - is_won: BOOLEAN DEFAULT FALSE
        - is_lost: BOOLEAN DEFAULT FALSE
        - color: VARCHAR(7)
        
    deal_activities:
      fields:
        - id: UUID PRIMARY KEY
        - deal_id: UUID FK deals
        - organization_id: UUID FK organizations
        - activity_type: ENUM (call, email, meeting, note, task, demo, proposal)
        - subject: VARCHAR(255) NOT NULL
        - description: TEXT
        - scheduled_at: TIMESTAMPTZ
        - completed_at: TIMESTAMPTZ
        - duration_minutes: INTEGER
        - outcome: VARCHAR(255)
        - assigned_to: UUID FK users
        - contact_id: UUID FK contacts
        - created_by: UUID FK users
        
    proposals:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - proposal_number: VARCHAR(50) NOT NULL
        - deal_id: UUID FK deals
        - company_id: UUID FK companies
        - contact_id: UUID FK contacts
        - name: VARCHAR(255) NOT NULL
        - version: INTEGER DEFAULT 1
        - status: ENUM (draft, sent, viewed, accepted, rejected, expired)
        - valid_until: DATE
        - total_amount: DECIMAL(14,2)
        - currency: VARCHAR(3)
        - content: JSONB # Proposal sections and content
        - terms: TEXT
        - notes: TEXT
        - sent_at: TIMESTAMPTZ
        - viewed_at: TIMESTAMPTZ
        - accepted_at: TIMESTAMPTZ
        - signed_by_contact: VARCHAR(255)
        
    proposal_items:
      fields:
        - id: UUID PRIMARY KEY
        - proposal_id: UUID FK proposals
        - product_id: UUID FK products
        - name: VARCHAR(255) NOT NULL
        - description: TEXT
        - quantity: DECIMAL(10,2)
        - unit_price: DECIMAL(12,2)
        - discount_percent: DECIMAL(5,2)
        - amount: DECIMAL(12,2)
        - position: INTEGER
        
  workflows:
    - deal_stage_changed: Update probability, trigger stage actions
    - deal_won: Create project, generate invoice, notify team
    - deal_lost: Update analytics, trigger win-back campaign
    - proposal_viewed: Notify owner, track engagement
    - activity_due: Send reminders, update deal health
    
  views:
    - pipeline: Kanban board by deal stage
    - forecast: Revenue forecast by period
    - activity: Activity timeline
    - company_360: Full company view
```

### 4.8 Experience Management Domain

```yaml
ExperienceManagement:
  description: Events, hospitality, F&B, ticketing, and guest services
  
  entities:
    tickets:
      description: Event ticketing
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - event_id: UUID FK events
        - ticket_type_id: UUID FK ticket_types
        - order_id: UUID FK ticket_orders
        - barcode: VARCHAR(100) UNIQUE
        - qr_code_url: TEXT
        - status: ENUM (reserved, purchased, checked_in, cancelled, refunded, transferred)
        - purchaser_id: UUID FK contacts
        - attendee_name: VARCHAR(255)
        - attendee_email: VARCHAR(255)
        - seat_info: JSONB
        - purchase_price: DECIMAL(10,2)
        - purchased_at: TIMESTAMPTZ
        - checked_in_at: TIMESTAMPTZ
        - checked_in_by: UUID FK users
        - transferred_to: UUID FK contacts
        - transferred_at: TIMESTAMPTZ
        
    ticket_types:
      fields:
        - id: UUID PRIMARY KEY
        - event_id: UUID FK events
        - name: VARCHAR(255) NOT NULL
        - description: TEXT
        - tier: ENUM (general, vip, premium, backstage, artist, media, staff, comp)
        - price: DECIMAL(10,2) NOT NULL
        - quantity_available: INTEGER
        - quantity_sold: INTEGER DEFAULT 0
        - sale_start: TIMESTAMPTZ
        - sale_end: TIMESTAMPTZ
        - max_per_order: INTEGER
        - transferable: BOOLEAN DEFAULT TRUE
        - refundable: BOOLEAN DEFAULT TRUE
        - perks: JSONB
        
    ticket_orders:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - order_number: VARCHAR(50) NOT NULL UNIQUE
        - event_id: UUID FK events
        - contact_id: UUID FK contacts
        - status: ENUM (pending, completed, cancelled, refunded, partially_refunded)
        - subtotal: DECIMAL(10,2)
        - fees: DECIMAL(10,2)
        - taxes: DECIMAL(10,2)
        - total: DECIMAL(10,2) NOT NULL
        - payment_method: VARCHAR(50)
        - payment_reference: VARCHAR(255)
        - completed_at: TIMESTAMPTZ
        - refunded_at: TIMESTAMPTZ
        - refund_amount: DECIMAL(10,2)
        
    guest_lists:
      description: VIP and comp guest management
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - event_id: UUID FK events
        - name: VARCHAR(255) NOT NULL
        - list_type: ENUM (vip, artist, media, sponsor, staff, comp)
        - owner_id: UUID FK users
        - max_guests: INTEGER
        - status: ENUM (draft, active, closed)
        
    guest_list_entries:
      fields:
        - id: UUID PRIMARY KEY
        - guest_list_id: UUID FK guest_lists
        - name: VARCHAR(255) NOT NULL
        - email: VARCHAR(255)
        - phone: VARCHAR(50)
        - plus_ones: INTEGER DEFAULT 0
        - ticket_type_id: UUID FK ticket_types
        - notes: TEXT
        - status: ENUM (pending, confirmed, checked_in, no_show)
        - added_by: UUID FK users
        - confirmed_at: TIMESTAMPTZ
        - checked_in_at: TIMESTAMPTZ
        
    hospitality_requests:
      description: Artist/VIP hospitality needs
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - event_id: UUID FK events
        - talent_id: UUID FK talents
        - contact_id: UUID FK contacts
        - request_type: ENUM (accommodation, transportation, catering, greenroom, security, other)
        - description: TEXT NOT NULL
        - requirements: JSONB
        - budget: DECIMAL(10,2)
        - status: ENUM (pending, approved, fulfilled, cancelled)
        - assigned_to: UUID FK users
        - notes: TEXT
        - fulfilled_at: TIMESTAMPTZ
        
    accommodations:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - event_id: UUID FK events
        - hotel_name: VARCHAR(255) NOT NULL
        - address: TEXT
        - room_type: VARCHAR(100)
        - check_in_date: DATE NOT NULL
        - check_out_date: DATE NOT NULL
        - confirmation_number: VARCHAR(100)
        - guest_name: VARCHAR(255)
        - talent_id: UUID FK talents
        - contact_id: UUID FK contacts
        - nightly_rate: DECIMAL(10,2)
        - total_cost: DECIMAL(10,2)
        - status: ENUM (booked, confirmed, checked_in, checked_out, cancelled)
        - notes: TEXT
        
    transportation:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - event_id: UUID FK events
        - transport_type: ENUM (flight, ground, shuttle, rideshare, rental, private)
        - departure_location: TEXT NOT NULL
        - arrival_location: TEXT NOT NULL
        - departure_time: TIMESTAMPTZ NOT NULL
        - arrival_time: TIMESTAMPTZ
        - carrier: VARCHAR(255)
        - confirmation_number: VARCHAR(100)
        - passengers: JSONB
        - talent_id: UUID FK talents
        - contact_id: UUID FK contacts
        - cost: DECIMAL(10,2)
        - status: ENUM (booked, confirmed, in_transit, completed, cancelled)
        - driver_name: VARCHAR(255)
        - driver_phone: VARCHAR(50)
        - vehicle_info: TEXT
        - notes: TEXT
        
    catering_orders:
      description: F&B orders for events
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - event_id: UUID FK events
        - vendor_id: UUID FK vendors
        - order_type: ENUM (greenroom, crew_meal, vip, hospitality, concession)
        - service_time: TIMESTAMPTZ NOT NULL
        - service_location: VARCHAR(255)
        - headcount: INTEGER
        - dietary_requirements: JSONB
        - menu_items: JSONB
        - total_cost: DECIMAL(10,2)
        - status: ENUM (pending, confirmed, delivered, cancelled)
        - notes: TEXT
        
    community_members:
      description: Social community users
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - user_id: UUID FK users
        - display_name: VARCHAR(100)
        - bio: TEXT
        - avatar_url: TEXT
        - member_type: ENUM (fan, artist, creator, influencer, brand)
        - verified: BOOLEAN DEFAULT FALSE
        - followers_count: INTEGER DEFAULT 0
        - following_count: INTEGER DEFAULT 0
        - badges: JSONB
        - preferences: JSONB
        - joined_at: TIMESTAMPTZ
        
    community_posts:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - member_id: UUID FK community_members
        - post_type: ENUM (text, image, video, poll, event, article)
        - content: TEXT
        - media_urls: JSONB
        - visibility: ENUM (public, followers, private)
        - likes_count: INTEGER DEFAULT 0
        - comments_count: INTEGER DEFAULT 0
        - shares_count: INTEGER DEFAULT 0
        - is_pinned: BOOLEAN DEFAULT FALSE
        - created_at: TIMESTAMPTZ
        - edited_at: TIMESTAMPTZ
        
  workflows:
    - ticket_purchased: Send confirmation, update inventory, trigger welcome sequence
    - guest_checked_in: Update status, notify host, trigger welcome
    - hospitality_request_submitted: Route to appropriate department
    - accommodation_approaching: Send details to guest
    - transport_departing: Send driver details and reminders
    
  views:
    - guest_list: Check-in interface
    - hospitality_board: Request status board
    - seating_chart: Visual seating layout
    - community_feed: Social feed view
```

### 4.9 Talent Management Domain

```yaml
TalentManagement:
  description: Artist booking, riders, scheduling, and payments
  
  entities:
    talents:
      description: Artists, performers, speakers
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - name: VARCHAR(255) NOT NULL
        - stage_name: VARCHAR(255)
        - talent_type: ENUM (dj, band, solo_artist, speaker, mc, performer, comedian, other)
        - genre: VARCHAR(100)
        - bio: TEXT
        - photo_url: TEXT
        - website: VARCHAR(255)
        - social_links: JSONB
        - booking_status: ENUM (available, limited, unavailable)
        - fee_range_min: DECIMAL(12,2)
        - fee_range_max: DECIMAL(12,2)
        - currency: VARCHAR(3)
        - agency_id: UUID FK companies
        - manager_contact_id: UUID FK contacts
        - agent_contact_id: UUID FK contacts
        - tags: TEXT[]
        - notes: TEXT
        - rating: DECIMAL(3,2)
        - created_at: TIMESTAMPTZ
        
    talent_bookings:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - talent_id: UUID FK talents
        - event_id: UUID FK events
        - booking_status: ENUM (inquiry, negotiating, confirmed, contracted, cancelled, completed)
        - performance_type: ENUM (headliner, support, opener, special_guest, resident)
        - set_date: DATE NOT NULL
        - set_time: TIME
        - set_duration_minutes: INTEGER
        - stage_id: UUID FK venue_spaces
        - fee_amount: DECIMAL(12,2) NOT NULL
        - fee_type: ENUM (flat, guarantee, vs_percentage, guarantee_plus_percentage)
        - deposit_amount: DECIMAL(12,2)
        - deposit_paid: BOOLEAN DEFAULT FALSE
        - contract_id: UUID FK contracts
        - rider_id: UUID FK riders
        - notes: TEXT
        - internal_notes: TEXT
        - confirmed_at: TIMESTAMPTZ
        - cancelled_at: TIMESTAMPTZ
        - cancelled_reason: TEXT
        
    riders:
      description: Technical and hospitality riders
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - talent_id: UUID FK talents
        - booking_id: UUID FK talent_bookings
        - rider_type: ENUM (technical, hospitality, combined)
        - version: INTEGER DEFAULT 1
        - status: ENUM (draft, submitted, approved, signed)
        - document_url: TEXT
        - tech_requirements: JSONB # Audio, lighting, backline specs
        - hospitality_requirements: JSONB # Greenroom, catering, accommodations
        - travel_requirements: JSONB # Flights, ground transport
        - security_requirements: TEXT
        - other_requirements: TEXT
        - approved_by: UUID FK users
        - approved_at: TIMESTAMPTZ
        - notes: TEXT
        
    rider_items:
      description: Individual rider line items
      fields:
        - id: UUID PRIMARY KEY
        - rider_id: UUID FK riders
        - category: ENUM (audio, lighting, video, backline, staging, hospitality, catering, accommodation, transportation, security, other)
        - item: VARCHAR(255) NOT NULL
        - quantity: INTEGER
        - specifications: TEXT
        - provided_by: ENUM (artist, venue, promoter)
        - status: ENUM (pending, confirmed, substituted, not_available)
        - substitute_item: VARCHAR(255)
        - notes: TEXT
        
    talent_payments:
      fields:
        - id: UUID PRIMARY KEY
        - organization_id: UUID FK organizations
        - booking_id: UUID FK talent_bookings
        - talent_id: UUID FK talents
        - payment_type: ENUM (deposit, balance, bonus, reimbursement)
        - amount: DECIMAL(12,2) NOT NULL
        - currency: VARCHAR(3)
        - payment_method: ENUM (wire, check, paypal, cash, crypto)
        - status: ENUM (pending, processing, completed, failed, cancelled)
        - due_date: DATE
        - paid_date: DATE
        - payment_reference: VARCHAR(255)
        - notes: TEXT
        - processed_by: UUID FK users
        
    setlists:
      fields:
        - id: UUID PRIMARY KEY
        - booking_id: UUID FK talent_bookings
        - talent_id: UUID FK talents
        - status: ENUM (draft, submitted, approved, performed)
        - total_duration_minutes: INTEGER
        - notes: TEXT
        
    setlist_items:
      fields:
        - id: UUID PRIMARY KEY
        - setlist_id: UUID FK setlists
        - position: INTEGER NOT NULL
        - song_title: VARCHAR(255) NOT NULL
        - artist: VARCHAR(255)
        - duration_seconds: INTEGER
        - bpm: INTEGER
        - key: VARCHAR(10)
        - notes: TEXT
        - actual_played: BOOLEAN
        - actual_duration: INTEGER
        
    performance_schedules:
      description: Detailed stage schedule
      fields:
        - id: UUID PRIMARY KEY
        - event_id: UUID FK events
        - stage_id: UUID FK venue_spaces
        - date: DATE NOT NULL
        - schedule_data: JSONB # Array of time slots with bookings
        - status: ENUM (draft, published, locked)
        - published_at: TIMESTAMPTZ
        - published_by: UUID FK users
        
  workflows:
    - booking_confirmed: Generate contract, create rider, set up payments
    - rider_submitted: Route for review, check against venue capabilities
    - deposit_due: Send payment reminder, escalate if overdue
    - performance_approaching: Confirm logistics, send day-of-show details
    - setlist_submitted: Review for timing, route for approval
    
  views:
    - booking_pipeline: Deal-style booking funnel
    - schedule_grid: Stage schedule timeline
    - roster: Talent roster with status
    - rider_checklist: Rider fulfillment status
```

---

## 5. USER ROLES & ACCESS MODEL

### 5.1 Platform Roles

```yaml
PlatformRoles:
  SuperAdmin:
    level: 1000
    tier: enterprise
    description: Anthropic/System administrator
    permissions: ALL
    
  PlatformAdmin:
    level: 900
    tier: enterprise
    description: Platform operations administrator
    permissions:
      - organizations.manage
      - users.manage
      - platform.*
```

### 5.2 Organization Roles

```yaml
OrganizationRoles:
  # Enterprise Tier
  OrganizationOwner:
    level: 100
    tier: enterprise
    description: Organization owner with full access
    permissions: ALL within organization
    
  OrganizationAdmin:
    level: 90
    tier: enterprise
    description: Organization administrators
    permissions:
      - organization.manage
      - users.manage
      - billing.manage
      - all_modules.manage
      
  # Pro Tier
  DepartmentHead:
    level: 70
    tier: pro
    description: Department directors
    permissions:
      - department.manage
      - projects.manage (scoped)
      - tasks.manage (scoped)
      - people.manage (scoped)
      - assets.manage (scoped)
      - reports.create
      - ai.use
      
  ProjectManager:
    level: 65
    tier: pro
    description: Project managers
    permissions:
      - projects.manage (assigned)
      - tasks.manage (scoped)
      - people.read
      - assets.checkout
      - workflows.create (scoped)
      - reports.create
      - ai.use
      
  ProductionManager:
    level: 60
    tier: pro
    description: Production management staff
    permissions:
      - events.manage (assigned)
      - tasks.manage (scoped)
      - assets.manage
      - schedules.manage
      - crew_calls.manage
      - workflows.execute
      
  TeamLead:
    level: 50
    tier: pro
    description: Team leaders
    permissions:
      - tasks.manage (team)
      - projects.update (assigned)
      - people.read (team)
      - assets.checkout
      - workflows.execute
      - reports.read
      
  # Core Tier (Free)
  CrewMember:
    level: 20
    tier: core
    description: Production crew
    permissions:
      - tasks.read
      - tasks.update (assigned)
      - projects.read (assigned)
      - assets.checkout
      - documents.read (shared)
      - schedules.read
      
  Artist:
    level: 15
    tier: core
    description: Performing artists and talent
    permissions:
      - tasks.read (own)
      - projects.read (assigned)
      - events.read (assigned)
      - documents.read (shared)
      - schedules.read (own)
      
  Vendor:
    level: 15
    tier: core
    description: External vendors and suppliers
    permissions:
      - tasks.read (own)
      - projects.read (assigned)
      - assets.read (assigned)
      - documents.read (shared)
      - procurement.read (own)
      
  Volunteer:
    level: 10
    tier: core
    description: Event volunteers
    permissions:
      - tasks.read (own)
      - tasks.update (status_only)
      - events.read (assigned)
      - schedules.read
      - procedures.read
      
  Guest:
    level: 5
    tier: core
    description: Read-only guest access
    permissions:
      - tasks.read (shared)
      - projects.read (shared)
      - documents.read (shared)
```

### 5.3 Pricing Tier Mapping

```yaml
PricingTiers:
  Core:
    price: $0 (Free Forever)
    user_limit: 10
    storage_gb: 5
    features:
      - Basic task management
      - Calendar
      - Basic documents
      - Asset tracking (read-only)
      - Standard views (list, table, board)
      - Mobile app access
    restrictions:
      - No project creation
      - No AI features
      - No integrations
      - No workflows
      - No custom fields
      - No reports
      
  Pro:
    price: $79/user/month
    user_limit: unlimited
    storage_gb: 50
    features:
      - Full project management
      - All view types
      - Custom fields
      - Basic workflows
      - Asset management
      - Time tracking
      - Basic reports
      - Limited AI (100 queries/month)
      - Basic integrations
      - Team scheduling
    restrictions:
      - No white-labeling
      - No GVTEWAY public tools
      - No custom domains
      - Limited API access
      
  Enterprise:
    price: $1,499+/month
    user_limit: unlimited
    storage_gb: 500
    features:
      - Everything in Pro
      - Unlimited AI
      - All integrations
      - Full API access
      - White-labeling
      - Custom domains
      - GVTEWAY public tools
      - Advanced workflows
      - Advanced analytics
      - SSO/SAML
      - Priority support
      - Dedicated success manager
      - Custom training
```

---

## 6. DATA VIEW ENGINE

### 6.1 Supported View Types

```yaml
ViewTypes:
  List:
    description: Standard list with grouping
    features:
      - Expandable rows
      - Inline editing
      - Grouping
      - Drag-drop reorder
    applicable_entities: ALL
    
  Table:
    description: Spreadsheet-style with columns
    features:
      - Column resize
      - Column reorder
      - Inline editing
      - Freeze columns
      - Row selection
      - Bulk actions
    applicable_entities: ALL
    
  Board:
    description: Kanban board
    features:
      - Drag-drop cards
      - Swimlanes
      - Card preview
      - Quick edit
      - WIP limits
    applicable_entities: [tasks, deals, tickets, content_approvals]
    
  Calendar:
    description: Calendar view
    features:
      - Day/week/month/year views
      - Drag-drop scheduling
      - Resource lanes
      - Recurring events
      - Availability overlay
    applicable_entities: [tasks, events, shifts, bookings]
    
  Timeline:
    description: Gantt-style timeline
    features:
      - Dependencies
      - Milestones
      - Progress bars
      - Date drag
      - Zoom levels
    applicable_entities: [tasks, projects, events]
    
  Gantt:
    description: Full Gantt chart
    features:
      - All Timeline features
      - Critical path
      - Baseline comparison
      - Resource leveling
    applicable_entities: [tasks, projects]
    
  Workload:
    description: Resource allocation view
    features:
      - Capacity bars
      - Over/under allocation
      - Drag-drop assign
      - Time period toggle
    applicable_entities: [tasks, shifts]
    
  Dashboard:
    description: Widget-based dashboard
    features:
      - Drag-drop widgets
      - Widget library
      - Real-time updates
      - Drill-down
    applicable_entities: metrics
    
  Activity:
    description: Activity/audit feed
    features:
      - Chronological feed
      - Filtering
      - Entity links
      - User attribution
    applicable_entities: audit_logs
    
  Map:
    description: Geographic map view
    features:
      - Location markers
      - Clustering
      - Heat maps
      - Route display
    applicable_entities: [venues, assets, contacts]
    
  Form:
    description: Form builder/viewer
    features:
      - Drag-drop fields
      - Conditional logic
      - Validation
      - Submissions view
    applicable_entities: forms
    
  Public:
    description: Public shareable view
    features:
      - Read-only
      - Custom branding
      - Embedded forms
      - Registration
    applicable_entities: [events, forms, showcases]
```

### 6.2 Global Data View Toolbar

```yaml
GlobalToolbar:
  position: top
  responsive: true
  
  actions:
    Search:
      icon: Search
      shortcut: /
      behavior: Opens command palette with entity-specific search
      
    Filter:
      icon: Filter
      behavior: Opens advanced filter panel
      features:
        - Multiple conditions
        - AND/OR logic
        - Field-specific operators
        - Save as filter preset
        
    Sort:
      icon: ArrowUpDown
      behavior: Opens sort configuration
      features:
        - Multi-column sort
        - Ascending/descending
        - Clear sort
        
    Group:
      icon: Layers
      behavior: Opens grouping configuration
      features:
        - Group by field
        - Nested grouping
        - Collapse/expand all
        
    Fields:
      icon: Columns
      behavior: Opens field visibility/order panel
      features:
        - Show/hide columns
        - Drag-drop reorder
        - Reset to default
        
    ViewSwitcher:
      icon: Layout
      behavior: Opens view type selector
      features:
        - All applicable view types
        - Create new view
        - Saved views list
        
    Import:
      icon: Upload
      behavior: Opens import wizard
      features:
        - CSV upload
        - Field mapping
        - Validation preview
        - Error handling
        
    Export:
      icon: Download
      behavior: Opens export options
      features:
        - CSV export
        - Excel export
        - PDF export
        - API export
        
    Scan:
      icon: ScanLine
      behavior: Opens scanner
      features:
        - QR code scan
        - Barcode scan
        - RFID/NFC scan
        - Manual entry fallback
        
    Create:
      icon: Plus
      behavior: Opens create modal/panel
      features:
        - Quick create form
        - Template selection
        - Duplicate from existing
        
    BulkActions:
      icon: CheckSquare2
      behavior: Appears when items selected
      actions:
        - Edit selected
        - Delete selected
        - Move selected
        - Assign selected
        - Tag selected
        - Export selected
        
    Refresh:
      icon: RefreshCw
      behavior: Refreshes current view data
      features:
        - Manual refresh
        - Auto-refresh toggle
        - Last updated indicator
```

---

## 7. WORKFLOW ENGINE

### 7.1 Workflow Structure

```yaml
WorkflowEngine:
  storage: Database (versioned)
  execution: Supabase Edge Functions
  
  TriggerTypes:
    - entity_created
    - entity_updated
    - entity_deleted
    - field_changed
    - status_changed
    - schedule (cron)
    - webhook
    - manual
    - api_call
    - form_submitted
    - approval_decision
    - scan_event
    
  ConditionTypes:
    - field_equals
    - field_contains
    - field_greater_than
    - field_less_than
    - field_in_list
    - field_is_empty
    - field_changed_to
    - field_changed_from
    - user_has_role
    - entity_has_tag
    - time_condition
    - custom_function
    
  ActionTypes:
    - update_field
    - create_entity
    - delete_entity
    - send_notification
    - send_email
    - assign_user
    - add_tag
    - remove_tag
    - create_task
    - create_approval_request
    - trigger_webhook
    - call_api
    - run_function
    - send_slack_message
    - create_calendar_event
    - update_status
    - log_audit
    - delay
    - branch (conditional)
    
  ApprovalTypes:
    - single_approver
    - any_of_list
    - all_of_list
    - sequential_chain
    - parallel_chain
    - manager_hierarchy
    - role_based
```

### 7.2 Workflow Templates

```yaml
WorkflowTemplates:
  TaskManagement:
    - task_due_reminder: Remind assignees of upcoming due dates
    - task_overdue_escalation: Escalate overdue tasks to manager
    - task_assignment_notification: Notify when assigned
    - task_status_update: Notify watchers on status change
    - task_completion_workflow: Run cleanup on task completion
    
  ProjectManagement:
    - project_kickoff: Initialize project with tasks and teams
    - milestone_approaching: Remind stakeholders of milestones
    - budget_threshold_alert: Alert on budget percentage reached
    - project_status_report: Generate weekly status reports
    
  LiveProduction:
    - event_phase_transition: Handle phase change actions
    - show_call_published: Distribute to all crew
    - runsheet_delay_adjustment: Adjust downstream items
    - crew_call_reminder: Remind crew of upcoming calls
    
  Workforce:
    - shift_confirmation_request: Request shift confirmations
    - timesheet_submission_reminder: Remind to submit timesheets
    - certification_expiry_alert: Alert on expiring certifications
    - availability_conflict_alert: Detect scheduling conflicts
    
  Assets:
    - asset_checkout_approval: Approve high-value checkouts
    - asset_overdue_reminder: Remind for overdue returns
    - maintenance_due_scheduling: Schedule maintenance tasks
    - low_inventory_alert: Alert on low stock
    
  Finance:
    - invoice_overdue_reminder: Send payment reminders
    - expense_approval_routing: Route expenses for approval
    - budget_overage_alert: Alert on budget exceeded
    - payment_received_notification: Confirm payment receipt
    
  Talent:
    - booking_confirmation_workflow: Process confirmed bookings
    - rider_review_routing: Route riders for review
    - payment_due_reminder: Remind of upcoming payments
    - performance_day_checklist: Day-of-show preparation
    
  Experience:
    - ticket_purchase_confirmation: Send purchase confirmation
    - guest_check_in_notification: Notify host of arrival
    - hospitality_fulfillment: Track hospitality requests
    - transport_departure_alert: Send transport details
```

---

## 8. EXECUTION PHASES & SELF-CHECK

### Phase 1: Domain Modeling & ERD

```
VALIDATION CHECKLIST:
□ All 9 management domains have entity definitions
□ All entities mapped to IA navigation
□ Relationships correctly modeled
□ Lifecycle states defined for all stateful entities
□ No circular dependencies
□ Junction tables for all many-to-many relationships
```

### Phase 2: Database Schema (3NF)

```
VALIDATION CHECKLIST:
□ All tables have UUID primary keys
□ All tenant-scoped tables have organization_id
□ All mutable tables have audit fields (created_at, updated_at, created_by, deleted_at)
□ All foreign keys have ON DELETE actions
□ All indexes created for frequent queries
□ No array columns for relational data
□ No computed columns without justification
□ All enums defined and used consistently
```

### Phase 3: RLS & RBAC Policies

```
VALIDATION CHECKLIST:
□ RLS enabled on all tenant-scoped tables
□ All roles defined with permission sets
□ Permission hierarchy enforced
□ Pricing tier restrictions enforced
□ Cross-tenant access impossible
□ Service role bypass for Edge Functions
```

### Phase 4: Seed & Demo Data

```
VALIDATION CHECKLIST:
□ Demo organization created
□ Users for all roles created
□ All pricing tiers represented
□ Sample data for all entities
□ Full lifecycle examples (draft → completed)
□ Realistic data relationships
```

### Phase 5: OpenAPI 3.1 Specification

```
VALIDATION CHECKLIST:
□ All entities have CRUD endpoints
□ All toolbar actions mapped
□ All bulk operations defined
□ Authentication documented
□ Response schemas match database
□ Error responses standardized
```

### Phase 6: Workflow Engine

```
VALIDATION CHECKLIST:
□ Workflow schema implemented
□ All trigger types functional
□ All condition types functional
□ All action types functional
□ Versioning working
□ Run history logged
□ Error handling implemented
```

### Phase 7: Data View Engine

```
VALIDATION CHECKLIST:
□ All 12 view types rendering
□ View configurations persisted
□ User preferences saved
□ Permission-aware filtering
□ Export/import functional
□ Mobile view parity
```

### Phase 8: Navigation Structure

```
VALIDATION CHECKLIST:
□ Top Bar complete with all components
□ Sidebar all sections and items
□ Mobile Bottom Nav functional
□ Breadcrumbs dynamic
□ AI Command Bar functional
□ All routes resolve to modules
□ Permission-based visibility
```

### Phase 9: Backend Services

```
VALIDATION CHECKLIST:
□ All Edge Functions deployed
□ Authentication working
□ Authorization enforced
□ Audit logging active
□ Scheduled jobs running
□ Webhook delivery functional
```

### Phase 10: Web UI (ATLVS)

```
VALIDATION CHECKLIST:
□ All navigation items implemented
□ All views rendering
□ All toolbar actions working
□ WCAG 2.2 AAA compliant
□ Dark/light modes working
□ Responsive design complete
□ No placeholder content
```

### Phase 11: Mobile UI (COMPVSS)

```
VALIDATION CHECKLIST:
□ Bottom nav functional
□ More menu complete
□ Offline mode working
□ Scan actions functional
□ Push notifications working
□ IA parity with web
```

### Phase 12: Public UI (GVTEWAY)

```
VALIDATION CHECKLIST:
□ Network section functional
□ Public views accessible
□ White-label theming applied
□ Guest registration working
□ Community features active
```

### Phase 13: White-Label Theming

```
VALIDATION CHECKLIST:
□ Token-based themes applied
□ All colors configurable
□ Typography configurable
□ Logo/branding assets loading
□ Email templates branded
□ No hardcoded brand values
```

### Phase 14: Compliance Validation

```
VALIDATION CHECKLIST:
□ WCAG 2.2 AAA audit passing
□ GDPR consent flows working
□ Data retention policies active
□ Right-to-be-forgotten functional
□ Security headers configured
□ Rate limiting active
```

### Phase 15: Final System Validation

```
VALIDATION CHECKLIST:
□ Full demo lifecycle complete
□ All user roles tested
□ All pricing tiers tested
□ Performance benchmarks met
□ No TODOs in codebase
□ No mismatches DB/API/UI/IA
□ Zero runtime errors
```

---

## 9. FINAL DIRECTIVE

```
┌─────────────────────────────────────────────────────────────────┐
│                     EXECUTION REQUIREMENTS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Information Architecture (Section 3) is AUTHORITATIVE       │
│                                                                  │
│  2. All 9 management domains must be fully implemented          │
│                                                                  │
│  3. Navigation structure must match specification exactly       │
│                                                                  │
│  4. Self-check validation is MANDATORY at each phase            │
│                                                                  │
│  5. IDE must build in ONE PASS, deterministic                   │
│                                                                  │
│  6. STOP execution when all validations pass                    │
│                                                                  │
│  7. NO assumptions, shortcuts, or inferred entities             │
│                                                                  │
│  8. NO placeholders, stubs, or TODO comments                    │
│                                                                  │
│  9. Every UI element must trace to a database entity            │
│                                                                  │
│  10. Every API endpoint must trace to this specification        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Build like infrastructure.
Validate like a regulator.
Stop like a compiler.
```

---

## 10. APPENDIX: ENTITY COUNT SUMMARY

| Domain | Tables | Views | Workflows | Endpoints |
|--------|--------|-------|-----------|-----------|
| Core (shared) | 45 | 12 | 10 | 89 |
| Project Management | 18 | 7 | 8 | 42 |
| Live Production | 22 | 6 | 12 | 48 |
| Workforce Management | 24 | 8 | 9 | 52 |
| Asset Management | 19 | 5 | 7 | 38 |
| Finance Management | 28 | 6 | 11 | 56 |
| Content Management | 16 | 4 | 6 | 32 |
| Business Management | 21 | 5 | 8 | 44 |
| Experience Management | 26 | 7 | 10 | 54 |
| Talent Management | 18 | 5 | 8 | 36 |
| **TOTAL** | **287** | **65** | **89** | **491** |