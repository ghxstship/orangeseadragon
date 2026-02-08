import { defineSchema } from '../schema/defineSchema';

/**
 * CREW RATE CARD ENTITY SCHEMA (SSOT)
 *
 * Rate management for crew members with:
 * - Day/half-day/hourly rates with OT/DT/weekend/holiday multipliers
 * - Per diem, hotel allowance, mileage, travel day rates
 * - Kit rental and vehicle allowances
 * - Effective date ranges for rate versioning
 */
export const crewRateCardSchema = defineSchema({
  identity: {
    name: 'Rate Card',
    namePlural: 'Rate Cards',
    slug: 'modules/people/rate-cards',
    icon: 'CreditCard',
    description: 'Crew rate cards with day rates, per diem, and multipliers',
  },

  data: {
    endpoint: '/api/crew-rate-cards',
    primaryKey: 'id',
    fields: {
      employee_id: {
        type: 'relation',
        label: 'Crew Member',
        inTable: true,
        inForm: true,
        inDetail: true,
        relation: { entity: 'people', display: 'name' },
      },
      role: {
        type: 'text',
        label: 'Role',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      department: {
        type: 'text',
        label: 'Department',
        inTable: true,
        inForm: true,
      },
      day_rate: {
        type: 'currency',
        label: 'Day Rate',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      half_day_rate: {
        type: 'currency',
        label: 'Half Day Rate',
        inForm: true,
        inDetail: true,
      },
      hourly_rate: {
        type: 'currency',
        label: 'Hourly Rate',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      overtime_rate_multiplier: {
        type: 'number',
        label: 'OT Multiplier',
        inForm: true,
        inDetail: true,
        default: 1.5,
      },
      double_time_multiplier: {
        type: 'number',
        label: 'DT Multiplier',
        inForm: true,
        inDetail: true,
        default: 2.0,
      },
      weekend_rate_multiplier: {
        type: 'number',
        label: 'Weekend Multiplier',
        inForm: true,
        inDetail: true,
        default: 1.5,
      },
      holiday_rate_multiplier: {
        type: 'number',
        label: 'Holiday Multiplier',
        inForm: true,
        inDetail: true,
        default: 2.0,
      },
      per_diem_amount: {
        type: 'currency',
        label: 'Per Diem',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      hotel_allowance: {
        type: 'currency',
        label: 'Hotel Allowance',
        inForm: true,
        inDetail: true,
      },
      mileage_rate: {
        type: 'number',
        label: 'Mileage Rate ($/mi)',
        inForm: true,
        inDetail: true,
      },
      travel_day_rate: {
        type: 'currency',
        label: 'Travel Day Rate',
        inForm: true,
        inDetail: true,
      },
      kit_rental_rate: {
        type: 'currency',
        label: 'Kit Rental',
        inForm: true,
        inDetail: true,
      },
      vehicle_allowance: {
        type: 'currency',
        label: 'Vehicle Allowance',
        inForm: true,
        inDetail: true,
      },
      currency: {
        type: 'select',
        label: 'Currency',
        inForm: true,
        default: 'USD',
        options: [
          { label: 'USD', value: 'USD' },
          { label: 'EUR', value: 'EUR' },
          { label: 'GBP', value: 'GBP' },
          { label: 'CAD', value: 'CAD' },
          { label: 'AUD', value: 'AUD' },
        ],
      },
      effective_from: {
        type: 'date',
        label: 'Effective From',
        required: true,
        inTable: true,
        inForm: true,
      },
      effective_until: {
        type: 'date',
        label: 'Effective Until',
        inTable: true,
        inForm: true,
      },
      is_default: {
        type: 'switch',
        label: 'Default Rate',
        inTable: true,
        inForm: true,
        default: false,
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
    title: (r: Record<string, unknown>) => `${r.role || 'Rate Card'}`,
    subtitle: (r: Record<string, unknown>) => r.day_rate ? `$${r.day_rate}/day` : '',
    defaultSort: { field: 'role', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['role', 'department'],
    placeholder: 'Search rate cards...',
  },

  filters: {
    quick: [
      { key: 'default', label: 'Default Rates', query: { where: { is_default: true } } },
    ],
    advanced: ['role', 'department', 'currency', 'is_default'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'default', label: 'Default', query: { where: { is_default: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [
          { key: 'day_rate', label: 'Day Rate', value: { type: 'field', field: 'day_rate' }, format: 'currency' },
          { key: 'hourly', label: 'Hourly', value: { type: 'field', field: 'hourly_rate' }, format: 'currency' },
          { key: 'per_diem', label: 'Per Diem', value: { type: 'field', field: 'per_diem_amount' }, format: 'currency' },
        ],
        blocks: [
          { key: 'multipliers', title: 'Rate Multipliers', content: { type: 'fields', fields: ['overtime_rate_multiplier', 'double_time_multiplier', 'weekend_rate_multiplier', 'holiday_rate_multiplier'] } },
          { key: 'allowances', title: 'Allowances', content: { type: 'fields', fields: ['per_diem_amount', 'hotel_allowance', 'mileage_rate', 'travel_day_rate', 'kit_rental_rate', 'vehicle_allowance'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Role & Member', fields: ['employee_id', 'role', 'department'] },
        { key: 'rates', title: 'Rates', fields: ['day_rate', 'half_day_rate', 'hourly_rate', 'currency'] },
        { key: 'multipliers', title: 'Multipliers', fields: ['overtime_rate_multiplier', 'double_time_multiplier', 'weekend_rate_multiplier', 'holiday_rate_multiplier'] },
        { key: 'allowances', title: 'Allowances & Per Diem', fields: ['per_diem_amount', 'hotel_allowance', 'mileage_rate', 'travel_day_rate', 'kit_rental_rate', 'vehicle_allowance'] },
        { key: 'validity', title: 'Validity', fields: ['effective_from', 'effective_until', 'is_default', 'notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['employee_id', 'role', 'department', 'day_rate', 'hourly_rate', 'per_diem_amount', 'effective_from', 'effective_until', 'is_default'],
    },
  },

  actions: {
    row: [
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/rate-cards/${r.id}/edit` } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Rate Card', variant: 'primary', handler: { type: 'navigate', path: '/people/rate-cards/new' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
