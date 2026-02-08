import { defineSchema } from '../schema/defineSchema';

export const assetKitSchema = defineSchema({
    identity: {
        name: 'AssetKit',
        namePlural: 'Asset Kits',
        slug: 'modules/assets/kits',
        icon: 'Briefcase',
        description: 'Manage bundles and kits of assets',
    },

    data: {
        endpoint: '/api/asset_kits',
        primaryKey: 'id',
        fields: {
            name: {
                type: 'text',
                label: 'Kit Name',
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
            category_id: {
                type: 'relation',
                label: 'Category',
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
                    { label: 'Active', value: 'active' },
                    { label: 'Draft', value: 'draft' },
                    { label: 'Archived', value: 'archived' },
                ],
            },
            is_template: {
                type: 'checkbox',
                label: 'Is Template',
                inTable: true,
                inForm: true,
                default: false,
            },
            template_id: {
                type: 'relation',
                label: 'Based on Template',
                inForm: true,
                inDetail: true,
            },
            total_items: {
                type: 'number',
                label: 'Total Items',
                inTable: true,
                inDetail: true,
                readOnly: true,
            },
            total_value: {
                type: 'currency',
                label: 'Total Value',
                inTable: true,
                inDetail: true,
                readOnly: true,
            },
        },
    },

    display: {
        title: (record) => record.name || 'Untitled Kit',
        subtitle: (record) => record.description || '',
        badge: (record) => {
            const status = record.status as string;
            if (status === 'active') return { label: 'Active', variant: 'success' };
            if (status === 'draft') return { label: 'Draft', variant: 'warning' };
            return { label: 'Archived', variant: 'secondary' };
        },
        defaultSort: { field: 'name', direction: 'asc' },
    },

    search: {
        enabled: true,
        fields: ['name', 'description'],
        placeholder: 'Search kits...',
    },

    filters: {
        quick: [],
        advanced: ['status', 'category_id']
    },

    layouts: {
        list: {
            defaultView: 'table',
            availableViews: ['table', 'grid'],
            subpages: [
                { key: 'all', label: 'All', query: { where: {} }, count: true }
            ]
        },
        detail: {
            tabs: [
                { key: 'overview', label: 'Overview', content: { type: 'overview' } }
            ],
            overview: {
                stats: [],
                blocks: []
            }
        },
        form: {
            sections: [
                {
                    key: 'basic',
                    title: 'Kit Information',
                    fields: ['name', 'description', 'category_id', 'status'],
                },
            ],
        },
    },

    views: {
        table: {
            columns: ['name', 'category_id', 'status'],
        },
        grid: {
            titleField: 'name',
            subtitleField: 'description',
            badgeField: 'status',
            cardFields: []
        },
    },

    actions: {
        row: [
            { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/assets/kits/${record.id}` } },
        ],
        bulk: [],
        global: [
            { key: 'create', label: 'New Kit', variant: 'primary', handler: { type: 'navigate', path: () => '/assets/kits/new' } },
        ],
    },

    permissions: {
        create: true,
        read: true,
        update: true,
        delete: true,
    }
});
