import { defineSchema } from '../schema/defineSchema';

export const vehicleSchema = defineSchema({
  identity: {
    name: 'vehicle',
    namePlural: 'Vehicles',
    slug: 'modules/assets/vehicles',
    icon: 'Car',
    description: 'Fleet vehicles and trailers',
  },

  data: {
    endpoint: '/api/vehicles',
    primaryKey: 'id',
    fields: {
      vehicle_number: {
        type: 'text',
        label: 'Vehicle #',
        required: true,
        inTable: true,
        inForm: true,
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
      vehicle_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Box Truck', value: 'box_truck' },
          { label: 'Sprinter', value: 'sprinter' },
          { label: 'Trailer', value: 'trailer' },
          { label: 'Flatbed', value: 'flatbed' },
          { label: 'Pickup', value: 'pickup' },
          { label: 'Van', value: 'van' },
          { label: 'SUV', value: 'suv' },
          { label: 'Sedan', value: 'sedan' },
        ],
      },
      make: {
        type: 'text',
        label: 'Make',
        inTable: true,
        inForm: true,
      },
      model: {
        type: 'text',
        label: 'Model',
        inTable: true,
        inForm: true,
      },
      year: {
        type: 'number',
        label: 'Year',
        inForm: true,
      },
      vin: {
        type: 'text',
        label: 'VIN',
        inForm: true,
        inDetail: true,
      },
      license_plate: {
        type: 'text',
        label: 'License Plate',
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
          { label: 'Available', value: 'available', color: 'green' },
          { label: 'In Use', value: 'in_use', color: 'blue' },
          { label: 'Maintenance', value: 'maintenance', color: 'yellow' },
          { label: 'Out of Service', value: 'out_of_service', color: 'red' },
          { label: 'Reserved', value: 'reserved', color: 'purple' },
        ],
        default: 'available',
      },
      current_location: {
        type: 'text',
        label: 'Current Location',
        inTable: true,
        inForm: true,
      },
      odometer: {
        type: 'number',
        label: 'Odometer',
        inForm: true,
        inDetail: true,
      },
      fuel_type: {
        type: 'select',
        label: 'Fuel Type',
        inForm: true,
        options: [
          { label: 'Gasoline', value: 'gasoline' },
          { label: 'Diesel', value: 'diesel' },
          { label: 'Electric', value: 'electric' },
          { label: 'Hybrid', value: 'hybrid' },
        ],
      },
      capacity_lbs: {
        type: 'number',
        label: 'Capacity (lbs)',
        inForm: true,
        inDetail: true,
      },
      insurance_expiry: {
        type: 'date',
        label: 'Insurance Expiry',
        inForm: true,
        inDetail: true,
      },
      registration_expiry: {
        type: 'date',
        label: 'Registration Expiry',
        inForm: true,
        inDetail: true,
      },
      gps_device_id: {
        type: 'select',
        label: 'GPS Device',
        inForm: true,
        options: [],
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
    title: (record: any) => record.name || record.vehicle_number,
    subtitle: (record: any) => `${record.make} ${record.model}` || '',
    badge: (record: any) => {
      const statusColors: Record<string, string> = {
        available: 'success', in_use: 'primary', maintenance: 'warning',
        out_of_service: 'destructive', reserved: 'primary',
      };
      return { label: record.status || 'Unknown', variant: statusColors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'vehicle_number', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['vehicle_number', 'name', 'license_plate', 'vin'],
    placeholder: 'Search vehicles...',
  },

  filters: {
    quick: [
      { key: 'available', label: 'Available', query: { where: { status: 'available' } } },
      { key: 'in-use', label: 'In Use', query: { where: { status: 'in_use' } } },
    ],
    advanced: ['status', 'vehicle_type', 'current_location'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Vehicles', query: { where: {} }, count: true },
        { key: 'available', label: 'Available', query: { where: { status: 'available' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'maintenance', label: 'Maintenance', content: { type: 'related', entity: 'service_history', foreignKey: 'vehicle_id' } },
        { key: 'trips', label: 'Trip Log', content: { type: 'related', entity: 'location_log', foreignKey: 'vehicle_id' } },
      ],
      overview: {
        stats: [
          { key: 'odometer', label: 'Odometer', value: { type: 'field', field: 'odometer' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Vehicle Details', content: { type: 'fields', fields: ['vin', 'capacity_lbs', 'fuel_type'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['vehicle_number', 'name', 'vehicle_type', 'status'] },
        { key: 'specs', title: 'Specifications', fields: ['make', 'model', 'year', 'vin', 'license_plate'] },
        { key: 'operations', title: 'Operations', fields: ['current_location', 'odometer', 'fuel_type', 'capacity_lbs'] },
        { key: 'compliance', title: 'Compliance', fields: ['insurance_expiry', 'registration_expiry'] },
        { key: 'tracking', title: 'Tracking', fields: ['gps_device_id', 'notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['vehicle_number', 'name', 'vehicle_type', 'make', 'model', 'status', 'current_location', 'license_plate'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: any) => `/assets/vehicles/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Vehicle', variant: 'primary', handler: { type: 'function', fn: () => console.log('Create Vehicle') } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
