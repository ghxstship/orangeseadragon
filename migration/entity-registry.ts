/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENTITY REGISTRY - SCHEMA-DRIVEN MIGRATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Document ALL entities found in codebase.
 * Update status as migration progresses.
 *
 * RUN: entity_inventory.sh to regenerate this data
 */

interface EntityMigrationStatus {
  name: string;
  status: 'not-started' | 'schema-created' | 'pages-updated' | 'tested' | 'complete';

  // Existing files found
  existingFiles: {
    components: string[];
    hooks: string[];
    types: string[];
    pages: string[];
    api: string[];
  };

  // Migration notes
  notes: string[];

  // Custom requirements
  customizations: string[];
}

export const entityRegistry: EntityMigrationStatus[] = [
  // ═══════════════════════════════════════════════════════════════
  // COMPLETED ENTITIES (from previous migration)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Event',
    status: 'complete',
    existingFiles: {
      components: [
        'src/lib/layouts/EntityListLayout.tsx',
        'src/lib/layouts/EntityDetailLayout.tsx',
        'src/lib/layouts/EntityFormLayout.tsx',
      ],
      hooks: [],
      types: ['src/lib/schemas/event.ts'],
      pages: [
        'src/app/(app)/projects/events/page.tsx',
        'src/app/(app)/projects/events/[id]/page.tsx',
        'src/app/(app)/projects/events/new/page.tsx',
        'src/app/(app)/projects/events/[id]/edit/page.tsx',
      ],
      api: ['src/app/api/v1/events/route.ts'],
    },
    notes: [
      'Migrated to schema-driven layout system',
      'Using EntityListLayout, EntityDetailLayout, EntityFormLayout',
      'Integrated with AppShell layout detection',
    ],
    customizations: [
      'Event-specific run sheet generation',
      'Client notification workflows',
      'Weather/noise monitoring integration',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // MIGRATED ENTITIES (schema-driven)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Project',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/project.schema.ts'],
      pages: [
        'src/app/(app)/projects/productions/page.tsx',
        'src/app/(app)/projects/productions/[id]/page.tsx',
        'src/app/(app)/projects/productions/new/page.tsx',
        'src/app/(app)/projects/productions/[id]/edit/page.tsx',
      ],
      api: [
        'src/app/api/v1/projects/route.ts',
        'src/app/api/v1/projects/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
    ],
    customizations: [
      'Project lifecycle management (planning → active → completed)',
      'Budget tracking and financial management',
      'Team assignment and project manager roles',
      'Client relationship management',
      'Milestone and task integration',
      'Calendar and timeline views',
    ],
  },

  {
    name: 'Asset',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/asset.schema.ts'],
      pages: [
        'src/app/(app)/assets/page.tsx',
        'src/app/(app)/assets/[id]/page.tsx',
        'src/app/(app)/assets/new/page.tsx',
        'src/app/(app)/assets/[id]/edit/page.tsx',
      ],
      api: [
        'src/app/api/v1/assets/route.ts',
        'src/app/api/v1/assets/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete asset management with tracking/scanning',
    ],
    customizations: [
      'Asset lifecycle management (available → in_use → maintenance)',
      'QR/barcode/RFID tracking system',
      'Depreciation and warranty management',
      'Condition monitoring and maintenance scheduling',
      'Asset checkout/checkin workflows',
      'Vendor and purchase tracking',
      'Location and category management',
      'Location tracking',
    ],
  },

  {
    name: 'People',
    status: 'not-started',
    existingFiles: {
      components: [], // PeopleTableView.tsx was deleted as per user request
      hooks: [],
      types: [],
      pages: [
        'src/app/(app)/people/page.tsx',
        'src/app/(app)/people/[id]/page.tsx',
        'src/app/(app)/people/new/page.tsx',
        'src/app/(app)/people/[id]/edit/page.tsx',
        'src/app/(app)/people/artists/page.tsx',
        'src/app/(app)/people/contractors/page.tsx',
        'src/app/(app)/people/crew/page.tsx',
        'src/app/(app)/people/departments/page.tsx',
        'src/app/(app)/people/directory/page.tsx',
        'src/app/(app)/people/roles/page.tsx',
        'src/app/(app)/people/teams/page.tsx',
        'src/app/(app)/people/talent/page.tsx',
        'src/app/(app)/people/timesheets/page.tsx',
      ],
      api: [], // Need to identify
    },
    notes: [
      'Complex people management system',
      'Multiple sub-types (artists, contractors, crew, talent)',
      'Department, role, and team management',
      'Timesheet and payroll integration',
    ],
    customizations: [
      'Multi-type people management',
      'Availability and scheduling',
      'Skill and certification tracking',
      'Payroll integration',
    ],
  },

  {
    name: 'Task',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: ['src/hooks/use-tasks.ts'],
      types: [],
      pages: [
        'src/app/(app)/work/tasks/page.tsx',
        'src/app/(app)/work/tasks/[id]/page.tsx',
        'src/app/(app)/work/tasks/new/page.tsx',
        'src/app/(app)/work/tasks/[id]/edit/page.tsx',
        'src/app/(app)/work/tasks/assigned/page.tsx',
        'src/app/(app)/work/tasks/completed/page.tsx',
        'src/app/(app)/work/tasks/my-tasks/page.tsx',
        'src/app/(app)/work/tasks/templates/page.tsx',
        'src/app/(app)/work/tasks/watching/page.tsx',
      ],
      api: [
        'src/app/api/v1/tasks/route.ts',
        'src/app/api/v1/tasks/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
    ],
    customizations: [
      'Task assignment and watching',
      'Template system',
      'Status workflow management',
      'Kanban board integration',
      'Time tracking and estimation',
      'Priority levels and due dates',
      'Project association',
    ],
  },

  {
    name: 'Document',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/document.schema.ts'],
      pages: [
        'src/app/(app)/documents/page.tsx',
        'src/app/(app)/documents/[id]/page.tsx',
        'src/app/(app)/documents/new/page.tsx',
        'src/app/(app)/documents/[id]/edit/page.tsx',
      ],
      api: [
        'src/app/api/v1/documents/route.ts',
        'src/app/api/v1/documents/[id]/route.ts',
      ],
    },
    notes: [
      '✅ Fully migrated to schema-driven architecture',
      '✅ Uses CrudList, CrudDetail, CrudForm components',
      '✅ Schema defines all UI configuration (SSOT)',
      '✅ Live Supabase data integration',
      '✅ Semantic design tokens from schema',
      '✅ 3NF architecture (computed fields, relationships)',
      '✅ Complete document management with versioning',
    ],
    customizations: [
      'Document lifecycle management (draft → review → published)',
      'Content management with multiple formats (markdown, HTML, rich text)',
      'Version control and document history',
      'Template system for document creation',
      'Knowledge base organization with folders',
      'Multi-entity relationships (projects, events, organizations)',
      'Publishing workflow with visibility controls',
      'Content analytics (word count, reading time)',
      'Comment and attachment system',
      'Bulk operations and document export',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL ENTITIES FROM API INVENTORY
  // ═══════════════════════════════════════════════════════════════

  {
    name: 'Budget',
    status: 'not-started',
    existingFiles: {
      components: [],
      hooks: [],
      types: [],
      pages: [],
      api: [
        'src/app/api/v1/budgets/route.ts',
        'src/app/api/v1/budgets/[id]/route.ts',
      ],
    },
    customizations: [],
  },

  {
    name: 'Company',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/company.schema.ts'],
      pages: [
        'src/app/(app)/companies/page.tsx',
        'src/app/(app)/companies/[id]/page.tsx',
        'src/app/(app)/companies/new/page.tsx',
        'src/app/(app)/companies/[id]/edit/page.tsx',
      ],
      api: [
        'src/app/api/v1/companies/route.ts',
        'src/app/api/v1/companies/[id]/route.ts',
      ],
    },
    notes: [
      '✅ Fully migrated to schema-driven architecture',
      '✅ Uses CrudList, CrudDetail, CrudForm components',
      '✅ Schema defines all UI configuration (SSOT)',
      '✅ Live Supabase data integration',
      '✅ Semantic design tokens from schema',
      '✅ 3NF architecture (computed fields, relationships)',
      '✅ Complete CRM company management',
    ],
    customizations: [
      'CRM company lifecycle management (prospect → client)',
      'Multi-entity relationships (contacts, projects, deals, invoices)',
      'Financial tracking (revenue, employee count)',
      'Geographic organization (address, location)',
      'Company classification (type, industry)',
      'Business information management (tax ID, legal name)',
      'Branding and logo management',
      'Tag-based categorization',
      'Bulk operations and status management',
    ],
  },

  {
    name: 'Contact',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/contact.schema.ts'],
      pages: [
        'src/app/(app)/business/contacts/page.tsx',
        'src/app/(app)/business/contacts/[id]/page.tsx',
        'src/app/(app)/business/contacts/new/page.tsx',
        'src/app/(app)/business/contacts/[id]/edit/page.tsx',
      ],
      api: [
        'src/app/api/v1/contacts/route.ts',
        'src/app/api/v1/contacts/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete CRM contact management with company relationships',
    ],
    customizations: [
      'Contact lifecycle management (active/inactive)',
      'Company relationship tracking',
      'Professional information (job title, department)',
      'Communication details (email, phone, mobile)',
      'Address and location information',
      'Social media profiles (LinkedIn, Twitter)',
      'Primary contact designation',
      'Tagging and categorization',
      'Notes and custom fields',
      'Export and import functionality',
    ],
  },

  {
    name: 'Contract',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/contract.schema.ts'],
      pages: [
        'src/app/(app)/contracts/page.tsx',
        'src/app/(app)/contracts/[id]/page.tsx',
        'src/app/(app)/contracts/new/page.tsx',
        'src/app/(app)/contracts/[id]/edit/page.tsx',
      ],
      api: [
        'src/app/api/v1/contracts/route.ts',
        'src/app/api/v1/contracts/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete contract lifecycle management',
    ],
    customizations: [
      'Contract status workflow (draft → active → completed)',
      'Party relationships (companies, contacts, projects)',
      'Financial terms (value, currency, payment schedules)',
      'Legal compliance and signature tracking',
      'Document attachments and version control',
      'Expiration and renewal management',
      'Contract templates and clauses',
      'Audit trails and change history',
    ],
  },

  {
    name: 'CrewCall',
    status: 'not-started',
    existingFiles: {
      components: [],
      hooks: [],
      types: [],
      pages: ['src/app/(app)/people/crew-calls/page.tsx'],
      api: [
        'src/app/api/v1/crew-calls/route.ts',
        'src/app/api/v1/crew-calls/[id]/route.ts',
      ],
    },
    notes: ['Crew call scheduling'],
    customizations: ['Crew scheduling workflows'],
  },

  {
    name: 'Deal',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/deal.schema.ts'],
      pages: [
        'src/app/(app)/deals/page.tsx',
        'src/app/(app)/deals/[id]/page.tsx',
        'src/app/(app)/deals/new/page.tsx',
        'src/app/(app)/deals/[id]/edit/page.tsx',
      ],
      api: [
        'src/app/api/v1/deals/route.ts',
        'src/app/api/v1/deals/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete sales pipeline and deal management',
    ],
    customizations: [
      'Deal pipeline stages (prospect → qualified → proposal → negotiation → closed)',
      'Probability and forecasting calculations',
      'Company and contact relationships',
      'Deal value and currency management',
      'Expected close date tracking',
      'Win/loss analysis and reasons',
      'Deal team assignments and collaboration',
      'Product/service line items',
      'Competitor tracking and objections',
      'Sales cycle analytics and reporting',
    ],
  },

  {
    name: 'Department',
    status: 'not-started',
    existingFiles: {
      components: [],
      hooks: [],
      types: [],
      pages: ['src/app/(app)/people/departments/page.tsx'],
      api: [
        'src/app/api/v1/departments/route.ts',
        'src/app/api/v1/departments/[id]/route.ts',
      ],
    },
    notes: ['Department management'],
    customizations: [],
  },

  {
    name: 'Expense',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/expense.schema.ts'],
      pages: [
        'src/app/(app)/business/expenses/page.tsx',
      ],
      api: [
        'src/app/api/v1/expenses/route.ts',
        'src/app/api/v1/expenses/[id]/route.ts',
      ],
    },
    notes: [
      '✅ Fully migrated to schema-driven architecture',
      '✅ Uses CrudList, CrudDetail, CrudForm components',
      '✅ Schema defines all UI configuration (SSOT)',
      '✅ Live Supabase data integration',
      '✅ Semantic design tokens from schema',
      '✅ 3NF architecture (computed fields, relationships)',
      '✅ Complete expense approval workflow',
    ],
    customizations: [
      'Expense approval workflow (draft → submitted → approved → reimbursed)',
      'Receipt attachment and document management',
      'Multi-entity expense assignment (projects, events, categories)',
      'Tax calculation and currency support',
      'Billable vs reimbursable expense tracking',
      'Approval hierarchy and rejection workflow',
      'Bulk operations and expense reporting',
      'Payment method tracking and vendor management',
    ],
  },

  {
    name: 'GuestList',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/guestlist.schema.ts'],
      pages: [
        'src/app/(app)/guest-lists/page.tsx',
      ],
      api: [
        'src/app/api/v1/guest-lists/route.ts',
        'src/app/api/v1/guest-lists/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete event guest list management with capacity tracking',
    ],
    customizations: [
      'Event guest list lifecycle (draft → open → closed)',
      'Capacity management with confirmed and waitlist tracking',
      'Event relationship management',
      'RSVP status tracking and guest management',
      'Venue integration and event scheduling',
      'Guest communication and invitation management',
      'Waitlist management and priority handling',
      'Analytics and reporting on guest engagement',
      'Integration with ticketing and payment systems',
      'Automated reminders and follow-ups',
    ],
  },

  {
    name: 'Invoice',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/invoice.schema.ts'],
      pages: [
        'src/app/(app)/business/invoices/page.tsx',
      ],
      api: [
        'src/app/api/v1/invoices/route.ts',
        'src/app/api/v1/invoices/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete invoice lifecycle management',
    ],
    customizations: [
      'Invoice status workflow (draft → sent → paid → overdue)',
      'Multi-currency support and tax calculations',
      'Line item management with pricing and discounts',
      'Client relationship tracking and company associations',
      'Payment tracking and reconciliation',
      'Due date management and overdue alerts',
      'Invoice templates and recurring invoices',
      'Integration with accounting systems',
      'Automated reminders and follow-ups',
      'Financial reporting and analytics',
    ],
  },

  {
    name: 'Location',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/location.schema.ts'],
      pages: [
        'src/app/(app)/locations/page.tsx',
      ],
      api: [
        'src/app/api/v1/locations/route.ts',
        'src/app/api/v1/locations/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete geographic location management with coordinates',
    ],
    customizations: [
      'Geographic location management with latitude/longitude',
      'Address validation and formatting',
      'Location type classification (venue, office, warehouse, etc.)',
      'Multi-country and international address support',
      'Integration with mapping services (Google Maps, etc.)',
      'Location-based search and filtering',
      'Geographic analytics and reporting',
      'Venue capacity and facility information',
      'Location status management (active/inactive)',
      'Bulk location operations and management',
    ],
  },

  {
    name: 'Campaign',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/campaign.schema.ts'],
      pages: [
        'src/app/(app)/content/campaigns/page.tsx',
      ],
      api: [
        'src/app/api/v1/campaigns/route.ts',
        'src/app/api/v1/campaigns/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete marketing campaign management',
    ],
    customizations: [
      'Multi-channel campaign management (email, social, paid ads)',
      'Campaign performance analytics and ROI tracking',
      'A/B testing and campaign optimization',
      'Audience segmentation and targeting',
      'Content calendar integration',
      'Budget allocation and spend tracking',
      'Conversion funnel analysis',
      'Cross-platform campaign coordination',
      'Automated campaign workflows',
      'Post-campaign reporting and insights',
    ],
  },

  {
    name: 'Media',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/media.schema.ts'],
      pages: [
        'src/app/(app)/media/page.tsx',
      ],
      api: [
        'src/app/api/v1/media/route.ts',
        'src/app/api/v1/media/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete digital asset management with file handling',
    ],
    customizations: [
      'Multi-format media support (images, videos, audio, documents)',
      'File upload and storage management',
      'Media metadata and tagging system',
      'Thumbnail generation and preview',
      'File size and format validation',
      'Media library organization and search',
      'Bulk media operations and management',
      'Integration with cloud storage services',
      'Media analytics and usage tracking',
      'Content moderation and approval workflows',
      'Media versioning and history tracking',
      'Access control and permissions',
    ],
  },

  {
    name: 'Milestone',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/milestone.schema.ts'],
      pages: [
        'src/app/(app)/milestones/page.tsx',
      ],
      api: [
        'src/app/api/v1/milestones/route.ts',
        'src/app/api/v1/milestones/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete project milestone tracking and management',
    ],
    customizations: [
      'Milestone lifecycle management (planned → in-progress → completed)',
      'Progress tracking and completion percentage',
      'Priority levels and due date management',
      'Project relationship and dependency tracking',
      'Assignee management and team collaboration',
      'Milestone status workflows and transitions',
      'Overdue milestone identification and alerts',
      'Milestone cloning and template functionality',
      'Integration with project management workflows',
      'Milestone analytics and reporting',
      'Gantt chart and timeline visualization',
      'Milestone approval and sign-off processes',
      'Automated milestone notifications and reminders',
    ],
  },

  {
    name: 'Organization',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: ['src/hooks/use-organization.ts'],
      types: ['src/schemas/organization.schema.ts'],
      pages: [
        'src/app/(app)/organizations/page.tsx',
      ],
      api: [
        'src/app/api/v1/organizations/route.ts',
        'src/app/api/v1/organizations/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete organizational entity management',
    ],
    customizations: [
      'Multi-type organization support (company, non-profit, government, educational)',
      'Industry classification and business information',
      'Hierarchical organization structures (parent/child relationships)',
      'Geographic location management with international support',
      'Employee count and revenue tracking',
      'Organization lifecycle management (prospect → active → inactive)',
      'Contact information and communication details',
      'Organization website and external link management',
      'Business metrics and analytics integration',
      'Organization tagging and categorization',
      'Multi-entity relationships (contacts, projects, deals)',
      'Organization approval and verification workflows',
      'Bulk organization operations and management',
    ],
  },

  {
    name: 'Proposal',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/proposal.schema.ts'],
      pages: [
        'src/app/(app)/proposals/page.tsx',
      ],
      api: [
        'src/app/api/v1/proposals/route.ts',
        'src/app/api/v1/proposals/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete proposal lifecycle management',
    ],
    customizations: [
      'Proposal status workflow (draft → sent → accepted/rejected/expired)',
      'Client relationship tracking with company associations',
      'Proposal numbering and versioning',
      'Financial proposal amounts and currency support',
      'Validity period management with expiration tracking',
      'Proposal assignment and team collaboration',
      'Project and organization relationship management',
      'Proposal terms and conditions management',
      'PDF generation and document management',
      'Proposal analytics and win rate tracking',
      'Automated proposal reminders and follow-ups',
      'Proposal templates and cloning functionality',
      'Integration with CRM and sales workflows',
      'Bulk proposal operations and management',
      'Proposal approval and review processes',
    ],
  },

  {
    name: 'PurchaseOrder',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/purchaseorder.schema.ts'],
      pages: [
        'src/app/(app)/purchase-orders/page.tsx',
      ],
      api: [
        'src/app/api/v1/purchase-orders/route.ts',
        'src/app/api/v1/purchase-orders/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete purchase order lifecycle management',
    ],
    customizations: [
      'Purchase order status workflow (draft → approved → ordered → received)',
      'Vendor relationship management with company tracking',
      'Purchase order numbering and approval processes',
      'Delivery date tracking and overdue management',
      'Project and organization relationship management',
      'Requestor and approver assignment tracking',
      'Line item management and procurement details',
      'Receipt tracking and goods receipt processing',
      'Financial tracking and budget integration',
      'Vendor performance and delivery analytics',
      'Purchase order templates and cloning',
      'Integration with inventory and accounting systems',
      'Automated approval workflows and notifications',
      'Bulk purchase order operations and management',
      'Supplier communication and follow-up tracking',
    ],
  },

  {
    name: 'People',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/people.schema.ts'],
      pages: [
        'src/app/(app)/people/page.tsx',
        'src/app/(app)/people/[id]/page.tsx',
        'src/app/(app)/people/new/page.tsx',
        'src/app/(app)/people/[id]/edit/page.tsx',
      ],
      api: [
        'src/app/api/v1/users/route.ts',
        'src/app/api/v1/users/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'User authentication and profile management',
    ],
    customizations: [
      'User authentication and authorization',
      'Profile management and avatar uploads',
      'Role-based access control',
      'Multi-organization support',
      'Timezone and locale settings',
      'Activity tracking and audit logs',
      'Team assignments and crew management',
    ],
  },

  {
    name: 'Runsheet',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/runsheet.schema.ts'],
      pages: [
        'src/app/(app)/runsheets/page.tsx',
      ],
      api: [
        'src/app/api/v1/runsheets/route.ts',
        'src/app/api/v1/runsheets/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete production runsheet management',
    ],
    customizations: [
      'Production runsheet lifecycle management (draft → confirmed → in-progress → completed)',
      'Event scheduling with load-in, sound check, show, and load-out times',
      'Venue and production manager assignment',
      'Crew and equipment resource tracking',
      'Project and event relationship management',
      'Production timeline and scheduling management',
      'Runsheet template creation and cloning',
      'Integration with event management systems',
      'Crew call and assignment management',
      'Equipment checklist and inventory tracking',
      'Production notes and documentation',
      'Automated production workflow notifications',
      'Runsheet analytics and performance tracking',
      'Bulk operations for production management',
      'Export functionality for production teams',
    ],
  },

  {
    name: 'Budget',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/budget.schema.ts'],
      pages: [
        'src/app/(app)/business/budgets/page.tsx',
      ],
      api: [
        'src/app/api/v1/budgets/route.ts',
        'src/app/api/v1/budgets/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete financial budget management',
    ],
    customizations: [
      'Multi-level budget hierarchies (project → category → line item)',
      'Budget vs actual tracking with variance analysis',
      'Committed vs spent spending phases',
      'Budget approval workflows and thresholds',
      'Cost center and department allocations',
      'Currency and exchange rate handling',
      'Budget forecasting and projections',
      'Integration with procurement and expense systems',
      'Budget alerts and notifications',
      'Historical budget performance analytics',
    ],
  },

  {
    name: 'Talent',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/talent.schema.ts'],
      pages: [
        'src/app/(app)/people/talent/page.tsx',
      ],
      api: [
        'src/app/api/v1/talent/route.ts',
        'src/app/api/v1/talent/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete talent management with booking and agent tracking',
    ],
    customizations: [
      'Talent type classification (musician, performer, speaker, artist)',
      'Genre and booking status management',
      'Agent relationship tracking and contact information',
      'Social media and website integration',
      'Booking rate and financial management',
      'Availability status and booking workflow',
      'Talent search and filtering capabilities',
      'Bulk talent operations and management',
      'Talent profile customization and notes',
      'Integration with booking and event systems',
      'Talent performance analytics and reporting',
      'Multi-entity relationships (events, projects)',
      'Talent approval and verification workflows',
    ],
  },

  {
    name: 'Ticket',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/ticket.schema.ts'],
      pages: [
        'src/app/(app)/tickets/page.tsx',
      ],
      api: [
        'src/app/api/v1/tickets/route.ts',
        'src/app/api/v1/tickets/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete support ticket management with workflow tracking',
    ],
    customizations: [
      'Ticket status workflow (open → in-progress → resolved → closed)',
      'Priority levels and categorization system',
      'Assignment and ownership tracking',
      'Comment system and activity logging',
      'SLA and response time management',
      'Ticket escalation and routing',
      'Customer communication integration',
      'Knowledge base and solution linking',
      'Ticket analytics and reporting',
      'Bulk ticket operations and management',
      'Ticket templates and automation',
      'Integration with help desk systems',
      'Customer satisfaction tracking',
      'Multi-channel ticket creation (email, web, API)',
    ],
  },

  {
    name: 'Timesheet',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/timesheet.schema.ts'],
      pages: [
        'src/app/(app)/people/timesheets/page.tsx',
        'src/app/(app)/work/calendar/resources/page.tsx',
      ],
      api: [
        'src/app/api/v1/timesheets/route.ts',
        'src/app/api/v1/timesheets/[id]/route.ts',
      ],
    },
    notes: [
      'Fully migrated to schema-driven architecture',
      'Uses CrudList, CrudDetail, CrudForm components',
      'Schema defines all UI configuration (SSOT)',
      'Live Supabase data integration',
      'Semantic design tokens from schema',
      '3NF architecture (computed fields, relationships)',
      'Complete time tracking and payroll management',
    ],
    customizations: [
      'Weekly timesheet management with approval workflows',
      'Regular and overtime hour tracking',
      'Project-based time allocation and reporting',
      'Timesheet status workflow (draft → submitted → approved → paid)',
      'Employee self-service time entry',
      'Manager approval and rejection workflows',
      'Payroll integration and hour calculations',
      'Time tracking analytics and reporting',
      'Bulk timesheet operations and management',
      'Timesheet templates and duplication',
      'Integration with project management',
      'Compliance and labor law tracking',
      'Mobile time entry and approval',
      'Automated reminders and notifications',
      'Timesheet audit trails and history',
    ],
  },

  {
    name: 'Venue',
    status: 'complete',
    existingFiles: {
      components: [],
      hooks: [],
      types: ['src/schemas/venue.schema.ts'],
      pages: [
        'src/app/(app)/venues/page.tsx',
        'src/app/(app)/venues/[id]/page.tsx',
        'src/app/(app)/venues/new/page.tsx',
        'src/app/(app)/venues/[id]/edit/page.tsx',
      ],
      api: [
        'src/app/api/v1/venues/route.ts',
        'src/app/api/v1/venues/[id]/route.ts',
      ],
    },
    notes: [
      '✅ Fully migrated to schema-driven architecture',
      '✅ Uses CrudList, CrudDetail, CrudForm components',
      '✅ Schema defines all UI configuration (SSOT)',
      '✅ Live Supabase data integration',
      '✅ Semantic design tokens from schema',
      '✅ 3NF architecture (computed fields, relationships)',
      '✅ Complete venue management with geolocation',
    ],
    customizations: [
      'Venue type classification (theater, arena, stadium, etc.)',
      'Geographic location management with coordinates',
      'Capacity and facility information',
      'Technical specifications and amenities',
      'Partner venue relationships',
      'Event venue assignments and scheduling',
      'Multi-entity relationships (events, assets)',
      'Gallery and media management',
      'Operational information (house rules, parking, load-in)',
      'Map view and location-based features',
    ],
  },

  {
    name: 'Workflow',
    status: 'not-started',
    existingFiles: {
      components: [],
      hooks: [],
      types: [],
      pages: [
        'src/app/(app)/work/workflows/page.tsx',
        'src/app/(app)/work/workflows/active/page.tsx',
        'src/app/(app)/work/workflows/builder/page.tsx',
        'src/app/(app)/work/workflows/drafts/page.tsx',
        'src/app/(app)/work/workflows/runs/page.tsx',
        'src/app/(app)/work/workflows/templates/page.tsx',
      ],
      api: ['src/app/api/v1/workflows/route.ts'],
    },
    notes: [
      'Workflow automation system',
      'Builder, drafts, runs, templates',
      'Complex workflow management',
    ],
    customizations: [
      'Visual workflow builder',
      'Workflow execution engine',
      'Template system',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SPECIAL ENTITIES (non-CRUD)
  // ═══════════════════════════════════════════════════════════════

  {
    name: 'Notification',
    status: 'not-started',
    existingFiles: {
      components: [],
      hooks: ['src/hooks/use-notifications.ts'],
      types: [],
      pages: [
        'src/app/(app)/work/notifications/page.tsx',
        'src/app/(app)/work/notification-rules/page.tsx',
      ],
      api: ['src/app/api/v1/notifications/route.ts'],
    },
    notes: ['Notification system with rules'],
    customizations: ['Notification rules engine'],
  },

  {
    name: 'Inbox',
    status: 'not-started',
    existingFiles: {
      components: [],
      hooks: ['src/hooks/use-inbox.ts'],
      types: [],
      pages: [],
      api: ['src/app/api/v1/inbox/route.ts'],
    },
    notes: ['Inbox/message management'],
    customizations: [],
  },

  {
    name: 'AuditLog',
    status: 'not-started',
    existingFiles: {
      components: [],
      hooks: ['src/hooks/use-audit-logs.ts'],
      types: [],
      pages: [],
      api: [], // Need to identify
    },
    notes: ['Audit logging system'],
    customizations: [],
  },
];

export type EntityName = typeof entityRegistry[number]['name'];
