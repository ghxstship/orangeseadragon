import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  GitBranch,
  Package,
  FileText,
  FolderKanban,
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
  History,
  DollarSign,
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

export const sidebarNavigation: NavSection[] = [
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
        title: "Workflows",
        path: "/core/workflows",
        icon: GitBranch,
        description: "Personal automations",
      },
      {
        title: "Activity",
        path: "/core/activity",
        icon: History,
        description: "Activity feed & history",
      },
      {
        title: "Documents",
        path: "/core/documents",
        icon: FileText,
        description: "Personal document library",
      },
    ],
  },
  {
    title: "MODULES",
    defaultExpanded: true,
    items: [
      {
        title: "Projects",
        path: "/modules/projects",
        icon: FolderKanban,
        description: "Team collaboration & project tracking",
        subpages: [
          { title: "Overview", path: "/modules/projects" },
          { title: "Projects", path: "/modules/projects/projects" },
          { title: "Sprints", path: "/modules/projects/sprints" },
          { title: "Backlogs", path: "/modules/projects/backlogs" },
          { title: "Boards", path: "/modules/projects/boards" },
          { title: "Roadmaps", path: "/modules/projects/roadmaps" },
          { title: "Teams", path: "/modules/projects/teams" },
          { title: "Reports", path: "/modules/projects/reports" },
        ],
      },
      {
        title: "Productions",
        path: "/modules/production",
        icon: Clapperboard,
        description: "Event lifecycle & production",
        subpages: [
          { title: "Overview", path: "/modules/production" },
          { title: "Events", path: "/modules/production/events" },
          { title: "Shows", path: "/modules/production/shows" },
          { title: "Runsheets", path: "/modules/production/runsheets" },
          { title: "Departments", path: "/modules/production/departments" },
          { title: "Advancing", path: "/modules/production/advancing" },
          { title: "Tech Specs", path: "/modules/production/tech-specs" },
          { title: "Riders", path: "/modules/production/riders" },
          { title: "Reports", path: "/modules/production/reports" },
        ],
      },
      {
        title: "Operations",
        path: "/modules/operations",
        icon: ClipboardList,
        description: "Venue management & logistics",
        subpages: [
          { title: "Overview", path: "/modules/operations" },
          { title: "Weather", path: "/modules/operations/weather" },
          { title: "Venues", path: "/modules/operations/venues" },
          { title: "Floor Plans", path: "/modules/operations/floor-plans" },
          { title: "Zones", path: "/modules/operations/zones" },
          { title: "Checkpoints", path: "/modules/operations/checkpoints" },
          { title: "Incidents", path: "/modules/operations/incidents" },
          { title: "Radio Channels", path: "/modules/operations/radio" },
          { title: "Reports", path: "/modules/operations/reports" },
        ],
      },
      {
        title: "Workforce",
        path: "/modules/workforce",
        icon: Users,
        description: "Staff scheduling & crew management",
        subpages: [
          { title: "Overview", path: "/modules/workforce" },
          { title: "Roster", path: "/modules/workforce/roster" },
          { title: "Schedules", path: "/modules/workforce/schedules" },
          { title: "Shifts", path: "/modules/workforce/shifts" },
          { title: "Timesheets", path: "/modules/workforce/timesheets" },
          { title: "Credentials", path: "/modules/workforce/credentials" },
          { title: "Certifications", path: "/modules/workforce/certifications" },
          { title: "Positions", path: "/modules/workforce/positions" },
          { title: "Reports", path: "/modules/workforce/reports" },
        ],
      },
      {
        title: "Assets",
        path: "/modules/assets",
        icon: Package,
        description: "Equipment & inventory management",
        subpages: [
          { title: "Overview", path: "/modules/assets" },
          { title: "Inventory", path: "/modules/assets/inventory" },
          { title: "Categories", path: "/modules/assets/categories" },
          { title: "Kits", path: "/modules/assets/kits" },
          { title: "Reservations", path: "/modules/assets/reservations" },
          { title: "Maintenance", path: "/modules/assets/maintenance" },
          { title: "Check In/Out", path: "/modules/assets/check" },
          { title: "Vendors", path: "/modules/assets/vendors" },
          { title: "Reports", path: "/modules/assets/reports" },
        ],
      },
      {
        title: "Finance",
        path: "/modules/finance",
        icon: DollarSign,
        description: "Budgets, invoices & expenses",
        subpages: [
          { title: "Overview", path: "/modules/finance" },
          { title: "Budgets", path: "/modules/finance/budgets" },
          { title: "Invoices", path: "/modules/finance/invoices" },
          { title: "Expenses", path: "/modules/finance/expenses" },
          { title: "Payments", path: "/modules/finance/payments" },
          { title: "Settlements", path: "/modules/finance/settlements" },
          { title: "Accounts", path: "/modules/finance/accounts" },
          { title: "Reports", path: "/modules/finance/reports" },
        ],
      },
      {
        title: "Business",
        path: "/modules/business",
        icon: Building2,
        description: "CRM, leads & contracts",
        subpages: [
          { title: "Overview", path: "/modules/business" },
          { title: "Contacts", path: "/modules/business/contacts" },
          { title: "Companies", path: "/modules/business/companies" },
          { title: "Leads", path: "/modules/business/leads" },
          { title: "Deals", path: "/modules/business/deals" },
          { title: "Proposals", path: "/modules/business/proposals" },
          { title: "Contracts", path: "/modules/business/contracts" },
          { title: "Pipeline", path: "/modules/business/pipeline" },
          { title: "Reports", path: "/modules/business/reports" },
        ],
      },
    ],
  },
  {
    title: "NETWORK",
    defaultExpanded: true,
    items: [
      {
        title: "Showcase",
        path: "/network/showcase",
        icon: Award,
        description: "Portfolio and work showcase",
      },
      {
        title: "Discussions",
        path: "/network/discussions",
        icon: MessageSquare,
        description: "Community forums",
      },
      {
        title: "Challenges",
        path: "/network/challenges",
        icon: Trophy,
        description: "Competitions and challenges",
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
        title: "Connections",
        path: "/network/connections",
        icon: Link,
        description: "Professional networking",
      },
    ],
  },
];

export const mobileBottomNav: NavItem[] = [
  { title: "Dashboard", path: "/core/dashboard", icon: LayoutDashboard },
  { title: "Calendar", path: "/core/calendar", icon: Calendar },
  { title: "Tasks", path: "/core/tasks", icon: CheckSquare },
  { title: "Productions", path: "/modules/production", icon: Clapperboard },
];
