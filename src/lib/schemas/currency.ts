import { defineSchema } from '../schema/defineSchema';

export const currencySchema = defineSchema({
  identity: {
    name: 'Currency',
    namePlural: 'Currencies',
    slug: 'settings/currencies',
    icon: 'Coins',
    description: 'Supported currencies for transactions',
  },
  data: {
    endpoint: '/api/currencies',
    primaryKey: 'id',
    fields: {
      code: {
        type: 'text',
        label: 'Currency Code',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
        maxLength: 3,
      },
      name: {
        type: 'text',
        label: 'Currency Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      symbol: {
        type: 'text',
        label: 'Symbol',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        maxLength: 10,
      },
      decimalPlaces: {
        type: 'number',
        label: 'Decimal Places',
        inForm: true,
        inDetail: true,
        default: 2,
        min: 0,
        max: 4,
      },
      isBaseCurrency: {
        type: 'switch',
        label: 'Base Currency',
        inTable: true,
        inForm: true,
        inDetail: true,
        helpText: 'Set as the default currency for reporting',
      },
      isActive: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => `${r.code} - ${r.name}`,
    subtitle: (r: Record<string, unknown>) => String(r.symbol || ''),
    badge: (r: Record<string, unknown>) =>
      r.isBaseCurrency
        ? { label: 'Base', variant: 'default' }
        : r.isActive
        ? { label: 'Active', variant: 'success' }
        : { label: 'Inactive', variant: 'secondary' },
    defaultSort: { field: 'code', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['code', 'name'],
    placeholder: 'Search currencies...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { isActive: true } } },
    ],
    advanced: ['isActive', 'isBaseCurrency'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { isActive: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'rates', label: 'Exchange Rates', content: { type: 'related', entity: 'exchange_rate', foreignKey: 'from_currency' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'details', title: 'Currency Details', content: { type: 'fields', fields: ['code', 'name', 'symbol', 'decimalPlaces', 'isBaseCurrency', 'isActive'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Currency Details', fields: ['code', 'name', 'symbol', 'decimalPlaces'] },
        { key: 'settings', title: 'Settings', fields: ['isBaseCurrency', 'isActive'] },
      ],
    },
  },
  views: {
    table: {
      columns: [
        'code', 'name', 'symbol',
        { field: 'isBaseCurrency', format: { type: 'boolean' } },
        { field: 'isActive', format: { type: 'boolean' } },
      ],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/settings/currencies/${r.id}` } },
      { key: 'setBase', label: 'Set as Base', handler: { type: 'api', endpoint: '/api/currencies/set-base', method: 'POST' }, condition: (r: Record<string, unknown>) => !r.isBaseCurrency },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Currency', variant: 'primary', handler: { type: 'navigate', path: '/settings/currencies/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});

export const exchangeRateSchema = defineSchema({
  identity: {
    name: 'Exchange Rate',
    namePlural: 'Exchange Rates',
    slug: 'settings/exchange-rates',
    icon: 'ArrowLeftRight',
    description: 'Currency exchange rates',
  },
  data: {
    endpoint: '/api/exchange-rates',
    primaryKey: 'id',
    fields: {
      fromCurrency: {
        type: 'select',
        label: 'From Currency',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'USD', value: 'USD' },
          { label: 'EUR', value: 'EUR' },
          { label: 'GBP', value: 'GBP' },
          { label: 'CAD', value: 'CAD' },
          { label: 'AUD', value: 'AUD' },
          { label: 'JPY', value: 'JPY' },
        ],
      },
      toCurrency: {
        type: 'select',
        label: 'To Currency',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'USD', value: 'USD' },
          { label: 'EUR', value: 'EUR' },
          { label: 'GBP', value: 'GBP' },
          { label: 'CAD', value: 'CAD' },
          { label: 'AUD', value: 'AUD' },
          { label: 'JPY', value: 'JPY' },
        ],
      },
      rate: {
        type: 'number',
        label: 'Exchange Rate',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        min: 0,
      },
      effectiveDate: {
        type: 'date',
        label: 'Effective Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      source: {
        type: 'select',
        label: 'Source',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Manual', value: 'manual' },
          { label: 'API', value: 'api' },
          { label: 'Bank', value: 'bank' },
        ],
        default: 'manual',
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => `${r.fromCurrency} → ${r.toCurrency}`,
    subtitle: (r: Record<string, unknown>) => `Rate: ${r.rate}`,
    defaultSort: { field: 'effectiveDate', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['fromCurrency', 'toCurrency'],
    placeholder: 'Search rates...',
  },
  filters: {
    quick: [],
    advanced: ['fromCurrency', 'toCurrency', 'source'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'details', title: 'Rate Details', content: { type: 'fields', fields: ['fromCurrency', 'toCurrency', 'rate', 'effectiveDate', 'source'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'rate', title: 'Exchange Rate', fields: ['fromCurrency', 'toCurrency', 'rate', 'effectiveDate', 'source'] },
      ],
    },
  },
  views: {
    table: {
      columns: [
        'fromCurrency', 'toCurrency',
        { field: 'rate', format: { type: 'number', decimals: 6 } },
        { field: 'effectiveDate', format: { type: 'date' } },
        'source',
      ],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/settings/exchange-rates/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Rate', variant: 'primary', handler: { type: 'navigate', path: '/settings/exchange-rates/new' } },
      { key: 'fetch', label: 'Fetch Latest Rates', variant: 'secondary', handler: { type: 'api', endpoint: '/api/exchange-rates/fetch', method: 'POST' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
