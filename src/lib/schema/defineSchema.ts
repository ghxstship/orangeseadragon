import type { EntitySchema, EntityRecord } from './types';

/**
 * Schema definition helper with defaults and validation.
 */
export function defineSchema<T = EntityRecord>(config: EntitySchema<T>): EntitySchema<T> {
  // Apply defaults
  const schema: EntitySchema<T> = {
    ...config,

    data: {
      primaryKey: 'id',
      timestamps: {
        created: 'createdAt',
        updated: 'updatedAt',
      },
      ...config.data,
    },

    search: {
      ...{
        enabled: true,
        minLength: 2,
        debounce: 300,
      },
      ...config.search,
    },

    filters: {
      allowSave: true,
      ...config.filters,
    },

    layouts: {
      ...config.layouts,
      list: {
        ...{
          pageSize: 25,
          pageSizeOptions: [10, 25, 50, 100],
        },
        ...config.layouts.list,
      },
    },

    permissions: {
      create: true,
      read: true,
      update: true,
      delete: true,
      ...config.permissions,
    },
  };

  // Validate schema
  validateSchema(schema);

  return schema;
}

function validateSchema<T = EntityRecord>(schema: EntitySchema<T>): void {
  // Ensure SSOT compliance
  const errors: string[] = [];

  // Check that all form section fields exist in data.fields
  schema.layouts.form.sections.forEach(section => {
    section.fields.forEach(field => {
      const fieldName = typeof field === 'string' ? field : field.fields[0];
      if (!schema.data.fields[fieldName] && !schema.data.computed?.[fieldName]) {
        errors.push(`Form section "${section.key}" references undefined field "${fieldName}"`);
      }
    });
  });

  // Check that all table columns exist in data.fields
  if (schema.views.table) {
    schema.views.table.columns.forEach(col => {
      const fieldName = typeof col === 'string' ? col : col.field;
      if (!schema.data.fields[fieldName] && !schema.data.computed?.[fieldName]) {
        errors.push(`Table view references undefined column "${fieldName}"`);
      }
    });
  }

  // Check subpage queries reference valid fields
  schema.layouts.list.subpages.forEach(subpage => {
    if (subpage.query.where) {
      Object.keys(subpage.query.where).forEach(field => {
        // Handle dot-notation for relation fields (e.g., 'status.code' -> 'status_id')
        const baseField = field.includes('.') ? field.split('.')[0] + '_id' : field;
        if (!schema.data.fields[field] && !schema.data.fields[baseField] && field !== 'archived' && !field.startsWith('$')) {
          errors.push(`Subpage "${subpage.key}" query references undefined field "${field}"`);
        }
      });
    }
  });

  if (errors.length > 0) {
    console.error('Schema validation errors:', errors);
    throw new Error(`Schema "${schema.identity.name}" has ${errors.length} validation errors`);
  }
}
