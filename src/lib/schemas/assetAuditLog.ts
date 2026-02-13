import { defineSchema } from '../schema/defineSchema';

/**
 * ASSET AUDIT LOG SCHEMA (SSOT)
 * Immutable audit trail for all asset-related actions
 */
export const assetAuditLogSchema = defineSchema({
  identity: {
    name: 'AssetAuditLog',
    namePlural: 'Asset Audit Logs',
    slug: 'modules/assets/audit',
    icon: 'History',
    description: 'Immutable audit trail for asset actions',
  },

  data: {
    endpoint: '/api/asset_audit_logs',
    primaryKey: 'id',
    fields: {
      asset_id: {
        type: 'relation',
        label: 'Asset',
        required: true,
        inTable: true,
        inDetail: true,
      },
      action: {
        type: 'select',
        label: 'Action',
        required: true,
        inTable: true,
        inDetail: true,
        options: [
          { label: 'Created', value: 'created', color: 'green' },
          { label: 'Updated', value: 'updated', color: 'blue' },
          { label: 'Checked Out', value: 'checked_out', color: 'orange' },
          { label: 'Checked In', value: 'checked_in', color: 'cyan' },
          { label: 'Reserved', value: 'reserved', color: 'purple' },
          { label: 'Transferred', value: 'transferred', color: 'indigo' },
          { label: 'Maintenance Started', value: 'maintenance_started', color: 'yellow' },
          { label: 'Maintenance Completed', value: 'maintenance_completed', color: 'teal' },
          { label: 'Retired', value: 'retired', color: 'gray' },
          { label: 'Disposed', value: 'disposed', color: 'red' },
        ],
      },
      performed_by: {
        type: 'relation',
        label: 'Performed By',
        inTable: true,
        inDetail: true,
      },
      performed_at: {
        type: 'datetime',
        label: 'Timestamp',
        required: true,
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      previous_values: {
        type: 'json',
        label: 'Previous Values',
        inDetail: true,
      },
      new_values: {
        type: 'json',
        label: 'New Values',
        inDetail: true,
      },
      related_entity_type: {
        type: 'text',
        label: 'Related Entity Type',
        inDetail: true,
      },
      related_entity_id: {
        type: 'text',
        label: 'Related Entity ID',
        inDetail: true,
      },
      ip_address: {
        type: 'text',
        label: 'IP Address',
        inDetail: true,
      },
      user_agent: {
        type: 'text',
        label: 'User Agent',
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inTable: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (record) => `${record.action || 'Action'} - ${record.asset_id || 'Asset'}`,
    subtitle: (record) => record.performed_at ? new Date(record.performed_at as string).toLocaleString() : '',
    badge: (record) => {
      const actionColors: Record<string, string> = {
        created: 'success',
        updated: 'primary',
        checked_out: 'warning',
        checked_in: 'success',
        reserved: 'primary',
        transferred: 'primary',
        maintenance_started: 'warning',
        maintenance_completed: 'success',
        retired: 'secondary',
        disposed: 'destructive',
      };
      return { label: String(record.action || 'Unknown'), variant: actionColors[record.action as string] || 'secondary' };
    },
    defaultSort: { field: 'performed_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['notes'],
    placeholder: 'Search audit logs...',
  },

  filters: {
    quick: [
      { key: 'today', label: 'Today', query: { where: { performed_at: { gte: 'today' } } } },
      { key: 'check-actions', label: 'Check In/Out', query: { where: { action: { in: ['checked_in', 'checked_out'] } } } },
    ],
    advanced: ['action', 'performed_by', 'asset_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Logs', query: { where: {} }, count: true },
        { key: 'today', label: 'Today', query: { where: { performed_at: { gte: 'today' } } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'changes', title: 'Changes', content: { type: 'fields', fields: ['previous_values', 'new_values'] } },
          { key: 'metadata', title: 'Metadata', content: { type: 'fields', fields: ['ip_address', 'user_agent'] } },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Audit Entry',
          fields: ['asset_id', 'action', 'performed_by', 'performed_at', 'notes'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: [
        { field: 'asset_id', format: { type: 'relation', entityType: 'asset' } },
        'action',
        { field: 'performed_by', format: { type: 'relation', entityType: 'person' } },
        { field: 'performed_at', format: { type: 'datetime' } },
        'notes',
      ],
    },
    list: {
      titleField: 'action',
      subtitleField: 'asset_id',
      metaFields: ['performed_at', 'performed_by'],
      showChevron: true,
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/assets/audit/${record.id}` } },
    ],
    bulk: [],
    global: [],
  },
  relationships: {
    belongsTo: [
      { entity: 'asset', foreignKey: 'asset_id', label: 'Asset' },
    ],
  },



  permissions: {
    create: false,
    read: true,
    update: false,
    delete: false,
  },
});
