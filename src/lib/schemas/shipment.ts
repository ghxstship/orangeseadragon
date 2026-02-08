/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineSchema } from '../schema/defineSchema';

export const shipmentSchema = defineSchema({
  identity: {
    name: 'shipment',
    namePlural: 'Shipments',
    slug: 'modules/assets/shipments',
    icon: 'Truck',
    description: 'Freight and equipment shipments',
  },

  data: {
    endpoint: '/api/shipments',
    primaryKey: 'id',
    fields: {
      shipment_number: {
        type: 'text',
        label: 'Shipment #',
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
        inTable: true,
        inForm: true,
        searchable: true,
      },
      direction: {
        type: 'select',
        label: 'Direction',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Outbound', value: 'outbound', color: 'blue' },
          { label: 'Inbound', value: 'inbound', color: 'green' },
          { label: 'Transfer', value: 'transfer', color: 'purple' },
        ],
        default: 'outbound',
      },
      production_id: {
        type: 'select',
        label: 'Production',
        inTable: true,
        inForm: true,
        options: [],
      },
      event_id: {
        type: 'select',
        label: 'Event',
        inForm: true,
        options: [],
      },
      carrier_id: {
        type: 'select',
        label: 'Carrier',
        inTable: true,
        inForm: true,
        options: [],
      },
      origin_facility: {
        type: 'text',
        label: 'Origin Facility',
        inForm: true,
        inDetail: true,
      },
      origin_address: {
        type: 'textarea',
        label: 'Origin Address',
        inForm: true,
      },
      destination_facility: {
        type: 'text',
        label: 'Destination Facility',
        inForm: true,
        inDetail: true,
      },
      destination_address: {
        type: 'textarea',
        label: 'Destination Address',
        inForm: true,
      },
      scheduled_pickup_date: {
        type: 'date',
        label: 'Scheduled Pickup',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      actual_pickup_date: {
        type: 'date',
        label: 'Actual Pickup',
        inForm: true,
        inDetail: true,
      },
      scheduled_delivery_date: {
        type: 'date',
        label: 'Scheduled Delivery',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      actual_delivery_date: {
        type: 'date',
        label: 'Actual Delivery',
        inForm: true,
        inDetail: true,
      },
      tracking_number: {
        type: 'text',
        label: 'Tracking #',
        inTable: true,
        inForm: true,
        searchable: true,
      },
      tracking_url: {
        type: 'url',
        label: 'Tracking URL',
        inForm: true,
        inDetail: true,
      },
      total_weight_lbs: {
        type: 'number',
        label: 'Weight (lbs)',
        inTable: true,
        inForm: true,
      },
      total_pieces: {
        type: 'number',
        label: 'Pieces',
        inTable: true,
        inForm: true,
      },
      pallet_count: {
        type: 'number',
        label: 'Pallets',
        inForm: true,
      },
      freight_cost: {
        type: 'currency',
        label: 'Freight Cost',
        inTable: true,
        inForm: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft', color: 'gray' },
          { label: 'Pending', value: 'pending', color: 'yellow' },
          { label: 'Packed', value: 'packed', color: 'blue' },
          { label: 'In Transit', value: 'in_transit', color: 'purple' },
          { label: 'Delivered', value: 'delivered', color: 'cyan' },
          { label: 'Partially Received', value: 'partially_received', color: 'orange' },
          { label: 'Received', value: 'received', color: 'green' },
          { label: 'Returned', value: 'returned', color: 'red' },
          { label: 'Cancelled', value: 'cancelled', color: 'slate' },
        ],
        default: 'draft',
      },
      special_instructions: {
        type: 'textarea',
        label: 'Special Instructions',
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
    title: (record: any) => record.shipment_number || 'New Shipment',
    subtitle: (record: any) => record.name || `${record.origin_facility} → ${record.destination_facility}`,
    badge: (record: any) => {
      const statusColors: Record<string, string> = {
        draft: 'secondary', pending: 'warning', packed: 'primary',
        in_transit: 'primary', delivered: 'success', partially_received: 'warning',
        received: 'success', returned: 'destructive', cancelled: 'secondary',
      };
      return { label: record.status || 'Unknown', variant: statusColors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'scheduled_pickup_date', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['shipment_number', 'name', 'tracking_number'],
    placeholder: 'Search shipments...',
  },

  filters: {
    quick: [
      { key: 'in-transit', label: 'In Transit', query: { where: { status: 'in_transit' } } },
      { key: 'pending', label: 'Pending', query: { where: { status: { in: ['draft', 'pending', 'packed'] } } } },
    ],
    advanced: ['status', 'direction', 'production_id', 'carrier_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Shipments', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: { notIn: ['received', 'cancelled', 'returned'] } } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban', 'list', 'timeline', 'map'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'items', label: 'Items', content: { type: 'related', entity: 'shipment_items', foreignKey: 'shipment_id' } },
      ],
      overview: {
        stats: [
          { key: 'freight_cost', label: 'Freight Cost', value: { type: 'field', field: 'freight_cost' }, format: 'currency' },
          { key: 'total_pieces', label: 'Pieces', value: { type: 'field', field: 'total_pieces' }, format: 'number' },
        ],
        blocks: [
          { key: 'origin', title: 'Origin', content: { type: 'fields', fields: ['origin_facility', 'origin_address'] } },
          { key: 'destination', title: 'Destination', content: { type: 'fields', fields: ['destination_facility', 'destination_address'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['shipment_number', 'name', 'direction', 'status'] },
        { key: 'relationships', title: 'Relationships', fields: ['production_id', 'event_id', 'carrier_id'] },
        { key: 'origin', title: 'Origin', fields: ['origin_facility', 'origin_address'] },
        { key: 'destination', title: 'Destination', fields: ['destination_facility', 'destination_address'] },
        { key: 'schedule', title: 'Schedule', fields: ['scheduled_pickup_date', 'actual_pickup_date', 'scheduled_delivery_date', 'actual_delivery_date'] },
        { key: 'tracking', title: 'Tracking', fields: ['tracking_number', 'tracking_url'] },
        { key: 'details', title: 'Details', fields: ['total_weight_lbs', 'total_pieces', 'pallet_count', 'freight_cost'] },
        { key: 'notes', title: 'Notes', fields: ['special_instructions', 'notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['shipment_number', 'direction', 'production_id', 'status', 'scheduled_pickup_date', 'scheduled_delivery_date', 'tracking_number'],
    },
    list: {
      titleField: 'shipment_number',
      subtitleField: 'name',
      metaFields: ['scheduled_delivery_date', 'tracking_number'],
      showChevron: true,
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'draft', label: 'Draft', color: 'gray' },
        { value: 'pending', label: 'Pending', color: 'yellow' },
        { value: 'packed', label: 'Packed', color: 'blue' },
        { value: 'in_transit', label: 'In Transit', color: 'purple' },
        { value: 'delivered', label: 'Delivered', color: 'cyan' },
        { value: 'received', label: 'Received', color: 'green' },
      ],
      card: {
        title: 'shipment_number',
        subtitle: 'name',
        fields: ['scheduled_delivery_date', 'tracking_number'],
      },
    },
    timeline: {
      titleField: 'shipment_number',
      startField: 'scheduled_pickup_date',
      endField: 'scheduled_delivery_date',
      groupField: 'direction',
    },
    map: {
      titleField: 'shipment_number',
      latitudeField: 'destination_latitude',
      longitudeField: 'destination_longitude',
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: any) => `/assets/logistics/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Shipment', variant: 'primary', handler: { type: 'function', fn: () => console.log('Create Shipment') } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
