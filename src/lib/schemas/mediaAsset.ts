import { defineSchema } from '../schema/defineSchema';

/**
 * MEDIA ASSET ENTITY SCHEMA (SSOT)
 *
 * Dedicated photo/video/audio asset library with:
 * - Asset type classification (photo, video, audio, render, cad, graphic)
 * - Rights management (copyright, usage, license, expiration)
 * - GPS/location metadata
 * - Folder organization + tags
 */
export const mediaAssetSchema = defineSchema({
  identity: {
    name: 'Media Asset',
    namePlural: 'Media Assets',
    slug: 'modules/documents/media-assets',
    icon: 'Image',
    description: 'Photo, video, and audio asset library with rights management and metadata',
  },

  data: {
    endpoint: '/api/media-assets',
    primaryKey: 'id',
    fields: {
      title: {
        type: 'text',
        label: 'Title',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      asset_type: {
        type: 'select',
        label: 'Asset Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Photo', value: 'photo' },
          { label: 'Video', value: 'video' },
          { label: 'Audio', value: 'audio' },
          { label: 'Render', value: 'render' },
          { label: 'CAD', value: 'cad' },
          { label: 'Graphic', value: 'graphic' },
        ],
      },
      project_id: {
        type: 'relation',
        relation: { entity: 'project', display: 'name', searchable: true },
        label: 'Project',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      file_url: {
        type: 'url',
        label: 'File URL',
        required: true,
        inDetail: true,
      },
      thumbnail_url: {
        type: 'url',
        label: 'Thumbnail',
        inDetail: true,
      },
      file_size_bytes: {
        type: 'number',
        label: 'File Size (bytes)',
        inDetail: true,
      },
      mime_type: {
        type: 'text',
        label: 'MIME Type',
        inDetail: true,
      },
      width: {
        type: 'number',
        label: 'Width (px)',
        inDetail: true,
      },
      height: {
        type: 'number',
        label: 'Height (px)',
        inDetail: true,
      },
      duration_seconds: {
        type: 'number',
        label: 'Duration (seconds)',
        inDetail: true,
      },
      folder: {
        type: 'text',
        label: 'Folder',
        inTable: true,
        inForm: true,
      },
      tags: {
        type: 'tags',
        label: 'Tags',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      category: {
        type: 'text',
        label: 'Category',
        inForm: true,
        inDetail: true,
      },
      copyright_holder: {
        type: 'text',
        label: 'Copyright Holder',
        inForm: true,
        inDetail: true,
      },
      usage_rights: {
        type: 'select',
        label: 'Usage Rights',
        inTable: true,
        inForm: true,
        default: 'internal',
        options: [
          { label: 'Internal Only', value: 'internal' },
          { label: 'Client Approved', value: 'client_approved' },
          { label: 'Public', value: 'public' },
          { label: 'Restricted', value: 'restricted' },
        ],
      },
      license_type: {
        type: 'text',
        label: 'License Type',
        inForm: true,
        inDetail: true,
      },
      expiration_date: {
        type: 'date',
        label: 'Expiration Date',
        inForm: true,
        inDetail: true,
      },
      shot_date: {
        type: 'datetime',
        label: 'Shot Date',
        inTable: true,
        inForm: true,
      },
      location_description: {
        type: 'text',
        label: 'Location',
        inForm: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        default: 'active',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Archived', value: 'archived' },
          { label: 'Pending Review', value: 'pending_review' },
          { label: 'Rejected', value: 'rejected' },
        ],
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => `${r.title || 'Media Asset'}`,
    subtitle: (r: Record<string, unknown>) => `${r.asset_type || ''}`,
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'description', 'folder', 'location_description'],
    placeholder: 'Search media assets...',
  },

  filters: {
    quick: [
      { key: 'photos', label: 'Photos', query: { where: { asset_type: 'photo' } } },
      { key: 'videos', label: 'Videos', query: { where: { asset_type: 'video' } } },
      { key: 'audio', label: 'Audio', query: { where: { asset_type: 'audio' } } },
    ],
    advanced: ['asset_type', 'usage_rights', 'status', 'project_id', 'tags'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'photos', label: 'Photos', query: { where: { asset_type: 'photo' } }, count: true },
        { key: 'videos', label: 'Videos', query: { where: { asset_type: 'video' } }, count: true },
        { key: 'audio', label: 'Audio', query: { where: { asset_type: 'audio' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'type', label: 'Type', value: { type: 'field', field: 'asset_type' } },
          { key: 'rights', label: 'Rights', value: { type: 'field', field: 'usage_rights' } },
        ],
        blocks: [
          { key: 'metadata', title: 'Metadata', content: { type: 'fields', fields: ['mime_type', 'file_size_bytes', 'width', 'height', 'duration_seconds'] } },
          { key: 'rights', title: 'Rights & Licensing', content: { type: 'fields', fields: ['copyright_holder', 'usage_rights', 'license_type', 'expiration_date'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Asset Info', fields: ['title', 'description', 'asset_type', 'project_id', 'file_url', 'thumbnail_url'] },
        { key: 'organize', title: 'Organization', fields: ['folder', 'tags', 'category', 'status'] },
        { key: 'rights', title: 'Rights', fields: ['copyright_holder', 'usage_rights', 'license_type', 'expiration_date'] },
        { key: 'capture', title: 'Capture Info', fields: ['shot_date', 'location_description'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'title',
        'asset_type',
        { field: 'project_id', format: { type: 'relation', entityType: 'project' } },
        'folder',
        'usage_rights',
        { field: 'shot_date', format: { type: 'date' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', pending: '#f59e0b', active: '#22c55e', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444', approved: '#22c55e', rejected: '#ef4444', closed: '#6b7280', open: '#3b82f6', planned: '#3b82f6', published: '#3b82f6', confirmed: '#22c55e', submitted: '#3b82f6', resolved: '#22c55e', expired: '#ef4444' } } },
        'tags',
      ],
    },
  },

  actions: {
    row: [
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/documents/media-assets/${r.id}/edit` } },
    ],
    bulk: [
      { key: 'archive', label: 'Archive', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'upload', label: 'Upload Asset', variant: 'primary', handler: { type: 'navigate', path: '/documents/media-assets/new' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'project', foreignKey: 'project_id', label: 'Project' },
    ],
  },



  permissions: { create: true, read: true, update: true, delete: true },
});
