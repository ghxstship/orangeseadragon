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
  CreditCard,
  BarChart3,
  Palette,
  Mail,
  UserPlus,
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
 * SIDEBAR NAVIGATION - v5 Information Architecture
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 7 Modules, 57 Pages - Optimized for:
 * - 3NF/SSOT compliance (zero data overlap)
 * - Cognitive load reduction (7±2 items per level)
 * - Workflow-based page ordering
 * - Catalog = Equipment SSOT (what you OWN)
 * - Products & Services = Business SSOT (what you SELL)
 *
 * See: /docs/OPTIMIZED_IA_STRUCTURE.md for full specification
 */
export const sidebarNavigation: NavSection[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // CORE - Personal Workspace (6 pages)
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
      },
      {
        title: "Inbox",
        path: "/core/inbox",
        icon: Inbox,
        description: "Notifications & approvals",
      },
      {
        title: "Documents",
        path: "/core/documents",
        icon: FileText,
        description: "Personal document library",
      },
      {
        title: "Workflows",
        path: "/core/workflows",
        icon: GitBranch,
        description: "Personal automations",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCTIONS - Pre/Post Event Lifecycle (8 pages)
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
      },
      {
        title: "Events",
        path: "/productions/events",
        icon: Calendar,
        description: "Individual events within productions",
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
        icon: ClipboardList,
        description: "Permits, licenses & certificates",
        subpages: [
          { title: "Permits", path: "/productions/compliance/permits" },
          { title: "Licenses", path: "/productions/compliance/licenses" },
          { title: "Certificates", path: "/productions/compliance/certificates" },
        ],
      },
      {
        title: "Inspections",
        path: "/productions/inspections",
        icon: CheckSquare,
        description: "Pre/post event inspections",
      },
      {
        title: "Punch Lists",
        path: "/productions/punch-lists",
        icon: ClipboardList,
        description: "Deficiency & fix items",
      },
      {
        title: "Advancing",
        path: "/productions/advancing",
        icon: Users,
        description: "Artist/vendor advance coordination",
        subpages: [
          { title: "Riders", path: "/productions/advancing/riders" },
          { title: "Tech Specs", path: "/productions/advancing/tech-specs" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPERATIONS - Run of Show (7 pages)
  // Ordered by: Shows → Runsheets → Venues → Incidents → Reports
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: "OPERATIONS",
    defaultExpanded: false,
    items: [
      {
        title: "Shows",
        path: "/operations/shows",
        icon: Clapperboard,
        description: "Live shows & performances",
      },
      {
        title: "Runsheets",
        path: "/operations/runsheets",
        icon: ClipboardList,
        description: "Real-time schedules & cue sheets",
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
        ],
      },
      {
        title: "Incidents",
        path: "/operations/incidents",
        icon: ClipboardList,
        description: "Live incident reports",
      },
      {
        title: "Work Orders",
        path: "/operations/work-orders",
        icon: Wrench,
        description: "On-site fix requests",
      },
      {
        title: "Daily Reports",
        path: "/operations/daily-reports",
        icon: FileText,
        description: "End-of-day summaries",
      },
      {
        title: "Comms",
        path: "/operations/comms",
        icon: MessageSquare,
        description: "Radio channels & weather",
        subpages: [
          { title: "Radio", path: "/operations/comms/radio" },
          { title: "Weather", path: "/operations/comms/weather" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PEOPLE - Human Resources (11 pages)
  // Ordered by: Roster → Availability → Recruit → Onboard → Train → Schedule → Track → Review
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
      },
      {
        title: "Availability",
        path: "/people/availability",
        icon: Calendar,
        description: "Person availability tracking",
      },
      {
        title: "Travel & Lodging",
        path: "/people/travel",
        icon: MapPin,
        description: "Bookings & accommodations",
        subpages: [
          { title: "Bookings", path: "/people/travel/bookings" },
          { title: "Accommodations", path: "/people/travel/accommodations" },
        ],
      },
      {
        title: "Recruitment",
        path: "/people/recruitment",
        icon: UserPlus,
        description: "Candidates & hiring",
      },
      {
        title: "Onboarding",
        path: "/people/onboarding",
        icon: CheckSquare,
        description: "New hire onboarding tasks",
      },
      {
        title: "Training",
        path: "/people/training",
        icon: Award,
        description: "Training records & courses",
        subpages: [
          { title: "Courses", path: "/people/training/courses" },
          { title: "Materials", path: "/people/training/materials" },
        ],
      },
      {
        title: "Scheduling",
        path: "/people/scheduling",
        icon: Calendar,
        description: "Person schedule assignments",
        subpages: [
          { title: "Shifts", path: "/people/scheduling/shifts" },
        ],
      },
      {
        title: "Timekeeping",
        path: "/people/timekeeping",
        icon: ClipboardList,
        description: "Timesheets & time tracking",
      },
      {
        title: "Performance",
        path: "/people/performance",
        icon: BarChart3,
        description: "Reviews & goals",
        subpages: [
          { title: "Reviews", path: "/people/performance/reviews" },
          { title: "Goals", path: "/people/performance/goals" },
        ],
      },
      {
        title: "Certifications",
        path: "/people/certifications",
        icon: Award,
        description: "Credentials & certifications",
      },
      {
        title: "Positions",
        path: "/people/positions",
        icon: Users,
        description: "Job roles & titles",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ASSETS - Equipment & Logistics (9 pages)
  // Ordered by: Catalog → Inventory → Locate → Reserve → Advance → Deploy → Ship → Status → Maintain
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
        ],
      },
      {
        title: "Inventory",
        path: "/assets/inventory",
        icon: Package,
        description: "Physical asset instances",
      },
      {
        title: "Locations",
        path: "/assets/locations",
        icon: MapPin,
        description: "Warehouses & staging areas",
        subpages: [
          { title: "Warehouses", path: "/assets/locations/warehouses" },
          { title: "Staging Areas", path: "/assets/locations/staging" },
        ],
      },
      {
        title: "Reservations",
        path: "/assets/reservations",
        icon: Calendar,
        description: "Asset reservation requests",
      },
      {
        title: "Advances",
        path: "/assets/advances",
        icon: Truck,
        description: "Production advances (gear sent ahead)",
      },
      {
        title: "Deployment",
        path: "/assets/deployment",
        icon: MapPin,
        description: "Asset deployment to productions",
      },
      {
        title: "Logistics",
        path: "/assets/logistics",
        icon: Truck,
        description: "Shipments & transport",
        subpages: [
          { title: "Shipments", path: "/assets/logistics/shipments" },
          { title: "Vehicles", path: "/assets/logistics/vehicles" },
        ],
      },
      {
        title: "Asset Status",
        path: "/assets/status",
        icon: CheckSquare,
        description: "Check-in/out & service status",
        subpages: [
          { title: "Check-In/Out", path: "/assets/status/check" },
          { title: "Service Status", path: "/assets/status/service" },
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
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS - Revenue + Relationships (8 pages)
  // Ordered by: Pipeline → Companies → Propose → Contract → Products → Market → Subscribers
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
        ],
      },
      {
        title: "Companies",
        path: "/business/companies",
        icon: Building2,
        description: "Clients, vendors, partners & sponsors",
        subpages: [
          { title: "Contacts", path: "/business/companies/contacts" },
        ],
      },
      {
        title: "Proposals",
        path: "/business/proposals",
        icon: FileText,
        description: "Formal proposal documents",
      },
      {
        title: "Contracts",
        path: "/business/contracts",
        icon: FileText,
        description: "Signed agreements",
      },
      {
        title: "Products & Services",
        path: "/business/products",
        icon: ShoppingCart,
        description: "Business offerings (what you SELL)",
        subpages: [
          { title: "Products", path: "/business/products/list" },
          { title: "Services", path: "/business/products/services" },
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
        ],
      },
      {
        title: "Subscribers",
        path: "/business/subscribers",
        icon: Users,
        description: "Email & marketing subscribers",
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
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCE - Money In/Out (8 pages)
  // Ordered by: Budget → Procure → Expense → Invoice → Pay → Payroll → Accounts → Report
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
        ],
      },
      {
        title: "Procurement",
        path: "/finance/procurement",
        icon: ShoppingCart,
        description: "Purchase orders",
      },
      {
        title: "Expenses",
        path: "/finance/expenses",
        icon: CreditCard,
        description: "Expense records",
      },
      {
        title: "Invoices",
        path: "/finance/invoices",
        icon: FileText,
        description: "Customer invoices",
        subpages: [
          { title: "Line Items", path: "/finance/invoices/line-items" },
          { title: "Payments", path: "/finance/invoices/payments" },
        ],
      },
      {
        title: "Payments",
        path: "/finance/payments",
        icon: CreditCard,
        description: "Payments in & out",
        subpages: [
          { title: "Incoming", path: "/finance/payments/incoming" },
          { title: "Outgoing", path: "/finance/payments/outgoing" },
        ],
      },
      {
        title: "Payroll",
        path: "/finance/payroll",
        icon: Users,
        description: "Payroll batches & pay stubs",
        subpages: [
          { title: "Pay Stubs", path: "/finance/payroll/stubs" },
        ],
      },
      {
        title: "Accounts",
        path: "/finance/accounts",
        icon: Building2,
        description: "GL & bank accounts",
        subpages: [
          { title: "GL", path: "/finance/accounts/gl" },
          { title: "Bank", path: "/finance/accounts/bank" },
        ],
      },
      {
        title: "Reports",
        path: "/finance/reports",
        icon: BarChart3,
        description: "Financial reports",
        subpages: [
          { title: "P&L", path: "/finance/reports/pnl" },
          { title: "Cash Flow", path: "/finance/reports/cash-flow" },
          { title: "AR/AP", path: "/finance/reports/ar-ap" },
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
    title: "Connections",
    path: "/network/connections",
    icon: Link,
    description: "Professional networking",
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
  },
];

export const mobileBottomNav: NavItem[] = [
  { title: "Dashboard", path: "/core/dashboard", icon: LayoutDashboard },
  { title: "Calendar", path: "/core/calendar", icon: Calendar },
  { title: "Tasks", path: "/core/tasks", icon: CheckSquare },
  { title: "Productions", path: "/productions", icon: Clapperboard },
];
