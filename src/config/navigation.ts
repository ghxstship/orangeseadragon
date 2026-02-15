import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  GitBranch,
  Package,
  FileText,
  Clapperboard,
  Users,
  ClipboardList,
  ClipboardCheck,
  Award,
  MessageSquare,
  Trophy,
  Store,
  Compass,
  Link,
  Building2,
  DollarSign,
  Inbox,
  MapPin,
  Truck,
  Wrench,
  ShoppingCart,
  BarChart3,
  Palette,
  Mail,
  UserPlus,
  Plane,
  Shield,
  Receipt,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  description?: string;
  permission?: string;
  badge?: string;
  subpages?: { title: string; path: string }[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
  defaultExpanded?: boolean;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SIDEBAR NAVIGATION - v6 Information Architecture
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 7 Modules, 37 Top-Level Pages, 93 Subpages - Optimized for:
 * - 3NF/SSOT compliance (zero data overlap)
 * - Cognitive load reduction (5-6 items per module)
 * - Schema-driven coverage (149 entities mapped)
 * - Workflow-based page ordering
 * - Catalog = Equipment SSOT (what you OWN)
 * - Products & Services = Business SSOT (what you SELL)
 *
 * See: /docs/OPTIMIZED_IA_STRUCTURE.md for full specification
 */
export const sidebarNavigation: NavSection[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // CORE - Personal Workspace (6 pages)
  // Schema: tasks, checklists, sprints, notifications, approval_requests,
  //         documents, document_folders, workflows, workflow_runs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: "CORE",
    defaultExpanded: true,
    items: [
      {
        title: "Dashboard",
        path: "/core/dashboard",
        icon: LayoutDashboard,
        description: "Personal command center",
      },
      {
        title: "Calendar",
        path: "/core/calendar",
        icon: Calendar,
        description: "Unified calendar view",
      },
      {
        title: "Tasks",
        path: "/core/tasks",
        icon: CheckSquare,
        description: "Personal task management",
        subpages: [
          { title: "Checklists", path: "/core/tasks/checklists" },
          { title: "Sprints", path: "/core/tasks/sprints" },
        ],
      },
      {
        title: "Inbox",
        path: "/core/inbox",
        icon: Inbox,
        description: "Notifications & approvals",
        subpages: [
          { title: "Notifications", path: "/core/inbox/notifications" },
          { title: "Approvals", path: "/core/inbox/approvals" },
        ],
      },
      {
        title: "Documents",
        path: "/core/documents",
        icon: FileText,
        description: "Personal document library",
        subpages: [
          { title: "Folders", path: "/core/documents/folders" },
          { title: "Templates", path: "/core/documents/templates" },
        ],
      },
      {
        title: "Workflows",
        path: "/core/workflows",
        icon: GitBranch,
        description: "Personal automations",
        subpages: [
          { title: "Automations", path: "/core/workflows/automations" },
          { title: "Triggers", path: "/core/workflows/triggers" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCTIONS - Pre/Post Event Lifecycle (5 pages)
  // Schema: productions, events, stages, activations, build_strike_schedules,
  //         permits, licenses, certificates, insurance_policies, riders,
  //         tech_specs, hospitality_requests, catering_orders, guest_lists
  // Ordered by: Plan → Build → Execute → Inspect → Close
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: "PRODUCTIONS",
    defaultExpanded: true,
    items: [
      {
        title: "Productions",
        path: "/productions",
        icon: Clapperboard,
        description: "Master production records",
        subpages: [
          { title: "Events", path: "/productions/events" },
          { title: "Stages", path: "/productions/stages" },
        ],
      },
      {
        title: "Activations",
        path: "/productions/activations",
        icon: Award,
        description: "Brand activations & sponsorship execution",
      },
      {
        title: "Build & Strike",
        path: "/productions/build-strike",
        icon: Wrench,
        description: "Production schedule - installation & restoration",
      },
      {
        title: "Compliance",
        path: "/productions/compliance",
        icon: Shield,
        description: "Permits, licenses & certificates",
        subpages: [
          { title: "Permits", path: "/productions/compliance/permits" },
          { title: "Licenses", path: "/productions/compliance/licenses" },
          { title: "Certificates", path: "/productions/compliance/certificates" },
          { title: "Insurance", path: "/productions/compliance/insurance" },
        ],
      },
      {
        title: "Advancing",
        path: "/productions/advancing",
        icon: ClipboardCheck,
        description: "Production advance coordination & logistics",
        subpages: [
          { title: "Advances", path: "/productions/advancing/advances" },
          { title: "Allotments", path: "/productions/advancing/allotments" },
          { title: "Approvals", path: "/productions/advancing/approvals" },
          { title: "Assignments", path: "/productions/advancing/assignments" },
          { title: "Activity", path: "/productions/advancing/activity" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPERATIONS - Run of Show (5 pages)
  // Schema: events (live), runsheets, runsheet_items, crew_calls, crew_assignments,
  //         talent_bookings, venues, floor_plans, venue_zones, checkpoints,
  //         incidents, punch_lists, work_orders, radio_channels, weather_reports
  // Ordered by: Events → Venues → Incidents → Work Orders → Comms
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: "OPERATIONS",
    defaultExpanded: false,
    items: [
      {
        title: "Events",
        path: "/operations/events",
        icon: Clapperboard,
        description: "Live events & performances",
        subpages: [
          { title: "Runsheets", path: "/operations/events/runsheets" },
          { title: "Crew Calls", path: "/operations/events/crew-calls" },
          { title: "Talent Bookings", path: "/operations/events/talent-bookings" },
        ],
      },
      {
        title: "Venues",
        path: "/operations/venues",
        icon: MapPin,
        description: "Physical locations",
        subpages: [
          { title: "Floor Plans", path: "/operations/venues/floor-plans" },
          { title: "Zones", path: "/operations/venues/zones" },
          { title: "Checkpoints", path: "/operations/venues/checkpoints" },
          { title: "Stages", path: "/operations/venues/stages" },
        ],
      },
      {
        title: "Incidents",
        path: "/operations/incidents",
        icon: ClipboardList,
        description: "Live incident reports",
        subpages: [
          { title: "Punch Lists", path: "/operations/incidents/punch-lists" },
        ],
      },
      {
        title: "Work Orders",
        path: "/operations/work-orders",
        icon: Wrench,
        description: "On-site fix requests",
      },
      {
        title: "Comms",
        path: "/operations/comms",
        icon: MessageSquare,
        description: "Radio channels & weather",
        subpages: [
          { title: "Radio", path: "/operations/comms/radio" },
          { title: "Weather", path: "/operations/comms/weather" },
          { title: "Daily Reports", path: "/operations/comms/daily-reports" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PEOPLE - Human Resources (6 pages)
  // Schema: employee_profiles, position_types, departments, teams, candidates,
  //         onboarding_tasks, job_applications, availability, shifts, crew_calls,
  //         timesheets, time_entries, training_courses, certifications, flights,
  //         transportation, accommodations, performance_reviews, goals
  // Ordered by: Roster → Recruit → Schedule → Train → Travel → Review
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: "PEOPLE",
    defaultExpanded: false,
    items: [
      {
        title: "Rosters",
        path: "/people/rosters",
        icon: Users,
        description: "Staff, crew, contractors & talent",
        subpages: [
          { title: "Positions", path: "/people/rosters/positions" },
          { title: "Departments", path: "/people/rosters/departments" },
          { title: "Teams", path: "/people/rosters/teams" },
        ],
      },
      {
        title: "Recruitment",
        path: "/people/recruitment",
        icon: UserPlus,
        description: "Candidates & hiring",
        subpages: [
          { title: "Candidates", path: "/people/recruitment/candidates" },
          { title: "Applications", path: "/people/recruitment/applications" },
          { title: "Onboarding", path: "/people/recruitment/onboarding" },
        ],
      },
      {
        title: "Scheduling",
        path: "/people/scheduling",
        icon: Calendar,
        description: "Person schedule assignments",
        subpages: [
          { title: "Availability", path: "/people/scheduling/availability" },
          { title: "Shifts", path: "/people/scheduling/shifts" },
          { title: "Crew Calls", path: "/people/scheduling/crew-calls" },
          { title: "Timekeeping", path: "/people/scheduling/timekeeping" },
          { title: "Clock In/Out", path: "/people/scheduling/clock" },
          { title: "Shift Swaps", path: "/people/scheduling/shift-swaps" },
          { title: "Open Shifts", path: "/people/scheduling/open-shifts" },
        ],
      },
      {
        title: "Training",
        path: "/people/training",
        icon: Award,
        description: "Training records & courses",
        subpages: [
          { title: "Courses", path: "/people/training/courses" },
          { title: "Materials", path: "/people/training/materials" },
          { title: "Certifications", path: "/people/training/certifications" },
          { title: "Compliance", path: "/people/training/compliance" },
          { title: "Enrollments", path: "/people/training/enrollments" },
        ],
      },
      {
        title: "Travel & Lodging",
        path: "/people/travel",
        icon: Plane,
        description: "Bookings & accommodations",
        subpages: [
          { title: "Flights", path: "/people/travel/flights" },
          { title: "Ground Transport", path: "/people/travel/ground-transport" },
          { title: "Accommodations", path: "/people/travel/accommodations" },
        ],
      },
      {
        title: "Performance",
        path: "/people/performance",
        icon: BarChart3,
        description: "Reviews & goals",
        subpages: [
          { title: "Reviews", path: "/people/performance/reviews" },
          { title: "Goals", path: "/people/performance/goals" },
          { title: "Feedback", path: "/people/performance/feedback" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ASSETS - Equipment & Logistics (5 pages)
  // Schema: catalog_items, asset_categories, assets, inventory_items, locations,
  //         warehouses, staging_areas, storage_bins, shipments, vehicles,
  //         advances, asset_deployments, asset_reservations, asset_check_actions,
  //         asset_transfers, asset_maintenance, repair_orders
  // Ordered by: Catalog → Locate → Reserve → Ship → Maintain
  // Catalog = Equipment SSOT (Uline-style - what you OWN)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: "ASSETS",
    defaultExpanded: false,
    items: [
      {
        title: "Catalog",
        path: "/assets/catalog",
        icon: Package,
        description: "Equipment catalog (Uline-style SSOT)",
        subpages: [
          { title: "Categories", path: "/assets/catalog/categories" },
          { title: "Inventory", path: "/assets/catalog/inventory" },
          { title: "Consumables", path: "/assets/catalog/consumables" },
        ],
      },
      {
        title: "Locations",
        path: "/assets/locations",
        icon: MapPin,
        description: "Warehouses & staging areas",
        subpages: [
          { title: "Warehouses", path: "/assets/locations/warehouses" },
          { title: "Staging Areas", path: "/assets/locations/staging" },
          { title: "Bins", path: "/assets/locations/bins" },
        ],
      },
      {
        title: "Logistics",
        path: "/assets/logistics",
        icon: Truck,
        description: "Shipments & transport",
        subpages: [
          { title: "Shipments", path: "/assets/logistics/shipments" },
          { title: "Vehicles", path: "/assets/logistics/vehicles" },
          { title: "Deployment", path: "/assets/logistics/deployment" },
        ],
      },
      {
        title: "Reservations",
        path: "/assets/reservations",
        icon: Calendar,
        description: "Asset reservation requests",
        subpages: [
          { title: "Check-In/Out", path: "/assets/reservations/check" },
          { title: "Transfers", path: "/assets/reservations/transfers" },
        ],
      },
      {
        title: "Maintenance",
        path: "/assets/maintenance",
        icon: Wrench,
        description: "Scheduled maintenance & repairs",
        subpages: [
          { title: "Scheduled", path: "/assets/maintenance/scheduled" },
          { title: "Repairs", path: "/assets/maintenance/repairs" },
          { title: "Service History", path: "/assets/maintenance/history" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS - Revenue + Relationships (5 pages)
  // Schema: leads, deals, proposals, activities, pipelines, pipeline_stages,
  //         companies, contacts, contracts, products, services, price_lists,
  //         campaigns, email_campaigns, forms, subscribers, email_templates,
  //         brand_logos, brand_colors, brand_typography
  // Ordered by: Pipeline → Companies → Products → Campaigns → Brand
  // Products & Services = Business SSOT (what you SELL)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: "BUSINESS",
    defaultExpanded: false,
    items: [
      {
        title: "Pipeline",
        path: "/business/pipeline",
        icon: BarChart3,
        description: "Sales opportunities & deals",
        subpages: [
          { title: "Leads", path: "/business/pipeline/leads" },
          { title: "Opportunities", path: "/business/pipeline/opportunities" },
          { title: "Proposals", path: "/business/pipeline/proposals" },
          { title: "Activities", path: "/business/pipeline/activities" },
        ],
      },
      {
        title: "Companies",
        path: "/business/companies",
        icon: Building2,
        description: "Clients, vendors, partners & sponsors",
        subpages: [
          { title: "Contacts", path: "/business/companies/contacts" },
          { title: "Contracts", path: "/business/companies/contracts" },
          { title: "Vendors", path: "/business/companies/vendors" },
          { title: "Sponsors", path: "/business/companies/sponsors" },
        ],
      },
      {
        title: "Products & Services",
        path: "/business/products",
        icon: ShoppingCart,
        description: "Business offerings (what you SELL)",
        subpages: [
          { title: "Products", path: "/business/products/list" },
          { title: "Services", path: "/business/products/services" },
          { title: "Pricing", path: "/business/products/pricing" },
          { title: "Packages", path: "/business/products/packages" },
        ],
      },
      {
        title: "Campaigns",
        path: "/business/campaigns",
        icon: Mail,
        description: "Marketing campaigns",
        subpages: [
          { title: "Email", path: "/business/campaigns/email" },
          { title: "Content", path: "/business/campaigns/content" },
          { title: "Forms", path: "/business/campaigns/forms" },
          { title: "Subscribers", path: "/business/campaigns/subscribers" },
          { title: "Templates", path: "/business/campaigns/templates" },
        ],
      },
      {
        title: "Brand Kit",
        path: "/business/brand",
        icon: Palette,
        description: "Logos, colors & typography",
        subpages: [
          { title: "Logos", path: "/business/brand/logos" },
          { title: "Colors", path: "/business/brand/colors" },
          { title: "Typography", path: "/business/brand/typography" },
          { title: "Assets", path: "/business/brand/assets" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCE - Money In/Out (7 pages)
  // Schema: budgets, budget_line_items, budget_categories, purchase_orders,
  //         invoices, invoice_line_items, payments, credit_notes, expenses,
  //         expense_receipts, reimbursements, payroll_batches, pay_stubs,
  //         pay_rates, deductions, accounts, bank_accounts, transactions,
  //         quotes, recurring_invoices, reminder_templates, bank_connections,
  //         imported_transactions, receipt_scans
  // Ordered by: Budget → Invoice → Quote → Expense → Payroll → Banking → Accounts
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: "FINANCE",
    defaultExpanded: false,
    items: [
      {
        title: "Budgets",
        path: "/finance/budgets",
        icon: DollarSign,
        description: "Production & project budgets",
        subpages: [
          { title: "Line Items", path: "/finance/budgets/line-items" },
          { title: "Procurement", path: "/finance/budgets/procurement" },
          { title: "Purchase Orders", path: "/finance/budgets/purchase-orders" },
        ],
      },
      {
        title: "Invoices",
        path: "/finance/invoices",
        icon: FileText,
        description: "Customer invoices",
        subpages: [
          { title: "Line Items", path: "/finance/invoices/line-items" },
          { title: "Payments", path: "/finance/invoices/payments" },
          { title: "Credit Notes", path: "/finance/invoices/credit-notes" },
          { title: "Recurring", path: "/finance/recurring-invoices" },
        ],
      },
      {
        title: "Quotes",
        path: "/finance/quotes",
        icon: FileText,
        description: "Quotes & estimates",
      },
      {
        title: "Expenses",
        path: "/finance/expenses",
        icon: Receipt,
        description: "Expense records",
        subpages: [
          { title: "Receipts", path: "/finance/receipts" },
          { title: "Reimbursements", path: "/finance/expenses/reimbursements" },
          { title: "Approvals", path: "/finance/expense-approvals" },
        ],
      },
      {
        title: "Payroll",
        path: "/finance/payroll",
        icon: Users,
        description: "Payroll batches & pay stubs",
        subpages: [
          { title: "Pay Stubs", path: "/finance/payroll/stubs" },
          { title: "Pay Rates", path: "/finance/payroll/rates" },
          { title: "Deductions", path: "/finance/payroll/deductions" },
        ],
      },
      {
        title: "Banking",
        path: "/finance/banking",
        icon: Building2,
        description: "Bank connections & reconciliation",
      },
      {
        title: "Accounts",
        path: "/finance/accounts",
        icon: Building2,
        description: "GL & bank accounts",
        subpages: [
          { title: "GL", path: "/finance/accounts/gl" },
          { title: "Bank", path: "/finance/accounts/bank" },
          { title: "Transactions", path: "/finance/accounts/transactions" },
          { title: "Reconciliation", path: "/finance/accounts/reconciliation" },
        ],
      },
    ],
  },
];

/**
 * NETWORK - Community/Social Layer
 * Accessible via header/profile menu, not competing for sidebar space
 */
export const networkNavigation: NavItem[] = [
  {
    title: "Feed",
    path: "/network/feed",
    icon: LayoutDashboard,
    description: "Activity feed and updates",
  },
  {
    title: "Messages",
    path: "/network/messages",
    icon: MessageSquare,
    description: "Direct and group messaging",
  },
  {
    title: "Connections",
    path: "/network/connections",
    icon: Link,
    description: "Professional networking",
    subpages: [
      { title: "Pending Requests", path: "/network/connections?tab=pending" },
      { title: "Discover People", path: "/network/discover" },
    ],
  },
  {
    title: "Discussions",
    path: "/network/discussions",
    icon: MessageSquare,
    description: "Community forums",
  },
  {
    title: "Marketplace",
    path: "/network/marketplace",
    icon: Store,
    description: "Services and product marketplace",
  },
  {
    title: "Opportunities",
    path: "/network/opportunities",
    icon: Compass,
    description: "Job board and opportunities",
  },
  {
    title: "Showcase",
    path: "/network/showcase",
    icon: Award,
    description: "Portfolio and work showcase",
  },
  {
    title: "Challenges",
    path: "/network/challenges",
    icon: Trophy,
    description: "Competitions and challenges",
    subpages: [
      { title: "Leaderboard", path: "/network/leaderboard" },
      { title: "Badges", path: "/network/badges" },
    ],
  },
];

export const mobileBottomNav: NavItem[] = [
  { title: "Dashboard", path: "/core/dashboard", icon: LayoutDashboard },
  { title: "Calendar", path: "/core/calendar", icon: Calendar },
  { title: "Tasks", path: "/core/tasks", icon: CheckSquare },
  { title: "Productions", path: "/productions", icon: Clapperboard },
];
