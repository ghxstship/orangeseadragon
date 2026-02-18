import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * EQUIPMENT TRACKING ENTITY SCHEMA (SSOT)
 * 
 * Real-time equipment location and status tracking with
 * barcode/RFID integration for event operations.
 */
export const equipmentTrackingSchema = defineSchema({
  identity: {
    name: 'equipment_tracking',
    namePlural: 'Equipment Tracking',
    slug: 'modules/operations/equipment-tracking',
    icon: 'Radio',
    description: 'Real-time equipment location and status tracking',
  },

  data: {
    endpoint: '/api/equipment-tracking',
    primaryKey: 'id',
    fields: {
      asset_id: {
        type: 'relation',
        label: 'Asset',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      event_id: {
        type: 'relation',
        relation: { entity: 'event', display: 'name', searchable: true },
        label: 'Event',
        required: true,
        inTable: true,
        inForm: true,
      },
      barcode: {
        type: 'text',
        label: 'Barcode',
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      rfid_tag: {
        type: 'text',
        label: 'RFID Tag',
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'In Storage', value: 'in_storage', color: 'gray' },
          { label: 'Checked Out', value: 'checked_out', color: 'blue' },
          { label: 'In Transit', value: 'in_transit', color: 'yellow' },
          { label: 'On Site', value: 'on_site', color: 'green' },
          { label: 'In Use', value: 'in_use', color: 'emerald' },
          { label: 'Returned', value: 'returned', color: 'purple' },
          { label: 'Missing', value: 'missing', color: 'red' },
          { label: 'Damaged', value: 'damaged', color: 'orange' },
        ],
        default: 'in_storage',
      },
      condition: {
        type: 'select',
        label: 'Condition',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Excellent', value: 'excellent', color: 'green' },
          { label: 'Good', value: 'good', color: 'blue' },
          { label: 'Fair', value: 'fair', color: 'yellow' },
          { label: 'Poor', value: 'poor', color: 'orange' },
          { label: 'Damaged', value: 'damaged', color: 'red' },
        ],
        default: 'good',
      },
      current_location: {
        type: 'text',
        label: 'Current Location',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      location_coordinates: {
        type: 'json',
        label: 'GPS Coordinates',
        inDetail: true,
      },
      zone_id: {
        type: 'relation',
        label: 'Zone',
        inTable: true,
        inForm: true,
      },
      assigned_to_id: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name', searchable: true },
        label: 'Assigned To',
        inTable: true,
        inForm: true,
      },
      checked_out_by_id: {
        type: 'relation',
        label: 'Checked Out By',
        inDetail: true,
      },
      checked_out_at: {
        type: 'datetime',
        label: 'Checked Out At',
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      expected_return_at: {
        type: 'datetime',
        label: 'Expected Return',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      returned_at: {
        type: 'datetime',
        label: 'Returned At',
        inDetail: true,
      },
      last_scanned_at: {
        type: 'datetime',
        label: 'Last Scanned',
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      last_scanned_by_id: {
        type: 'relation',
        label: 'Last Scanned By',
        inDetail: true,
      },
      scan_count: {
        type: 'number',
        label: 'Scan Count',
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      damage_report: {
        type: 'textarea',
        label: 'Damage Report',
        inForm: true,
        inDetail: true,
      },
      photos: {
        type: 'file',
        label: 'Photos',
        inForm: true,
        inDetail: true,
      },
    },
    computed: {
      is_overdue: {
        label: 'Overdue',
        computation: {
          type: 'derived',
          compute: (tracking: Record<string, unknown>) => {
            if (!tracking.expected_return_at || tracking.returned_at) return false;
            return new Date(tracking.expected_return_at as string) < new Date();
          },
        },
        inTable: true,
      },
      time_out: {
        label: 'Time Out',
        computation: {
          type: 'derived',
          compute: (tracking: Record<string, unknown>) => {
            if (!tracking.checked_out_at) return null;
            const checkOut = new Date(tracking.checked_out_at as string).getTime();
            const returnTime = tracking.returned_at 
              ? new Date(tracking.returned_at as string).getTime()
              : Date.now();
            return Math.round((returnTime - checkOut) / 3600000 * 10) / 10;
          },
        },
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.asset_id || 'Unknown Asset'),
    subtitle: (r: Record<string, unknown>) => String(r.current_location || 'Unknown location'),
    badge: (r: Record<string, unknown>) => {
      const statusMap: Record<string, { label: string; variant: string }> = {
        in_storage: { label: 'In Storage', variant: 'secondary' },
        checked_out: { label: 'Checked Out', variant: 'primary' },
        in_transit: { label: 'In Transit', variant: 'warning' },
        on_site: { label: 'On Site', variant: 'primary' },
        in_use: { label: 'In Use', variant: 'primary' },
        returned: { label: 'Returned', variant: 'secondary' },
        missing: { label: 'Missing', variant: 'destructive' },
        damaged: { label: 'Damaged', variant: 'warning' },
      };
      return statusMap[r.status as string] || { label: 'Unknown', variant: 'secondary' };
    },
    defaultSort: { field: 'last_scanned_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['barcode', 'rfid_tag', 'current_location', 'notes'],
    placeholder: 'Search by barcode, RFID, or location...',
  },

  filters: {
    quick: [
      { key: 'checked_out', label: 'Checked Out', query: { where: { status: 'checked_out' } } },
      { key: 'on_site', label: 'On Site', query: { where: { status: { in: ['on_site', 'in_use'] } } } },
      { key: 'missing', label: 'Missing', query: { where: { status: 'missing' } } },
      { key: 'overdue', label: 'Overdue', query: { where: { is_overdue: true } } },
    ],
    advanced: ['status', 'condition', 'event_id', 'zone_id', 'assigned_to_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'active', label: 'Active', query: { where: { status: { in: ['checked_out', 'in_transit', 'on_site', 'in_use'] } } }, count: true },
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'missing', label: 'Missing', query: { where: { status: 'missing' } }, count: true },
        { key: 'damaged', label: 'Damaged', query: { where: { status: 'damaged' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'history', label: 'Scan History', content: { type: 'related', entity: 'equipment_scans', foreignKey: 'tracking_id' } },
        { key: 'timeline', label: 'Timeline', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'scans', label: 'Total Scans', value: { type: 'field', field: 'scan_count' }, format: 'number' },
          { key: 'time_out', label: 'Hours Out', value: { type: 'field', field: 'time_out' }, format: 'number' },
        ],
        blocks: [
          { key: 'location', title: 'Location', content: { type: 'fields', fields: ['current_location', 'zone_id'] } },
          { key: 'assignment', title: 'Assignment', content: { type: 'fields', fields: ['assigned_to_id', 'checked_out_by_id'] } },
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes', 'damage_report'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'asset', title: 'Asset', fields: ['asset_id', 'barcode', 'rfid_tag'] },
        { key: 'status', title: 'Status', fields: ['status', 'condition', 'event_id'] },
        { key: 'location', title: 'Location', fields: ['current_location', 'zone_id'] },
        { key: 'assignment', title: 'Assignment', fields: ['assigned_to_id', 'expected_return_at'] },
        { key: 'notes', title: 'Notes', fields: ['notes', 'damage_report', 'photos'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['asset_id', 'barcode', 'status', 'condition', 'current_location', 'assigned_to_id', 'last_scanned_at', 'is_overdue'],
    },
    grid: {
      cardFields: ['status', 'current_location', 'condition'],
      titleField: 'asset_id',
      subtitleField: 'barcode',
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/equipment-tracking/${r.id}` } },
      { key: 'scan', label: 'Record Scan', variant: 'primary', handler: { type: 'function', fn: () => {} } },
      { key: 'checkout', label: 'Check Out', handler: { type: 'function', fn: () => {} } },
      { key: 'return', label: 'Return', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'bulk_scan', label: 'Bulk Scan', handler: { type: 'function', fn: () => {} } },
      { key: 'export', label: 'Export', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'scan', label: 'Scan Equipment', variant: 'primary', handler: { type: 'function', fn: () => {} } },
      { key: 'scanner', label: 'Scanner Mode', handler: { type: 'navigate', path: () => '/operations/equipment-tracking/scanner' } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});

/**
 * EQUIPMENT SCAN ENTITY SCHEMA
 * Individual scan records for equipment tracking history
 */
export const equipmentScanSchema = defineSchema({
  identity: {
    name: 'equipment_scan',
    namePlural: 'Equipment Scans',
    slug: 'modules/operations/equipment-scans',
    icon: 'Scan',
    description: 'Equipment scan history records',
  },

  data: {
    endpoint: '/api/equipment-scans',
    primaryKey: 'id',
    fields: {
      tracking_id: {
        type: 'relation',
        label: 'Tracking Record',
        required: true,
        inTable: true,
      },
      scanned_at: {
        type: 'datetime',
        label: 'Scanned At',
        required: true,
        inTable: true,
        sortable: true,
      },
      scanned_by_id: {
        type: 'relation',
        label: 'Scanned By',
        required: true,
        inTable: true,
      },
      scan_type: {
        type: 'select',
        label: 'Scan Type',
        inTable: true,
        options: [
          { label: 'Check Out', value: 'checkout', color: 'blue' },
          { label: 'Check In', value: 'checkin', color: 'green' },
          { label: 'Location Update', value: 'location', color: 'purple' },
          { label: 'Inventory', value: 'inventory', color: 'gray' },
          { label: 'Condition Check', value: 'condition', color: 'yellow' },
        ],
      },
      location: {
        type: 'text',
        label: 'Location',
        inTable: true,
      },
      location_coordinates: {
        type: 'json',
        label: 'GPS Coordinates',
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
      },
      device_id: {
        type: 'text',
        label: 'Device ID',
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.scan_type || 'Scan'),
    subtitle: (r: Record<string, unknown>) => String(r.location || ''),
    badge: (r: Record<string, unknown>) => ({ label: String(r.scan_type), variant: 'secondary' }),
    defaultSort: { field: 'scanned_at', direction: 'desc' },
  },

  search: { enabled: false, fields: [], placeholder: '' },
  filters: { quick: [], advanced: [] },

  layouts: {
    list: {
      subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: { stats: [], blocks: [] },
    },
    form: {
      sections: [
        { key: 'scan', title: 'Scan Details', fields: ['tracking_id', 'scan_type', 'location', 'notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['scanned_at', 'scan_type', 'location', 'scanned_by_id'],
    },
  },

  actions: { row: [], bulk: [], global: [] },
  permissions: { create: true, read: true, update: false, delete: false },
});
