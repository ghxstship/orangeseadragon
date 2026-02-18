# GHXSTSHIP INDUSTRIES — CSV BULK OPERATIONS IMPLEMENTATION PROTOCOL v1.0

## WINDSURF PROMPT — DISCOVER, PLAN, AND BUILD COMPLETE CSV IMPORT/EXPORT SYSTEM

**Classification:** Feature Implementation / Surgical Discovery + Build
**Scope:** Every data model, every list view, every bulk operation surface
**Standard:** Enterprise-grade with column mapping, validation, error recovery, and progress tracking
**Output:** Working code, not recommendations

---

## INSTRUCTIONS TO WINDSURF

You are a **Principal Data Engineer** tasked with implementing a **complete CSV bulk import/export system** across this entire application. You will first discover every surface that needs bulk operations, then build the entire infrastructure and wire it into each surface.

**Execute in this exact order. Do not skip steps. Do not ask — build.**

---

## STEP 1: DISCOVERY — SCAN THE ENTIRE SCHEMA

Open the database schema. For every model/table, produce this assessment:

```
┌─────────────────────┬────────┬────────┬──────────────────────────────────────────┐
│ Model               │ Import │ Export │ Justification                            │
├─────────────────────┼────────┼────────┼──────────────────────────────────────────┤
│ users               │ ✅     │ ✅     │ Admin bulk-invites, team onboarding      │
│ projects            │ ✅     │ ✅     │ Migrate from spreadsheets, reporting     │
│ tasks               │ ✅     │ ✅     │ Bulk task creation, sprint planning      │
│ clients             │ ✅     │ ✅     │ CRM import, client list export           │
│ invoices            │ ❌     │ ✅     │ Export for accounting, no bulk create     │
│ payments            │ ❌     │ ✅     │ Export only — created by payment system   │
│ audit_logs          │ ❌     │ ✅     │ Export for compliance, never imported     │
│ tags                │ ✅     │ ✅     │ Bulk tag setup, taxonomy management      │
│ venues              │ ✅     │ ✅     │ Bulk venue onboarding, inventory export  │
│ contacts            │ ✅     │ ✅     │ Contact list import from other CRMs      │
│ inventory_items     │ ✅     │ ✅     │ Equipment/asset bulk management          │
│ time_entries        │ ✅     │ ✅     │ Timesheet import, payroll export         │
│ expenses            │ ✅     │ ✅     │ Receipt bulk upload, finance export      │
│ [continue for every model...]                                                   │
└─────────────────────┴────────┴────────┴──────────────────────────────────────────┘
```

**Decision criteria:**
- **Import YES** if: users create this data manually, data migrates from other systems, or bulk creation saves significant time
- **Import NO** if: data is system-generated (audit logs, webhooks, payment records) or has complex dependencies that can't be expressed in a flat CSV row
- **Export YES** if: users need reporting, accounting, compliance, migration, or offline review
- **Export NO** if: data is purely internal system state with no user-facing value

For each ✅ model, identify:
1. Which **list view page** it appears on (this is where the import/export buttons go)
2. Which **fields are importable** (writable by the user)
3. Which **fields are exportable** (readable and useful in a spreadsheet)
4. Which **fields require mapping** (names may differ between CSV headers and DB columns)
5. Which **fields have foreign key dependencies** (need lookup resolution — e.g., client name → client_id)
6. Which **fields have enum/constrained values** (need validation against allowed values)

---

## STEP 2: BUILD THE CORE CSV INFRASTRUCTURE

Create these shared modules before building any model-specific implementation:

### 2.1 — CSV Configuration Registry

```typescript
// lib/csv/registry.ts

import { z } from 'zod';

/**
 * Central registry defining CSV import/export behavior for every model.
 * Add a new entry here to enable CSV operations for any model.
 */

interface CsvFieldConfig {
  /** Database column name */
  dbField: string;
  /** Human-readable header shown in CSV template */
  csvHeader: string;
  /** Alternate headers accepted during import (for flexible mapping) */
  aliases: string[];
  /** Field type for validation and formatting */
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'email' | 'url' | 'enum' | 'currency' | 'phone' | 'uuid';
  /** Required for import? */
  required: boolean;
  /** Include in export? */
  exportable: boolean;
  /** Accept in import? */
  importable: boolean;
  /** Allowed values for enum fields */
  enumValues?: string[];
  /** For FK fields: which model to look up, and which display field maps to it */
  foreignKey?: {
    model: string;
    lookupField: string;   // e.g., 'name' — what appears in the CSV
    resolveField: string;  // e.g., 'id' — what gets stored in the DB
  };
  /** Zod validation schema for this field */
  validation: z.ZodType;
  /** Transform raw CSV string into the correct type */
  parseValue: (raw: string) => unknown;
  /** Transform DB value into CSV-friendly string */
  formatValue: (value: unknown) => string;
  /** Example value shown in template */
  example: string;
  /** Description shown in template header row or mapping UI */
  description: string;
  /** Max length for string fields */
  maxLength?: number;
  /** Default value if not provided in import */
  defaultValue?: unknown;
}

interface CsvModelConfig {
  /** Model/table name */
  model: string;
  /** Display name for UI */
  displayName: string;
  /** URL slug for routes */
  slug: string;
  /** Whether bulk import is enabled */
  importEnabled: boolean;
  /** Whether export is enabled */
  exportEnabled: boolean;
  /** Max rows per import batch */
  maxImportRows: number;
  /** Fields configuration */
  fields: CsvFieldConfig[];
  /** Unique constraint fields (for upsert/duplicate detection) */
  uniqueFields: string[];
  /** What to do when a duplicate is found during import */
  duplicateStrategy: 'skip' | 'update' | 'error' | 'ask';
  /** Pre-import hook for custom validation across rows */
  validateBatch?: (rows: Record<string, unknown>[]) => ValidationResult[];
  /** Post-import hook for side effects (e.g., send welcome emails) */
  afterImport?: (importedIds: string[]) => Promise<void>;
}

// EXAMPLE CONFIG (generate one per model from Step 1):
export const csvConfigs: Record<string, CsvModelConfig> = {
  contacts: {
    model: 'contact',
    displayName: 'Contacts',
    slug: 'contacts',
    importEnabled: true,
    exportEnabled: true,
    maxImportRows: 10000,
    uniqueFields: ['email'],
    duplicateStrategy: 'ask',
    fields: [
      {
        dbField: 'firstName',
        csvHeader: 'First Name',
        aliases: ['first_name', 'fname', 'first', 'given_name'],
        type: 'string',
        required: true,
        exportable: true,
        importable: true,
        validation: z.string().min(1).max(100),
        parseValue: (raw) => raw.trim(),
        formatValue: (v) => String(v ?? ''),
        example: 'Jane',
        description: 'Contact first name',
        maxLength: 100,
      },
      {
        dbField: 'lastName',
        csvHeader: 'Last Name',
        aliases: ['last_name', 'lname', 'last', 'surname', 'family_name'],
        type: 'string',
        required: true,
        exportable: true,
        importable: true,
        validation: z.string().min(1).max(100),
        parseValue: (raw) => raw.trim(),
        formatValue: (v) => String(v ?? ''),
        example: 'Doe',
        description: 'Contact last name',
        maxLength: 100,
      },
      {
        dbField: 'email',
        csvHeader: 'Email',
        aliases: ['email_address', 'e-mail', 'mail'],
        type: 'email',
        required: true,
        exportable: true,
        importable: true,
        validation: z.string().email(),
        parseValue: (raw) => raw.trim().toLowerCase(),
        formatValue: (v) => String(v ?? ''),
        example: 'jane.doe@example.com',
        description: 'Primary email address (must be unique)',
      },
      {
        dbField: 'phone',
        csvHeader: 'Phone',
        aliases: ['phone_number', 'telephone', 'mobile', 'cell'],
        type: 'phone',
        required: false,
        exportable: true,
        importable: true,
        validation: z.string().optional(),
        parseValue: (raw) => raw.replace(/[^\d+\-() ]/g, '').trim() || null,
        formatValue: (v) => String(v ?? ''),
        example: '+1 (555) 123-4567',
        description: 'Phone number in any format',
      },
      {
        dbField: 'companyId',
        csvHeader: 'Company',
        aliases: ['company_name', 'organization', 'org', 'company'],
        type: 'string',
        required: false,
        exportable: true,
        importable: true,
        foreignKey: {
          model: 'company',
          lookupField: 'name',
          resolveField: 'id',
        },
        validation: z.string().optional(),
        parseValue: (raw) => raw.trim() || null,
        formatValue: (v) => String(v ?? ''),  // Export renders company NAME, not ID
        example: 'Acme Corp',
        description: 'Company name (will be matched to existing companies)',
      },
      {
        dbField: 'status',
        csvHeader: 'Status',
        aliases: ['contact_status', 'state'],
        type: 'enum',
        required: false,
        exportable: true,
        importable: true,
        enumValues: ['active', 'inactive', 'lead', 'prospect', 'archived'],
        validation: z.enum(['active', 'inactive', 'lead', 'prospect', 'archived']).default('active'),
        parseValue: (raw) => raw.trim().toLowerCase() || 'active',
        formatValue: (v) => String(v ?? 'active'),
        example: 'active',
        description: 'Contact status: active, inactive, lead, prospect, or archived',
        defaultValue: 'active',
      },
      {
        dbField: 'tags',
        csvHeader: 'Tags',
        aliases: ['labels', 'categories'],
        type: 'string',
        required: false,
        exportable: true,
        importable: true,
        validation: z.string().optional(),
        parseValue: (raw) => raw.split(/[,;|]/).map(t => t.trim()).filter(Boolean),
        formatValue: (v) => (Array.isArray(v) ? v.join(', ') : String(v ?? '')),
        example: 'VIP, Enterprise, Q1-2026',
        description: 'Comma-separated tags',
      },
      // ... continue for every importable/exportable field
    ],
  },
  // ... generate for every model from Step 1
};
```

### 2.2 — CSV Parser / Generator Engine

```typescript
// lib/csv/parser.ts — IMPORT ENGINE

import Papa from 'papaparse';

interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  encoding: string;
  delimiter: string;
}

/**
 * Parse a CSV file into structured rows.
 * Handles: UTF-8 BOM, various delimiters, quoted fields, line breaks in fields.
 */
export async function parseCsvFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        resolve({
          headers: result.meta.fields ?? [],
          rows: result.data as Record<string, string>[],
          totalRows: result.data.length,
          encoding: 'UTF-8',
          delimiter: result.meta.delimiter,
        });
      },
      error: (err) => reject(new Error(`CSV parse failed: ${err.message}`)),
    });
  });
}


// lib/csv/generator.ts — EXPORT ENGINE

/**
 * Generate a CSV file from structured data.
 * Handles: UTF-8 BOM for Excel compatibility, proper escaping, date formatting.
 */
export function generateCsv(
  data: Record<string, unknown>[],
  fields: CsvFieldConfig[],
  options?: { includeHeaders?: boolean; delimiter?: string }
): Blob {
  const { includeHeaders = true, delimiter = ',' } = options ?? {};

  const exportFields = fields.filter(f => f.exportable);
  const headers = exportFields.map(f => f.csvHeader);

  const rows = data.map(row =>
    exportFields.map(field => {
      const value = row[field.dbField];
      const formatted = field.formatValue(value);
      // Escape fields containing delimiter, quotes, or newlines
      if (formatted.includes(delimiter) || formatted.includes('"') || formatted.includes('\n')) {
        return `"${formatted.replace(/"/g, '""')}"`;
      }
      return formatted;
    })
  );

  const lines: string[] = [];
  if (includeHeaders) lines.push(headers.join(delimiter));
  rows.forEach(row => lines.push(row.join(delimiter)));

  // UTF-8 BOM for Excel compatibility
  const bom = '\uFEFF';
  return new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
}


// lib/csv/template.ts — TEMPLATE GENERATOR

/**
 * Generate a downloadable CSV template with:
 * - Header row with human-readable column names
 * - Description row (row 2) explaining each field
 * - Example row (row 3) showing sample data
 * - Field constraints row (row 4) showing validation rules
 */
export function generateTemplate(config: CsvModelConfig): Blob {
  const importFields = config.fields.filter(f => f.importable);

  const headers = importFields.map(f => f.csvHeader);
  const descriptions = importFields.map(f => f.description);
  const examples = importFields.map(f => f.example);
  const constraints = importFields.map(f => {
    const parts: string[] = [];
    if (f.required) parts.push('REQUIRED');
    if (f.maxLength) parts.push(`Max ${f.maxLength} chars`);
    if (f.enumValues) parts.push(`Options: ${f.enumValues.join(' | ')}`);
    if (f.foreignKey) parts.push(`Must match existing ${f.foreignKey.model}`);
    if (f.type === 'email') parts.push('Valid email');
    if (f.type === 'date') parts.push('Format: YYYY-MM-DD');
    if (f.type === 'datetime') parts.push('Format: YYYY-MM-DD HH:mm');
    if (f.type === 'url') parts.push('Valid URL');
    if (f.type === 'currency') parts.push('Number, no currency symbol');
    return parts.join('; ') || 'Optional';
  });

  const lines = [
    headers.join(','),
    descriptions.map(d => `"${d}"`).join(','),
    examples.map(e => `"${e}"`).join(','),
    constraints.map(c => `"${c}"`).join(','),
  ];

  const bom = '\uFEFF';
  return new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
}
```

### 2.3 — Column Mapping Engine

```typescript
// lib/csv/mapper.ts

interface ColumnMapping {
  csvHeader: string;
  dbField: string | null;      // null = unmapped (skip this column)
  confidence: 'exact' | 'alias' | 'fuzzy' | 'manual' | 'unmapped';
}

/**
 * Auto-map CSV headers to database fields using:
 * 1. Exact match (case-insensitive)
 * 2. Alias match (from field config)
 * 3. Fuzzy match (Levenshtein distance + token overlap)
 */
export function autoMapColumns(
  csvHeaders: string[],
  config: CsvModelConfig
): ColumnMapping[] {
  const importFields = config.fields.filter(f => f.importable);

  return csvHeaders.map(csvHeader => {
    const normalized = csvHeader.trim().toLowerCase().replace(/[_\-\s]+/g, '');

    // 1. Exact match on csvHeader
    const exactMatch = importFields.find(
      f => f.csvHeader.toLowerCase().replace(/[_\-\s]+/g, '') === normalized
    );
    if (exactMatch) {
      return { csvHeader, dbField: exactMatch.dbField, confidence: 'exact' as const };
    }

    // 2. Alias match
    const aliasMatch = importFields.find(f =>
      f.aliases.some(a => a.toLowerCase().replace(/[_\-\s]+/g, '') === normalized)
    );
    if (aliasMatch) {
      return { csvHeader, dbField: aliasMatch.dbField, confidence: 'alias' as const };
    }

    // 3. Fuzzy match (token overlap — shared words)
    const csvTokens = normalized.split(/[_\-\s]+/).filter(Boolean);
    let bestMatch: CsvFieldConfig | null = null;
    let bestScore = 0;
    for (const field of importFields) {
      const fieldTokens = [
        ...field.csvHeader.toLowerCase().split(/[_\-\s]+/),
        ...field.aliases.flatMap(a => a.toLowerCase().split(/[_\-\s]+/)),
        field.dbField.toLowerCase(),
      ];
      const overlap = csvTokens.filter(t => fieldTokens.includes(t)).length;
      const score = overlap / Math.max(csvTokens.length, 1);
      if (score > bestScore && score >= 0.5) {
        bestScore = score;
        bestMatch = field;
      }
    }
    if (bestMatch) {
      return { csvHeader, dbField: bestMatch.dbField, confidence: 'fuzzy' as const };
    }

    // 4. Unmapped
    return { csvHeader, dbField: null, confidence: 'unmapped' as const };
  });
}
```

### 2.4 — Row Validation Engine

```typescript
// lib/csv/validator.ts

interface RowValidationResult {
  rowIndex: number;
  valid: boolean;
  errors: { field: string; message: string; value: string }[];
  warnings: { field: string; message: string; value: string }[];
  parsedData: Record<string, unknown> | null;
}

interface BatchValidationResult {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  results: RowValidationResult[];
  duplicatesDetected: { rowIndex: number; conflictField: string; conflictValue: string }[];
}

/**
 * Validate every row against the model config.
 * Returns detailed per-row, per-field errors.
 */
export function validateBatch(
  rows: Record<string, string>[],
  mappings: ColumnMapping[],
  config: CsvModelConfig
): BatchValidationResult {
  const activeMappings = mappings.filter(m => m.dbField !== null);
  const fieldsByDbName = Object.fromEntries(
    config.fields.map(f => [f.dbField, f])
  );
  const seenUniques = new Map<string, number[]>(); // value → row indices

  const results: RowValidationResult[] = rows.map((row, rowIndex) => {
    const errors: RowValidationResult['errors'] = [];
    const warnings: RowValidationResult['warnings'] = [];
    const parsedData: Record<string, unknown> = {};

    // Check mapped fields
    for (const mapping of activeMappings) {
      const field = fieldsByDbName[mapping.dbField!];
      if (!field) continue;

      const rawValue = row[mapping.csvHeader]?.trim() ?? '';

      // Required check
      if (field.required && !rawValue) {
        errors.push({ field: field.dbField, message: `${field.csvHeader} is required`, value: rawValue });
        continue;
      }

      // Skip empty optional fields
      if (!rawValue && !field.required) {
        parsedData[field.dbField] = field.defaultValue ?? null;
        continue;
      }

      // Type-specific validation
      try {
        const parsed = field.parseValue(rawValue);
        const result = field.validation.safeParse(parsed);
        if (!result.success) {
          errors.push({
            field: field.dbField,
            message: result.error.issues[0]?.message ?? 'Invalid value',
            value: rawValue,
          });
        } else {
          parsedData[field.dbField] = result.data;
        }
      } catch {
        errors.push({ field: field.dbField, message: `Could not parse value`, value: rawValue });
      }

      // Enum validation
      if (field.type === 'enum' && field.enumValues && rawValue) {
        if (!field.enumValues.includes(rawValue.toLowerCase())) {
          errors.push({
            field: field.dbField,
            message: `Invalid value. Must be one of: ${field.enumValues.join(', ')}`,
            value: rawValue,
          });
        }
      }

      // Max length
      if (field.maxLength && rawValue.length > field.maxLength) {
        errors.push({
          field: field.dbField,
          message: `Exceeds max length of ${field.maxLength} characters`,
          value: rawValue,
        });
      }
    }

    // Check required fields that weren't in the CSV at all
    for (const field of config.fields.filter(f => f.importable && f.required)) {
      if (!activeMappings.some(m => m.dbField === field.dbField)) {
        errors.push({ field: field.dbField, message: `Required field ${field.csvHeader} is not mapped`, value: '' });
      }
    }

    // Track uniqueness within the batch
    for (const uniqueField of config.uniqueFields) {
      const value = parsedData[uniqueField];
      if (value != null) {
        const key = `${uniqueField}:${String(value).toLowerCase()}`;
        if (!seenUniques.has(key)) seenUniques.set(key, []);
        seenUniques.get(key)!.push(rowIndex);
      }
    }

    return {
      rowIndex,
      valid: errors.length === 0,
      errors,
      warnings,
      parsedData: errors.length === 0 ? parsedData : null,
    };
  });

  // Detect in-batch duplicates
  const duplicatesDetected: BatchValidationResult['duplicatesDetected'] = [];
  for (const [key, indices] of seenUniques) {
    if (indices.length > 1) {
      const [field, value] = key.split(':');
      indices.forEach(i => duplicatesDetected.push({ rowIndex: i, conflictField: field, conflictValue: value }));
    }
  }

  return {
    totalRows: rows.length,
    validRows: results.filter(r => r.valid).length,
    errorRows: results.filter(r => !r.valid).length,
    warningRows: results.filter(r => r.warnings.length > 0).length,
    results,
    duplicatesDetected,
  };
}
```

### 2.5 — Foreign Key Resolution Engine

```typescript
// lib/csv/resolver.ts

interface ResolutionResult {
  resolved: Map<string, string>;    // lookupValue → resolvedId
  unresolved: string[];              // values that couldn't be found
  created: Map<string, string>;      // if auto-create enabled: value → new ID
}

/**
 * Resolve foreign key references from human-readable names to database IDs.
 * Example: "Acme Corp" → "uuid-of-acme-corp"
 *
 * Options:
 * - autoCreate: Create missing records on the fly
 * - caseSensitive: Whether matching is case-sensitive
 */
export async function resolveForeignKeys(
  values: string[],
  fkConfig: CsvFieldConfig['foreignKey'],
  options?: { autoCreate?: boolean; caseSensitive?: boolean; tenantId?: string }
): Promise<ResolutionResult> {
  // Implementation:
  // 1. Deduplicate input values
  // 2. Batch query: SELECT id, name FROM [model] WHERE name IN (...)
  // 3. Build resolved map
  // 4. Identify unresolved
  // 5. Optionally auto-create missing records
  // 6. Return complete resolution map
}
```

### 2.6 — Batch Import Processor

```typescript
// lib/csv/importer.ts

interface ImportOptions {
  /** How to handle duplicates found in the database */
  duplicateStrategy: 'skip' | 'update' | 'error';
  /** How to handle FK references that don't exist */
  unresolvedFkStrategy: 'skip_row' | 'create' | 'error';
  /** Process in batches of this size */
  batchSize: number;
  /** Dry run — validate everything but don't write */
  dryRun: boolean;
  /** User performing the import (for audit trail) */
  userId: string;
  /** Tenant scope (for multi-tenant) */
  tenantId?: string;
}

interface ImportProgress {
  phase: 'validating' | 'resolving_fks' | 'checking_duplicates' | 'importing' | 'complete' | 'failed';
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  skippedRows: number;
  currentBatch: number;
  totalBatches: number;
  errors: { row: number; field: string; message: string }[];
}

/**
 * Full import pipeline:
 * 1. Validate all rows
 * 2. Resolve all FK references
 * 3. Check for duplicates against existing DB records
 * 4. Insert/upsert in batches within a transaction
 * 5. Record import audit log
 * 6. Run post-import hooks
 */
export async function processImport(
  validatedRows: Record<string, unknown>[],
  config: CsvModelConfig,
  options: ImportOptions,
  onProgress: (progress: ImportProgress) => void
): Promise<ImportResult> {
  // Implementation plan:
  //
  // PHASE 1: FK Resolution
  //   For each field with foreignKey config:
  //   - Collect all unique values from the batch
  //   - Batch-resolve against the DB
  //   - Replace display values with IDs in the parsed data
  //   - Track unresolved based on strategy
  //
  // PHASE 2: Duplicate Check
  //   For each uniqueField in config:
  //   - Query DB: SELECT [uniqueField] FROM [model] WHERE [uniqueField] IN (...)
  //   - Apply duplicateStrategy: skip, update, or error
  //
  // PHASE 3: Batch Insert/Upsert
  //   - Split rows into batches of batchSize
  //   - For each batch:
  //     - BEGIN TRANSACTION
  //     - INSERT or UPSERT rows
  //     - COMMIT
  //     - Report progress
  //   - On any batch failure: ROLLBACK, report which rows failed
  //
  // PHASE 4: Audit & Hooks
  //   - Create import_log record: { userId, model, totalRows, successRows, errorRows, timestamp }
  //   - Call afterImport hook if defined
  //   - Return complete ImportResult with IDs of created/updated records
}
```

---

## STEP 3: BUILD THE API ENDPOINTS

Create these endpoints for every import/export-enabled model:

```
For each model [M] with slug [S]:

EXPORT:
  GET  /api/[S]/export
       Query: { format?: 'csv', filters?: string, fields?: string, sort?: string }
       Auth: Required + read permission on [M]
       Response: CSV file download (Content-Disposition: attachment)
       Behavior:
         - Applies same filters as the list view (so export matches what user sees)
         - Streams rows for large datasets (no loading entire table into memory)
         - Caps at configurable max (e.g., 50,000 rows) with warning
         - Logs export in audit trail

TEMPLATE:
  GET  /api/[S]/import/template
       Auth: Required + write permission on [M]
       Response: CSV template file download
       Behavior:
         - Uses generateTemplate() from csv/template.ts
         - Includes header, description, example, and constraints rows
         - File named: [model]_import_template.csv

IMPORT — UPLOAD & VALIDATE:
  POST /api/[S]/import/validate
       Body: multipart/form-data with CSV file
       Auth: Required + write permission on [M]
       Response: {
         headers: string[],
         autoMapping: ColumnMapping[],
         preview: first 5 rows as parsed objects,
         validation: BatchValidationResult (first 100 rows),
         totalRows: number,
         uploadId: string  // temporary file reference for subsequent confirm
       }
       Behavior:
         - Parses CSV
         - Auto-maps columns
         - Validates first 100 rows for quick feedback
         - Stores uploaded file in temporary storage with uploadId
         - Does NOT write to database yet

IMPORT — CONFIRM & PROCESS:
  POST /api/[S]/import/confirm
       Body: {
         uploadId: string,
         mappings: ColumnMapping[],  // user may have adjusted auto-mapping
         duplicateStrategy: 'skip' | 'update' | 'error',
         unresolvedFkStrategy: 'skip_row' | 'create' | 'error',
         dryRun?: boolean
       }
       Auth: Required + write permission on [M]
       Response: Streaming progress (SSE or polling):
         { phase, processedRows, successRows, errorRows, ... }
       Behavior:
         - Retrieves file from temporary storage
         - Validates ALL rows (not just first 100)
         - Resolves foreign keys
         - Checks duplicates against DB
         - Imports in batches
         - Reports progress via SSE or stores in job status table for polling

IMPORT — STATUS (if using async processing):
  GET  /api/[S]/import/status/[jobId]
       Auth: Required + owner of import job
       Response: ImportProgress
```

---

## STEP 4: BUILD THE UI COMPONENTS

### 4.1 — Shared Components (build once, use everywhere)

```
CREATE THESE COMPONENTS:

components/csv/
├── CsvExportButton.tsx        — Dropdown: "Export CSV" + "Export Filtered"
├── CsvImportButton.tsx        — Opens the import modal
├── CsvImportModal.tsx         — Full import wizard (multi-step)
├── CsvTemplateButton.tsx      — "Download Template" button
├── CsvColumnMapper.tsx        — Visual column mapping UI
├── CsvValidationPreview.tsx   — Shows validation results with error highlighting
├── CsvImportProgress.tsx      — Progress bar with phase labels and row counts
├── CsvImportSummary.tsx       — Final summary: created, updated, skipped, errors
├── CsvErrorTable.tsx          — Downloadable table of rows that failed with reasons
└── hooks/
    ├── useCsvExport.ts        — Hook: triggers export, handles loading/error
    ├── useCsvImport.ts        — Hook: manages multi-step import state machine
    └── useCsvTemplate.ts      — Hook: triggers template download
```

### 4.2 — Import Wizard Flow (CsvImportModal)

```
The import modal is a MULTI-STEP WIZARD with these states:

STEP 1: UPLOAD
  ┌─────────────────────────────────────────────────────┐
  │  Import [Model Name]                            [X] │
  │                                                     │
  │  ┌───────────────────────────────────────────────┐  │
  │  │                                               │  │
  │  │        Drag & drop a CSV file here            │  │
  │  │        or click to browse                     │  │
  │  │                                               │  │
  │  │        Supported: .csv, .tsv (max 10MB)       │  │
  │  └───────────────────────────────────────────────┘  │
  │                                                     │
  │  Need a template? [Download Template]               │
  │                                                     │
  │  [Cancel]                              [Next →]     │
  └─────────────────────────────────────────────────────┘

STEP 2: COLUMN MAPPING
  ┌─────────────────────────────────────────────────────┐
  │  Map Columns                                    [X] │
  │                                                     │
  │  We auto-detected these mappings. Review and adjust:│
  │                                                     │
  │  Your CSV Column      →  Our Field                  │
  │  ┌─────────────────┐    ┌─────────────────┐        │
  │  │ First Name   ✅ │ →  │ First Name      │        │
  │  │ Last Name    ✅ │ →  │ Last Name       │        │
  │  │ E-mail       🔵 │ →  │ Email           │  alias │
  │  │ Organisation 🟡 │ →  │ Company     [v] │  fuzzy │
  │  │ Notes        ⚪ │ →  │ [Skip]      [v] │  unmap │
  │  └─────────────────┘    └─────────────────┘        │
  │                                                     │
  │  Legend: ✅ Exact  🔵 Alias  🟡 Fuzzy  ⚪ Unmapped  │
  │                                                     │
  │  Required fields not mapped: [none | list]          │
  │                                                     │
  │  [← Back]                              [Next →]     │
  └─────────────────────────────────────────────────────┘

STEP 3: VALIDATION PREVIEW
  ┌─────────────────────────────────────────────────────┐
  │  Preview & Validate                             [X] │
  │                                                     │
  │  📊 1,247 rows detected                             │
  │  ✅ 1,198 valid                                     │
  │  ❌ 49 errors (will be skipped)                     │
  │  ⚠️ 12 duplicates found                             │
  │                                                     │
  │  Preview (first 5 rows):                            │
  │  ┌───────────┬──────────┬──────────────┬────────┐   │
  │  │ First Name│Last Name │ Email        │ Status │   │
  │  ├───────────┼──────────┼──────────────┼────────┤   │
  │  │ Jane      │ Doe      │ jane@acme.co │ active │   │
  │  │ John      │ Smith    │ j@smith.io   │ lead   │   │
  │  └───────────┴──────────┴──────────────┴────────┘   │
  │                                                     │
  │  [View all errors]   [Download error report]        │
  │                                                     │
  │  Duplicate handling:                                │
  │  ( ) Skip duplicates                                │
  │  ( ) Update existing records                        │
  │  ( ) Stop on duplicates                             │
  │                                                     │
  │  [← Back]                           [Import →]      │
  └─────────────────────────────────────────────────────┘

STEP 4: IMPORT PROGRESS
  ┌─────────────────────────────────────────────────────┐
  │  Importing...                                   [X] │
  │                                                     │
  │  ████████████████████░░░░░  856 / 1,198    72%      │
  │                                                     │
  │  Phase: Importing records (batch 4 of 12)           │
  │  ✅ Created: 831                                    │
  │  🔄 Updated: 19                                     │
  │  ⏭️  Skipped: 6                                     │
  │  ❌ Errors: 0                                       │
  │                                                     │
  │  [Cancel Import]                                    │
  └─────────────────────────────────────────────────────┘

STEP 5: COMPLETE
  ┌─────────────────────────────────────────────────────┐
  │  Import Complete ✅                             [X] │
  │                                                     │
  │  Successfully imported 1,192 contacts               │
  │                                                     │
  │  ✅ Created: 1,167 new records                      │
  │  🔄 Updated: 19 existing records                    │
  │  ⏭️  Skipped: 6 duplicates                          │
  │  ❌ Errors: 49 rows (see error report)              │
  │                                                     │
  │  [Download Error Report]    [View Imported Data]    │
  │                                                     │
  │                                        [Done]       │
  └─────────────────────────────────────────────────────┘
```

### 4.3 — Integration Into List Views

```
FOR EVERY LIST VIEW PAGE IDENTIFIED IN STEP 1:

Add to the page header / toolbar area:

┌─────────────────────────────────────────────────────────────────┐
│  Contacts (1,247)                                               │
│                                                                 │
│  [Search...          ]  [Status ▾]  [Tags ▾]                   │
│                                                                 │
│                    [📥 Import CSV]  [📤 Export CSV ▾]           │
│                                     ├─ Export All (1,247)       │
│                                     ├─ Export Filtered (342)    │
│                                     └─ Download Template        │
└─────────────────────────────────────────────────────────────────┘

IMPLEMENTATION:
- CsvImportButton opens CsvImportModal with the correct model config
- CsvExportButton dropdown triggers export with current filters applied
- Export "Filtered" passes the active URL params to the export endpoint
- Template download uses the model's generateTemplate()
- After successful import, list view refetches / cache invalidates
```

---

## STEP 5: BUILD THE ERROR RECOVERY SYSTEM

```
WHEN IMPORT HAS ERRORS, THE USER MUST BE ABLE TO:

1. DOWNLOAD ERROR REPORT
   - CSV file containing ONLY the rows that failed
   - Each row has an additional "Error" column with the failure reason
   - User can fix errors in the CSV, then re-upload just the failed rows
   - Error report uses the SAME column headers as the original upload

2. VIEW ERRORS INLINE
   - CsvErrorTable shows a scrollable table of failed rows
   - Error cells highlighted in red with tooltip showing the error message
   - Sortable/filterable by error type
   - Row count: "49 of 1,247 rows had errors"

3. PARTIAL SUCCESS
   - Valid rows are imported even if some rows fail
   - User is never forced into an all-or-nothing import
   - Summary clearly states: "1,198 imported, 49 failed"

4. RETRY MECHANISM
   - Error report can be re-uploaded as a new import
   - Column mapping persists (saved in localStorage for this model)
   - Previously successful rows are detected as duplicates (handled by strategy)
```

---

## STEP 6: WIRE VERIFICATION CHECKLIST

After building everything, verify each model's complete circuit:

```
FOR EACH MODEL WITH CSV OPERATIONS:

EXPORT WIRE:
□ Export button exists on the list view page
□ Click triggers GET /api/[model]/export
□ API applies current filters from URL params
□ Query selects only exportable fields
□ CSV generated with correct headers and formatting
□ Dates formatted as YYYY-MM-DD (not ISO timestamps)
□ Currency formatted as numbers (not $1,234.56 strings)
□ FK fields export human-readable names (not UUIDs)
□ Enums export as human-readable values
□ Arrays/tags export as comma-separated strings
□ Boolean fields export as "Yes" / "No" (not true/false)
□ Null fields export as empty string (not "null" or "undefined")
□ File downloads with correct name: [model]_export_[date].csv
□ Large exports stream (don't load entire dataset into memory)
□ Export respects user permissions (only exports accessible records)
□ Export logged in audit trail

TEMPLATE WIRE:
□ Template download button exists on list view and in import modal
□ Template includes all importable fields as headers
□ Row 2 has field descriptions
□ Row 3 has example values matching real data patterns
□ Row 4 has validation constraints
□ Template opens correctly in Excel, Google Sheets, Numbers

IMPORT WIRE:
□ Import button exists on the list view page
□ File upload accepts .csv and .tsv files
□ File size limit enforced (client + server)
□ CSV parsed correctly (handles commas in quoted fields, line breaks, BOM)
□ Column auto-mapping produces correct results for typical CSVs
□ Column mapping UI allows manual override of every column
□ Required unmapped fields block proceeding to next step
□ Validation preview shows accurate counts
□ Validation errors shown with correct row numbers and field names
□ FK references resolved correctly (name → id lookup)
□ Unresolvable FKs handled per selected strategy
□ Duplicate detection works against existing DB records
□ Duplicate handling respects selected strategy
□ In-batch duplicates detected and reported
□ Import processes in batches (not one giant INSERT)
□ Progress reported accurately (row count, phase, percentage)
□ Successful rows committed even if some rows fail
□ Failed rows available as downloadable error report
□ After import complete: list view cache invalidated / refetched
□ After import complete: correct count shown in list view
□ Import logged in audit trail (who, when, how many, which model)
□ Imported records have correct tenant_id (multi-tenant)
□ Imported records have correct created_by / imported_by audit field
```

---

## STEP 7: OUTPUT REQUIREMENTS

**When you complete this protocol, deliver:**

1. **Discovery table** (Step 1) — every model assessed for import/export
2. **CSV config registry** — complete CsvModelConfig for every enabled model
3. **Core library files** — parser, generator, template, mapper, validator, resolver, importer
4. **API routes** — export, template, validate, confirm, status for each model
5. **UI components** — all shared components + integration into each list view
6. **Error recovery** — error report generator + retry flow
7. **Wire verification** — completed checklist per model

**All code must be working, typed, and integrated — not pseudocode, not recommendations.**

---

*GHXSTSHIP Industries LLC — Every Record. Every Column. Every Direction. Fully Wired.*
*CSV Bulk Operations Protocol v1.0 — Enterprise-grade import/export for every data surface*