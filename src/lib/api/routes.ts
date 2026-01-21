/**
 * API Route Definitions
 * Defines all API routes as per ENTERPRISE_EXTENSION_PLAN.md
 */

import type { ApiRouteDefinition, RateLimitConfig, RouteConfig } from "./types";

const defaultRateLimit: RateLimitConfig = {
  requests: 1000,
  window: 60,
  keyBy: "organization",
};

export const apiRoutes: Record<string, ApiRouteDefinition> = {
  // Core Service
  organizations: {
    service: "core",
    basePath: "/api/v1/organizations",
    rateLimit: { requests: 1000, window: 60, keyBy: "organization" },
    routes: [
      { path: "/", method: "GET", handler: "list", permissions: ["org:read"] },
      { path: "/", method: "POST", handler: "create", permissions: ["org:create"] },
      { path: "/:id", method: "GET", handler: "get", permissions: ["org:read"] },
      { path: "/:id", method: "PUT", handler: "update", permissions: ["org:update"] },
      { path: "/:id", method: "DELETE", handler: "delete", permissions: ["org:delete"] },
      { path: "/:id/members", method: "GET", handler: "listMembers", permissions: ["org:read"] },
      { path: "/:id/members", method: "POST", handler: "addMember", permissions: ["org:manage"] },
      { path: "/:id/members/:userId", method: "DELETE", handler: "removeMember", permissions: ["org:manage"] },
      { path: "/:id/settings", method: "GET", handler: "getSettings", permissions: ["org:read"] },
      { path: "/:id/settings", method: "PUT", handler: "updateSettings", permissions: ["org:manage"] },
      { path: "/:id/billing", method: "GET", handler: "getBilling", permissions: ["org:billing"] },
      { path: "/:id/usage", method: "GET", handler: "getUsage", permissions: ["org:read"] },
    ],
  },

  users: {
    service: "core",
    basePath: "/api/v1/users",
    rateLimit: defaultRateLimit,
    routes: [
      { path: "/", method: "GET", handler: "list", permissions: ["user:read"] },
      { path: "/me", method: "GET", handler: "getCurrentUser", permissions: [] },
      { path: "/me", method: "PUT", handler: "updateCurrentUser", permissions: [] },
      { path: "/:id", method: "GET", handler: "get", permissions: ["user:read"] },
      { path: "/:id", method: "PUT", handler: "update", permissions: ["user:update"] },
      { path: "/:id", method: "DELETE", handler: "delete", permissions: ["user:delete"] },
      { path: "/:id/roles", method: "GET", handler: "getRoles", permissions: ["user:read"] },
      { path: "/:id/roles", method: "PUT", handler: "updateRoles", permissions: ["user:manage"] },
      { path: "/:id/preferences", method: "GET", handler: "getPreferences", permissions: [] },
      { path: "/:id/preferences", method: "PUT", handler: "updatePreferences", permissions: [] },
    ],
  },

  // Project Service
  projects: {
    service: "projects",
    basePath: "/api/v1/projects",
    rateLimit: { requests: 500, window: 60, keyBy: "organization" },
    routes: [
      { path: "/", method: "GET", handler: "list", permissions: ["project:read"] },
      { path: "/", method: "POST", handler: "create", permissions: ["project:create"] },
      { path: "/bulk", method: "POST", handler: "bulkCreate", permissions: ["project:create"] },
      { path: "/:id", method: "GET", handler: "get", permissions: ["project:read"] },
      { path: "/:id", method: "PUT", handler: "update", permissions: ["project:update"] },
      { path: "/:id", method: "DELETE", handler: "delete", permissions: ["project:delete"] },
      { path: "/:id/tasks", method: "GET", handler: "listTasks", permissions: ["task:read"] },
      { path: "/:id/tasks", method: "POST", handler: "createTask", permissions: ["task:create"] },
      { path: "/:id/milestones", method: "GET", handler: "listMilestones", permissions: ["project:read"] },
      { path: "/:id/milestones", method: "POST", handler: "createMilestone", permissions: ["project:update"] },
      { path: "/:id/team", method: "GET", handler: "getTeam", permissions: ["project:read"] },
      { path: "/:id/team", method: "PUT", handler: "updateTeam", permissions: ["project:manage"] },
      { path: "/:id/budget", method: "GET", handler: "getBudget", permissions: ["project:read"] },
      { path: "/:id/timeline", method: "GET", handler: "getTimeline", permissions: ["project:read"] },
      { path: "/:id/activity", method: "GET", handler: "getActivity", permissions: ["project:read"] },
    ],
  },

  tasks: {
    service: "projects",
    basePath: "/api/v1/tasks",
    rateLimit: { requests: 1000, window: 60, keyBy: "organization" },
    routes: [
      { path: "/", method: "GET", handler: "list", permissions: ["task:read"] },
      { path: "/", method: "POST", handler: "create", permissions: ["task:create"] },
      { path: "/bulk", method: "POST", handler: "bulkUpdate", permissions: ["task:update"] },
      { path: "/:id", method: "GET", handler: "get", permissions: ["task:read"] },
      { path: "/:id", method: "PUT", handler: "update", permissions: ["task:update"] },
      { path: "/:id", method: "DELETE", handler: "delete", permissions: ["task:delete"] },
      { path: "/:id/subtasks", method: "GET", handler: "listSubtasks", permissions: ["task:read"] },
      { path: "/:id/subtasks", method: "POST", handler: "createSubtask", permissions: ["task:create"] },
      { path: "/:id/comments", method: "GET", handler: "listComments", permissions: ["task:read"] },
      { path: "/:id/comments", method: "POST", handler: "addComment", permissions: ["task:read"] },
      { path: "/:id/attachments", method: "GET", handler: "listAttachments", permissions: ["task:read"] },
      { path: "/:id/attachments", method: "POST", handler: "addAttachment", permissions: ["task:update"] },
      { path: "/:id/time-entries", method: "GET", handler: "listTimeEntries", permissions: ["task:read"] },
      { path: "/:id/time-entries", method: "POST", handler: "addTimeEntry", permissions: ["task:update"] },
    ],
  },

  // Production Service
  events: {
    service: "production",
    basePath: "/api/v1/events",
    rateLimit: { requests: 500, window: 60, keyBy: "organization" },
    routes: [
      { path: "/", method: "GET", handler: "list", permissions: ["event:read"] },
      { path: "/", method: "POST", handler: "create", permissions: ["event:create"] },
      { path: "/:id", method: "GET", handler: "get", permissions: ["event:read"] },
      { path: "/:id", method: "PUT", handler: "update", permissions: ["event:update"] },
      { path: "/:id", method: "DELETE", handler: "delete", permissions: ["event:delete"] },
      { path: "/:id/shows", method: "GET", handler: "listShows", permissions: ["event:read"] },
      { path: "/:id/shows", method: "POST", handler: "createShow", permissions: ["event:update"] },
      { path: "/:id/crew", method: "GET", handler: "listCrew", permissions: ["event:read"] },
      { path: "/:id/crew", method: "POST", handler: "assignCrew", permissions: ["event:manage"] },
      { path: "/:id/runsheet", method: "GET", handler: "getRunsheet", permissions: ["event:read"] },
      { path: "/:id/runsheet", method: "PUT", handler: "updateRunsheet", permissions: ["event:update"] },
      { path: "/:id/call-sheet", method: "GET", handler: "getCallSheet", permissions: ["event:read"] },
      { path: "/:id/call-sheet", method: "POST", handler: "generateCallSheet", permissions: ["event:update"] },
      { path: "/:id/stage-plot", method: "GET", handler: "getStagePlot", permissions: ["event:read"] },
      { path: "/:id/cue-sheet", method: "GET", handler: "getCueSheet", permissions: ["event:read"] },
    ],
  },

  venues: {
    service: "production",
    basePath: "/api/v1/venues",
    rateLimit: { requests: 500, window: 60, keyBy: "organization" },
    routes: [
      { path: "/", method: "GET", handler: "list", permissions: ["venue:read"] },
      { path: "/", method: "POST", handler: "create", permissions: ["venue:create"] },
      { path: "/:id", method: "GET", handler: "get", permissions: ["venue:read"] },
      { path: "/:id", method: "PUT", handler: "update", permissions: ["venue:update"] },
      { path: "/:id", method: "DELETE", handler: "delete", permissions: ["venue:delete"] },
      { path: "/:id/spaces", method: "GET", handler: "listSpaces", permissions: ["venue:read"] },
      { path: "/:id/availability", method: "GET", handler: "getAvailability", permissions: ["venue:read"] },
      { path: "/:id/floor-plans", method: "GET", handler: "listFloorPlans", permissions: ["venue:read"] },
    ],
  },

  // Asset Service
  assets: {
    service: "assets",
    basePath: "/api/v1/assets",
    rateLimit: { requests: 1000, window: 60, keyBy: "organization" },
    routes: [
      { path: "/", method: "GET", handler: "list", permissions: ["asset:read"] },
      { path: "/", method: "POST", handler: "create", permissions: ["asset:create"] },
      { path: "/bulk", method: "POST", handler: "bulkCreate", permissions: ["asset:create"] },
      { path: "/scan", method: "POST", handler: "scan", permissions: ["asset:read"] },
      { path: "/:id", method: "GET", handler: "get", permissions: ["asset:read"] },
      { path: "/:id", method: "PUT", handler: "update", permissions: ["asset:update"] },
      { path: "/:id", method: "DELETE", handler: "delete", permissions: ["asset:delete"] },
      { path: "/:id/checkout", method: "POST", handler: "checkout", permissions: ["asset:checkout"] },
      { path: "/:id/checkin", method: "POST", handler: "checkin", permissions: ["asset:checkout"] },
      { path: "/:id/maintenance", method: "GET", handler: "listMaintenance", permissions: ["asset:read"] },
      { path: "/:id/maintenance", method: "POST", handler: "scheduleMaintenance", permissions: ["asset:manage"] },
      { path: "/:id/history", method: "GET", handler: "getHistory", permissions: ["asset:read"] },
      { path: "/:id/qr-code", method: "GET", handler: "getQRCode", permissions: ["asset:read"] },
    ],
  },

  // Finance Service
  finance: {
    service: "finance",
    basePath: "/api/v1/finance",
    rateLimit: { requests: 500, window: 60, keyBy: "organization" },
    routes: [
      { path: "/budgets", method: "GET", handler: "listBudgets", permissions: ["finance:read"] },
      { path: "/budgets", method: "POST", handler: "createBudget", permissions: ["finance:create"] },
      { path: "/budgets/:id", method: "GET", handler: "getBudget", permissions: ["finance:read"] },
      { path: "/budgets/:id", method: "PUT", handler: "updateBudget", permissions: ["finance:update"] },
      { path: "/invoices", method: "GET", handler: "listInvoices", permissions: ["finance:read"] },
      { path: "/invoices", method: "POST", handler: "createInvoice", permissions: ["finance:create"] },
      { path: "/invoices/:id", method: "GET", handler: "getInvoice", permissions: ["finance:read"] },
      { path: "/invoices/:id", method: "PUT", handler: "updateInvoice", permissions: ["finance:update"] },
      { path: "/invoices/:id/send", method: "POST", handler: "sendInvoice", permissions: ["finance:manage"] },
      { path: "/expenses", method: "GET", handler: "listExpenses", permissions: ["finance:read"] },
      { path: "/expenses", method: "POST", handler: "createExpense", permissions: ["finance:create"] },
      { path: "/expenses/:id", method: "GET", handler: "getExpense", permissions: ["finance:read"] },
      { path: "/expenses/:id/approve", method: "POST", handler: "approveExpense", permissions: ["finance:approve"] },
      { path: "/payments", method: "GET", handler: "listPayments", permissions: ["finance:read"] },
      { path: "/payments", method: "POST", handler: "createPayment", permissions: ["finance:create"] },
      { path: "/reconciliation", method: "GET", handler: "getReconciliation", permissions: ["finance:read"] },
      { path: "/reconciliation/match", method: "POST", handler: "matchTransactions", permissions: ["finance:manage"] },
      { path: "/reports/pnl", method: "GET", handler: "getPnLReport", permissions: ["finance:read"] },
      { path: "/reports/cashflow", method: "GET", handler: "getCashflowReport", permissions: ["finance:read"] },
    ],
  },

  // CRM Service
  crm: {
    service: "crm",
    basePath: "/api/v1/crm",
    rateLimit: { requests: 1000, window: 60, keyBy: "organization" },
    routes: [
      { path: "/contacts", method: "GET", handler: "listContacts", permissions: ["crm:read"] },
      { path: "/contacts", method: "POST", handler: "createContact", permissions: ["crm:create"] },
      { path: "/contacts/:id", method: "GET", handler: "getContact", permissions: ["crm:read"] },
      { path: "/contacts/:id", method: "PUT", handler: "updateContact", permissions: ["crm:update"] },
      { path: "/contacts/:id", method: "DELETE", handler: "deleteContact", permissions: ["crm:delete"] },
      { path: "/companies", method: "GET", handler: "listCompanies", permissions: ["crm:read"] },
      { path: "/companies", method: "POST", handler: "createCompany", permissions: ["crm:create"] },
      { path: "/companies/:id", method: "GET", handler: "getCompany", permissions: ["crm:read"] },
      { path: "/companies/:id", method: "PUT", handler: "updateCompany", permissions: ["crm:update"] },
      { path: "/deals", method: "GET", handler: "listDeals", permissions: ["crm:read"] },
      { path: "/deals", method: "POST", handler: "createDeal", permissions: ["crm:create"] },
      { path: "/deals/:id", method: "GET", handler: "getDeal", permissions: ["crm:read"] },
      { path: "/deals/:id", method: "PUT", handler: "updateDeal", permissions: ["crm:update"] },
      { path: "/deals/:id/stage", method: "PUT", handler: "updateDealStage", permissions: ["crm:update"] },
      { path: "/pipeline", method: "GET", handler: "getPipeline", permissions: ["crm:read"] },
      { path: "/activities", method: "GET", handler: "listActivities", permissions: ["crm:read"] },
      { path: "/activities", method: "POST", handler: "createActivity", permissions: ["crm:create"] },
    ],
  },

  // Workflow Service
  workflows: {
    service: "workflows",
    basePath: "/api/v1/workflows",
    rateLimit: { requests: 200, window: 60, keyBy: "organization" },
    routes: [
      { path: "/", method: "GET", handler: "list", permissions: ["workflow:read"] },
      { path: "/", method: "POST", handler: "create", permissions: ["workflow:create"] },
      { path: "/templates", method: "GET", handler: "listTemplates", permissions: ["workflow:read"] },
      { path: "/:id", method: "GET", handler: "get", permissions: ["workflow:read"] },
      { path: "/:id", method: "PUT", handler: "update", permissions: ["workflow:update"] },
      { path: "/:id", method: "DELETE", handler: "delete", permissions: ["workflow:delete"] },
      { path: "/:id/activate", method: "POST", handler: "activate", permissions: ["workflow:manage"] },
      { path: "/:id/deactivate", method: "POST", handler: "deactivate", permissions: ["workflow:manage"] },
      { path: "/:id/execute", method: "POST", handler: "execute", permissions: ["workflow:execute"] },
      { path: "/:id/executions", method: "GET", handler: "listExecutions", permissions: ["workflow:read"] },
      { path: "/executions/:executionId", method: "GET", handler: "getExecution", permissions: ["workflow:read"] },
      { path: "/executions/:executionId/cancel", method: "POST", handler: "cancelExecution", permissions: ["workflow:manage"] },
    ],
  },

  // Integrations Service
  integrations: {
    service: "integrations",
    basePath: "/api/v1/integrations",
    rateLimit: { requests: 500, window: 60, keyBy: "organization" },
    routes: [
      { path: "/connectors", method: "GET", handler: "listConnectors", permissions: ["integration:read"] },
      { path: "/connectors/:id", method: "GET", handler: "getConnector", permissions: ["integration:read"] },
      { path: "/instances", method: "GET", handler: "listInstances", permissions: ["integration:read"] },
      { path: "/instances", method: "POST", handler: "createInstance", permissions: ["integration:create"] },
      { path: "/instances/:id", method: "GET", handler: "getInstance", permissions: ["integration:read"] },
      { path: "/instances/:id", method: "PUT", handler: "updateInstance", permissions: ["integration:update"] },
      { path: "/instances/:id", method: "DELETE", handler: "deleteInstance", permissions: ["integration:delete"] },
      { path: "/instances/:id/sync", method: "POST", handler: "triggerSync", permissions: ["integration:manage"] },
      { path: "/instances/:id/test", method: "POST", handler: "testConnection", permissions: ["integration:read"] },
      { path: "/oauth/authorize", method: "GET", handler: "oauthAuthorize", permissions: ["integration:create"] },
      { path: "/oauth/callback", method: "GET", handler: "oauthCallback", permissions: [] },
      { path: "/webhooks/:id", method: "POST", handler: "handleWebhook", permissions: [] },
    ],
  },
};

export function getRoutesByService(service: string): ApiRouteDefinition[] {
  return Object.values(apiRoutes).filter((r) => r.service === service);
}

export function getAllRoutes(): RouteConfig[] {
  return Object.values(apiRoutes).flatMap((def) =>
    def.routes.map((route) => ({
      ...route,
      path: `${def.basePath}${route.path}`,
    }))
  );
}

export function countEndpoints(): number {
  return Object.values(apiRoutes).reduce((sum, def) => sum + def.routes.length, 0);
}
