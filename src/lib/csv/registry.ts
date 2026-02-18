/**
 * CSV Configuration Registry
 *
 * Derives CSV import/export configuration from EntitySchema definitions.
 * No per-model config files needed — everything comes from the schema SSOT.
 */

import { z } from 'zod';
import type { EntitySchema, FieldDefinition, FieldType } from '@/lib/schema-engine/types';

// ============================================================================
// TYPES
// ============================================================================

export interface CsvFieldConfig {
  dbField: string;
  csvHeader: string;
  aliases: string[];
  type: CsvFieldType;
  required: boolean;
  exportable: boolean;
  importable: boolean;
  enumValues?: string[];
  foreignKey?: {
    model: string;
    lookupField: string;
    resolveField: string;
  };
  validation: z.ZodType;
  parseValue: (raw: string) => unknown;
  formatValue: (value: unknown) => string;
  example: string;
  description: string;
  maxLength?: number;
  defaultValue?: unknown;
}

export type CsvFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'url'
  | 'enum'
  | 'currency'
  | 'phone'
  | 'uuid'
  | 'tags'
  | 'json';

export interface CsvModelConfig {
  model: string;
  displayName: string;
  slug: string;
  endpoint: string;
  importEnabled: boolean;
  exportEnabled: boolean;
  maxImportRows: number;
  maxExportRows: number;
  fields: CsvFieldConfig[];
  uniqueFields: string[];
  duplicateStrategy: 'skip' | 'update' | 'error' | 'ask';
}

// ============================================================================
// FIELD TYPE MAPPING
// ============================================================================

const FIELD_TYPE_MAP: Record<FieldType, CsvFieldType> = {
  text: 'string',
  textarea: 'string',
  richtext: 'string',
  code: 'string',
  number: 'number',
  currency: 'currency',
  percentage: 'number',
  email: 'email',
  phone: 'phone',
  url: 'url',
  select: 'enum',
  multiselect: 'tags',
  radio: 'enum',
  checkbox: 'boolean',
  switch: 'boolean',
  date: 'date',
  datetime: 'datetime',
  time: 'string',
  daterange: 'string',
  duration: 'number',
  file: 'string',
  image: 'string',
  avatar: 'string',
  gallery: 'string',
  relation: 'uuid',
  location: 'string',
  address: 'string',
  color: 'string',
  rating: 'number',
  tags: 'tags',
  json: 'json',
  signature: 'string',
  computed: 'string',
  custom: 'string',
};

// Fields that should never be imported (system-managed)
const SYSTEM_FIELDS = new Set([
  'id', 'created_at', 'updated_at', 'createdAt', 'updatedAt',
  'organization_id', 'tenant_id', 'created_by', 'updated_by',
  'deleted_at', 'deletedAt', 'qr_code_url',
]);

// Field types that cannot be imported via CSV
const NON_IMPORTABLE_TYPES = new Set<FieldType>([
  'file', 'image', 'avatar', 'gallery', 'signature', 'computed', 'custom',
  'richtext', 'json', 'code',
]);

// Models that are system-generated (export only, no import)
const EXPORT_ONLY_MODELS = new Set([
  'activityFeed', 'activity', 'assetAuditLog', 'notification',
  'approval', 'workflowRun', 'workflowTrigger', 'reaction',
  'discussionReply', 'challengeSubmission', 'challengeParticipant',
  'challengeMilestone', 'userFollow', 'userPoints', 'userBadge',
  'badge', 'gamification', 'inboxItem', 'clockEntry', 'timePunch',
  'payStub', 'payrollDeduction', 'payrollRate', 'payment',
  'journalEntry', 'creditNote', 'invoiceLineItem', 'budgetLineItem',
  'budgetPhase', 'savedView', 'configuration', 'oauthConnection',
  'webhookEndpoint', 'clientPortalAccess',
]);

// Models that should have no CSV operations at all
const EXCLUDED_MODELS = new Set([
  'calendar', 'board', 'folder', 'stage', 'dashboard',
]);

// ============================================================================
// EXAMPLE VALUES
// ============================================================================

function getExampleValue(type: CsvFieldType, fieldKey: string): string {
  switch (type) {
    case 'string': return 'Example text';
    case 'number': return '42';
    case 'boolean': return 'Yes';
    case 'date': return '2026-01-15';
    case 'datetime': return '2026-01-15 09:00';
    case 'email': return 'user@example.com';
    case 'url': return 'https://example.com';
    case 'phone': return '+1 (555) 123-4567';
    case 'currency': return '1500.00';
    case 'uuid': return '';
    case 'enum': return '';
    case 'tags': return 'tag1, tag2';
    case 'json': return '{}';
  }
  return fieldKey;
}

// ============================================================================
// VALIDATION BUILDERS
// ============================================================================

function buildValidation(type: CsvFieldType, required: boolean, enumValues?: string[]): z.ZodType {
  let schema: z.ZodType;

  switch (type) {
    case 'email':
      schema = z.string().email();
      break;
    case 'url':
      schema = z.string().url();
      break;
    case 'number':
    case 'currency':
      schema = z.coerce.number();
      break;
    case 'boolean':
      schema = z.boolean();
      break;
    case 'date':
    case 'datetime':
      schema = z.string().min(1);
      break;
    case 'enum':
      if (enumValues && enumValues.length > 0) {
        schema = z.enum(enumValues as [string, ...string[]]);
      } else {
        schema = z.string();
      }
      break;
    default:
      schema = z.string();
  }

  if (!required) {
    schema = schema.optional() as z.ZodType;
  }

  return schema;
}

// ============================================================================
// PARSE/FORMAT BUILDERS
// ============================================================================

function buildParseValue(type: CsvFieldType): (raw: string) => unknown {
  switch (type) {
    case 'number':
    case 'currency':
      return (raw: string) => {
        const cleaned = raw.replace(/[$€£¥,\s]/g, '').trim();
        if (!cleaned) return null;
        const num = Number(cleaned);
        return isNaN(num) ? null : num;
      };
    case 'boolean':
      return (raw: string) => {
        const v = raw.trim().toLowerCase();
        return ['yes', 'true', '1', 'y', 'on'].includes(v);
      };
    case 'date':
      return (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        const d = new Date(trimmed);
        return isNaN(d.getTime()) ? trimmed : d.toISOString().split('T')[0];
      };
    case 'datetime':
      return (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        const d = new Date(trimmed);
        return isNaN(d.getTime()) ? trimmed : d.toISOString();
      };
    case 'email':
      return (raw: string) => raw.trim().toLowerCase() || null;
    case 'phone':
      return (raw: string) => raw.replace(/[^\d+\-() ]/g, '').trim() || null;
    case 'tags':
      return (raw: string) => raw.split(/[,;|]/).map(t => t.trim()).filter(Boolean);
    case 'enum':
      return (raw: string) => raw.trim().toLowerCase() || null;
    default:
      return (raw: string) => raw.trim() || null;
  }
}

function buildFormatValue(type: CsvFieldType): (value: unknown) => string {
  switch (type) {
    case 'boolean':
      return (v: unknown) => (v ? 'Yes' : 'No');
    case 'date':
      return (v: unknown) => {
        if (!v) return '';
        const d = new Date(String(v));
        return isNaN(d.getTime()) ? String(v) : d.toISOString().split('T')[0] ?? '';
      };
    case 'datetime':
      return (v: unknown) => {
        if (!v) return '';
        const d = new Date(String(v));
        return isNaN(d.getTime()) ? String(v) : d.toISOString().replace('T', ' ').slice(0, 16);
      };
    case 'number':
      return (v: unknown) => (v != null ? String(v) : '');
    case 'currency':
      return (v: unknown) => (v != null ? String(v) : '');
    case 'tags':
      return (v: unknown) => (Array.isArray(v) ? v.join(', ') : String(v ?? ''));
    default:
      return (v: unknown) => String(v ?? '');
  }
}

// ============================================================================
// ALIAS GENERATION
// ============================================================================

function generateAliases(fieldKey: string, label: string): string[] {
  const aliases: string[] = [];
  const snakeCase = fieldKey.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  const kebabCase = snakeCase.replace(/_/g, '-');
  const words = label.toLowerCase().split(/\s+/);

  if (snakeCase !== fieldKey.toLowerCase()) aliases.push(snakeCase);
  if (kebabCase !== snakeCase) aliases.push(kebabCase);
  if (words.length > 1) aliases.push(words.join('_'), words.join(''));
  aliases.push(fieldKey.toLowerCase());

  return [...new Set(aliases)];
}

// ============================================================================
// SCHEMA → CSV CONFIG DERIVATION
// ============================================================================

export function deriveModelConfig(schema: EntitySchema): CsvModelConfig {
  const modelName = schema.identity.name.toLowerCase().replace(/\s+/g, '');
  const isExportOnly = EXPORT_ONLY_MODELS.has(modelName) || EXPORT_ONLY_MODELS.has(schema.identity.name);

  const schemaImportEnabled = schema.import?.enabled ?? !isExportOnly;
  const schemaExportEnabled = schema.export?.enabled ?? true;

  const fields: CsvFieldConfig[] = [];

  for (const [fieldKey, fieldDef] of Object.entries(schema.data.fields)) {
    if (SYSTEM_FIELDS.has(fieldKey)) continue;

    const csvType = FIELD_TYPE_MAP[fieldDef.type] ?? 'string';
    const isImportable = !NON_IMPORTABLE_TYPES.has(fieldDef.type)
      && !fieldDef.readOnly
      && (fieldDef.inForm !== false);
    const isExportable = fieldDef.inExport !== false
      && fieldDef.type !== 'signature'
      && fieldDef.type !== 'custom';

    const enumValues = extractEnumValues(fieldDef);

    const foreignKey = fieldDef.type === 'relation' && fieldDef.relation
      ? {
          model: fieldDef.relation.entity,
          lookupField: typeof fieldDef.relation.display === 'string' ? fieldDef.relation.display : 'name',
          resolveField: 'id',
        }
      : undefined;

    const csvField: CsvFieldConfig = {
      dbField: fieldKey,
      csvHeader: fieldDef.label,
      aliases: generateAliases(fieldKey, fieldDef.label),
      type: foreignKey ? 'string' : csvType,
      required: fieldDef.required ?? false,
      exportable: isExportable,
      importable: isImportable && schemaImportEnabled,
      enumValues,
      foreignKey,
      validation: buildValidation(csvType, fieldDef.required ?? false, enumValues),
      parseValue: buildParseValue(csvType),
      formatValue: buildFormatValue(csvType),
      example: enumValues?.[0] ?? getExampleValue(csvType, fieldKey),
      description: fieldDef.helpText ?? fieldDef.placeholder ?? fieldDef.label,
      maxLength: fieldDef.maxLength,
      defaultValue: typeof fieldDef.default === 'function' ? undefined : fieldDef.default,
    };

    fields.push(csvField);
  }

  // Determine unique fields from schema
  const uniqueFields: string[] = [];
  for (const [key, def] of Object.entries(schema.data.fields)) {
    if (def.type === 'email' || key === 'email') {
      uniqueFields.push(key);
      break;
    }
  }
  if (uniqueFields.length === 0) {
    // Fall back to name if no email field
    if (schema.data.fields['name']) {
      uniqueFields.push('name');
    }
  }

  return {
    model: schema.identity.name,
    displayName: schema.identity.namePlural,
    slug: schema.identity.slug,
    endpoint: schema.data.endpoint,
    importEnabled: schemaImportEnabled,
    exportEnabled: schemaExportEnabled,
    maxImportRows: 10000,
    maxExportRows: 50000,
    fields,
    uniqueFields,
    duplicateStrategy: 'ask',
  };
}

function extractEnumValues(fieldDef: FieldDefinition): string[] | undefined {
  if (fieldDef.type !== 'select' && fieldDef.type !== 'radio' && fieldDef.type !== 'multiselect') {
    return undefined;
  }
  if (!fieldDef.options || typeof fieldDef.options === 'function') return undefined;
  return (fieldDef.options as Array<string | { value: string }>).map(o =>
    typeof o === 'string' ? o : o.value
  );
}

// ============================================================================
// HELPERS
// ============================================================================

export function getImportableFields(config: CsvModelConfig): CsvFieldConfig[] {
  return config.fields.filter(f => f.importable);
}

export function getExportableFields(config: CsvModelConfig): CsvFieldConfig[] {
  return config.fields.filter(f => f.exportable);
}

export function isModelExcluded(modelName: string): boolean {
  return EXCLUDED_MODELS.has(modelName);
}
