import { defineSchema } from '../schema/defineSchema';

/**
 * RESOURCE BOOKING ENTITY SCHEMA (SSOT)
 *
 * Full-featured resource planner with:
 * - Confirmed, tentative, placeholder, and soft-hold bookings
 * - Conflict detection with severity levels
 * - Utilization tracking and capacity indicators
 * - Budget/cost estimation per booking
 * - Crew confirmation workflow (offer → accept → confirm)
 * - Placeholder bookings for unfilled roles
 */
export const resourceBookingSchema = defineSchema({
  identity: {
    name: 'Resource Booking',
    namePlural: 'Resource Bookings',
    slug: 'modules/operations/resource-bookings',
    icon: 'CalendarRange',
    description: 'Resource allocation with conflict detection and utilization tracking',
  },

  data: {
    endpoint: '/api/resource-bookings',
    primaryKey: 'id',
    fields: {
      user_id: {
        type: 'relation',
        label: 'Team Member',
        inTable: true,
        inForm: true,
        relation: { entity: 'user', display: 'full_name' },
      },
      contact_id: {
        type: 'relation',
        label: 'Contractor/Freelancer',
        inForm: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      project_id: {
        type: 'relation',
        label: 'Project',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'project', display: 'name' },
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        inTable: true,
        inForm: true,
        relation: { entity: 'event', display: 'name' },
      },
      deal_id: {
        type: 'relation',
        label: 'Deal',
        inForm: true,
        relation: { entity: 'deal', display: 'name' },
      },
      role: {
        type: 'text',
        label: 'Role',
        required: true,
        inTable: true,
        inForm: true,
        searchable: true,
      },
      department: {
        type: 'text',
        label: 'Department',
        inTable: true,
        inForm: true,
      },
      booking_type: {
        type: 'select',
        label: 'Booking Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Confirmed', value: 'confirmed', color: 'green' },
          { label: 'Tentative', value: 'tentative', color: 'yellow' },
          { label: 'Placeholder', value: 'placeholder', color: 'blue' },
          { label: 'Soft Hold', value: 'soft_hold', color: 'orange' },
        ],
        default: 'confirmed',
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Active', value: 'active', color: 'green' },
          { label: 'Completed', value: 'completed', color: 'slate' },
          { label: 'Cancelled', value: 'cancelled', color: 'red' },
          { label: 'On Hold', value: 'on_hold', color: 'yellow' },
        ],
        default: 'active',
      },
      start_date: {
        type: 'date',
        label: 'Start Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      end_date: {
        type: 'date',
        label: 'End Date',
        required: true,
        inTable: true,
        inForm: true,
      },
      hours_per_day: {
        type: 'number',
        label: 'Hours/Day',
        inForm: true,
        inDetail: true,
        default: 8,
      },
      total_hours: {
        type: 'number',
        label: 'Total Hours',
        inTable: true,
        inDetail: true,
      },
      allocation_percent: {
        type: 'number',
        label: 'Allocation %',
        required: true,
        inTable: true,
        inForm: true,
        default: 100,
      },
      hourly_rate: {
        type: 'currency',
        label: 'Hourly Rate',
        inForm: true,
        inDetail: true,
      },
      daily_rate: {
        type: 'currency',
        label: 'Daily Rate',
        inForm: true,
        inDetail: true,
      },
      estimated_cost: {
        type: 'currency',
        label: 'Estimated Cost',
        inTable: true,
        inDetail: true,
      },
      budget_id: {
        type: 'relation',
        label: 'Budget',
        inForm: true,
        relation: { entity: 'budget', display: 'name' },
      },
      labor_rule_set_id: {
        type: 'relation',
        label: 'Labor Rule Set',
        inForm: true,
        relation: { entity: 'labor_rule_set', display: 'name' },
      },
      // Placeholder fields
      placeholder_name: {
        type: 'text',
        label: 'Placeholder Name',
        inForm: true,
        inDetail: true,
        helpText: 'Name for unfilled role (e.g. "Stagehand #3")',
      },
      required_skills: {
        type: 'tags',
        label: 'Required Skills',
        inForm: true,
        inDetail: true,
      },
      required_certifications: {
        type: 'tags',
        label: 'Required Certifications',
        inForm: true,
        inDetail: true,
      },
      // Confirmation workflow
      offer_sent_at: {
        type: 'datetime',
        label: 'Offer Sent',
        inDetail: true,
      },
      offer_accepted_at: {
        type: 'datetime',
        label: 'Offer Accepted',
        inDetail: true,
      },
      confirmed_at: {
        type: 'datetime',
        label: 'Confirmed At',
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
    },
    computed: {
      display_name: {
        label: 'Resource',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const user = r.user as Record<string, unknown> | undefined;
            const contact = r.contact as Record<string, unknown> | undefined;
            if (user) return String(user.full_name || 'Team Member');
            if (contact) return String(contact.full_name || 'Contractor');
            return String(r.placeholder_name || 'TBD');
          },
        },
        inTable: true,
      },
      duration_days: {
        label: 'Duration (days)',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const start = r.start_date ? new Date(String(r.start_date)) : null;
            const end = r.end_date ? new Date(String(r.end_date)) : null;
            if (!start || !end) return 0;
            return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          },
        },
        format: 'number',
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => {
      const user = r.user as Record<string, unknown> | undefined;
      const contact = r.contact as Record<string, unknown> | undefined;
      if (user) return String(user.full_name || 'Team Member');
      if (contact) return String(contact.full_name || 'Contractor');
      return String(r.placeholder_name || 'TBD');
    },
    subtitle: (r: Record<string, unknown>) => `${r.role || ''} — ${r.allocation_percent || 100}%`,
    badge: (r: Record<string, unknown>) => {
      const typeMap: Record<string, { label: string; variant: string }> = {
        confirmed: { label: 'Confirmed', variant: 'success' },
        tentative: { label: 'Tentative', variant: 'warning' },
        placeholder: { label: 'Placeholder', variant: 'primary' },
        soft_hold: { label: 'Soft Hold', variant: 'secondary' },
      };
      return typeMap[String(r.booking_type)] || { label: String(r.booking_type), variant: 'secondary' };
    },
    defaultSort: { field: 'start_date', direction: 'asc' },
  },

  search: { enabled: true, fields: ['role', 'placeholder_name'], placeholder: 'Search bookings...' },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'tentative', label: 'Tentative', query: { where: { booking_type: 'tentative' } } },
      { key: 'placeholders', label: 'Placeholders', query: { where: { booking_type: 'placeholder' } } },
    ],
    advanced: ['project_id', 'event_id', 'booking_type', 'status', 'department', 'role'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
        { key: 'tentative', label: 'Tentative', query: { where: { booking_type: 'tentative' } }, count: true },
        { key: 'placeholders', label: 'Unfilled', query: { where: { booking_type: 'placeholder' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'timeline', 'calendar'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'conflicts', label: 'Conflicts', content: { type: 'related', entity: 'booking_conflicts', foreignKey: 'booking_a_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'allocation', label: 'Allocation', value: { type: 'field', field: 'allocation_percent' }, format: 'percentage' },
          { key: 'hours', label: 'Total Hours', value: { type: 'field', field: 'total_hours' }, format: 'number' },
          { key: 'cost', label: 'Est. Cost', value: { type: 'field', field: 'estimated_cost' }, format: 'currency' },
        ],
        blocks: [
          { key: 'schedule', title: 'Schedule', content: { type: 'fields', fields: ['start_date', 'end_date', 'hours_per_day', 'allocation_percent'] } },
          { key: 'rates', title: 'Rates & Budget', content: { type: 'fields', fields: ['hourly_rate', 'daily_rate', 'estimated_cost', 'budget_id'] } },
          { key: 'confirmation', title: 'Confirmation', content: { type: 'fields', fields: ['offer_sent_at', 'offer_accepted_at', 'confirmed_at'] } },
          { key: 'requirements', title: 'Requirements', content: { type: 'fields', fields: ['required_skills', 'required_certifications'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'resource', title: 'Resource', fields: ['user_id', 'contact_id', 'placeholder_name', 'role', 'department'] },
        { key: 'assignment', title: 'Assignment', fields: ['project_id', 'event_id', 'deal_id', 'booking_type', 'status'] },
        { key: 'schedule', title: 'Schedule', fields: ['start_date', 'end_date', 'hours_per_day', 'allocation_percent'] },
        { key: 'rates', title: 'Rates', fields: ['hourly_rate', 'daily_rate', 'budget_id', 'labor_rule_set_id'] },
        { key: 'requirements', title: 'Requirements', fields: ['required_skills', 'required_certifications'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['display_name', 'role', 'project_id', 'event_id', 'booking_type', 'start_date', 'end_date', 'allocation_percent', 'estimated_cost', 'status'],
    },
    timeline: {
      startField: 'start_date',
      endField: 'end_date',
      titleField: 'role',
      groupField: 'user_id',
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/resource-bookings/${r.id}` } },
      { key: 'confirm', label: 'Confirm', variant: 'primary', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => r.booking_type === 'tentative' || r.booking_type === 'soft_hold' },
      { key: 'send-offer', label: 'Send Offer', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => !r.offer_sent_at && r.booking_type !== 'placeholder' },
      { key: 'fill-placeholder', label: 'Assign Person', variant: 'primary', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => r.booking_type === 'placeholder' },
      { key: 'cancel', label: 'Cancel', variant: 'destructive', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => r.status === 'active' },
    ],
    bulk: [
      { key: 'confirm-all', label: 'Confirm Selected', handler: { type: 'function', fn: () => {} } },
      { key: 'export', label: 'Export', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'create', label: 'New Booking', variant: 'primary', handler: { type: 'navigate', path: '/operations/resource-bookings/new' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
