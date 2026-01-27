/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INFORMATION ARCHITECTURE REGISTRY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SINGLE SOURCE OF TRUTH for all routes, entities, and page configurations.
 * This registry maps every IA route to its:
 * - Layout type (list/detail/form/dashboard/settings/wizard)
 * - Primary entity (schema reference)
 * - Subpages (distinct data subsets)
 * - Tabs (related data on detail pages)
 *
 * RULES:
 * - Subpages = distinct data subsets (All, My, Archived, Templates)
 * - Tabs = related entities on detail pages (Schedule, Team, Budget)
 * - Filters = refinement within current dataset (status, date, category)
 */

// Icon names are strings referencing lucide-react icons

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
    {
      path: "/login",
      title: "Sign In",
      layout: "wizard",
      icon: "LogIn",
      description: "User authentication",
      status: "not-started",
    },
    {
      path: "/register",
      title: "Create Account",
      layout: "wizard",
      icon: "UserPlus",
      description: "New user registration",
      status: "not-started",
    },
    {
      path: "/forgot-password",
      title: "Forgot Password",
      layout: "wizard",
      icon: "KeyRound",
      description: "Password reset request",
      status: "not-started",
    },
    {
      path: "/reset-password",
      title: "Reset Password",
      layout: "wizard",
      icon: "KeyRound",
      description: "Password reset form",
      status: "not-started",
    },
    {
      path: "/verify-email",
      title: "Verify Email",
      layout: "wizard",
      icon: "MailCheck",
      description: "Email verification",
      status: "not-started",
    },
    {
      path: "/verify-mfa",
      title: "Two-Factor Auth",
      layout: "wizard",
      icon: "ShieldCheck",
      description: "MFA verification",
      status: "not-started",
    },
    {
      path: "/sso/[provider]",
      title: "SSO Login",
      layout: "wizard",
      icon: "Link",
      description: "Single sign-on callback",
      status: "not-started",
    },
    {
      path: "/invite/[token]",
      title: "Accept Invite",
      layout: "wizard",
      icon: "UserPlus",
      description: "Team invitation acceptance",
      status: "not-started",
    },
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
    {
      path: "/",
      title: "Welcome",
      layout: "wizard",
      icon: "Sparkles",
      description: "Onboarding start",
      status: "not-started",
    },
    {
      path: "/profile",
      title: "Your Profile",
      layout: "wizard",
      entity: "profile",
      icon: "User",
      description: "Profile setup",
      status: "not-started",
    },
    {
      path: "/organization",
      title: "Organization",
      layout: "wizard",
      entity: "organization",
      icon: "Building2",
      description: "Organization setup",
      status: "not-started",
    },
    {
      path: "/team",
      title: "Invite Team",
      layout: "wizard",
      icon: "Users",
      description: "Team invitations",
      status: "not-started",
    },
    {
      path: "/preferences",
      title: "Preferences",
      layout: "wizard",
      icon: "Settings",
      description: "Initial preferences",
      status: "not-started",
    },
    {
      path: "/integrations",
      title: "Integrations",
      layout: "wizard",
      icon: "Plug",
      description: "Connect services",
      status: "not-started",
    },
    {
      path: "/tour",
      title: "Platform Tour",
      layout: "wizard",
      icon: "Map",
      description: "Guided tour",
      status: "not-started",
    },
    {
      path: "/complete",
      title: "All Set!",
      layout: "wizard",
      icon: "CheckCircle",
      description: "Onboarding complete",
      status: "not-started",
    },
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
    {
      path: "/profile",
      title: "Profile",
      layout: "settings",
      entity: "profile",
      icon: "User",
      description: "Personal profile settings",
      status: "not-started",
    },
    {
      path: "/organization",
      title: "Organization",
      layout: "settings",
      entity: "organization",
      icon: "Building2",
      description: "Organization settings",
      status: "not-started",
    },
    {
      path: "/billing",
      title: "Billing",
      layout: "settings",
      icon: "CreditCard",
      description: "Subscription and payments",
      status: "not-started",
    },
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
    {
      path: "/resources",
      title: "Resources",
      layout: "dashboard",
      icon: "BookOpen",
      description: "Help and documentation",
      status: "not-started",
    },
    {
      path: "/platform",
      title: "Platform Settings",
      layout: "settings",
      icon: "Cpu",
      description: "App preferences",
      status: "not-started",
    },
    {
      path: "/support",
      title: "Support",
      layout: "settings",
      icon: "LifeBuoy",
      description: "Help and support",
      status: "not-started",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE ROUTES
// ─────────────────────────────────────────────────────────────────────────────

export const coreRoutes: RouteGroup = {
  name: "Core",
  basePath: "/(app)/core",
  description: "Personal productivity tools",
  pages: [
    {
      path: "/dashboard",
      title: "Dashboard",
      layout: "dashboard",
      icon: "LayoutDashboard",
      description: "Personal command center",
      status: "in-progress",
    },
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
    {
      path: "/activity",
      title: "Activity",
      layout: "entity-list",
      entity: "activityLog",
      icon: "Activity",
      description: "Activity feed & history",
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
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: PROJECTS
// ─────────────────────────────────────────────────────────────────────────────

export const projectsModule: RouteGroup = {
  name: "Projects",
  basePath: "/(app)/modules/projects",
  description: "Team collaboration & project tracking",
  pages: [
    {
      path: "/",
      title: "Projects Overview",
      layout: "dashboard",
      entity: "project",
      icon: "FolderKanban",
      description: "Projects dashboard",
      status: "in-progress",
    },
    {
      path: "/projects",
      title: "Projects",
      layout: "entity-list",
      entity: "project",
      icon: "FolderKanban",
      description: "All projects",
      subpages: [
        { key: "all", label: "All Projects", path: "/modules/projects/projects", count: true },
        { key: "my", label: "My Projects", path: "/modules/projects/projects/my", count: true },
        { key: "templates", label: "Templates", path: "/modules/projects/projects/templates" },
        { key: "archived", label: "Archived", path: "/modules/projects/projects/archived" },
      ],
      tabs: [
        { key: "overview", label: "Overview", type: "overview", icon: "LayoutDashboard" },
        { key: "tasks", label: "Tasks", type: "related", entity: "task", foreignKey: "projectId", defaultView: "kanban", allowCreate: true, icon: "CheckSquare" },
        { key: "team", label: "Team", type: "related", entity: "projectMember", foreignKey: "projectId", allowCreate: true, icon: "Users" },
        { key: "files", label: "Files", type: "files", icon: "Folder" },
        { key: "activity", label: "Activity", type: "activity", lazy: true, icon: "Activity" },
      ],
      status: "in-progress",
    },
    {
      path: "/sprints",
      title: "Sprints",
      layout: "entity-list",
      entity: "sprint",
      icon: "Zap",
      description: "Sprint management",
      subpages: [
        { key: "active", label: "Active", path: "/modules/projects/sprints", count: true },
        { key: "upcoming", label: "Upcoming", path: "/modules/projects/sprints/upcoming" },
        { key: "completed", label: "Completed", path: "/modules/projects/sprints/completed" },
      ],
      status: "not-started",
    },
    {
      path: "/backlogs",
      title: "Backlogs",
      layout: "entity-list",
      entity: "backlogItem",
      icon: "List",
      description: "Product backlogs",
      status: "not-started",
    },
    {
      path: "/boards",
      title: "Boards",
      layout: "entity-list",
      entity: "kanbanBoard",
      icon: "Columns",
      description: "Kanban boards",
      status: "not-started",
    },
    {
      path: "/roadmaps",
      title: "Roadmaps",
      layout: "entity-list",
      entity: "roadmapItem",
      icon: "Map",
      description: "Product roadmaps",
      status: "not-started",
    },
    {
      path: "/teams",
      title: "Teams",
      layout: "entity-list",
      entity: "team",
      icon: "Users",
      description: "Team management",
      status: "not-started",
    },
    {
      path: "/reports",
      title: "Reports",
      layout: "dashboard",
      icon: "BarChart3",
      description: "Project analytics",
      status: "not-started",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: PRODUCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const productionsModule: RouteGroup = {
  name: "Productions",
  basePath: "/(app)/modules/production",
  description: "Event lifecycle & production management",
  pages: [
    {
      path: "/",
      title: "Productions Overview",
      layout: "dashboard",
      entity: "event",
      icon: "Clapperboard",
      description: "Productions dashboard",
      status: "in-progress",
    },
    {
      path: "/events",
      title: "Events",
      layout: "entity-list",
      entity: "event",
      icon: "Calendar",
      description: "All events",
      subpages: [
        { key: "all", label: "All Events", path: "/modules/production/events", count: true },
        { key: "upcoming", label: "Upcoming", path: "/modules/production/events/upcoming", count: true },
        { key: "my", label: "My Events", path: "/modules/production/events/my", count: true },
        { key: "drafts", label: "Drafts", path: "/modules/production/events/drafts" },
        { key: "archived", label: "Archived", path: "/modules/production/events/archived" },
      ],
      tabs: [
        { key: "overview", label: "Overview", type: "overview", icon: "LayoutDashboard" },
        { key: "schedule", label: "Schedule", type: "related", entity: "scheduleItem", foreignKey: "eventId", defaultView: "timeline", allowCreate: true, icon: "Clock" },
        { key: "team", label: "Team", type: "related", entity: "assignment", foreignKey: "eventId", allowCreate: true, icon: "Users" },
        { key: "budget", label: "Budget", type: "related", entity: "budgetLine", foreignKey: "eventId", allowCreate: true, icon: "DollarSign" },
        { key: "files", label: "Files", type: "files", icon: "Folder" },
        { key: "activity", label: "Activity", type: "activity", lazy: true, icon: "Activity" },
      ],
      status: "in-progress",
    },
    {
      path: "/shows",
      title: "Shows",
      layout: "entity-list",
      entity: "show",
      icon: "Tv",
      description: "Show management",
      status: "not-started",
    },
    {
      path: "/runsheets",
      title: "Runsheets",
      layout: "entity-list",
      entity: "runsheet",
      icon: "ListOrdered",
      description: "Production runsheets",
      status: "not-started",
    },
    {
      path: "/departments",
      title: "Departments",
      layout: "entity-list",
      entity: "department",
      icon: "Building",
      description: "Department management",
      status: "not-started",
    },
    {
      path: "/advancing",
      title: "Advancing",
      layout: "entity-list",
      entity: "advancingSheet",
      icon: "ClipboardCheck",
      description: "Event advancing",
      status: "not-started",
    },
    {
      path: "/tech-specs",
      title: "Tech Specs",
      layout: "entity-list",
      entity: "technicalSpec",
      icon: "FileCode",
      description: "Technical specifications",
      status: "not-started",
    },
    {
      path: "/riders",
      title: "Riders",
      layout: "entity-list",
      entity: "rider",
      icon: "FileText",
      description: "Artist/technical riders",
      status: "not-started",
    },
    {
      path: "/reports",
      title: "Reports",
      layout: "dashboard",
      icon: "BarChart3",
      description: "Production analytics",
      status: "not-started",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const operationsModule: RouteGroup = {
  name: "Operations",
  basePath: "/(app)/modules/operations",
  description: "Venue management & logistics",
  pages: [
    {
      path: "/",
      title: "Operations Overview",
      layout: "dashboard",
      icon: "ClipboardList",
      description: "Operations dashboard",
      status: "in-progress",
    },
    {
      path: "/venues",
      title: "Venues",
      layout: "entity-list",
      entity: "venue",
      icon: "MapPin",
      description: "Venue management",
      subpages: [
        { key: "all", label: "All Venues", path: "/modules/operations/venues", count: true },
        { key: "owned", label: "Owned", path: "/modules/operations/venues/owned" },
        { key: "partners", label: "Partners", path: "/modules/operations/venues/partners" },
      ],
      tabs: [
        { key: "overview", label: "Overview", type: "overview", icon: "LayoutDashboard" },
        { key: "floor-plans", label: "Floor Plans", type: "related", entity: "floorPlan", foreignKey: "venueId", icon: "Map" },
        { key: "zones", label: "Zones", type: "related", entity: "venueZone", foreignKey: "venueId", icon: "Grid" },
        { key: "events", label: "Events", type: "related", entity: "event", foreignKey: "venueId", icon: "Calendar" },
        { key: "files", label: "Files", type: "files", icon: "Folder" },
      ],
      status: "in-progress",
    },
    {
      path: "/floor-plans",
      title: "Floor Plans",
      layout: "entity-list",
      entity: "floorPlan",
      icon: "Map",
      description: "Floor plan management",
      status: "not-started",
    },
    {
      path: "/zones",
      title: "Zones",
      layout: "entity-list",
      entity: "venueZone",
      icon: "Grid",
      description: "Venue zones",
      status: "not-started",
    },
    {
      path: "/checkpoints",
      title: "Checkpoints",
      layout: "entity-list",
      entity: "checkpoint",
      icon: "Flag",
      description: "Operational checkpoints",
      status: "not-started",
    },
    {
      path: "/incidents",
      title: "Incidents",
      layout: "entity-list",
      entity: "incident",
      icon: "AlertTriangle",
      description: "Incident management",
      subpages: [
        { key: "open", label: "Open", path: "/modules/operations/incidents", count: true },
        { key: "resolved", label: "Resolved", path: "/modules/operations/incidents/resolved" },
        { key: "all", label: "All", path: "/modules/operations/incidents/all" },
      ],
      status: "not-started",
    },
    {
      path: "/radio",
      title: "Radio Channels",
      layout: "entity-list",
      entity: "radioChannel",
      icon: "Radio",
      description: "Radio channel management",
      status: "not-started",
    },
    {
      path: "/weather",
      title: "Weather",
      layout: "dashboard",
      icon: "Cloud",
      description: "Weather monitoring",
      status: "not-started",
    },
    {
      path: "/reports",
      title: "Reports",
      layout: "dashboard",
      icon: "BarChart3",
      description: "Operations analytics",
      status: "not-started",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: WORKFORCE
// ─────────────────────────────────────────────────────────────────────────────

export const workforceModule: RouteGroup = {
  name: "Workforce",
  basePath: "/(app)/modules/workforce",
  description: "Staff scheduling & crew management",
  pages: [
    {
      path: "/",
      title: "Workforce Overview",
      layout: "dashboard",
      icon: "Users",
      description: "Workforce dashboard",
      status: "in-progress",
    },
    {
      path: "/roster",
      title: "Roster",
      layout: "entity-list",
      entity: "staffMember",
      icon: "Users",
      description: "Staff roster",
      subpages: [
        { key: "all", label: "All Staff", path: "/modules/workforce/roster", count: true },
        { key: "active", label: "Active", path: "/modules/workforce/roster/active", count: true },
        { key: "contractors", label: "Contractors", path: "/modules/workforce/roster/contractors" },
        { key: "inactive", label: "Inactive", path: "/modules/workforce/roster/inactive" },
      ],
      tabs: [
        { key: "overview", label: "Overview", type: "overview", icon: "LayoutDashboard" },
        { key: "shifts", label: "Shifts", type: "related", entity: "shift", foreignKey: "staffMemberId", icon: "Clock" },
        { key: "certifications", label: "Certifications", type: "related", entity: "staffCertification", foreignKey: "staffMemberId", icon: "Award" },
        { key: "timesheets", label: "Timesheets", type: "related", entity: "timesheet", foreignKey: "staffMemberId", icon: "FileText" },
        { key: "files", label: "Files", type: "files", icon: "Folder" },
      ],
      status: "in-progress",
    },
    {
      path: "/schedules",
      title: "Schedules",
      layout: "entity-list",
      entity: "schedule",
      icon: "CalendarDays",
      description: "Staff schedules",
      status: "not-started",
    },
    {
      path: "/shifts",
      title: "Shifts",
      layout: "entity-list",
      entity: "shift",
      icon: "Clock",
      description: "Shift management",
      subpages: [
        { key: "upcoming", label: "Upcoming", path: "/modules/workforce/shifts", count: true },
        { key: "today", label: "Today", path: "/modules/workforce/shifts/today", count: true },
        { key: "open", label: "Open Shifts", path: "/modules/workforce/shifts/open", count: true },
        { key: "past", label: "Past", path: "/modules/workforce/shifts/past" },
      ],
      status: "not-started",
    },
    {
      path: "/timesheets",
      title: "Timesheets",
      layout: "entity-list",
      entity: "timesheet",
      icon: "FileText",
      description: "Timesheet management",
      subpages: [
        { key: "pending", label: "Pending", path: "/modules/workforce/timesheets", count: true },
        { key: "approved", label: "Approved", path: "/modules/workforce/timesheets/approved" },
        { key: "all", label: "All", path: "/modules/workforce/timesheets/all" },
      ],
      status: "not-started",
    },
    {
      path: "/credentials",
      title: "Credentials",
      layout: "entity-list",
      entity: "credential",
      icon: "BadgeCheck",
      description: "Access credentials",
      status: "not-started",
    },
    {
      path: "/certifications",
      title: "Certifications",
      layout: "entity-list",
      entity: "certification",
      icon: "Award",
      description: "Certification management",
      status: "not-started",
    },
    {
      path: "/positions",
      title: "Positions",
      layout: "entity-list",
      entity: "position",
      icon: "Briefcase",
      description: "Position definitions",
      status: "not-started",
    },
    {
      path: "/reports",
      title: "Reports",
      layout: "dashboard",
      icon: "BarChart3",
      description: "Workforce analytics",
      status: "not-started",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: ASSETS
// ─────────────────────────────────────────────────────────────────────────────

export const assetsModule: RouteGroup = {
  name: "Assets",
  basePath: "/(app)/modules/assets",
  description: "Equipment & inventory management",
  pages: [
    {
      path: "/",
      title: "Assets Overview",
      layout: "dashboard",
      icon: "Package",
      description: "Assets dashboard",
      status: "in-progress",
    },
    {
      path: "/inventory",
      title: "Inventory",
      layout: "entity-list",
      entity: "asset",
      icon: "Package",
      description: "Asset inventory",
      subpages: [
        { key: "all", label: "All Assets", path: "/modules/assets/inventory", count: true },
        { key: "available", label: "Available", path: "/modules/assets/inventory/available", count: true },
        { key: "reserved", label: "Reserved", path: "/modules/assets/inventory/reserved", count: true },
        { key: "maintenance", label: "In Maintenance", path: "/modules/assets/inventory/maintenance" },
      ],
      tabs: [
        { key: "overview", label: "Overview", type: "overview", icon: "LayoutDashboard" },
        { key: "reservations", label: "Reservations", type: "related", entity: "assetReservation", foreignKey: "assetId", icon: "Calendar" },
        { key: "maintenance", label: "Maintenance", type: "related", entity: "maintenanceRecord", foreignKey: "assetId", icon: "Wrench" },
        { key: "history", label: "History", type: "activity", icon: "History" },
        { key: "files", label: "Files", type: "files", icon: "Folder" },
      ],
      status: "in-progress",
    },
    {
      path: "/categories",
      title: "Categories",
      layout: "entity-list",
      entity: "assetCategory",
      icon: "FolderTree",
      description: "Asset categories",
      status: "not-started",
    },
    {
      path: "/kits",
      title: "Kits",
      layout: "entity-list",
      entity: "assetKit",
      icon: "Box",
      description: "Asset kits",
      status: "not-started",
    },
    {
      path: "/reservations",
      title: "Reservations",
      layout: "entity-list",
      entity: "assetReservation",
      icon: "CalendarCheck",
      description: "Asset reservations",
      subpages: [
        { key: "upcoming", label: "Upcoming", path: "/modules/assets/reservations", count: true },
        { key: "active", label: "Active", path: "/modules/assets/reservations/active", count: true },
        { key: "past", label: "Past", path: "/modules/assets/reservations/past" },
      ],
      status: "not-started",
    },
    {
      path: "/maintenance",
      title: "Maintenance",
      layout: "entity-list",
      entity: "maintenanceRecord",
      icon: "Wrench",
      description: "Maintenance records",
      subpages: [
        { key: "scheduled", label: "Scheduled", path: "/modules/assets/maintenance", count: true },
        { key: "overdue", label: "Overdue", path: "/modules/assets/maintenance/overdue", count: true },
        { key: "completed", label: "Completed", path: "/modules/assets/maintenance/completed" },
      ],
      status: "not-started",
    },
    {
      path: "/check",
      title: "Check In/Out",
      layout: "workspace",
      icon: "ArrowLeftRight",
      description: "Asset check in/out",
      status: "not-started",
    },
    {
      path: "/vendors",
      title: "Vendors",
      layout: "entity-list",
      entity: "vendor",
      icon: "Store",
      description: "Vendor management",
      status: "not-started",
    },
    {
      path: "/reports",
      title: "Reports",
      layout: "dashboard",
      icon: "BarChart3",
      description: "Asset analytics",
      status: "not-started",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: FINANCE
// ─────────────────────────────────────────────────────────────────────────────

export const financeModule: RouteGroup = {
  name: "Finance",
  basePath: "/(app)/modules/finance",
  description: "Budgets, invoices & expenses",
  pages: [
    {
      path: "/",
      title: "Finance Overview",
      layout: "dashboard",
      icon: "DollarSign",
      description: "Finance dashboard",
      status: "in-progress",
    },
    {
      path: "/budgets",
      title: "Budgets",
      layout: "entity-list",
      entity: "budget",
      icon: "PiggyBank",
      description: "Budget management",
      subpages: [
        { key: "all", label: "All Budgets", path: "/modules/finance/budgets", count: true },
        { key: "active", label: "Active", path: "/modules/finance/budgets/active", count: true },
        { key: "draft", label: "Draft", path: "/modules/finance/budgets/draft" },
        { key: "closed", label: "Closed", path: "/modules/finance/budgets/closed" },
      ],
      tabs: [
        { key: "overview", label: "Overview", type: "overview", icon: "LayoutDashboard" },
        { key: "lines", label: "Line Items", type: "related", entity: "budgetLineItem", foreignKey: "budgetId", allowCreate: true, icon: "List" },
        { key: "expenses", label: "Expenses", type: "related", entity: "expense", foreignKey: "budgetId", icon: "Receipt" },
        { key: "activity", label: "Activity", type: "activity", lazy: true, icon: "Activity" },
      ],
      status: "not-started",
    },
    {
      path: "/invoices",
      title: "Invoices",
      layout: "entity-list",
      entity: "invoice",
      icon: "FileText",
      description: "Invoice management",
      subpages: [
        { key: "all", label: "All Invoices", path: "/modules/finance/invoices", count: true },
        { key: "draft", label: "Draft", path: "/modules/finance/invoices/draft", count: true },
        { key: "pending", label: "Pending", path: "/modules/finance/invoices/pending", count: true },
        { key: "paid", label: "Paid", path: "/modules/finance/invoices/paid" },
        { key: "overdue", label: "Overdue", path: "/modules/finance/invoices/overdue", count: true },
      ],
      status: "not-started",
    },
    {
      path: "/expenses",
      title: "Expenses",
      layout: "entity-list",
      entity: "expense",
      icon: "Receipt",
      description: "Expense tracking",
      subpages: [
        { key: "all", label: "All Expenses", path: "/modules/finance/expenses", count: true },
        { key: "pending", label: "Pending Approval", path: "/modules/finance/expenses/pending", count: true },
        { key: "approved", label: "Approved", path: "/modules/finance/expenses/approved" },
        { key: "reimbursable", label: "Reimbursable", path: "/modules/finance/expenses/reimbursable", count: true },
      ],
      status: "not-started",
    },
    {
      path: "/payments",
      title: "Payments",
      layout: "entity-list",
      entity: "payment",
      icon: "CreditCard",
      description: "Payment tracking",
      subpages: [
        { key: "all", label: "All Payments", path: "/modules/finance/payments" },
        { key: "incoming", label: "Incoming", path: "/modules/finance/payments/incoming", count: true },
        { key: "outgoing", label: "Outgoing", path: "/modules/finance/payments/outgoing", count: true },
      ],
      status: "not-started",
    },
    {
      path: "/settlements",
      title: "Settlements",
      layout: "entity-list",
      entity: "settlement",
      icon: "Scale",
      description: "Event settlements",
      subpages: [
        { key: "pending", label: "Pending", path: "/modules/finance/settlements", count: true },
        { key: "finalized", label: "Finalized", path: "/modules/finance/settlements/finalized" },
      ],
      status: "not-started",
    },
    {
      path: "/accounts",
      title: "Accounts",
      layout: "entity-list",
      entity: "financialAccount",
      icon: "Landmark",
      description: "Financial accounts",
      status: "not-started",
    },
    {
      path: "/reports",
      title: "Reports",
      layout: "dashboard",
      icon: "BarChart3",
      description: "Financial analytics",
      status: "not-started",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: BUSINESS
// ─────────────────────────────────────────────────────────────────────────────

export const businessModule: RouteGroup = {
  name: "Business",
  basePath: "/(app)/modules/business",
  description: "CRM, leads & contracts",
  pages: [
    {
      path: "/",
      title: "Business Overview",
      layout: "dashboard",
      icon: "Building2",
      description: "Business dashboard",
      status: "in-progress",
    },
    {
      path: "/contacts",
      title: "Contacts",
      layout: "entity-list",
      entity: "contact",
      icon: "Users",
      description: "Contact management",
      subpages: [
        { key: "all", label: "All Contacts", path: "/modules/business/contacts", count: true },
        { key: "my", label: "My Contacts", path: "/modules/business/contacts/my", count: true },
        { key: "recent", label: "Recent", path: "/modules/business/contacts/recent" },
      ],
      tabs: [
        { key: "overview", label: "Overview", type: "overview", icon: "LayoutDashboard" },
        { key: "deals", label: "Deals", type: "related", entity: "deal", foreignKey: "contactId", icon: "Handshake" },
        { key: "activity", label: "Activity", type: "activity", icon: "Activity" },
        { key: "files", label: "Files", type: "files", icon: "Folder" },
      ],
      status: "not-started",
    },
    {
      path: "/companies",
      title: "Companies",
      layout: "entity-list",
      entity: "company",
      icon: "Building",
      description: "Company management",
      subpages: [
        { key: "all", label: "All Companies", path: "/modules/business/companies", count: true },
        { key: "clients", label: "Clients", path: "/modules/business/companies/clients", count: true },
        { key: "prospects", label: "Prospects", path: "/modules/business/companies/prospects" },
        { key: "vendors", label: "Vendors", path: "/modules/business/companies/vendors" },
      ],
      tabs: [
        { key: "overview", label: "Overview", type: "overview", icon: "LayoutDashboard" },
        { key: "contacts", label: "Contacts", type: "related", entity: "contact", foreignKey: "companyId", allowCreate: true, icon: "Users" },
        { key: "deals", label: "Deals", type: "related", entity: "deal", foreignKey: "companyId", icon: "Handshake" },
        { key: "contracts", label: "Contracts", type: "related", entity: "contract", foreignKey: "companyId", icon: "FileText" },
        { key: "activity", label: "Activity", type: "activity", icon: "Activity" },
      ],
      status: "not-started",
    },
    {
      path: "/leads",
      title: "Leads",
      layout: "entity-list",
      entity: "lead",
      icon: "UserPlus",
      description: "Lead management",
      subpages: [
        { key: "all", label: "All Leads", path: "/modules/business/leads", count: true },
        { key: "new", label: "New", path: "/modules/business/leads/new", count: true },
        { key: "qualified", label: "Qualified", path: "/modules/business/leads/qualified", count: true },
        { key: "converted", label: "Converted", path: "/modules/business/leads/converted" },
      ],
      status: "not-started",
    },
    {
      path: "/deals",
      title: "Deals",
      layout: "entity-list",
      entity: "deal",
      icon: "Handshake",
      description: "Deal management",
      subpages: [
        { key: "all", label: "All Deals", path: "/modules/business/deals", count: true },
        { key: "open", label: "Open", path: "/modules/business/deals/open", count: true },
        { key: "won", label: "Won", path: "/modules/business/deals/won" },
        { key: "lost", label: "Lost", path: "/modules/business/deals/lost" },
      ],
      tabs: [
        { key: "overview", label: "Overview", type: "overview", icon: "LayoutDashboard" },
        { key: "proposals", label: "Proposals", type: "related", entity: "proposal", foreignKey: "dealId", allowCreate: true, icon: "FileText" },
        { key: "activity", label: "Activity", type: "activity", icon: "Activity" },
        { key: "files", label: "Files", type: "files", icon: "Folder" },
      ],
      status: "not-started",
    },
    {
      path: "/proposals",
      title: "Proposals",
      layout: "entity-list",
      entity: "proposal",
      icon: "FileText",
      description: "Proposal management",
      subpages: [
        { key: "all", label: "All Proposals", path: "/modules/business/proposals", count: true },
        { key: "draft", label: "Draft", path: "/modules/business/proposals/draft", count: true },
        { key: "sent", label: "Sent", path: "/modules/business/proposals/sent", count: true },
        { key: "accepted", label: "Accepted", path: "/modules/business/proposals/accepted" },
      ],
      status: "not-started",
    },
    {
      path: "/contracts",
      title: "Contracts",
      layout: "entity-list",
      entity: "contract",
      icon: "FileSignature",
      description: "Contract management",
      subpages: [
        { key: "all", label: "All Contracts", path: "/modules/business/contracts", count: true },
        { key: "active", label: "Active", path: "/modules/business/contracts/active", count: true },
        { key: "expiring", label: "Expiring Soon", path: "/modules/business/contracts/expiring", count: true },
        { key: "expired", label: "Expired", path: "/modules/business/contracts/expired" },
      ],
      status: "not-started",
    },
    {
      path: "/pipeline",
      title: "Pipeline",
      layout: "workspace",
      entity: "deal",
      icon: "GitBranch",
      description: "Sales pipeline view",
      status: "not-started",
    },
    {
      path: "/reports",
      title: "Reports",
      layout: "dashboard",
      icon: "BarChart3",
      description: "Business analytics",
      status: "not-started",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: NETWORK
// ─────────────────────────────────────────────────────────────────────────────

export const networkModule: RouteGroup = {
  name: "Network",
  basePath: "/(app)/modules/network",
  description: "Community & professional networking",
  pages: [
    {
      path: "/",
      title: "Network Overview",
      layout: "dashboard",
      icon: "Globe",
      description: "Network dashboard",
      status: "not-started",
    },
    {
      path: "/showcase",
      title: "Showcase",
      layout: "entity-list",
      entity: "showcase",
      icon: "Award",
      description: "Portfolio gallery",
      subpages: [
        { key: "all", label: "All Showcases", path: "/modules/network/showcase", count: true },
        { key: "my", label: "My Showcases", path: "/modules/network/showcase/my" },
        { key: "featured", label: "Featured", path: "/modules/network/showcase/featured" },
      ],
      tabs: [
        { key: "overview", label: "Overview", type: "overview", icon: "LayoutDashboard" },
        { key: "items", label: "Items", type: "related", entity: "showcaseItem", foreignKey: "showcaseId", allowCreate: true, icon: "Image" },
        { key: "comments", label: "Comments", type: "comments", icon: "MessageSquare" },
      ],
      status: "in-progress",
    },
    {
      path: "/discussions",
      title: "Discussions",
      layout: "entity-list",
      entity: "discussion",
      icon: "MessageSquare",
      description: "Community forums",
      subpages: [
        { key: "all", label: "All Discussions", path: "/modules/network/discussions", count: true },
        { key: "my", label: "My Discussions", path: "/modules/network/discussions/my" },
        { key: "following", label: "Following", path: "/modules/network/discussions/following", count: true },
      ],
      tabs: [
        { key: "overview", label: "Discussion", type: "overview", icon: "MessageSquare" },
        { key: "replies", label: "Replies", type: "related", entity: "discussionPost", foreignKey: "discussionId", allowCreate: true, icon: "MessageCircle" },
      ],
      status: "in-progress",
    },
    {
      path: "/challenges",
      title: "Challenges",
      layout: "entity-list",
      entity: "challenge",
      icon: "Trophy",
      description: "Competitions & challenges",
      subpages: [
        { key: "all", label: "All Challenges", path: "/modules/network/challenges", count: true },
        { key: "active", label: "Active", path: "/modules/network/challenges/active", count: true },
        { key: "my", label: "My Submissions", path: "/modules/network/challenges/my" },
        { key: "past", label: "Past", path: "/modules/network/challenges/past" },
      ],
      tabs: [
        { key: "overview", label: "Overview", type: "overview", icon: "LayoutDashboard" },
        { key: "submissions", label: "Submissions", type: "related", entity: "challengeSubmission", foreignKey: "challengeId", icon: "Upload" },
        { key: "leaderboard", label: "Leaderboard", type: "custom", icon: "Medal" },
      ],
      status: "in-progress",
    },
    {
      path: "/marketplace",
      title: "Marketplace",
      layout: "entity-list",
      entity: "marketplaceListing",
      icon: "Store",
      description: "Services & products",
      subpages: [
        { key: "all", label: "All Listings", path: "/modules/network/marketplace", count: true },
        { key: "my", label: "My Listings", path: "/modules/network/marketplace/my" },
        { key: "saved", label: "Saved", path: "/modules/network/marketplace/saved", count: true },
      ],
      status: "in-progress",
    },
    {
      path: "/opportunities",
      title: "Opportunities",
      layout: "entity-list",
      entity: "opportunity",
      icon: "Compass",
      description: "Jobs & gigs",
      subpages: [
        { key: "all", label: "All Opportunities", path: "/modules/network/opportunities", count: true },
        { key: "jobs", label: "Jobs", path: "/modules/network/opportunities/jobs", count: true },
        { key: "gigs", label: "Gigs", path: "/modules/network/opportunities/gigs", count: true },
        { key: "rfps", label: "RFPs", path: "/modules/network/opportunities/rfps" },
        { key: "applied", label: "Applied", path: "/modules/network/opportunities/applied" },
      ],
      status: "in-progress",
    },
    {
      path: "/connections",
      title: "Connections",
      layout: "entity-list",
      entity: "connection",
      icon: "Link",
      description: "Professional network",
      subpages: [
        { key: "all", label: "All Connections", path: "/modules/network/connections", count: true },
        { key: "pending", label: "Pending", path: "/modules/network/connections/pending", count: true },
        { key: "suggestions", label: "Suggestions", path: "/modules/network/connections/suggestions" },
      ],
      status: "in-progress",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const iaRegistry: RouteGroup[] = [
  authRoutes,
  onboardingRoutes,
  accountRoutes,
  coreRoutes,
  projectsModule,
  productionsModule,
  operationsModule,
  workforceModule,
  assetsModule,
  financeModule,
  businessModule,
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
