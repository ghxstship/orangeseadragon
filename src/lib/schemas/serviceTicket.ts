import { defineSchema } from '../schema/defineSchema';

export const serviceTicketSchema = defineSchema({
  identity: {
    name: 'service_ticket',
    namePlural: 'Service Tickets',
    slug: 'modules/business/service',
    icon: '🎫',
    description: 'Customer service and support ticket management',
  },
  data: {
    endpoint: '/api/service_tickets',
    primaryKey: 'id',
    fields: {
      ticket_number: {
        type: 'text',
        label: 'Ticket #',
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      contact_id: {
        type: 'relation',
        label: 'Customer',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'contact', display: 'full_name' },
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
        type: 'textarea',
        label: 'Description',
        required: true,
        inForm: true,
        inDetail: true,
      },
      category: {
        type: 'select',
        label: 'Category',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'General Inquiry', value: 'general' },
          { label: 'Technical Support', value: 'technical' },
          { label: 'Billing', value: 'billing' },
          { label: 'Account', value: 'account' },
          { label: 'Feature Request', value: 'feature' },
          { label: 'Bug Report', value: 'bug' },
          { label: 'Complaint', value: 'complaint' },
        ],
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
          { label: 'Open', value: 'open' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Waiting on Customer', value: 'waiting_customer' },
          { label: 'Waiting on Third Party', value: 'waiting_third_party' },
          { label: 'Resolved', value: 'resolved' },
          { label: 'Closed', value: 'closed' },
        ],
        default: 'open',
      },
      assigned_to_id: {
        type: 'relation',
        label: 'Assigned To',
        inTable: true,
        inForm: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      channel: {
        type: 'select',
        label: 'Channel',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'phone' },
          { label: 'Chat', value: 'chat' },
          { label: 'Web Form', value: 'web' },
          { label: 'Social Media', value: 'social' },
        ],
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
      satisfaction_rating: {
        type: 'number',
        label: 'Satisfaction Rating',
        inDetail: true,
      },
      related_order_id: {
        type: 'relation',
        label: 'Related Order',
        inForm: true,
        inDetail: true,
        relation: { entity: 'order', display: 'order_number' },
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => r.ticket_number ? `#${r.ticket_number}` : String(r.subject || 'New Ticket'),
    subtitle: (r: Record<string, unknown>) => String(r.subject || ''),
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        open: 'warning',
        in_progress: 'default',
        waiting_customer: 'secondary',
        waiting_third_party: 'secondary',
        resolved: 'success',
        closed: 'default',
      };
      return { label: String(r.status || 'open'), variant: variants[String(r.status)] || 'secondary' };
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
      { key: 'open', label: 'Open', query: { where: { status: 'open' } } },
      { key: 'urgent', label: 'Urgent', query: { where: { priority: 'urgent' } } },
    ],
    advanced: ['category', 'priority', 'status', 'assigned_to_id', 'channel'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'open', label: 'Open', query: { where: { status: 'open' } }, count: true },
        { key: 'my_tickets', label: 'My Tickets', query: { where: {} }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'conversation', label: 'Conversation', content: { type: 'related', entity: 'ticket_message', foreignKey: 'ticket_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'rating', label: 'Satisfaction', value: { type: 'field', field: 'satisfaction_rating' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Ticket Details', content: { type: 'fields', fields: ['ticket_number', 'contact_id', 'category', 'priority', 'status', 'assigned_to_id'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Ticket Details', fields: ['contact_id', 'subject', 'description'] },
        { key: 'classification', title: 'Classification', fields: ['category', 'priority', 'channel'] },
        { key: 'assignment', title: 'Assignment', fields: ['assigned_to_id', 'status'] },
        { key: 'related', title: 'Related', fields: ['related_order_id'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['ticket_number', 'subject', 'contact_id', 'category', 'priority', 'status', 'assigned_to_id'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/business/service/${r.id}` } },
      { key: 'resolve', label: 'Resolve', variant: 'primary', handler: { type: 'api', endpoint: '/api/service_tickets', method: 'PATCH' }, condition: (r: Record<string, unknown>) => r.status !== 'resolved' && r.status !== 'closed' },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Ticket', variant: 'primary', handler: { type: 'navigate', path: '/modules/business/service/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
