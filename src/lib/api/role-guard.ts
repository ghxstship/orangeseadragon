import { forbidden } from '@/lib/api/response';
import type { OrgMemberContext } from '@/lib/api/guard';

/**
 * ATLVS Role-Based Access Guard — Supplementary Enforcement
 *
 * Provides fine-grained permission checks beyond the basic requireRole guard.
 * Enforces client and vendor role restrictions at the API level.
 */

/** Resources that client-role users are forbidden from accessing */
const CLIENT_FORBIDDEN_RESOURCES = new Set([
  'budgets',
  'budget_line_items',
  'budget_categories',
  'budget_phases',
  'budget_alerts',
  'budget_scenarios',
  'crew_rate_cards',
  'rate_cards',
  'rate_card_items',
  'expenses',
  'expense_receipts',
  'reimbursements',
  'payroll_batches',
  'pay_stubs',
  'pay_rates',
  'deductions',
  'time_entries',
  'timesheet_entries',
  'timesheets',
  'employee_profiles',
  'crew_gig_ratings',
  'labor_rule_sets',
  'meal_penalties',
  'turnaround_violations',
  'vendor_payment_schedules',
  'purchase_orders',
  'purchase_order_items',
]);

/** Resources that vendor-role users are forbidden from accessing */
const VENDOR_FORBIDDEN_RESOURCES = new Set([
  'budgets',
  'budget_line_items',
  'budget_categories',
  'budget_phases',
  'budget_alerts',
  'budget_scenarios',
  'deals',
  'proposals',
  'proposal_line_items',
  'leads',
  'pipelines',
  'pipeline_stages',
  'employee_profiles',
  'crew_gig_ratings',
  'payroll_batches',
  'pay_stubs',
  'pay_rates',
  'deductions',
  'revenue_recognitions',
  'fiscal_periods',
]);

/**
 * Check if a user's role permits access to a specific resource.
 * Returns null if allowed, or a 403 Response if forbidden.
 */
export function enforceResourceAccess(
  auth: OrgMemberContext,
  resource: string
) {
  const role = auth.membership.role_name;

  if ((role === 'client' || role === 'client_viewer') && CLIENT_FORBIDDEN_RESOURCES.has(resource)) {
    return forbidden(`Client role does not have access to ${resource}`);
  }

  if (role === 'vendor' && VENDOR_FORBIDDEN_RESOURCES.has(resource)) {
    return forbidden(`Vendor role does not have access to ${resource}`);
  }

  return null;
}

/**
 * Check if a user's role permits access to emergency contact information.
 * Returns true if the user can view emergency contacts.
 */
export function canViewEmergencyContacts(
  auth: OrgMemberContext,
  targetVisibility: string
): boolean {
  const role = auth.membership.role_name;

  switch (targetVisibility) {
    case 'all':
      return true;
    case 'managers_only':
      return ['owner', 'admin', 'manager'].includes(role || '');
    case 'hr_only':
      return ['owner', 'admin'].includes(role || '');
    case 'restricted':
    default:
      return ['owner', 'admin'].includes(role || '');
  }
}
