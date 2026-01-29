import { defineSchema } from '../schema/defineSchema';

export const campaignSchema = defineSchema({
  identity: {
    name: 'campaign',
    namePlural: 'Campaigns',
    slug: 'modules/business/campaigns',
    icon: 'Send',
    description: 'Email marketing campaigns',
  },
  data: {
    endpoint: '/api/campaigns',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Campaign Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      campaign_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Email Blast', value: 'email_blast' },
          { label: 'Drip Sequence', value: 'drip' },
          { label: 'Newsletter', value: 'newsletter' },
          { label: 'Transactional', value: 'transactional' },
          { label: 'Event Promotion', value: 'event_promo' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Scheduled', value: 'scheduled' },
          { label: 'Sending', value: 'sending' },
          { label: 'Sent', value: 'sent' },
          { label: 'Paused', value: 'paused' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
        default: 'draft',
      },
      subject_line: {
        type: 'text',
        label: 'Subject Line',
        required: true,
        inForm: true,
        inDetail: true,
      },
      preview_text: {
        type: 'text',
        label: 'Preview Text',
        inForm: true,
        inDetail: true,
      },
      from_name: {
        type: 'text',
        label: 'From Name',
        required: true,
        inForm: true,
        inDetail: true,
      },
      from_email: {
        type: 'email',
        label: 'From Email',
        required: true,
        inForm: true,
        inDetail: true,
      },
      reply_to_email: {
        type: 'email',
        label: 'Reply-To Email',
        inForm: true,
        inDetail: true,
      },
      template_id: {
        type: 'relation',
        label: 'Email Template',
        inForm: true,
        inDetail: true,
        relation: { entity: 'email_template', display: 'name' },
      },
      audience_filter: {
        type: 'json',
        label: 'Audience Filter',
        inForm: true,
        inDetail: true,
        helpText: 'JSON filter for target audience',
      },
      scheduled_at: {
        type: 'datetime',
        label: 'Scheduled Send',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      sent_at: {
        type: 'datetime',
        label: 'Sent At',
        inTable: true,
        inDetail: true,
      },
      event_id: {
        type: 'relation',
        label: 'Related Event',
        inForm: true,
        inDetail: true,
        relation: { entity: 'event', display: 'name' },
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Campaign'),
    subtitle: (r: Record<string, unknown>) => String(r.subject_line || ''),
    badge: (r: Record<string, unknown>) => {
      const status = String(r.status || 'draft');
      const variants: Record<string, string> = {
        draft: 'secondary',
        scheduled: 'warning',
        sending: 'primary',
        sent: 'default',
        paused: 'warning',
        cancelled: 'destructive',
      };
      return { label: status.charAt(0).toUpperCase() + status.slice(1), variant: variants[status] || 'secondary' };
    },
    defaultSort: { field: 'created_at', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['name', 'subject_line'],
    placeholder: 'Search campaigns...',
  },
  filters: {
    quick: [
      { key: 'draft', label: 'Drafts', query: { where: { status: 'draft' } } },
      { key: 'scheduled', label: 'Scheduled', query: { where: { status: 'scheduled' } } },
      { key: 'sent', label: 'Sent', query: { where: { status: 'sent' } } },
    ],
    advanced: ['campaign_type', 'status', 'event_id'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'draft', label: 'Drafts', query: { where: { status: 'draft' } }, count: true },
        { key: 'scheduled', label: 'Scheduled', query: { where: { status: 'scheduled' } }, count: true },
        { key: 'sent', label: 'Sent', query: { where: { status: 'sent' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'analytics', label: 'Analytics', content: { type: 'related', entity: 'campaign_analytics', foreignKey: 'campaign_id' } },
        { key: 'recipients', label: 'Recipients', content: { type: 'related', entity: 'campaign_recipient', foreignKey: 'campaign_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'sent', label: 'Sent', value: { type: 'relation-count', entity: 'campaign_recipient', foreignKey: 'campaign_id' }, format: 'number' },
          { key: 'opened', label: 'Opened', value: { type: 'relation-count', entity: 'campaign_recipient', foreignKey: 'campaign_id', filter: { opened_at: { not: null } } }, format: 'number' },
          { key: 'clicked', label: 'Clicked', value: { type: 'relation-count', entity: 'campaign_recipient', foreignKey: 'campaign_id', filter: { clicked_at: { not: null } } }, format: 'number' },
        ],
        blocks: [
          { key: 'content', title: 'Email Content', content: { type: 'fields', fields: ['subject_line', 'preview_text', 'from_name', 'from_email'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Campaign Info', fields: ['name', 'campaign_type', 'status', 'event_id'] },
        { key: 'content', title: 'Email Content', fields: ['subject_line', 'preview_text', 'template_id'] },
        { key: 'sender', title: 'Sender Info', fields: ['from_name', 'from_email', 'reply_to_email'] },
        { key: 'audience', title: 'Audience', fields: ['audience_filter'] },
        { key: 'schedule', title: 'Schedule', fields: ['scheduled_at'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'campaign_type', 'status', 'scheduled_at', 'sent_at'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/business/campaigns/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/business/campaigns/${r.id}/edit` }, condition: (r: Record<string, unknown>) => r.status === 'draft' },
      { key: 'send', label: 'Send Now', variant: 'primary', handler: { type: 'api', endpoint: '/api/campaigns/send', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'draft' || r.status === 'scheduled' },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'api', endpoint: '/api/campaigns/duplicate', method: 'POST' } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Campaign', variant: 'primary', handler: { type: 'navigate', path: '/modules/business/campaigns/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
