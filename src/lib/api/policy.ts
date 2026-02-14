export type PolicyAction =
  | "entity.read"
  | "entity.write"
  | "entity.delete"
  | "finance.approve"
  | "audit.read"
  | "settings.manage";

export type DataSensitivity = "low" | "medium" | "high" | "critical";

export interface PolicyDecisionContext {
  actorId: string;
  actorOrganizationId: string;
  roleName: string | null;
  resourceOwnerId?: string | null;
  resourceOrganizationId?: string | null;
  sensitivity?: DataSensitivity;
}

export interface PolicyDecision {
  allow: boolean;
  reason: string;
}

type PolicyRule = {
  roles?: string[];
  allowIf?: (context: PolicyDecisionContext) => boolean;
  reason: string;
};

const POLICY_RULES: Record<PolicyAction, PolicyRule[]> = {
  "entity.read": [
    {
      roles: ["admin", "manager", "staff", "viewer"],
      reason: "Role is permitted to view entities",
    },
    {
      allowIf: (context) => context.actorId === context.resourceOwnerId,
      reason: "Resource owners can always read their own records",
    },
  ],
  "entity.write": [
    {
      roles: ["admin", "manager", "staff"],
      reason: "Role is permitted to modify entities",
    },
    {
      allowIf: (context) => context.actorId === context.resourceOwnerId,
      reason: "Resource owners can edit their own records",
    },
  ],
  "entity.delete": [
    {
      roles: ["admin", "manager"],
      reason: "Delete operations require elevated privileges",
    },
  ],
  "finance.approve": [
    {
      roles: ["admin", "finance_manager"],
      reason: "Finance approvals are restricted to privileged finance roles",
    },
  ],
  "audit.read": [
    {
      roles: ["admin", "security_auditor", "compliance_officer"],
      reason: "Audit access restricted to compliance/security administrators",
    },
  ],
  "settings.manage": [
    {
      roles: ["admin"],
      reason: "Only tenant admins can manage settings",
    },
  ],
};

function matchesRole(roleName: string | null, allowedRoles: string[] | undefined): boolean {
  if (!allowedRoles?.length || !roleName) {
    return false;
  }

  return allowedRoles.includes(roleName);
}

function isOrgBoundaryValid(context: PolicyDecisionContext): boolean {
  if (!context.resourceOrganizationId) {
    return true;
  }

  return context.resourceOrganizationId === context.actorOrganizationId;
}

function passesSensitivityGuard(context: PolicyDecisionContext): boolean {
  if (!context.sensitivity) {
    return true;
  }

  if (context.sensitivity === "critical") {
    return context.roleName === "admin" || context.roleName === "security_auditor";
  }

  if (context.sensitivity === "high") {
    return ["admin", "manager", "security_auditor", "compliance_officer"].includes(
      context.roleName || ""
    );
  }

  return true;
}

export function evaluatePolicy(action: PolicyAction, context: PolicyDecisionContext): PolicyDecision {
  if (!isOrgBoundaryValid(context)) {
    return {
      allow: false,
      reason: "Cross-organization access is not permitted",
    };
  }

  if (!passesSensitivityGuard(context)) {
    return {
      allow: false,
      reason: "Action blocked due to data sensitivity constraints",
    };
  }

  const rules = POLICY_RULES[action] || [];

  for (const rule of rules) {
    if (matchesRole(context.roleName, rule.roles)) {
      return { allow: true, reason: rule.reason };
    }

    if (rule.allowIf?.(context)) {
      return { allow: true, reason: rule.reason };
    }
  }

  return {
    allow: false,
    reason: `Policy denied for action ${action}`,
  };
}
