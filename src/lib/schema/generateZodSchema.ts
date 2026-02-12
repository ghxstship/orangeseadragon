import { z, ZodTypeAny } from 'zod';
import { FieldDefinition } from './types';

/**
 * GENERATE ZOD SCHEMA FROM ENTITY FIELD DEFINITIONS
 *
 * Converts schema field definitions into a Zod validation schema.
 * Supports: text, textarea, number, currency, percentage, email, url,
 * phone, date, datetime, select, multiselect, checkbox, switch,
 * relation, json, image, file.
 */
export function generateZodSchema(
  fields: Record<string, FieldDefinition>,
  formFields: string[],
  mode: 'create' | 'edit' = 'create'
): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {};

  for (const fieldKey of formFields) {
    const field = fields[fieldKey];
    if (!field) continue;

    let fieldSchema = buildFieldZod(field, mode);

    // Apply required/optional
    if (field.required && mode === 'create') {
      // Already required by default from buildFieldZod
    } else {
      fieldSchema = fieldSchema.optional();
    }

    shape[fieldKey] = fieldSchema;
  }

  return z.object(shape);
}

function buildFieldZod(field: FieldDefinition, _mode: 'create' | 'edit'): ZodTypeAny {
  const v = field.validation;

  switch (field.type) {
    case 'text':
    case 'phone': {
      let s = z.string();
      if (field.required) s = s.min(1, `${field.label} is required`);
      if (v?.minLength ?? field.minLength) s = s.min((v?.minLength ?? field.minLength)!, `${field.label} must be at least ${v?.minLength ?? field.minLength} characters`);
      if (v?.maxLength ?? field.maxLength) s = s.max((v?.maxLength ?? field.maxLength)!, `${field.label} must be at most ${v?.maxLength ?? field.maxLength} characters`);
      if (v?.pattern ?? field.pattern) {
        const pat = v?.pattern ?? field.pattern;
        const regex = typeof pat === 'string' ? new RegExp(pat) : pat!;
        s = s.regex(regex, `${field.label} format is invalid`);
      }
      return s;
    }

    case 'textarea': {
      let s = z.string();
      if (field.required) s = s.min(1, `${field.label} is required`);
      if (v?.maxLength ?? field.maxLength) s = s.max((v?.maxLength ?? field.maxLength)!, `${field.label} is too long`);
      return s;
    }

    case 'email': {
      let s = z.string();
      if (field.required) s = s.min(1, `${field.label} is required`);
      s = s.email(`${field.label} must be a valid email`);
      return s;
    }

    case 'url': {
      let s = z.string();
      if (field.required) s = s.min(1, `${field.label} is required`);
      s = s.url(`${field.label} must be a valid URL`);
      return s;
    }

    case 'number':
    case 'currency':
    case 'percentage': {
      let n = z.coerce.number();
      const min = v?.min ?? field.min;
      const max = v?.max ?? field.max;
      if (min !== undefined) n = n.min(min, `${field.label} must be at least ${min}`);
      if (max !== undefined) n = n.max(max, `${field.label} must be at most ${max}`);
      return n;
    }

    case 'date':
    case 'datetime': {
      // Accept string (ISO) or Date
      const s = z.string();
      if (field.required) return s.min(1, `${field.label} is required`);
      return s;
    }

    case 'select':
    case 'relation': {
      const s = z.string();
      if (field.required) return s.min(1, `${field.label} is required`);
      return s;
    }

    case 'multiselect': {
      const a = z.array(z.string());
      if (field.required) return a.min(1, `${field.label} requires at least one selection`);
      return a;
    }

    case 'checkbox':
    case 'switch': {
      return z.boolean();
    }

    case 'json': {
      return z.any();
    }

    case 'image':
    case 'file': {
      return z.any();
    }

    default: {
      // Fallback: accept any string
      return z.string().optional() as ZodTypeAny;
    }
  }
}

/**
 * Extract form field keys from schema form sections.
 * Handles both string fields and FieldGroupDefinition objects.
 */
export function extractFormFieldKeys(
  sections: Array<{ fields: (string | { fields?: string[] })[]; condition?: (data: Record<string, unknown>) => boolean }>
): string[] {
  const keys: string[] = [];
  for (const section of sections) {
    for (const field of section.fields) {
      if (typeof field === 'string') {
        keys.push(field);
      } else if (field && typeof field === 'object' && Array.isArray(field.fields)) {
        keys.push(...field.fields);
      }
    }
  }
  return keys;
}
