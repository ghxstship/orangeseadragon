import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * CREW GIG RATING ENTITY SCHEMA (SSOT)
 *
 * Per-project, per-crew-member rating system with:
 * - Overall + 5 dimension ratings (1-5 stars)
 * - Would-rehire flag
 * - Private/public visibility
 */
export const crewGigRatingSchema = defineSchema({
  identity: {
    name: 'Crew Rating',
    namePlural: 'Crew Ratings',
    slug: 'modules/people/crew-ratings',
    icon: 'Star',
    description: 'Per-gig crew performance ratings with multi-dimensional scoring',
  },

  data: {
    endpoint: '/api/crew-gig-ratings',
    primaryKey: 'id',
    fields: {
      employee_id: {
        type: 'relation',
        label: 'Crew Member',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      project_id: {
        type: 'relation',
        label: 'Project / Gig',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        relation: { entity: 'projects', display: 'name' },
      },
      overall_rating: {
        type: 'number',
        label: 'Overall Rating',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        min: 1,
        max: 5,
      },
      professionalism_rating: {
        type: 'number',
        label: 'Professionalism',
        inForm: true,
        inDetail: true,
        min: 1,
        max: 5,
      },
      skill_rating: {
        type: 'number',
        label: 'Skill',
        inForm: true,
        inDetail: true,
        min: 1,
        max: 5,
      },
      reliability_rating: {
        type: 'number',
        label: 'Reliability',
        inForm: true,
        inDetail: true,
        min: 1,
        max: 5,
      },
      communication_rating: {
        type: 'number',
        label: 'Communication',
        inForm: true,
        inDetail: true,
        min: 1,
        max: 5,
      },
      teamwork_rating: {
        type: 'number',
        label: 'Teamwork',
        inForm: true,
        inDetail: true,
        min: 1,
        max: 5,
      },
      role_during_project: {
        type: 'text',
        label: 'Role',
        inTable: true,
        inForm: true,
      },
      would_rehire: {
        type: 'switch',
        label: 'Would Rehire',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      comments: {
        type: 'textarea',
        label: 'Comments',
        inForm: true,
        inDetail: true,
      },
      is_private: {
        type: 'switch',
        label: 'Private',
        inForm: true,
        default: true,
      },
      rated_by: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name' },
        label: 'Rated By',
        inTable: true,
        inDetail: true,
      },
      rated_at: {
        type: 'datetime',
        label: 'Rated At',
        inTable: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => `${r.role_during_project || 'Rating'}`,
    subtitle: (r: Record<string, unknown>) => `${r.overall_rating || 0}/5 stars`,
    defaultSort: { field: 'rated_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['role_during_project', 'comments'],
    placeholder: 'Search ratings...',
  },

  filters: {
    quick: [
      { key: 'rehire', label: 'Would Rehire', query: { where: { would_rehire: true } } },
      { key: 'top', label: '5 Stars', query: { where: { overall_rating: 5 } } },
    ],
    advanced: ['overall_rating', 'would_rehire', 'is_private'],
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
        stats: [
          { key: 'overall', label: 'Overall', value: { type: 'field', field: 'overall_rating' }, format: 'number' },
          { key: 'skill', label: 'Skill', value: { type: 'field', field: 'skill_rating' }, format: 'number' },
          { key: 'reliability', label: 'Reliability', value: { type: 'field', field: 'reliability_rating' }, format: 'number' },
        ],
        blocks: [
          { key: 'dimensions', title: 'Rating Dimensions', content: { type: 'fields', fields: ['professionalism_rating', 'skill_rating', 'reliability_rating', 'communication_rating', 'teamwork_rating'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'context', title: 'Context', fields: ['employee_id', 'project_id', 'role_during_project'] },
        { key: 'ratings', title: 'Ratings', fields: ['overall_rating', 'professionalism_rating', 'skill_rating', 'reliability_rating', 'communication_rating', 'teamwork_rating'] },
        { key: 'feedback', title: 'Feedback', fields: ['would_rehire', 'comments', 'is_private'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['employee_id', 'project_id', 'role_during_project', 'overall_rating', 'would_rehire', 'rated_by', 'rated_at'],
    },
  },

  actions: {
    row: [
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/crew-ratings/${r.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Rate Crew', variant: 'primary', handler: { type: 'navigate', path: '/people/crew-ratings/new' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'employeeProfile', foreignKey: 'employee_id', label: 'Employee' },
      { entity: 'project', foreignKey: 'project_id', label: 'Project' },
      { entity: 'user', foreignKey: 'rated_by', label: 'Rated By' },
    ],
  },



  permissions: { create: true, read: true, update: true, delete: true },
});
