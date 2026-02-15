"use client";

import * as React from "react";
import {
  FolderOpen,
  Search,
  Filter,
  Lock,
  WifiOff,
  AlertCircle,
  Plus,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Briefcase,
  Users,
  Package,
  Receipt,
  Wallet,
  Building2,
  UserCircle,
  ClipboardList,
  Calendar,
  FileText,
  Handshake,
  Truck,
  Shield,
  BarChart3,
  Megaphone,
  Ticket,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/error-message";
import { useTranslation } from "@/lib/i18n";

type EmptyStateType =
  | "no-data"
  | "no-results"
  | "no-permission"
  | "offline"
  | "error"
  | "first-time";

interface ContextualEmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const defaultConfig: Record<
  EmptyStateType,
  { icon: React.ElementType; title: string; description: string }
> = {
  "no-data": {
    icon: FolderOpen,
    title: "No items yet",
    description: "Get started by creating your first item.",
  },
  "no-results": {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filter criteria.",
  },
  "no-permission": {
    icon: Lock,
    title: "Access restricted",
    description: "You don't have permission to view this content.",
  },
  offline: {
    icon: WifiOff,
    title: "You're offline",
    description: "Check your internet connection and try again.",
  },
  error: {
    icon: AlertCircle,
    title: "Something went wrong",
    description: "We encountered an error. Please try again.",
  },
  "first-time": {
    icon: Sparkles,
    title: "Welcome!",
    description: "Let's get you started with a quick setup.",
  },
};

export function ContextualEmptyState({
  type,
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  children,
}: ContextualEmptyStateProps) {
  const config = defaultConfig[type];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full mb-4",
          type === "error" && "bg-destructive/10 text-destructive",
          type === "no-permission" && "bg-semantic-warning/10 text-semantic-warning",
          type === "offline" && "bg-muted text-muted-foreground",
          type === "first-time" && "bg-primary/10 text-primary",
          (type === "no-data" || type === "no-results") &&
            "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-8 w-8" />
      </div>

      <h3 className="text-lg font-semibold mb-2">{displayTitle}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {displayDescription}
      </p>

      {children}

      {(onAction || onSecondaryAction) && (
        <div className="flex items-center gap-3">
          {onSecondaryAction && secondaryActionLabel && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {onAction && actionLabel && (
            <Button onClick={onAction}>
              {type === "no-data" || type === "first-time" ? (
                <Plus className="mr-2 h-4 w-4" />
              ) : type === "error" || type === "offline" ? (
                <RefreshCw className="mr-2 h-4 w-4" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface PageErrorStateProps {
  title?: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}

export function PageErrorState({
  title,
  description,
  error,
  onRetry,
  className,
}: PageErrorStateProps) {
  const { t } = useTranslation();

  const resolvedTitle = title || t("errors.loadFailed");
  const resolvedDescription = description || getErrorMessage(error, t("errors.tryAgain"));

  return (
    <div
      className={cn(
        "flex min-h-[22rem] items-center justify-center rounded-lg border border-border/60 bg-muted/20 p-6",
        className
      )}
    >
      <ContextualEmptyState
        type="error"
        title={resolvedTitle}
        description={resolvedDescription}
        actionLabel={onRetry ? t("common.refresh") : undefined}
        onAction={onRetry}
      />
    </div>
  );
}

// Pre-configured empty states for common scenarios
export function NoDataEmptyState({
  entityName = "items",
  onCreateNew,
  className,
}: {
  entityName?: string;
  onCreateNew?: () => void;
  className?: string;
}) {
  return (
    <ContextualEmptyState
      type="no-data"
      title={`No ${entityName} yet`}
      description={`Get started by creating your first ${entityName.slice(0, -1)}.`}
      actionLabel={`Create ${entityName.slice(0, -1)}`}
      onAction={onCreateNew}
      className={className}
    />
  );
}

export function NoResultsEmptyState({
  onClearFilters,
  className,
}: {
  onClearFilters?: () => void;
  className?: string;
}) {
  return (
    <ContextualEmptyState
      type="no-results"
      icon={Filter}
      actionLabel="Clear filters"
      onAction={onClearFilters}
      className={className}
    />
  );
}

export function ErrorEmptyState({
  message,
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <ContextualEmptyState
      type="error"
      description={message}
      actionLabel="Try again"
      onAction={onRetry}
      className={className}
    />
  );
}

export function OfflineEmptyState({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <ContextualEmptyState
      type="offline"
      actionLabel="Retry"
      onAction={onRetry}
      className={className}
    />
  );
}

export function NoPermissionEmptyState({
  onRequestAccess,
  className,
}: {
  onRequestAccess?: () => void;
  className?: string;
}) {
  return (
    <ContextualEmptyState
      type="no-permission"
      actionLabel="Request access"
      onAction={onRequestAccess}
      className={className}
    />
  );
}

export function FirstTimeEmptyState({
  featureName,
  onGetStarted,
  className,
}: {
  featureName?: string;
  onGetStarted?: () => void;
  className?: string;
}) {
  return (
    <ContextualEmptyState
      type="first-time"
      title={featureName ? `Welcome to ${featureName}!` : "Welcome!"}
      description="Let's get you started with a quick setup."
      actionLabel="Get started"
      onAction={onGetStarted}
      className={className}
    />
  );
}

/**
 * ENTITY-AWARE SMART EMPTY STATE
 *
 * Resolves context from entity schema to produce tailored empty states
 * per entity type. Provides contextual icon, title, description, and CTA
 * based on the entity's identity and the current empty state reason.
 *
 * Usage: <EntityEmptyState entity="projects" type="no-data" onAction={...} />
 */

const entityEmptyStateConfig: Record<
  string,
  {
    icon: React.ElementType;
    noDataTitle: string;
    noDataDescription: string;
    noDataAction: string;
    noResultsDescription?: string;
    firstTimeTitle: string;
    firstTimeDescription: string;
  }
> = {
  projects: {
    icon: Briefcase,
    noDataTitle: "No projects yet",
    noDataDescription:
      "Projects are the backbone of your productions. Create one to start organizing tasks, budgets, and crew.",
    noDataAction: "Create Project",
    firstTimeTitle: "Welcome to Projects!",
    firstTimeDescription:
      "Track every production from pitch to wrap. Start by creating your first project.",
  },
  tasks: {
    icon: ClipboardList,
    noDataTitle: "No tasks yet",
    noDataDescription:
      "Break your work into actionable tasks. Assign them to team members and track progress.",
    noDataAction: "Create Task",
    firstTimeTitle: "Welcome to Tasks!",
    firstTimeDescription:
      "Organize your work with tasks, subtasks, and due dates.",
  },
  people: {
    icon: Users,
    noDataTitle: "No team members yet",
    noDataDescription:
      "Add your crew, staff, and freelancers to manage availability, rates, and assignments.",
    noDataAction: "Add Person",
    firstTimeTitle: "Welcome to People!",
    firstTimeDescription:
      "Build your team roster and manage crew across all productions.",
  },
  assets: {
    icon: Package,
    noDataTitle: "No assets yet",
    noDataDescription:
      "Track your equipment, vehicles, and inventory. Know what you have and where it is.",
    noDataAction: "Add Asset",
    firstTimeTitle: "Welcome to Assets!",
    firstTimeDescription:
      "Catalog your equipment and track reservations, maintenance, and depreciation.",
  },
  invoices: {
    icon: Receipt,
    noDataTitle: "No invoices yet",
    noDataDescription:
      "Create and send professional invoices. Track payments and aging automatically.",
    noDataAction: "Create Invoice",
    firstTimeTitle: "Welcome to Invoicing!",
    firstTimeDescription:
      "Bill clients, track payments, and manage your accounts receivable.",
  },
  budgets: {
    icon: Wallet,
    noDataTitle: "No budgets yet",
    noDataDescription:
      "Set up budgets to track estimated vs. actual costs across your productions.",
    noDataAction: "Create Budget",
    firstTimeTitle: "Welcome to Budgets!",
    firstTimeDescription:
      "Plan and monitor spending with line items, phases, and real-time variance tracking.",
  },
  companies: {
    icon: Building2,
    noDataTitle: "No companies yet",
    noDataDescription:
      "Add clients, vendors, and partners to build your business network.",
    noDataAction: "Add Company",
    firstTimeTitle: "Welcome to Companies!",
    firstTimeDescription:
      "Manage your business relationships — clients, vendors, agencies, and venues.",
  },
  contacts: {
    icon: UserCircle,
    noDataTitle: "No contacts yet",
    noDataDescription:
      "Add key contacts for your clients, vendors, and partners.",
    noDataAction: "Add Contact",
    firstTimeTitle: "Welcome to Contacts!",
    firstTimeDescription:
      "Keep track of every person you work with across all your business relationships.",
  },
  deals: {
    icon: Handshake,
    noDataTitle: "No deals yet",
    noDataDescription:
      "Track opportunities from lead to close. Manage proposals, holds, and revenue pipeline.",
    noDataAction: "Create Deal",
    firstTimeTitle: "Welcome to Deals!",
    firstTimeDescription:
      "Build your sales pipeline and track every opportunity to close.",
  },
  events: {
    icon: Calendar,
    noDataTitle: "No events yet",
    noDataDescription:
      "Schedule and manage events across all your productions and venues.",
    noDataAction: "Create Event",
    firstTimeTitle: "Welcome to Events!",
    firstTimeDescription:
      "Plan events with dates, venues, and crew assignments.",
  },
  documents: {
    icon: FileText,
    noDataTitle: "No documents yet",
    noDataDescription:
      "Upload and organize production documents — contracts, riders, and more.",
    noDataAction: "Upload Document",
    firstTimeTitle: "Welcome to Documents!",
    firstTimeDescription:
      "Centralize all your production paperwork in one place.",
  },
  venues: {
    icon: MapPin,
    noDataTitle: "No venues yet",
    noDataDescription:
      "Add venues to track capacity, technical specs, and availability.",
    noDataAction: "Add Venue",
    firstTimeTitle: "Welcome to Venues!",
    firstTimeDescription:
      "Manage your venue database with specs, contacts, and booking history.",
  },
  expenses: {
    icon: Receipt,
    noDataTitle: "No expenses yet",
    noDataDescription:
      "Track production expenses with receipts, categories, and approval workflows.",
    noDataAction: "Add Expense",
    firstTimeTitle: "Welcome to Expenses!",
    firstTimeDescription:
      "Log expenses, attach receipts, and track reimbursements.",
  },
  shipments: {
    icon: Truck,
    noDataTitle: "No shipments yet",
    noDataDescription:
      "Track equipment and material shipments between locations.",
    noDataAction: "Create Shipment",
    firstTimeTitle: "Welcome to Shipments!",
    firstTimeDescription:
      "Manage logistics for equipment moves and deliveries.",
  },
  reports: {
    icon: BarChart3,
    noDataTitle: "No reports yet",
    noDataDescription:
      "Build custom reports to analyze performance, financials, and operations.",
    noDataAction: "Create Report",
    firstTimeTitle: "Welcome to Reports!",
    firstTimeDescription:
      "Generate insights with customizable reports and dashboards.",
  },
  campaigns: {
    icon: Megaphone,
    noDataTitle: "No campaigns yet",
    noDataDescription:
      "Plan and track marketing campaigns tied to your productions.",
    noDataAction: "Create Campaign",
    firstTimeTitle: "Welcome to Campaigns!",
    firstTimeDescription:
      "Manage outreach, promotions, and marketing activities.",
  },
  tickets: {
    icon: Ticket,
    noDataTitle: "No tickets yet",
    noDataDescription:
      "Track support tickets and internal requests.",
    noDataAction: "Create Ticket",
    firstTimeTitle: "Welcome to Tickets!",
    firstTimeDescription:
      "Manage support requests with priority, assignment, and resolution tracking.",
  },
  permits: {
    icon: Shield,
    noDataTitle: "No permits yet",
    noDataDescription:
      "Track permits, licenses, and compliance requirements for your productions.",
    noDataAction: "Add Permit",
    firstTimeTitle: "Welcome to Permits!",
    firstTimeDescription:
      "Stay compliant by tracking all required permits and their expiration dates.",
  },
};

const fallbackConfig = {
  icon: FolderOpen,
  noDataTitle: "No items yet",
  noDataDescription: "Get started by creating your first item.",
  noDataAction: "Create New",
  noResultsDescription: "Try adjusting your search or filter criteria.",
  firstTimeTitle: "Welcome!",
  firstTimeDescription: "Let's get you started.",
};

interface EntityEmptyStateProps {
  entity: string;
  type?: EmptyStateType;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EntityEmptyState({
  entity,
  type = "no-data",
  onAction,
  onSecondaryAction,
  secondaryActionLabel,
  className,
  children,
}: EntityEmptyStateProps) {
  const entityKey = entity.toLowerCase().replace(/[-_\s]/g, "");
  const config = entityEmptyStateConfig[entityKey] || fallbackConfig;

  let title: string;
  let description: string;
  let actionLabel: string | undefined;

  switch (type) {
    case "no-data":
      title = config.noDataTitle;
      description = config.noDataDescription;
      actionLabel = onAction ? config.noDataAction : undefined;
      break;
    case "first-time":
      title = config.firstTimeTitle;
      description = config.firstTimeDescription;
      actionLabel = onAction ? "Get Started" : undefined;
      break;
    case "no-results":
      title = "No results found";
      description =
        config.noResultsDescription ||
        `No ${entity} match your current filters. Try broadening your search.`;
      actionLabel = onAction ? "Clear Filters" : undefined;
      break;
    default:
      title = defaultConfig[type].title;
      description = defaultConfig[type].description;
      actionLabel = onAction ? "Try Again" : undefined;
  }

  return (
    <ContextualEmptyState
      type={type}
      icon={config.icon}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
      secondaryActionLabel={secondaryActionLabel}
      onSecondaryAction={onSecondaryAction}
      className={className}
    >
      {children}
    </ContextualEmptyState>
  );
}
