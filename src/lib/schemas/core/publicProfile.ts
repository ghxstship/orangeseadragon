/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * PUBLIC PROFILE SCHEMA (SSOT)
 * LinkedIn-style public pages for various entities
 */
export const publicProfileSchema = defineSchema({
    identity: {
        name: 'publicProfile',
        namePlural: 'Public Profiles',
        slug: 'network/profiles',
        icon: 'Globe',
        description: 'Manage public-facing profiles for individuals and organizations',
    },

    data: {
        endpoint: '/api/network/profiles',
        primaryKey: 'id',
        fields: {
            slug: {
                type: 'text',
                label: 'Slug',
                placeholder: 'e.g. john-doe',
                required: true,
                inTable: true,
                inForm: true,
                searchable: true,
            },
            entity_type: {
                type: 'select',
                label: 'Profile Type',
                required: true,
                inTable: true,
                inForm: true,
                options: [
                    { label: 'Professional', value: 'professional', color: 'blue' },
                    { label: 'Business', value: 'business', color: 'purple' },
                    { label: 'Artist', value: 'artist', color: 'green' },
                    { label: 'Agency', value: 'agency', color: 'orange' },
                    { label: 'Sponsor', value: 'sponsor', color: 'yellow' },
                    { label: 'Investor', value: 'investor', color: 'emerald' },
                    { label: 'Affiliate', value: 'affiliate', color: 'teal' },
                    { label: 'Influencer', value: 'influencer', color: 'pink' },
                    { label: 'Media/Press', value: 'media', color: 'red' },
                    { label: 'Event', value: 'event', color: 'indigo' },
                    { label: 'Experience', value: 'experience', color: 'cyan' },
                ],
            },
            entity_id: {
                type: 'text', // In reality, this is a UUID linked via UI
                label: 'Entity ID',
                required: true,
                inForm: true,
            },
            is_public: {
                type: 'switch',
                label: 'Visible to Public',
                inTable: true,
                inForm: true,
                default: false,
            },
            headline: {
                type: 'text',
                label: 'Headline',
                placeholder: 'e.g. Senior Production Manager',
                inTable: true,
                inForm: true,
                searchable: true,
            },
            summary: {
                type: 'textarea',
                label: 'Brief Summary',
                inForm: true,
            },
            detailed_bio: {
                type: 'richtext',
                label: 'Detailed Bio',
                inForm: true,
            },
            avatar_url: {
                type: 'image',
                label: 'Profile Picture',
                inForm: true,
            },
            banner_url: {
                type: 'image',
                label: 'Cover Image',
                inForm: true,
            },
            is_verified: {
                type: 'checkbox',
                label: 'Verified',
                inTable: true,
                inForm: true,
                default: false,
            },
            views_count: {
                type: 'number',
                label: 'Views',
                inTable: true,
                readOnly: true,
            },
        },
    },

    display: {
        title: (record: any) => record.headline || record.slug || 'Untitled Profile',
        subtitle: (record: any) => record.entity_type,
        badge: (record: any) => record.is_verified ? { label: 'Verified', variant: 'success' } : undefined,
        image: (record: any) => record.avatar_url,
        defaultSort: { field: 'views_count', direction: 'desc' },
    },

    search: {
        enabled: true,
        fields: ['slug', 'headline', 'summary'],
        placeholder: 'Search profiles...',
    },

    filters: {
        quick: [
            { key: 'public', label: 'Public', query: { is_public: true } },
            { key: 'verified', label: 'Verified', query: { is_verified: true } },
        ],
        advanced: ['entity_type', 'is_public', 'is_verified'],
    },

    layouts: {
        list: {
            subpages: [
                { key: 'all', label: 'All Profiles', query: { where: {} }, count: true },
                { key: 'public', label: 'Public', query: { where: { is_public: true } }, count: true },
                { key: 'pending', label: 'Draft', query: { where: { is_public: false } }, count: true },
            ],
            defaultView: 'table',
            availableViews: ['table', 'grid', 'list'],
        },
        detail: {
            tabs: [
                { key: 'overview', label: 'Overview', content: { type: 'overview' } },
                { key: 'gallery', label: 'Portfolio', content: { type: 'files' } },
                { key: 'activity', label: 'Recent Activity', content: { type: 'activity' } },
            ],
            overview: {
                stats: [
                    { key: 'views', label: 'Total Views', value: { type: 'field', field: 'views_count' } },
                ],
                blocks: [
                    { key: 'bio', title: 'Bio', content: { type: 'fields', fields: ['summary', 'detailed_bio'] } },
                ],
            },
        },
        form: {
            sections: [
                { key: 'identity', title: 'Identity', fields: ['slug', 'entity_type', 'entity_id', 'is_public'] },
                { key: 'content', title: 'Content', fields: ['headline', 'summary', 'detailed_bio'] },
                { key: 'media', title: 'Media', fields: ['avatar_url', 'banner_url'] },
            ],
        },
    },

    views: {
        table: {
            columns: [
              'slug', 'entity_type', 'headline',
              { field: 'is_public', format: { type: 'boolean' } },
              { field: 'is_verified', format: { type: 'boolean' } },
              { field: 'views_count', format: { type: 'number' } },
            ],
        },
        grid: {
            titleField: 'slug',
            subtitleField: 'headline',
            imageField: 'avatar_url',
            cardFields: ['entity_type'],
        },
    },

    actions: {
        row: [
            { key: 'view', label: 'View Public', handler: { type: 'external', url: (r: any) => `/p/${r.slug}` } },
            { key: 'edit', label: 'Edit Profile', handler: { type: 'navigate', path: (r: any) => `/network/profiles/${r.id}` } },
        ],
        bulk: [],
        global: [
            { key: 'create', label: 'Create Profile', variant: 'primary', handler: { type: 'navigate', path: () => '/network/profiles/new' } },
        ],
    },

    permissions: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },
});
