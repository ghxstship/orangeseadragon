import { defineSchema } from '../schema/defineSchema';

/**
 * DEAL ENTITY SCHEMA (SSOT)
 *
 * Full-featured CRM deal management with:
 * - Hold management (first hold, second hold, confirmed, released)
 * - Production type tagging
 * - Deal-to-project one-click conversion
 * - Estimated budget/margin forecasting
 * - Win/loss tracking with reasons
 * - Referral source tracking
 * - Venue hold integration
 */
export const dealSchema = defineSchema({
  identity: {
    name: 'deal',
    namePlural: 'Deals',
    slug: 'modules/business/deals',
    icon: 'Handshake',
    description: 'Sales deals and opportunities with hold management',
  },

  data: {
    endpoint: '/api/deals',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Deal Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      contact_id: {
        type: 'relation',
        label: 'Contact',
        inTable: true,
        inForm: true,
      },
      company_id: {
        type: 'relation',
        label: 'Company',
        required: true,
        inTable: true,
        inForm: true,
      },
      pipeline_id: {
        type: 'relation',
        label: 'Pipeline',
        inForm: true,
        relation: { entity: 'pipeline', display: 'name' },
      },
      value: {
        type: 'currency',
        label: 'Deal Value',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      stage: {
        type: 'select',
        label: 'Stage',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Prospecting', value: 'prospecting', color: 'gray' },
          { label: 'Qualification', value: 'qualification', color: 'blue' },
          { label: 'Proposal', value: 'proposal', color: 'yellow' },
          { label: 'Negotiation', value: 'negotiation', color: 'orange' },
          { label: 'Closed Won', value: 'closed_won', color: 'green' },
          { label: 'Closed Lost', value: 'closed_lost', color: 'red' },
        ],
        default: 'prospecting',
      },
      probability: {
        type: 'number',
        label: 'Probability %',
        inTable: true,
        inForm: true,
      },
      close_date: {
        type: 'date',
        label: 'Expected Close',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      // Production type
      production_type: {
        type: 'select',
        label: 'Production Type',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Concert / Festival', value: 'concert_festival' },
          { label: 'Corporate Event', value: 'corporate_event' },
          { label: 'Conference', value: 'conference' },
          { label: 'Trade Show', value: 'trade_show' },
          { label: 'Broadcast / Film', value: 'broadcast_film' },
          { label: 'Theater', value: 'theater' },
          { label: 'Tour', value: 'tour' },
          { label: 'Installation', value: 'installation' },
          { label: 'Private Event', value: 'private_event' },
        ],
      },
      // Hold management
      hold_status: {
        type: 'select',
        label: 'Hold Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'No Hold', value: 'no_hold', color: 'gray' },
          { label: '1st Hold', value: 'first_hold', color: 'blue' },
          { label: '2nd Hold', value: 'second_hold', color: 'yellow' },
          { label: 'Confirmed', value: 'confirmed', color: 'green' },
          { label: 'Released', value: 'released', color: 'slate' },
          { label: 'Challenged', value: 'challenged', color: 'red' },
        ],
        default: 'no_hold',
      },
      hold_date: {
        type: 'datetime',
        label: 'Hold Date',
        inForm: true,
        inDetail: true,
      },
      hold_expires_at: {
        type: 'datetime',
        label: 'Hold Expires',
        inForm: true,
        inDetail: true,
      },
      hold_notes: {
        type: 'textarea',
        label: 'Hold Notes',
        inForm: true,
        inDetail: true,
      },
      // Budget forecasting
      estimated_budget: {
        type: 'currency',
        label: 'Estimated Budget',
        inForm: true,
        inDetail: true,
      },
      estimated_costs: {
        type: 'currency',
        label: 'Estimated Costs',
        inForm: true,
        inDetail: true,
      },
      estimated_margin_percent: {
        type: 'percentage',
        label: 'Estimated Margin',
        inForm: true,
        inDetail: true,
      },
      // Referral
      referral_source: {
        type: 'text',
        label: 'Referral Source',
        inForm: true,
        inDetail: true,
      },
      referral_contact_id: {
        type: 'relation',
        label: 'Referred By',
        inForm: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      // Win/Loss
      loss_reason: {
        type: 'select',
        label: 'Loss Reason',
        inDetail: true,
        inForm: true,
        options: [
          { label: 'Price', value: 'price' },
          { label: 'Timing', value: 'timing' },
          { label: 'Competition', value: 'competition' },
          { label: 'Scope', value: 'scope' },
          { label: 'Relationship', value: 'relationship' },
          { label: 'Budget Cut', value: 'budget_cut' },
          { label: 'No Decision', value: 'no_decision' },
          { label: 'Other', value: 'other' },
        ],
      },
      loss_notes: {
        type: 'textarea',
        label: 'Loss Notes',
        inForm: true,
        inDetail: true,
      },
      competitor_name: {
        type: 'text',
        label: 'Competitor',
        inForm: true,
        inDetail: true,
      },
      // Conversion tracking
      converted_project_id: {
        type: 'relation',
        label: 'Converted Project',
        inDetail: true,
        relation: { entity: 'project', display: 'name' },
      },
      converted_at: {
        type: 'datetime',
        label: 'Converted At',
        inDetail: true,
      },
      last_activity_at: {
        type: 'datetime',
        label: 'Last Activity',
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
    },
    computed: {
      weighted_value: {
        label: 'Weighted Value',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const value = Number(r.value) || 0;
            const prob = Number(r.probability) || 0;
            return Math.round(value * (prob / 100));
          },
        },
        format: 'currency',
        inTable: true,
        inDetail: true,
      },
      estimated_profit: {
        label: 'Est. Profit',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const budget = Number(r.estimated_budget) || Number(r.value) || 0;
            const costs = Number(r.estimated_costs) || 0;
            return budget - costs;
          },
        },
        format: 'currency',
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled'),
    subtitle: (r: Record<string, unknown>) => `$${Number(r.value || 0).toLocaleString()}`,
    badge: (r: Record<string, unknown>) => {
      const stageMap: Record<string, { label: string; variant: string }> = {
        prospecting: { label: 'Prospecting', variant: 'secondary' },
        qualification: { label: 'Qualification', variant: 'primary' },
        proposal: { label: 'Proposal', variant: 'warning' },
        negotiation: { label: 'Negotiation', variant: 'warning' },
        closed_won: { label: 'Won', variant: 'success' },
        closed_lost: { label: 'Lost', variant: 'destructive' },
      };
      return stageMap[String(r.stage)] || { label: String(r.stage), variant: 'secondary' };
    },
    defaultSort: { field: 'close_date', direction: 'asc' },
  },

  search: { enabled: true, fields: ['name'], placeholder: 'Search deals...' },

  filters: {
    quick: [
      { key: 'open', label: 'Open', query: { where: {} } },
      { key: 'with-hold', label: 'With Hold', query: { where: {} } },
    ],
    advanced: ['stage', 'company_id', 'production_type', 'hold_status', 'pipeline_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'prospecting', label: 'Prospecting', query: { where: { stage: 'prospecting' } }, count: true },
        { key: 'proposal', label: 'Proposal', query: { where: { stage: 'proposal' } }, count: true },
        { key: 'negotiation', label: 'Negotiation', query: { where: { stage: 'negotiation' } }, count: true },
        { key: 'won', label: 'Won', query: { where: { stage: 'closed_won' } } },
        { key: 'lost', label: 'Lost', query: { where: { stage: 'closed_lost' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'holds', label: 'Venue Holds', content: { type: 'related', entity: 'venue_holds', foreignKey: 'deal_id', allowCreate: true } },
        { key: 'proposals', label: 'Proposals', content: { type: 'related', entity: 'proposals', foreignKey: 'deal_id', allowCreate: true } },
        { key: 'contacts', label: 'Contacts', content: { type: 'related', entity: 'contact', foreignKey: 'company_id' } },
        { key: 'files', label: 'Files', content: { type: 'files' } },
        { key: 'comments', label: 'Comments', content: { type: 'comments' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'value', label: 'Value', value: { type: 'field', field: 'value' }, format: 'currency' },
          { key: 'prob', label: 'Probability', value: { type: 'field', field: 'probability' }, format: 'percentage' },
          { key: 'weighted', label: 'Weighted', value: { type: 'computed', compute: (r: Record<string, unknown>) => Math.round((Number(r.value) || 0) * ((Number(r.probability) || 0) / 100)) }, format: 'currency' },
        ],
        blocks: [
          { key: 'hold', title: 'Hold Status', content: { type: 'fields', fields: ['hold_status', 'hold_date', 'hold_expires_at', 'hold_notes'] } },
          { key: 'forecast', title: 'Budget Forecast', content: { type: 'fields', fields: ['estimated_budget', 'estimated_costs', 'estimated_margin_percent'] } },
          { key: 'referral', title: 'Referral', content: { type: 'fields', fields: ['referral_source', 'referral_contact_id'] } },
        ],
      },
      sidebar: {
        width: 300,
        collapsible: true,
        defaultState: 'open',
        sections: [
          { key: 'properties', title: 'Properties', content: { type: 'stats', stats: ['stage', 'hold_status', 'production_type', 'close_date', 'probability'] } },
          { key: 'financial', title: 'Financial', content: { type: 'stats', stats: ['value', 'estimated_budget', 'estimated_costs'] } },
          { key: 'recent_activity', title: 'Recent Activity', content: { type: 'activity', limit: 5 }, collapsible: true },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Deal Details', fields: ['name', 'company_id', 'contact_id', 'pipeline_id', 'value', 'stage', 'probability', 'close_date', 'production_type'] },
        { key: 'hold', title: 'Hold Management', fields: ['hold_status', 'hold_date', 'hold_expires_at', 'hold_notes'] },
        { key: 'forecast', title: 'Budget Forecast', fields: ['estimated_budget', 'estimated_costs', 'estimated_margin_percent'] },
        { key: 'referral', title: 'Referral', fields: ['referral_source', 'referral_contact_id'] },
        { key: 'loss', title: 'Win/Loss', fields: ['loss_reason', 'loss_notes', 'competitor_name'], condition: (data: Record<string, unknown>) => data.stage === 'closed_lost' },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'name',
        { field: 'company_id', format: { type: 'relation', entityType: 'company' } },
        { field: 'value', format: { type: 'currency' } },
        { field: 'weighted_value', format: { type: 'currency' } },
        { field: 'stage', format: { type: 'badge', colorMap: { prospecting: '#6b7280', qualification: '#3b82f6', proposal: '#eab308', negotiation: '#f59e0b', closed_won: '#22c55e', closed_lost: '#ef4444' } } },
        { field: 'hold_status', format: { type: 'badge', colorMap: { none: '#6b7280', first_hold: '#3b82f6', second_hold: '#eab308', confirmed: '#22c55e', released: '#ef4444' } } },
        'production_type',
        { field: 'probability', format: { type: 'percentage' } },
        { field: 'close_date', format: { type: 'date' } },
      ],
    },
    kanban: {
      columnField: 'stage',
      columns: [
        { value: 'prospecting', label: 'Prospecting', color: 'gray' },
        { value: 'qualification', label: 'Qualification', color: 'blue' },
        { value: 'proposal', label: 'Proposal', color: 'yellow' },
        { value: 'negotiation', label: 'Negotiation', color: 'orange' },
        { value: 'closed_won', label: 'Won', color: 'green' },
        { value: 'closed_lost', label: 'Lost', color: 'red' },
      ],
      card: {
        title: 'name',
        subtitle: 'company_id',
        fields: ['value', 'close_date', 'hold_status'],
      },
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/business/deals/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/business/deals/${r.id}/edit` } },
      { key: 'convert', label: 'Convert to Project', variant: 'primary', handler: { type: 'api', endpoint: '/api/deals/convert', method: 'POST' }, condition: (r: Record<string, unknown>) => r.stage === 'closed_won' && !r.converted_project_id },
      { key: 'place-hold', label: 'Place Hold', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => r.hold_status === 'no_hold' || !r.hold_status },
      { key: 'release-hold', label: 'Release Hold', variant: 'destructive', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => r.hold_status === 'first_hold' || r.hold_status === 'second_hold' },
      { key: 'confirm-hold', label: 'Confirm', variant: 'primary', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => r.hold_status === 'first_hold' },
      { key: 'mark-won', label: 'Mark Won', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => r.stage !== 'closed_won' && r.stage !== 'closed_lost' },
      { key: 'mark-lost', label: 'Mark Lost', variant: 'destructive', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => r.stage !== 'closed_won' && r.stage !== 'closed_lost' },
    ],
    bulk: [
      { key: 'export', label: 'Export', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'create', label: 'New Deal', variant: 'primary', handler: { type: 'navigate', path: () => '/business/deals/new' } },
    ],
  },

  relationships: {
    belongsTo: [
      { entity: 'company', foreignKey: 'company_id', label: 'Company' },
      { entity: 'contact', foreignKey: 'contact_id', label: 'Contact' },
      { entity: 'pipeline', foreignKey: 'pipeline_id', label: 'Pipeline' },
      { entity: 'contact', foreignKey: 'referral_contact_id', label: 'Referred By' },
      { entity: 'project', foreignKey: 'converted_project_id', label: 'Converted Project' },
    ],
    hasMany: [
      { entity: 'venueHold', foreignKey: 'deal_id', label: 'Venue Holds', cascade: 'delete' },
      { entity: 'proposal', foreignKey: 'deal_id', label: 'Proposals', cascade: 'delete' },
      { entity: 'activity', foreignKey: 'deal_id', label: 'Activities', cascade: 'delete' },
      { entity: 'rfpResponse', foreignKey: 'deal_id', label: 'RFP Responses', cascade: 'nullify' },
    ],
  },

  stateMachine: {
    field: 'stage',
    initial: 'prospecting',
    terminal: ['closed_won', 'closed_lost'],
    transitions: [
      { from: 'prospecting', to: 'qualification', label: 'Qualify' },
      { from: 'qualification', to: 'proposal', label: 'Send Proposal' },
      { from: 'qualification', to: 'prospecting', label: 'Back to Prospecting' },
      { from: 'proposal', to: 'negotiation', label: 'Negotiate' },
      { from: 'proposal', to: 'qualification', label: 'Back to Qualification' },
      { from: 'negotiation', to: 'closed_won', label: 'Mark Won' },
      { from: 'negotiation', to: 'closed_lost', label: 'Mark Lost' },
      { from: 'negotiation', to: 'proposal', label: 'Revise Proposal' },
      { from: 'prospecting', to: 'closed_lost', label: 'Mark Lost' },
      { from: 'qualification', to: 'closed_lost', label: 'Mark Lost' },
      { from: 'proposal', to: 'closed_lost', label: 'Mark Lost' },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
