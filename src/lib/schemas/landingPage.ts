import { defineSchema } from '../schema/defineSchema';

export const landingPageSchema = defineSchema({
  identity: {
    name: 'landing_page',
    namePlural: 'Landing Pages',
    slug: 'content/landing-pages',
    icon: '🖥️',
    description: 'Marketing landing pages for campaigns and lead capture',
  },
  data: {
    endpoint: '/api/landing_pages',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Page Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      slug: {
        type: 'text',
        label: 'URL Slug',
        required: true,
        inTable: true,
        inForm: true,
        helpText: 'URL-friendly identifier (e.g., summer-sale)',
      },
      page_type: {
        type: 'select',
        label: 'Page Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Lead Capture', value: 'lead_capture' },
          { label: 'Event Registration', value: 'event_registration' },
          { label: 'Product Launch', value: 'product_launch' },
          { label: 'Webinar', value: 'webinar' },
          { label: 'Download', value: 'download' },
          { label: 'Thank You', value: 'thank_you' },
          { label: 'Custom', value: 'custom' },
        ],
      },
      campaign_id: {
        type: 'relation',
        label: 'Campaign',
        inTable: true,
        inForm: true,
        relation: { entity: 'campaign', display: 'name' },
      },
      form_id: {
        type: 'relation',
        label: 'Form',
        inForm: true,
        relation: { entity: 'form_template', display: 'name' },
      },
      headline: {
        type: 'text',
        label: 'Headline',
        required: true,
        inForm: true,
        inDetail: true,
      },
      subheadline: {
        type: 'text',
        label: 'Subheadline',
        inForm: true,
        inDetail: true,
      },
      body_content: {
        type: 'richtext',
        label: 'Body Content',
        inForm: true,
        inDetail: true,
      },
      cta_text: {
        type: 'text',
        label: 'CTA Button Text',
        inForm: true,
        default: 'Get Started',
      },
      cta_url: {
        type: 'url',
        label: 'CTA URL',
        inForm: true,
        helpText: 'Leave blank to use form submission',
      },
      hero_image_url: {
        type: 'url',
        label: 'Hero Image URL',
        inForm: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
          { label: 'Archived', value: 'archived' },
        ],
        default: 'draft',
      },
      published_at: {
        type: 'datetime',
        label: 'Published At',
        inDetail: true,
      },
      view_count: {
        type: 'number',
        label: 'Views',
        inTable: true,
        inDetail: true,
      },
      conversion_count: {
        type: 'number',
        label: 'Conversions',
        inTable: true,
        inDetail: true,
      },
      conversion_rate: {
        type: 'number',
        label: 'Conversion Rate',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'New Landing Page'),
    subtitle: (r: Record<string, unknown>) => `/${r.slug || ''}`,
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        draft: 'secondary',
        published: 'success',
        archived: 'destructive',
      };
      return { label: String(r.status || 'draft'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['name', 'slug'],
    placeholder: 'Search pages...',
  },
  filters: {
    quick: [
      { key: 'published', label: 'Published', query: { where: { status: 'published' } } },
    ],
    advanced: ['page_type', 'campaign_id', 'status'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'published', label: 'Published', query: { where: { status: 'published' } }, count: true },
        { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'analytics', label: 'Analytics', content: { type: 'custom', component: 'LandingPageAnalytics' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'views', label: 'Views', value: { type: 'field', field: 'view_count' }, format: 'number' },
          { key: 'conversions', label: 'Conversions', value: { type: 'field', field: 'conversion_count' }, format: 'number' },
          { key: 'rate', label: 'Conversion Rate', value: { type: 'field', field: 'conversion_rate' }, format: 'percentage' },
        ],
        blocks: [
          { key: 'details', title: 'Page Details', content: { type: 'fields', fields: ['name', 'slug', 'page_type', 'campaign_id'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Page Details', fields: ['name', 'slug', 'page_type', 'campaign_id', 'form_id', 'status'] },
        { key: 'content', title: 'Content', fields: ['headline', 'subheadline', 'body_content', 'hero_image_url'] },
        { key: 'cta', title: 'Call to Action', fields: ['cta_text', 'cta_url'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'slug', 'page_type', 'view_count', 'conversion_count', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/content/landing-pages/${r.id}` } },
      { key: 'preview', label: 'Preview', handler: { type: 'external', url: (r: Record<string, unknown>) => `/p/${r.slug}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Page', variant: 'primary', handler: { type: 'navigate', path: '/content/landing-pages/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
