/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INFORMATION ARCHITECTURE REGISTRY - v5
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SINGLE SOURCE OF TRUTH for all routes, entities, and page configurations.
 * v5 IA: 7 modules, 57 pages, 3NF/SSOT compliant
 *
 * Key Changes from v4:
 * - Routes moved from /modules/* to top-level (e.g., /productions, /people)
 * - Projects module REMOVED
 * - Workforce renamed to People
 * - Tracking renamed to Asset Status
 * - Catalog = Equipment SSOT (what you OWN)
 * - Products & Services = Business SSOT (what you SELL)
 * - Activity renamed to Inbox
 * - NETWORK moved to header access
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type LayoutType =
  | "entity-list"
  | "entity-detail"
  | "entity-form"
  | "dashboard"
  | "settings"
  | "wizard"
  | "workspace"
  | "document"
  | "empty";

export type PageStatus = "not-started" | "in-progress" | "complete";

export interface SubpageDefinition {
  key: string;
  label: string;
  path: string;
  query?: {
    where?: Record<string, unknown>;
    orderBy?: { field: string; direction: "asc" | "desc" };
  };
  count?: boolean;
  icon?: string;
}

export interface TabDefinition {
  key: string;
  label: string;
  icon?: string;
  type: "overview" | "related" | "activity" | "comments" | "files" | "settings" | "custom";
  entity?: string;
  foreignKey?: string;
  defaultView?: string;
  allowCreate?: boolean;
  lazy?: boolean;
}

export interface PageDefinition {
  path: string;
  title: string;
  layout: LayoutType;
  entity?: string;
  icon?: string;
  description?: string;
  subpages?: SubpageDefinition[];
  tabs?: TabDefinition[];
  status: PageStatus;
}

export interface RouteGroup {
  name: string;
  basePath: string;
  description: string;
  pages: PageDefinition[];
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────────────────────

export const authRoutes: RouteGroup = {
  name: "Auth",
  basePath: "/(auth)",
  description: "Authentication flows",
  pages: [
    { path: "/login", title: "Sign In", layout: "wizard", icon: "LogIn", description: "User authentication", status: "not-started" },
    { path: "/register", title: "Create Account", layout: "wizard", icon: "UserPlus", description: "New user registration", status: "not-started" },
    { path: "/forgot-password", title: "Forgot Password", layout: "wizard", icon: "KeyRound", description: "Password reset request", status: "not-started" },
    { path: "/reset-password", title: "Reset Password", layout: "wizard", icon: "KeyRound", description: "Password reset form", status: "not-started" },
    { path: "/verify-email", title: "Verify Email", layout: "wizard", icon: "MailCheck", description: "Email verification", status: "not-started" },
    { path: "/verify-mfa", title: "Two-Factor Auth", layout: "wizard", icon: "ShieldCheck", description: "MFA verification", status: "not-started" },
    { path: "/sso/[provider]", title: "SSO Login", layout: "wizard", icon: "Link", description: "Single sign-on callback", status: "not-started" },
    { path: "/invite/[token]", title: "Accept Invite", layout: "wizard", icon: "UserPlus", description: "Team invitation acceptance", status: "not-started" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING ROUTES
// ─────────────────────────────────────────────────────────────────────────────

export const onboardingRoutes: RouteGroup = {
  name: "Onboarding",
  basePath: "/(onboarding)",
  description: "New user onboarding wizard",
  pages: [
    { path: "/", title: "Welcome", layout: "wizard", icon: "Sparkles", description: "Onboarding start", status: "not-started" },
    { path: "/profile", title: "Your Profile", layout: "wizard", entity: "profile", icon: "User", description: "Profile setup", status: "not-started" },
    { path: "/organization", title: "Organization", layout: "wizard", entity: "organization", icon: "Building2", description: "Organization setup", status: "not-started" },
    { path: "/team", title: "Invite Team", layout: "wizard", icon: "Users", description: "Team invitations", status: "not-started" },
    { path: "/preferences", title: "Preferences", layout: "wizard", icon: "Settings", description: "Initial preferences", status: "not-started" },
    { path: "/integrations", title: "Integrations", layout: "wizard", icon: "Plug", description: "Connect services", status: "not-started" },
    { path: "/tour", title: "Platform Tour", layout: "wizard", icon: "Map", description: "Guided tour", status: "not-started" },
    { path: "/complete", title: "All Set!", layout: "wizard", icon: "CheckCircle", description: "Onboarding complete", status: "not-started" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT ROUTES
// ─────────────────────────────────────────────────────────────────────────────

export const accountRoutes: RouteGroup = {
  name: "Account",
  basePath: "/(app)/account",
  description: "User and organization settings",
  pages: [
    { path: "/profile", title: "Profile", layout: "settings", entity: "profile", icon: "User", description: "Personal profile settings", status: "not-started" },
    { path: "/organization", title: "Organization", layout: "settings", entity: "organization", icon: "Building2", description: "Organization settings", status: "not-started" },
    { path: "/billing", title: "Billing", layout: "settings", icon: "CreditCard", description: "Subscription and payments", status: "not-started" },
    {
      path: "/history",
      title: "History",
      layout: "entity-list",
      entity: "activityLog",
      icon: "History",
      description: "Activity history",
      subpages: [
        { key: "all", label: "All Activity", path: "/account/history" },
        { key: "logins", label: "Logins", path: "/account/history/logins" },
        { key: "changes", label: "Changes", path: "/account/history/changes" },
      ],
      status: "not-started",
    },
    { path: "/resources", title: "Resources", layout: "dashboard", icon: "BookOpen", description: "Help and documentation", status: "not-started" },
    { path: "/platform", title: "Platform Settings", layout: "settings", icon: "Cpu", description: "App preferences", status: "not-started" },
    { path: "/support", title: "Support", layout: "settings", icon: "LifeBuoy", description: "Help and support", status: "not-started" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE ROUTES (6 pages)
// ─────────────────────────────────────────────────────────────────────────────

export const coreRoutes: RouteGroup = {
  name: "Core",
  basePath: "/(app)/core",
  description: "Personal productivity tools",
  pages: [
    { path: "/dashboard", title: "Dashboard", layout: "dashboard", icon: "LayoutDashboard", description: "Personal command center", status: "in-progress" },
    {
      path: "/calendar",
      title: "Calendar",
      layout: "workspace",
      entity: "calendarEvent",
      icon: "Calendar",
      description: "Unified calendar view",
      subpages: [
        { key: "month", label: "Month", path: "/core/calendar" },
        { key: "week", label: "Week", path: "/core/calendar/week" },
        { key: "day", label: "Day", path: "/core/calendar/day" },
        { key: "agenda", label: "Agenda", path: "/core/calendar/agenda" },
      ],
      status: "in-progress",
    },
    {
      path: "/tasks",
      title: "Tasks",
      layout: "entity-list",
      entity: "task",
      icon: "CheckSquare",
      description: "Personal task management",
      subpages: [
        { key: "all", label: "All Tasks", path: "/core/tasks", count: true },
        { key: "today", label: "Today", path: "/core/tasks/today", count: true },
        { key: "upcoming", label: "Upcoming", path: "/core/tasks/upcoming", count: true },
      ],
      status: "in-progress",
    },
    {
      path: "/inbox",
      title: "Inbox",
      layout: "entity-list",
      entity: "notification",
      icon: "Inbox",
      description: "Notifications & approvals",
      subpages: [
        { key: "all", label: "All", path: "/core/inbox" },
        { key: "unread", label: "Unread", path: "/core/inbox/unread", count: true },
        { key: "approvals", label: "Approvals", path: "/core/inbox/approvals", count: true },
      ],
      status: "in-progress",
    },
    {
      path: "/documents",
      title: "Documents",
      layout: "entity-list",
      entity: "document",
      icon: "FileText",
      description: "Personal document library",
      subpages: [
        { key: "all", label: "All Documents", path: "/core/documents" },
        { key: "recent", label: "Recent", path: "/core/documents/recent" },
        { key: "shared", label: "Shared with Me", path: "/core/documents/shared" },
      ],
      status: "in-progress",
    },
    {
      path: "/workflows",
      title: "Workflows",
      layout: "entity-list",
      entity: "workflow",
      icon: "GitBranch",
      description: "Personal automations",
      subpages: [
        { key: "all", label: "All Workflows", path: "/core/workflows" },
        { key: "active", label: "Active", path: "/core/workflows/active" },
        { key: "templates", label: "Templates", path: "/core/workflows/templates" },
      ],
      status: "in-progress",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTIONS MODULE (8 pages) - Pre/post event lifecycle
// ─────────────────────────────────────────────────────────────────────────────

export const productionsModule: RouteGroup = {
  name: "Productions",
  basePath: "/(app)/productions",
  description: "Pre/post event lifecycle management",
  pages: [
    { path: "/", title: "Productions", layout: "dashboard", entity: "production", icon: "Clapperboard", description: "Productions dashboard", status: "in-progress" },
    {
      path: "/events",
      title: "Events",
      layout: "entity-list",
      entity: "event",
      icon: "Calendar",
      description: "Individual events within productions",
      subpages: [
        { key: "all", label: "All Events", path: "/productions/events", count: true },
        { key: "upcoming", label: "Upcoming", path: "/productions/events/upcoming", count: true },
        { key: "past", label: "Past", path: "/productions/events/past" },
      ],
      tabs: [
        { key: "overview", label: "Overview", type: "overview", icon: "LayoutDashboard" },
        { key: "schedule", label: "Schedule", type: "related", entity: "scheduleItem", foreignKey: "eventId", icon: "Clock" },
        { key: "team", label: "Team", type: "related", entity: "assignment", foreignKey: "eventId", icon: "Users" },
        { key: "budget", label: "Budget", type: "related", entity: "budgetLine", foreignKey: "eventId", icon: "DollarSign" },
      ],
      status: "in-progress",
    },
    { path: "/activations", title: "Activations", layout: "entity-list", entity: "activation", icon: "Sparkles", description: "Brand activations & sponsorship execution", status: "not-started" },
    {
      path: "/build-strike",
      title: "Build & Strike",
      layout: "entity-list",
      entity: "buildStrikeTask",
      icon: "Hammer",
      description: "Production schedule - installation & restoration",
      subpages: [
        { key: "all", label: "All Tasks", path: "/productions/build-strike", count: true },
        { key: "build", label: "Build", path: "/productions/build-strike/build" },
        { key: "strike", label: "Strike", path: "/productions/build-strike/strike" },
      ],
      status: "not-started",
    },
    {
      path: "/compliance",
      title: "Compliance",
      layout: "entity-list",
      entity: "permit",
      icon: "Shield",
      description: "Permits, licenses & certificates",
      tabs: [
        { key: "permits", label: "Permits", type: "overview", icon: "FileCheck" },
        { key: "licenses", label: "Licenses", type: "related", entity: "license", foreignKey: "productionId", icon: "Award" },
        { key: "certificates", label: "Certificates", type: "related", entity: "certificate", foreignKey: "productionId", icon: "BadgeCheck" },
      ],
      status: "not-started",
    },
    { path: "/inspections", title: "Inspections", layout: "entity-list", entity: "inspection", icon: "ClipboardCheck", description: "Pre/post event inspections", status: "not-started" },
    { path: "/punch-lists", title: "Punch Lists", layout: "entity-list", entity: "punchItem", icon: "ListChecks", description: "Deficiency & fix items", status: "not-started" },
    {
      path: "/advancing",
      title: "Advancing",
      layout: "dashboard",
      entity: "advancing",
      icon: "ClipboardCheck",
      description: "Production advance coordination & logistics",
      tabs: [
        { key: "advances", label: "Advances", type: "related", entity: "productionAdvance", foreignKey: "advancingId", icon: "ClipboardList" },
        { key: "allotments", label: "Allotments", type: "related", entity: "advanceItem", foreignKey: "advancingId", icon: "Layers" },
        { key: "approvals", label: "Approvals", type: "related", entity: "advanceApproval", foreignKey: "advancingId", icon: "ShieldCheck" },
        { key: "assignments", label: "Assignments", type: "related", entity: "advanceAssignment", foreignKey: "advancingId", icon: "Link2" },
        { key: "activity", label: "Activity", type: "related", entity: "advanceActivity", foreignKey: "advancingId", icon: "Activity" },
      ],
      status: "not-started",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// OPERATIONS MODULE (7 pages) - Run of show
// ─────────────────────────────────────────────────────────────────────────────

export const operationsModule: RouteGroup = {
  name: "Operations",
  basePath: "/(app)/operations",
  description: "Run of show management",
  pages: [
    { path: "/", title: "Operations", layout: "dashboard", icon: "Radio", description: "Operations dashboard", status: "in-progress" },
    { path: "/shows", title: "Shows", layout: "entity-list", entity: "show", icon: "Tv", description: "Live shows & performances", status: "not-started" },
    { path: "/runsheets", title: "Runsheets", layout: "entity-list", entity: "runsheet", icon: "ListOrdered", description: "Real-time schedules & cue sheets", status: "not-started" },
    {
      path: "/venues",
      title: "Venues",
      layout: "entity-list",
      entity: "venue",
      icon: "MapPin",
      description: "Physical locations",
      tabs: [
        { key: "floor-plans", label: "Floor Plans", type: "related", entity: "floorPlan", foreignKey: "venueId", icon: "Map" },
        { key: "zones", label: "Zones", type: "related", entity: "zone", foreignKey: "venueId", icon: "Grid" },
        { key: "checkpoints", label: "Checkpoints", type: "related", entity: "checkpoint", foreignKey: "venueId", icon: "Flag" },
      ],
      status: "not-started",
    },
    { path: "/incidents", title: "Incidents", layout: "entity-list", entity: "incident", icon: "AlertTriangle", description: "Live incident reports", status: "not-started" },
    { path: "/work-orders", title: "Work Orders", layout: "entity-list", entity: "workOrder", icon: "Wrench", description: "On-site fix requests", status: "not-started" },
    { path: "/daily-reports", title: "Daily Reports", layout: "entity-list", entity: "dailyReport", icon: "FileText", description: "End-of-day summaries", status: "not-started" },
    {
      path: "/comms",
      title: "Comms",
      layout: "entity-list",
      entity: "radioChannel",
      icon: "Radio",
      description: "Radio channels & weather",
      tabs: [
        { key: "radio", label: "Radio", type: "overview", icon: "Radio" },
        { key: "weather", label: "Weather", type: "custom", icon: "Cloud" },
      ],
      status: "not-started",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PEOPLE MODULE (11 pages) - Human resources
// ─────────────────────────────────────────────────────────────────────────────

export const peopleModule: RouteGroup = {
  name: "People",
  basePath: "/(app)/people",
  description: "Human resources management",
  pages: [
    { path: "/", title: "People", layout: "dashboard", icon: "Users", description: "People dashboard", status: "in-progress" },
    {
      path: "/rosters",
      title: "Rosters",
      layout: "entity-list",
      entity: "person",
      icon: "Users",
      description: "Staff, crew, contractors & talent",
      subpages: [
        { key: "all", label: "All People", path: "/people/rosters", count: true },
        { key: "staff", label: "Staff", path: "/people/rosters/staff" },
        { key: "contractors", label: "Contractors", path: "/people/rosters/contractors" },
        { key: "talent", label: "Talent", path: "/people/rosters/talent" },
      ],
      status: "in-progress",
    },
    { path: "/availability", title: "Availability", layout: "entity-list", entity: "availability", icon: "CalendarCheck", description: "Person availability tracking", status: "not-started" },
    {
      path: "/travel",
      title: "Travel & Lodging",
      layout: "entity-list",
      entity: "travelRequest",
      icon: "Plane",
      description: "Bookings & accommodations",
      tabs: [
        { key: "bookings", label: "Bookings", type: "overview", icon: "Ticket" },
        { key: "accommodations", label: "Accommodations", type: "related", entity: "accommodation", foreignKey: "travelRequestId", icon: "Hotel" },
      ],
      status: "not-started",
    },
    { path: "/recruitment", title: "Recruitment", layout: "entity-list", entity: "candidate", icon: "UserPlus", description: "Candidates & hiring", status: "not-started" },
    { path: "/onboarding", title: "Onboarding", layout: "entity-list", entity: "onboardingTask", icon: "Rocket", description: "New hire onboarding tasks", status: "not-started" },
    {
      path: "/training",
      title: "Training",
      layout: "entity-list",
      entity: "trainingRecord",
      icon: "GraduationCap",
      description: "Training records & courses",
      tabs: [
        { key: "courses", label: "Courses", type: "related", entity: "course", foreignKey: "trainingId", icon: "BookOpen" },
        { key: "materials", label: "Materials", type: "related", entity: "trainingMaterial", foreignKey: "trainingId", icon: "FileText" },
      ],
      status: "not-started",
    },
    {
      path: "/scheduling",
      title: "Scheduling",
      layout: "entity-list",
      entity: "schedule",
      icon: "CalendarDays",
      description: "Person schedule assignments",
      tabs: [
        { key: "shifts", label: "Shifts", type: "related", entity: "shift", foreignKey: "scheduleId", icon: "Clock" },
      ],
      status: "not-started",
    },
    { path: "/timekeeping", title: "Timekeeping", layout: "entity-list", entity: "timesheet", icon: "Timer", description: "Timesheets & time tracking", status: "not-started" },
    {
      path: "/performance",
      title: "Performance",
      layout: "entity-list",
      entity: "performanceReview",
      icon: "TrendingUp",
      description: "Reviews & goals",
      tabs: [
        { key: "reviews", label: "Reviews", type: "overview", icon: "Star" },
        { key: "goals", label: "Goals", type: "related", entity: "goal", foreignKey: "personId", icon: "Target" },
      ],
      status: "not-started",
    },
    { path: "/certifications", title: "Certifications", layout: "entity-list", entity: "certification", icon: "Award", description: "Credentials & certifications", status: "not-started" },
    { path: "/positions", title: "Positions", layout: "entity-list", entity: "position", icon: "Briefcase", description: "Job roles & titles", status: "not-started" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ASSETS MODULE (9 pages) - Equipment & logistics
// ─────────────────────────────────────────────────────────────────────────────

export const assetsModule: RouteGroup = {
  name: "Assets",
  basePath: "/(app)/assets",
  description: "Equipment & logistics management",
  pages: [
    { path: "/", title: "Assets", layout: "dashboard", icon: "Package", description: "Assets dashboard", status: "in-progress" },
    {
      path: "/catalog",
      title: "Catalog",
      layout: "entity-list",
      entity: "catalogItem",
      icon: "BookOpen",
      description: "Equipment catalog (Uline-style SSOT) - What you OWN",
      tabs: [
        { key: "categories", label: "Categories", type: "related", entity: "category", foreignKey: "catalogId", icon: "FolderTree" },
      ],
      status: "not-started",
    },
    {
      path: "/inventory",
      title: "Inventory",
      layout: "entity-list",
      entity: "asset",
      icon: "Package",
      description: "Physical asset instances",
      subpages: [
        { key: "all", label: "All Assets", path: "/assets/inventory", count: true },
        { key: "available", label: "Available", path: "/assets/inventory/available", count: true },
        { key: "deployed", label: "Deployed", path: "/assets/inventory/deployed" },
        { key: "maintenance", label: "In Maintenance", path: "/assets/inventory/maintenance" },
      ],
      status: "in-progress",
    },
    {
      path: "/locations",
      title: "Locations",
      layout: "entity-list",
      entity: "location",
      icon: "Warehouse",
      description: "Warehouses & staging areas",
      tabs: [
        { key: "warehouses", label: "Warehouses", type: "overview", icon: "Warehouse" },
        { key: "staging", label: "Staging Areas", type: "related", entity: "stagingArea", foreignKey: "locationId", icon: "Box" },
      ],
      status: "not-started",
    },
    { path: "/reservations", title: "Reservations", layout: "entity-list", entity: "reservation", icon: "CalendarCheck", description: "Asset reservation requests", status: "not-started" },
    { path: "/advances", title: "Advances", layout: "entity-list", entity: "advance", icon: "Send", description: "Production advances (gear sent ahead)", status: "not-started" },
    { path: "/deployment", title: "Deployment", layout: "entity-list", entity: "deployment", icon: "Truck", description: "Asset deployment to productions", status: "not-started" },
    {
      path: "/logistics",
      title: "Logistics",
      layout: "entity-list",
      entity: "shipment",
      icon: "Truck",
      description: "Shipments & transport",
      tabs: [
        { key: "shipments", label: "Shipments", type: "overview", icon: "Package" },
        { key: "vehicles", label: "Vehicles", type: "related", entity: "vehicle", foreignKey: "logisticsId", icon: "Car" },
      ],
      status: "not-started",
    },
    {
      path: "/status",
      title: "Asset Status",
      layout: "entity-list",
      entity: "assetStatus",
      icon: "ArrowLeftRight",
      description: "Check-in/out & service status",
      tabs: [
        { key: "check", label: "Check-In/Out", type: "overview", icon: "ArrowLeftRight" },
        { key: "service", label: "Service Status", type: "related", entity: "serviceStatus", foreignKey: "assetId", icon: "Wrench" },
      ],
      status: "not-started",
    },
    {
      path: "/maintenance",
      title: "Maintenance",
      layout: "entity-list",
      entity: "maintenance",
      icon: "Wrench",
      description: "Scheduled maintenance & repairs",
      tabs: [
        { key: "scheduled", label: "Scheduled", type: "overview", icon: "Calendar" },
        { key: "repairs", label: "Repairs", type: "related", entity: "repair", foreignKey: "maintenanceId", icon: "Tool" },
      ],
      status: "not-started",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS MODULE (8 pages) - Revenue + relationships
// ─────────────────────────────────────────────────────────────────────────────

export const businessModule: RouteGroup = {
  name: "Business",
  basePath: "/(app)/business",
  description: "Revenue + relationships management",
  pages: [
    { path: "/", title: "Business", layout: "dashboard", icon: "Building2", description: "Business dashboard", status: "in-progress" },
    {
      path: "/pipeline",
      title: "Pipeline",
      layout: "entity-list",
      entity: "deal",
      icon: "GitBranch",
      description: "Sales opportunities & deals",
      tabs: [
        { key: "leads", label: "Leads", type: "related", entity: "lead", foreignKey: "pipelineId", icon: "UserPlus" },
        { key: "opportunities", label: "Opportunities", type: "overview", icon: "Target" },
      ],
      status: "not-started",
    },
    {
      path: "/companies",
      title: "Companies",
      layout: "entity-list",
      entity: "company",
      icon: "Building",
      description: "Clients, vendors, partners & sponsors",
      subpages: [
        { key: "all", label: "All Companies", path: "/business/companies", count: true },
        { key: "clients", label: "Clients", path: "/business/companies/clients" },
        { key: "vendors", label: "Vendors", path: "/business/companies/vendors" },
        { key: "partners", label: "Partners", path: "/business/companies/partners" },
      ],
      tabs: [
        { key: "contacts", label: "Contacts", type: "related", entity: "contact", foreignKey: "companyId", icon: "Users" },
      ],
      status: "not-started",
    },
    { path: "/proposals", title: "Proposals", layout: "entity-list", entity: "proposal", icon: "FileText", description: "Formal proposal documents", status: "not-started" },
    { path: "/contracts", title: "Contracts", layout: "entity-list", entity: "contract", icon: "FileSignature", description: "Signed agreements", status: "not-started" },
    {
      path: "/products",
      title: "Products & Services",
      layout: "entity-list",
      entity: "product",
      icon: "ShoppingBag",
      description: "Business offerings (what you SELL)",
      tabs: [
        { key: "list", label: "Products", type: "overview", icon: "Package" },
        { key: "services", label: "Services", type: "related", entity: "service", foreignKey: "productId", icon: "Briefcase" },
      ],
      status: "not-started",
    },
    {
      path: "/campaigns",
      title: "Campaigns",
      layout: "entity-list",
      entity: "campaign",
      icon: "Megaphone",
      description: "Marketing campaigns",
      tabs: [
        { key: "email", label: "Email", type: "related", entity: "emailCampaign", foreignKey: "campaignId", icon: "Mail" },
        { key: "content", label: "Content", type: "related", entity: "contentPiece", foreignKey: "campaignId", icon: "FileText" },
        { key: "forms", label: "Forms", type: "related", entity: "form", foreignKey: "campaignId", icon: "FormInput" },
      ],
      status: "not-started",
    },
    { path: "/subscribers", title: "Subscribers", layout: "entity-list", entity: "subscriber", icon: "Mail", description: "Email & marketing subscribers", status: "not-started" },
    {
      path: "/brand",
      title: "Brand Kit",
      layout: "entity-list",
      entity: "brandAsset",
      icon: "Palette",
      description: "Logos, colors & typography",
      tabs: [
        { key: "logos", label: "Logos", type: "overview", icon: "Image" },
        { key: "colors", label: "Colors", type: "related", entity: "colorPalette", foreignKey: "brandId", icon: "Palette" },
        { key: "typography", label: "Typography", type: "related", entity: "typography", foreignKey: "brandId", icon: "Type" },
      ],
      status: "not-started",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE MODULE (8 pages) - Money in/out
// ─────────────────────────────────────────────────────────────────────────────

export const financeModule: RouteGroup = {
  name: "Finance",
  basePath: "/(app)/finance",
  description: "Money in/out management",
  pages: [
    { path: "/", title: "Finance", layout: "dashboard", icon: "DollarSign", description: "Finance dashboard", status: "in-progress" },
    {
      path: "/budgets",
      title: "Budgets",
      layout: "entity-list",
      entity: "budget",
      icon: "PiggyBank",
      description: "Production & project budgets",
      tabs: [
        { key: "line-items", label: "Line Items", type: "related", entity: "budgetLineItem", foreignKey: "budgetId", icon: "List" },
      ],
      status: "not-started",
    },
    { path: "/procurement", title: "Procurement", layout: "entity-list", entity: "purchaseOrder", icon: "ShoppingCart", description: "Purchase orders", status: "not-started" },
    { path: "/expenses", title: "Expenses", layout: "entity-list", entity: "expense", icon: "Receipt", description: "Expense records", status: "not-started" },
    {
      path: "/invoices",
      title: "Invoices",
      layout: "entity-list",
      entity: "invoice",
      icon: "FileText",
      description: "Customer invoices",
      tabs: [
        { key: "line-items", label: "Line Items", type: "related", entity: "invoiceLineItem", foreignKey: "invoiceId", icon: "List" },
        { key: "payments", label: "Payments", type: "related", entity: "payment", foreignKey: "invoiceId", icon: "CreditCard" },
      ],
      status: "not-started",
    },
    {
      path: "/payments",
      title: "Payments",
      layout: "entity-list",
      entity: "payment",
      icon: "CreditCard",
      description: "Payments in & out",
      tabs: [
        { key: "incoming", label: "Incoming", type: "overview", icon: "ArrowDownLeft" },
        { key: "outgoing", label: "Outgoing", type: "related", entity: "outgoingPayment", foreignKey: "paymentId", icon: "ArrowUpRight" },
      ],
      status: "not-started",
    },
    {
      path: "/payroll",
      title: "Payroll",
      layout: "entity-list",
      entity: "payrollRun",
      icon: "Banknote",
      description: "Payroll batches & pay stubs",
      tabs: [
        { key: "stubs", label: "Pay Stubs", type: "related", entity: "payStub", foreignKey: "payrollRunId", icon: "FileText" },
      ],
      status: "not-started",
    },
    {
      path: "/accounts",
      title: "Accounts",
      layout: "entity-list",
      entity: "account",
      icon: "Landmark",
      description: "GL & bank accounts",
      tabs: [
        { key: "gl", label: "GL", type: "overview", icon: "BookOpen" },
        { key: "bank", label: "Bank", type: "related", entity: "bankAccount", foreignKey: "accountId", icon: "Landmark" },
      ],
      status: "not-started",
    },
    { path: "/reports", title: "Reports", layout: "dashboard", icon: "BarChart3", description: "P&L, Cash Flow, AR/AP", status: "not-started" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK MODULE (Header access, not sidebar)
// ─────────────────────────────────────────────────────────────────────────────

export const networkModule: RouteGroup = {
  name: "Network",
  basePath: "/(app)/network",
  description: "Community & professional networking (header access)",
  pages: [
    { path: "/showcase", title: "Showcase", layout: "entity-list", entity: "showcase", icon: "Award", description: "Portfolio gallery", status: "in-progress" },
    { path: "/discussions", title: "Discussions", layout: "entity-list", entity: "discussion", icon: "MessageSquare", description: "Community forums", status: "in-progress" },
    { path: "/challenges", title: "Challenges", layout: "entity-list", entity: "challenge", icon: "Trophy", description: "Competitions & challenges", status: "in-progress" },
    { path: "/marketplace", title: "Marketplace", layout: "entity-list", entity: "marketplaceListing", icon: "Store", description: "Services & products", status: "in-progress" },
    { path: "/opportunities", title: "Opportunities", layout: "entity-list", entity: "opportunity", icon: "Compass", description: "Jobs & gigs", status: "in-progress" },
    { path: "/connections", title: "Connections", layout: "entity-list", entity: "connection", icon: "Link", description: "Professional network", status: "in-progress" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE REGISTRY - v5
// ─────────────────────────────────────────────────────────────────────────────

export const iaRegistry: RouteGroup[] = [
  authRoutes,
  onboardingRoutes,
  accountRoutes,
  coreRoutes,
  productionsModule,
  operationsModule,
  peopleModule,
  assetsModule,
  businessModule,
  financeModule,
  networkModule,
];

// Helper to get all pages flattened
export function getAllPages(): PageDefinition[] {
  return iaRegistry.flatMap((group) => group.pages);
}

// Helper to get page by path
export function getPageByPath(path: string): PageDefinition | undefined {
  return getAllPages().find((page) => page.path === path);
}

// Helper to get pages by status
export function getPagesByStatus(status: PageStatus): PageDefinition[] {
  return getAllPages().filter((page) => page.status === status);
}

// Helper to count pages by status
export function countPagesByStatus(): Record<PageStatus, number> {
  const pages = getAllPages();
  return {
    "not-started": pages.filter((p) => p.status === "not-started").length,
    "in-progress": pages.filter((p) => p.status === "in-progress").length,
    complete: pages.filter((p) => p.status === "complete").length,
  };
}
