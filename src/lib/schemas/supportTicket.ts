import { defineSchema } from '../schema/defineSchema';

export const supportTicketSchema = defineSchema({
  identity: {
    name: 'Support Ticket',
    namePlural: 'Support Tickets',
    slug: 'modules/operations/support',
    icon: 'LifeBuoy',
    description: 'Customer support and service tickets',
  },
  data: {
    endpoint: '/api/support-tickets',
    primaryKey: 'id',
    fields: {
      ticket_number: {
        type: 'text',
        label: 'Ticket #',
        required: true,
        inTable: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      subject: {
        type: 'text',
        label: 'Subject',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      description: {
        type: 'richtext',
        label: 'Description',
        required: true,
        inForm: true,
        inDetail: true,
      },
      contact_id: {
        type: 'relation',
        label: 'Contact',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      company_id: {
        type: 'relation',
        label: 'Company',
        inTable: true,
        inForm: true,
        relation: { entity: 'company', display: 'name' },
      },
      category_id: {
        type: 'relation',
        label: 'Category',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'ticket_category', display: 'name' },
      },
      priority: {
        type: 'select',
        label: 'Priority',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
          { label: 'Urgent', value: 'urgent' },
        ],
        default: 'medium',
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'New', value: 'new' },
          { label: 'Open', value: 'open' },
          { label: 'Pending', value: 'pending' },
          { label: 'On Hold', value: 'on_hold' },
          { label: 'Resolved', value: 'resolved' },
          { label: 'Closed', value: 'closed' },
        ],
        default: 'new',
      },
      assigned_to_user_id: {
        type: 'relation',
        label: 'Assigned To',
        inTable: true,
        inForm: true,
        relation: { entity: 'profile', display: 'full_name' },
      },
      assigned_team_id: {
        type: 'relation',
        label: 'Team',
        inForm: true,
        relation: { entity: 'team', display: 'name' },
      },
      source: {
        type: 'select',
        label: 'Source',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'phone' },
          { label: 'Web Form', value: 'web' },
          { label: 'Chat', value: 'chat' },
          { label: 'Social Media', value: 'social' },
          { label: 'Internal', value: 'internal' },
        ],
      },
      event_id: {
        type: 'relation',
        label: 'Related Event',
        inForm: true,
        relation: { entity: 'event', display: 'name' },
      },
      registration_id: {
        type: 'relation',
        label: 'Related Registration',
        inForm: true,
        relation: { entity: 'registration', display: 'confirmation_number' },
      },
      first_response_at: {
        type: 'datetime',
        label: 'First Response',
        inDetail: true,
      },
      resolved_at: {
        type: 'datetime',
        label: 'Resolved At',
        inDetail: true,
      },
      closed_at: {
        type: 'datetime',
        label: 'Closed At',
        inDetail: true,
      },
      satisfaction_rating: {
        type: 'rating',
        label: 'Satisfaction',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.subject || 'Untitled Ticket'),
    subtitle: (r: Record<string, unknown>) => String(r.ticket_number || ''),
    badge: (r: Record<string, unknown>) => {
      const priority = String(r.priority || 'medium');
      const variants: Record<string, string> = {
        low: 'secondary',
        medium: 'default',
        high: 'warning',
        urgent: 'destructive',
      };
      return { label: priority.charAt(0).toUpperCase() + priority.slice(1), variant: variants[priority] || 'secondary' };
    },
    defaultSort: { field: 'created_at', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['ticket_number', 'subject'],
    placeholder: 'Search tickets...',
  },
  filters: {
    quick: [
      { key: 'open', label: 'Open', query: { where: { status: { in: ['new', 'open', 'pending'] } } } },
      { key: 'urgent', label: 'Urgent', query: { where: { priority: 'urgent' } } },
      { key: 'unassigned', label: 'Unassigned', query: { where: { assigned_to_user_id: null } } },
    ],
    advanced: ['category_id', 'priority', 'status', 'assigned_to_user_id'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'new', label: 'New', query: { where: { status: 'new' } }, count: true },
        { key: 'open', label: 'Open', query: { where: { status: 'open' } }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true },
        { key: 'resolved', label: 'Resolved', query: { where: { status: 'resolved' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'comments', label: 'Comments', content: { type: 'comments' } },
        { key: 'files', label: 'Files', content: { type: 'files' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'details', title: 'Ticket Details', content: { type: 'fields', fields: ['category_id', 'priority', 'status', 'source'] } },
          { key: 'assignment', title: 'Assignment', content: { type: 'fields', fields: ['assigned_to_user_id', 'assigned_team_id'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Ticket Info', fields: ['subject', 'description', 'category_id', 'priority'] },
        { key: 'contact', title: 'Contact', fields: ['contact_id', 'company_id', 'source'] },
        { key: 'assignment', title: 'Assignment', fields: ['assigned_to_user_id', 'assigned_team_id', 'status'] },
        { key: 'related', title: 'Related', fields: ['event_id', 'registration_id'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['ticket_number', 'subject', 'contact_id', 'priority', 'status', 'assigned_to_user_id'],
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'new', label: 'New', color: '#3b82f6' },
        { value: 'open', label: 'Open', color: '#22c55e' },
        { value: 'pending', label: 'Pending', color: '#f59e0b' },
        { value: 'on_hold', label: 'On Hold', color: '#6b7280' },
        { value: 'resolved', label: 'Resolved', color: '#8b5cf6' },
      ],
      card: {
        title: 'subject',
        subtitle: (r: Record<string, unknown>) => String(r.ticket_number || ''),
        fields: ['priority', 'assigned_to_user_id'],
      },
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/support/${r.id}` } },
      { key: 'assign', label: 'Assign', handler: { type: 'modal', component: 'AssignTicketModal' } },
      { key: 'resolve', label: 'Resolve', variant: 'primary', handler: { type: 'api', endpoint: '/api/support-tickets/resolve', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status !== 'resolved' && r.status !== 'closed' },
      { key: 'close', label: 'Close', handler: { type: 'api', endpoint: '/api/support-tickets/close', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'resolved' },
    ],
    bulk: [
      { key: 'bulk_assign', label: 'Assign Selected', handler: { type: 'modal', component: 'BulkAssignModal' } },
    ],
    global: [
      { key: 'create', label: 'New Ticket', variant: 'primary', handler: { type: 'navigate', path: '/operations/support/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: false },
});
