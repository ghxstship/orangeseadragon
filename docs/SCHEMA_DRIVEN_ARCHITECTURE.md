# ═══════════════════════════════════════════════════════════════════════════════
# SCHEMA-DRIVEN ARCHITECTURE - TECHNICAL DOCUMENTATION
# ═══════════════════════════════════════════════════════════════════════════════
#
# This document provides comprehensive technical guidance for the new
# schema-driven CRUD system that powers the entire application.
#
# ═══════════════════════════════════════════════════════════════════════════════

## OVERVIEW

The application has been migrated from entity-specific components to a **schema-driven architecture** that provides:

- **80%+ code reduction** through generic, reusable components
- **Single-source-of-truth** configuration via schema files
- **Type-safe development** with full TypeScript support
- **Instant new entity setup** (just create schema, pages auto-work)
- **Consistent UI/UX** across all business domains

## ARCHITECTURE PRINCIPLES

### 1. SINGLE SOURCE OF TRUTH (SSOT)
```typescript
// ❌ VIOLATION: Defining column headers in multiple places
const columns = [
  { key: 'name', label: 'Project Name' },
  { key: 'status', label: 'Status' }
];

// ✅ CORRECT: Schema defines once, all views read from schema
schema.fields.name.label // Used by tables, forms, cards, etc.
```

### 2. THIRD NORMAL FORM (3NF)
```typescript
// ❌ VIOLATION: Storing computed data
project: {
  taskCount: 5,  // Stored in database
  totalBudget: 10000
}

// ✅ CORRECT: Computed at runtime
schema.computed.taskCount = {
  computation: { type: 'relation-count', entity: 'tasks', foreignKey: 'projectId' }
}
```

### 3. ZERO PER-ENTITY COMPONENTS
```typescript
// ❌ VIOLATION: Entity-specific components
export function ProjectTable() { /* project-specific logic */ }

// ✅ CORRECT: Generic components with schema props
export function CrudList({ schema }: CrudListProps) {
  return <DataTable schema={schema} />;
}
```

## SCHEMA SYSTEM

### Schema Structure
```typescript
interface EntitySchema {
  identity: {
    name: string;           // "Project"
    namePlural: string;     // "Projects"
    slug: string;          // "projects"
    icon: string;          // "folder"
    color?: string;        // "blue"
    description?: string;
  };

  data: {
    endpoint: string;      // "/api/v1/projects"
    fields: Record<string, FieldDefinition>;
    computed?: Record<string, ComputedFieldDefinition>;
  };

  relationships: {
    belongsTo?: RelationshipDefinition[];
    hasMany?: RelationshipDefinition[];
    manyToMany?: RelationshipDefinition[];
  };

  display: {
    title: string | ((record) => string);
    subtitle?: string | ((record) => string);
    badge?: (record) => { label: string; variant: string };
    defaultSort: { field: string; direction: 'asc' | 'desc' };
  };

  search: {
    enabled: boolean;
    fields: string[];
    placeholder: string;
  };

  filters: {
    quick: QuickFilterDefinition[];
    advanced: string[];
  };

  layouts: {
    list: ListLayoutConfig;
    detail: DetailLayoutConfig;
    form: FormLayoutConfig;
  };

  views: {
    table?: TableViewConfig;
    kanban?: KanbanViewConfig;
    calendar?: CalendarViewConfig;
    // ... other view configs
  };

  actions: {
    row: ActionDefinition[];
    bulk: ActionDefinition[];
    global: ActionDefinition[];
  };

  permissions: {
    create?: boolean | ((user) => boolean);
    update?: boolean | ((user, record) => boolean);
    delete?: boolean | ((user, record) => boolean);
  };

  hooks?: {
    beforeCreate?: (data) => Partial<T> | Promise<Partial<T>>;
    afterCreate?: (record) => void | Promise<void>;
    beforeUpdate?: (id, data, existing) => Partial<T> | Promise<Partial<T>>;
    afterUpdate?: (record, changes) => void | Promise<void>;
    beforeDelete?: (id, record) => boolean | Promise<boolean>;
    afterDelete?: (id) => void | Promise<void>;
  };

  validate?: (data, mode) => Record<string, string> | undefined;

  export?: {
    enabled: boolean;
    formats: ('csv' | 'xlsx' | 'pdf' | 'json')[];
    fields?: string[];
  };

  import?: {
    enabled: boolean;
    formats: ('csv' | 'xlsx' | 'json')[];
    templateUrl?: string;
  };
}
```

### Field Definitions
```typescript
interface FieldDefinition {
  type: FieldType;                    // 'text', 'select', 'relation', etc.
  label: string;                      // Display label
  required?: boolean;                 // Required field
  inTable?: boolean;                  // Show in table view
  inForm?: boolean;                   // Show in create/edit forms
  inDetail?: boolean;                 // Show in detail view
  searchable?: boolean;               // Include in search
  sortable?: boolean;                 // Allow sorting

  // Type-specific configuration
  options?: FieldOption[];           // For select/multiselect
  relation?: RelationConfig;         // For relation fields
  validation?: FieldValidation;      // Custom validation rules

  // Display formatting
  format?: (value, record) => string | ReactNode;

  // Custom rendering (escape hatch)
  renderField?: (props: FieldRenderProps) => ReactNode;
}
```

## CREATING A NEW ENTITY

### Step 1: Create Schema File
```typescript
// /schemas/myEntity.schema.ts
import { defineSchema } from '@/lib/schema';

export const myEntitySchema = defineSchema({
  identity: {
    name: 'My Entity',
    namePlural: 'My Entities',
    slug: 'my-entities',
    icon: 'box',
    description: 'Manage my custom entities',
  },

  data: {
    endpoint: '/api/v1/my-entities',
    fields: {
      id: {
        type: 'text',
        label: 'ID',
        inTable: false,
        inForm: false,
      },
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
        validation: { required: true, minLength: 1, maxLength: 255 },
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        options: [
          { label: 'Active', value: 'active', color: 'green' },
          { label: 'Inactive', value: 'inactive', color: 'gray' },
        ],
        default: 'active',
      },
      createdAt: {
        type: 'datetime',
        label: 'Created',
        inTable: true,
        inForm: false,
        sortable: true,
      },
    },
  },

  display: {
    title: 'name',
    subtitle: (record) => `${record.status}`,
    badge: (record) => ({
      label: record.status,
      variant: record.status === 'active' ? 'default' : 'secondary'
    }),
    defaultSort: { field: 'createdAt', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search entities...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'inactive', label: 'Inactive', query: { where: { status: 'inactive' } } },
    ],
    advanced: ['status', 'createdAt'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Entities', query: {} },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      ],
      defaultView: 'table',
    },

    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
    },

    form: {
      sections: [
        { key: 'basic', title: 'Basic Information', fields: ['name', 'status'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['name', 'status', 'createdAt'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r) => `/my-entities/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r) => `/my-entities/${r.id}/edit` } },
    ],
    bulk: [
      { key: 'delete', label: 'Delete', confirm: { title: 'Delete', message: 'Are you sure?' } },
    ],
    global: [
      { key: 'create', label: 'Add Entity', variant: 'primary', handler: { type: 'navigate', path: '/my-entities/new' } },
    ],
  },

  permissions: {
    create: true,
    update: true,
    delete: true,
  },

  validate: (data, mode) => {
    const errors: Record<string, string> = {};
    if (!data.name?.trim()) errors.name = 'Name is required';
    return Object.keys(errors).length ? errors : undefined;
  },
});
```

### Step 2: Create Page Files
```typescript
// /src/app/(app)/my-entities/page.tsx
"use client";
import { CrudList } from '@/lib/crud';
import { myEntitySchema } from '@/schemas/myEntity.schema';

export default function MyEntitiesPage() {
  return <CrudList schema={myEntitySchema} />;
}

// /src/app/(app)/my-entities/[id]/page.tsx
"use client";
import { CrudDetail } from '@/lib/crud';
import { myEntitySchema } from '@/schemas/myEntity.schema';

export default function MyEntityDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={myEntitySchema} id={params.id} />;
}

// /src/app/(app)/my-entities/new/page.tsx
"use client";
import { CrudForm } from '@/lib/crud';
import { myEntitySchema } from '@/schemas/myEntity.schema';

export default function NewMyEntityPage() {
  return <CrudForm schema={myEntitySchema} mode="create" />;
}

// /src/app/(app)/my-entities/[id]/edit/page.tsx
"use client";
import { CrudForm } from '@/lib/crud';
import { myEntitySchema } from '@/schemas/myEntity.schema';

export default function EditMyEntityPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={myEntitySchema} mode="edit" id={params.id} />;
}
```

### Step 3: Create API Routes
```typescript
// /src/app/api/v1/my-entities/route.ts
import { createApiRoute } from '@/lib/api/createApiRoute';
import { myEntitySchema } from '@/schemas/myEntity.schema';

export const { GET, POST } = createApiRoute(myEntitySchema);

// /src/app/api/v1/my-entities/[id]/route.ts
import { createApiRoute } from '@/lib/api/createApiRoute';
import { myEntitySchema } from '@/schemas/myEntity.schema';

export const { GET, PUT, DELETE } = createApiRoute(myEntitySchema);
```

### Step 4: Create Database Migration
```sql
-- supabase/migrations/XXXX_my_entity.sql
CREATE TABLE my_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_my_entities_organization ON my_entities(organization_id);
CREATE INDEX idx_my_entities_status ON my_entities(status);
```

## CRUD COMPONENT USAGE

### CrudList Component
```typescript
interface CrudListProps {
  schema: EntitySchema;
  initialSubpage?: string;
  initialFilters?: Record<string, any>;
  initialSearch?: string;
}

// Renders complete list page with:
// - Subpage navigation tabs
// - Search bar (if enabled)
// - Quick/advanced filters
// - Table/kanban/calendar view
// - Bulk actions toolbar
// - Pagination controls
```

### CrudDetail Component
```typescript
interface CrudDetailProps {
  schema: EntitySchema;
  id: string;
  initialTab?: string;
}

// Renders complete detail page with:
// - Breadcrumb navigation
// - Tabbed content layout
// - Overview stats cards
// - Related entity sections
// - Action buttons
// - Sidebar with key info
```

### CrudForm Component
```typescript
interface CrudFormProps {
  schema: EntitySchema;
  mode: 'create' | 'edit';
  id?: string;  // Required for edit mode
}

// Renders complete form page with:
// - Sectioned form layout
// - Dynamic field rendering
// - Validation feedback
// - Auto-save functionality
// - Submit/cancel actions
```

## FIELD COMPONENT TYPES

### Text Fields
```typescript
// Basic text input
{
  type: 'text',
  label: 'Name',
  required: true,
  validation: { minLength: 1, maxLength: 255 }
}

// Textarea for longer content
{
  type: 'textarea',
  label: 'Description',
  validation: { maxLength: 10000 }
}

// Rich text editor
{
  type: 'richtext',
  label: 'Content',
  validation: { required: true }
}
```

### Selection Fields
```typescript
// Single select dropdown
{
  type: 'select',
  label: 'Status',
  options: [
    { label: 'Active', value: 'active', color: 'green' },
    { label: 'Inactive', value: 'inactive', color: 'gray' }
  ],
  default: 'active'
}

// Multi-select with tags
{
  type: 'multiselect',
  label: 'Tags',
  options: ['urgent', 'important', 'low-priority']
}
```

### Date/Time Fields
```typescript
// Date picker
{
  type: 'date',
  label: 'Due Date',
  required: true
}

// DateTime picker
{
  type: 'datetime',
  label: 'Meeting Time',
  required: true
}
```

### Relation Fields
```typescript
// Single relation (belongs to)
{
  type: 'relation',
  label: 'Project',
  relation: {
    entity: 'projects',
    display: 'name',
    searchable: true
  }
}

// Multiple relations (has many)
{
  type: 'relation',
  label: 'Assigned Users',
  relation: {
    entity: 'users',
    display: (user) => `${user.firstName} ${user.lastName}`,
    multiple: true,
    searchable: true
  }
}
```

### Media Fields
```typescript
// File upload
{
  type: 'file',
  label: 'Document',
  validation: { required: true }
}

// Image upload with preview
{
  type: 'image',
  label: 'Profile Picture'
}
```

### Other Field Types
```typescript
// Number input
{
  type: 'number',
  label: 'Quantity',
  validation: { min: 0, max: 1000 }
}

// Currency input
{
  type: 'currency',
  label: 'Budget',
  validation: { min: 0 }
}

// Email input
{
  type: 'email',
  label: 'Contact Email',
  validation: { required: true }
}

// Phone input
{
  type: 'phone',
  label: 'Phone Number'
}

// URL input
{
  type: 'url',
  label: 'Website'
}

// Color picker
{
  type: 'color',
  label: 'Brand Color'
}

// Tags input
{
  type: 'tags',
  label: 'Tags'
}

// Switch/toggle
{
  type: 'switch',
  label: 'Active'
}
```

## VIEW CONFIGURATIONS

### Table View
```typescript
views: {
  table: {
    columns: [
      'name',
      'status',
      'createdAt',
      // Or custom column definitions:
      {
        field: 'priority',
        width: 120,
        align: 'center'
      }
    ],
    features: {
      selection: true,
      multiSelect: true,
      inlineEdit: false,
      rowExpansion: false,
    }
  }
}
```

### Kanban View
```typescript
views: {
  kanban: {
    columnField: 'status',
    columns: [
      { value: 'todo', label: 'To Do', color: 'gray' },
      { value: 'in-progress', label: 'In Progress', color: 'blue' },
      { value: 'done', label: 'Done', color: 'green' }
    ],
    card: {
      title: 'name',
      subtitle: 'assignee',
      fields: ['priority', 'dueDate'],
      badge: 'status'
    },
    features: {
      dragDrop: true,
      quickAdd: true
    }
  }
}
```

### Calendar View
```typescript
views: {
  calendar: {
    startField: 'startDate',
    endField: 'endDate',
    titleField: 'name',
    allDayField: 'allDay',
    colorField: 'category',
    defaultView: 'month',
    features: {
      dragDrop: true,
      resize: true,
      quickAdd: true
    }
  }
}
```

## ACTION DEFINITIONS

### Built-in Actions
```typescript
actions: {
  row: [
    {
      key: 'view',
      label: 'View Details',
      icon: 'eye',
      handler: { type: 'navigate', path: (record) => `/entities/${record.id}` }
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: 'edit',
      condition: (record) => record.status !== 'locked',
      handler: { type: 'navigate', path: (record) => `/entities/${record.id}/edit` }
    },
    {
      key: 'duplicate',
      label: 'Duplicate',
      icon: 'copy',
      handler: {
        type: 'function',
        fn: async (record) => {
          // Custom duplication logic
          const duplicated = await api.duplicate(record.id);
          router.push(`/entities/${duplicated.id}/edit`);
        }
      }
    }
  ]
}
```

### Custom Actions
```typescript
actions: {
  global: [
    {
      key: 'export',
      label: 'Export Data',
      icon: 'download',
      handler: {
        type: 'modal',
        component: 'ExportModal',
        props: { entity: 'projects' }
      }
    },
    {
      key: 'import',
      label: 'Import Data',
      icon: 'upload',
      condition: (user) => user.role === 'admin',
      handler: { type: 'navigate', path: '/entities/import' }
    }
  ],

  bulk: [
    {
      key: 'update-status',
      label: 'Change Status',
      icon: 'refresh-cw',
      confirm: {
        title: 'Change Status',
        message: 'Update status for selected items?',
        confirmLabel: 'Update'
      },
      handler: {
        type: 'function',
        fn: async (records, newStatus) => {
          await api.bulkUpdate(records.map(r => r.id), { status: newStatus });
          toast.success('Status updated');
        }
      }
    }
  ]
}
```

## HOOKS & VALIDATION

### Lifecycle Hooks
```typescript
hooks: {
  beforeCreate: async (data) => ({
    ...data,
    createdBy: currentUser.id,
    slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  }),

  afterCreate: async (record) => {
    await auditLog('create', 'entity', record.id);
    await emailNotifications.send('entity-created', record);
  },

  beforeUpdate: async (id, data, existing) => {
    if (data.status === 'approved' && existing.status !== 'approved') {
      data.approvedAt = new Date().toISOString();
      data.approvedBy = currentUser.id;
    }
    return data;
  },

  beforeDelete: async (id, record) => {
    // Prevent deletion of referenced records
    const references = await api.getReferences(id);
    if (references.length > 0) {
      throw new Error('Cannot delete: record is referenced by other entities');
    }
    return true;
  }
}
```

### Validation Rules
```typescript
validate: (data, mode) => {
  const errors: Record<string, string> = {};

  // Required field validation
  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }

  // Field length validation
  if (data.description && data.description.length > 5000) {
    errors.description = 'Description cannot exceed 5,000 characters';
  }

  // Cross-field validation
  if (data.endDate && data.startDate && data.endDate < data.startDate) {
    errors.endDate = 'End date must be after start date';
  }

  // Business rule validation
  if (mode === 'create' && data.status === 'approved') {
    errors.status = 'New records cannot be created with approved status';
  }

  return Object.keys(errors).length ? errors : undefined;
}
```

## TESTING & DEBUGGING

### Schema Validation
```typescript
// Validate schema structure
import { validateSchema } from '@/lib/schema/validateSchema';

const errors = validateSchema(myEntitySchema);
if (errors.length > 0) {
  console.error('Schema validation errors:', errors);
}
```

### Component Testing
```typescript
// Test CRUD components with schema
import { render, screen } from '@testing-library/react';
import { CrudList } from '@/lib/crud';
import { myEntitySchema } from '@/schemas/myEntity.schema';

test('renders entity list', () => {
  render(<CrudList schema={myEntitySchema} />);
  expect(screen.getByText('My Entities')).toBeInTheDocument();
});
```

### API Testing
```typescript
// Test generated API routes
const response = await fetch('/api/v1/my-entities');
const data = await response.json();
expect(data).toHaveProperty('items');
```

## DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Schema files created and validated
- [ ] Page files created and tested
- [ ] API routes created and tested
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] User permissions configured

### Deployment Steps
1. Run database migrations
2. Deploy application code
3. Verify API endpoints
4. Test CRUD operations
5. Validate user permissions
6. Monitor error logs

### Post-Deployment
- [ ] Performance monitoring enabled
- [ ] Error tracking configured
- [ ] User feedback collection
- [ ] Documentation updated

## TROUBLESHOOTING

### Common Issues

**Schema not loading**
- Check import path in page files
- Verify schema file exists and exports correctly
- Check for TypeScript compilation errors

**API calls failing**
- Verify endpoint URL in schema
- Check API route file exists
- Validate database table and permissions

**Fields not rendering**
- Check field type is supported
- Verify field configuration
- Check for missing field components

**Permissions not working**
- Verify permission functions in schema
- Check user role configuration
- Validate authentication setup

### Debug Tools

**Schema Inspector**
```typescript
import { inspectSchema } from '@/lib/schema/inspectSchema';

const inspection = inspectSchema(myEntitySchema);
console.log('Schema inspection:', inspection);
```

**API Debugger**
```typescript
import { debugApi } from '@/lib/api/debugApi';

const debugInfo = await debugApi('/api/v1/my-entities');
console.log('API debug info:', debugInfo);
```

---

This technical documentation provides the foundation for maintaining and extending the schema-driven architecture. For specific entity implementations, refer to the individual schema files and their inline documentation.
