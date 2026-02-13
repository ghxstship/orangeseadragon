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
      },
      company_id: {
        type: 'relation',
        label: 'Company',
        inTable: true,
        inForm: true,
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
      columns: [
        'ticket_number',
        'subject',
        { field: 'contact_id', format: { type: 'relation', entityType: 'contact' } },
        { field: 'priority', format: { type: 'badge', colorMap: { urgent: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6', critical: '#ef4444', none: '#6b7280' } } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
        { field: 'assigned_to_user_id', format: { type: 'relation', entityType: 'person' } },
      ],
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'new', label: 'New', color: 'hsl(var(--primary))' },
        { value: 'open', label: 'Open', color: 'hsl(var(--chart-income))' },
        { value: 'pending', label: 'Pending', color: 'hsl(var(--chart-4))' },
        { value: 'on_hold', label: 'On Hold', color: 'hsl(var(--muted-foreground))' },
        { value: 'resolved', label: 'Resolved', color: 'hsl(var(--chart-5))' },
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
  relationships: {
    belongsTo: [
      { entity: 'contact', foreignKey: 'contact_id', label: 'Contact' },
      { entity: 'company', foreignKey: 'company_id', label: 'Company' },
      { entity: 'category', foreignKey: 'category_id', label: 'Category' },
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
      { entity: 'registration', foreignKey: 'registration_id', label: 'Registration' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: false },
});
