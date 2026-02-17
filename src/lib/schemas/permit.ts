/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineSchema } from '../schema/defineSchema';

export const permitSchema = defineSchema({
  identity: {
    name: 'permit',
    namePlural: 'Permits',
    slug: 'modules/production/permits',
    icon: 'ClipboardCheck',
    description: 'Building, fire, and event permits',
  },

  data: {
    endpoint: '/api/permits',
    primaryKey: 'id',
    fields: {
      permit_number: {
        type: 'text',
        label: 'Permit #',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        searchable: true,
      },
      permit_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Building', value: 'building' },
          { label: 'Fire', value: 'fire' },
          { label: 'Electrical', value: 'electrical' },
          { label: 'Noise', value: 'noise' },
          { label: 'Street Closure', value: 'street_closure' },
          { label: 'Alcohol', value: 'alcohol' },
          { label: 'Food', value: 'food' },
          { label: 'Pyrotechnics', value: 'pyrotechnics' },
          { label: 'Temporary Structure', value: 'temporary_structure' },
          { label: 'Other', value: 'other' },
        ],
      },
      production_id: {
        type: 'select',
        label: 'Production',
        inTable: true,
        inForm: true,
        options: [],
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        inForm: true,
      },
      venue_id: {
        type: 'relation',
        label: 'Venue',
        inForm: true,
        relation: { entity: 'venue', display: 'name', searchable: true },
      },
      issuing_authority: {
        type: 'text',
        label: 'Issuing Authority',
        inTable: true,
        inForm: true,
      },
      jurisdiction: {
        type: 'text',
        label: 'Jurisdiction',
        inForm: true,
        inDetail: true,
      },
      application_date: {
        type: 'date',
        label: 'Application Date',
        inForm: true,
        inDetail: true,
      },
      approval_date: {
        type: 'date',
        label: 'Approval Date',
        inForm: true,
        inDetail: true,
      },
      effective_date: {
        type: 'date',
        label: 'Effective Date',
        inForm: true,
        inDetail: true,
      },
      expiration_date: {
        type: 'date',
        label: 'Expiration Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      fee_amount: {
        type: 'currency',
        label: 'Fee Amount',
        inForm: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Not Required', value: 'not_required', color: 'gray' },
          { label: 'Pending', value: 'pending', color: 'yellow' },
          { label: 'Submitted', value: 'submitted', color: 'blue' },
          { label: 'Under Review', value: 'under_review', color: 'purple' },
          { label: 'Approved', value: 'approved', color: 'green' },
          { label: 'Denied', value: 'denied', color: 'red' },
          { label: 'Expired', value: 'expired', color: 'orange' },
          { label: 'Revoked', value: 'revoked', color: 'red' },
        ],
        default: 'pending',
      },
      application_url: {
        type: 'url',
        label: 'Application URL',
        inForm: true,
        inDetail: true,
      },
      permit_url: {
        type: 'url',
        label: 'Permit Document',
        inForm: true,
        inDetail: true,
      },
      requirements: {
        type: 'textarea',
        label: 'Requirements',
        inForm: true,
        inDetail: true,
      },
      conditions: {
        type: 'textarea',
        label: 'Conditions',
        inForm: true,
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (record: any) => record.name || record.permit_number,
    subtitle: (record: any) => record.permit_type || '',
    badge: (record: any) => {
      const statusColors: Record<string, string> = {
        not_required: 'secondary', pending: 'warning', submitted: 'primary',
        under_review: 'primary', approved: 'success', denied: 'destructive',
        expired: 'warning', revoked: 'destructive',
      };
      return { label: record.status || 'Unknown', variant: statusColors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'expiration_date', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['permit_number', 'name', 'issuing_authority'],
    placeholder: 'Search permits...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'approved' } } },
      { key: 'expiring', label: 'Expiring Soon', query: { where: { expiration_date: { lte: '{{now + 30d}}' }, status: 'approved' } } },
    ],
    advanced: ['status', 'permit_type', 'production_id', 'venue_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: { $in: ['pending', 'submitted', 'under_review'] } } }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'approved' } }, count: true },
        { key: 'expiring', label: 'Expiring', query: { where: { status: 'approved', expiration_date: { $lte: '{{now + 30d}}' } } }, count: true },
        { key: 'expired', label: 'Expired', query: { where: { status: { $in: ['expired', 'revoked'] } } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'list', 'calendar', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'documents', label: 'Documents', content: { type: 'related', entity: 'documents', foreignKey: 'permit_id' } },
      ],
      overview: {
        stats: [
          { key: 'fee', label: 'Fee Amount', value: { type: 'field', field: 'fee_amount' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Permit Details', content: { type: 'fields', fields: ['requirements', 'conditions'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['permit_number', 'name', 'permit_type', 'status'] },
        { key: 'relationships', title: 'Relationships', fields: ['production_id', 'event_id', 'venue_id'] },
        { key: 'authority', title: 'Authority', fields: ['issuing_authority', 'jurisdiction', 'fee_amount'] },
        { key: 'dates', title: 'Dates', fields: ['application_date', 'approval_date', 'effective_date', 'expiration_date'] },
        { key: 'documents', title: 'Documents', fields: ['application_url', 'permit_url'] },
        { key: 'details', title: 'Details', fields: ['requirements', 'conditions', 'notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['permit_number', 'name', 'permit_type', 'production_id', 'status', 'expiration_date', 'issuing_authority'],
    },
    list: {
      titleField: 'name',
      subtitleField: 'permit_type',
      metaFields: ['expiration_date', 'issuing_authority'],
      showChevron: true,
    },
    calendar: {
      titleField: 'name',
      startField: 'expiration_date',
      colorField: 'status',
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'pending', label: 'Pending', color: 'yellow' },
        { value: 'submitted', label: 'Submitted', color: 'blue' },
        { value: 'under_review', label: 'Under Review', color: 'purple' },
        { value: 'approved', label: 'Approved', color: 'green' },
        { value: 'denied', label: 'Denied', color: 'red' },
        { value: 'expired', label: 'Expired', color: 'orange' },
      ],
      card: {
        title: 'name',
        subtitle: 'permit_type',
        fields: ['expiration_date', 'issuing_authority'],
      },
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: any) => `/productions/compliance/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Permit', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
      { entity: 'venue', foreignKey: 'venue_id', label: 'Venue' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
