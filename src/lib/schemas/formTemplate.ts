import { defineSchema } from '../schema/defineSchema';

export const formTemplateSchema = defineSchema({
  identity: {
    name: 'Form Template',
    namePlural: 'Forms',
    slug: 'content/forms',
    icon: '📝',
    description: 'Custom form builder for lead capture and data collection',
  },
  data: {
    endpoint: '/api/form_templates',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Form Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      form_type: {
        type: 'select',
        label: 'Form Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Lead Capture', value: 'lead_capture' },
          { label: 'Contact Form', value: 'contact' },
          { label: 'Registration', value: 'registration' },
          { label: 'Survey', value: 'survey' },
          { label: 'Feedback', value: 'feedback' },
          { label: 'Application', value: 'application' },
          { label: 'Custom', value: 'custom' },
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
          { label: 'Published', value: 'published' },
          { label: 'Archived', value: 'archived' },
        ],
        default: 'draft',
      },
      submit_button_text: {
        type: 'text',
        label: 'Submit Button Text',
        inForm: true,
        default: 'Submit',
      },
      success_message: {
        type: 'textarea',
        label: 'Success Message',
        inForm: true,
        default: 'Thank you for your submission!',
      },
      redirect_url: {
        type: 'url',
        label: 'Redirect URL',
        inForm: true,
        helpText: 'Optional URL to redirect after submission',
      },
      notification_email: {
        type: 'email',
        label: 'Notification Email',
        inForm: true,
        helpText: 'Email to notify on new submissions',
      },
      submission_count: {
        type: 'number',
        label: 'Submissions',
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
    title: (r: Record<string, unknown>) => String(r.name || 'New Form'),
    subtitle: (r: Record<string, unknown>) => {
      const types: Record<string, string> = {
        lead_capture: 'Lead Capture',
        contact: 'Contact Form',
        registration: 'Registration',
        survey: 'Survey',
        feedback: 'Feedback',
        application: 'Application',
        custom: 'Custom',
      };
      return types[String(r.form_type)] || '';
    },
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
    fields: ['name'],
    placeholder: 'Search forms...',
  },
  filters: {
    quick: [
      { key: 'published', label: 'Published', query: { where: { status: 'published' } } },
    ],
    advanced: ['form_type', 'status'],
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
        { key: 'fields', label: 'Fields', content: { type: 'related', entity: 'form_field', foreignKey: 'form_id' } },
        { key: 'submissions', label: 'Submissions', content: { type: 'related', entity: 'form_submission', foreignKey: 'form_id' } },
        { key: 'analytics', label: 'Analytics', content: { type: 'custom', component: 'FormAnalytics' } },
      ],
      overview: {
        stats: [
          { key: 'submissions', label: 'Submissions', value: { type: 'field', field: 'submission_count' }, format: 'number' },
          { key: 'conversion', label: 'Conversion Rate', value: { type: 'field', field: 'conversion_rate' }, format: 'percentage' },
        ],
        blocks: [
          { key: 'details', title: 'Form Details', content: { type: 'fields', fields: ['name', 'description', 'form_type', 'status'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Form Details', fields: ['name', 'description', 'form_type', 'status'] },
        { key: 'settings', title: 'Settings', fields: ['submit_button_text', 'success_message', 'redirect_url', 'notification_email'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'form_type', 'submission_count', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/content/forms/${r.id}` } },
      { key: 'preview', label: 'Preview', handler: { type: 'modal', component: 'FormPreview' } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Form', variant: 'primary', handler: { type: 'navigate', path: '/content/forms/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
