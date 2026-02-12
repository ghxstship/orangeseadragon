import { describe, it, expect } from 'vitest';
import {
  parseCsv,
  generateCsv,
  validateCsvRows,
  autoMapHeaders,
} from './csv';

describe('CSV Utils', () => {
  describe('parseCsv', () => {
    it('parses simple CSV with headers', () => {
      const csv = 'Name,Email,Role\nAlice,alice@test.com,PM\nBob,bob@test.com,Engineer';
      const result = parseCsv(csv);

      expect(result.headers).toEqual(['Name', 'Email', 'Role']);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({ Name: 'Alice', Email: 'alice@test.com', Role: 'PM' });
      expect(result.rows[1]).toEqual({ Name: 'Bob', Email: 'bob@test.com', Role: 'Engineer' });
      expect(result.errors).toHaveLength(0);
    });

    it('handles quoted fields with commas', () => {
      const csv = 'Name,Address\n"Smith, John","123 Main St, Suite 4"';
      const result = parseCsv(csv);

      expect(result.rows[0]).toEqual({ Name: 'Smith, John', Address: '123 Main St, Suite 4' });
    });

    it('handles escaped quotes within fields', () => {
      const csv = 'Name,Note\nAlice,"She said ""hello"""';
      const result = parseCsv(csv);

      expect(result.rows[0].Note).toBe('She said "hello"');
    });

    it('strips BOM character', () => {
      const csv = '\uFEFFName,Email\nAlice,alice@test.com';
      const result = parseCsv(csv);

      expect(result.headers).toEqual(['Name', 'Email']);
      expect(result.rows).toHaveLength(1);
    });

    it('handles empty file', () => {
      const result = parseCsv('');
      expect(result.headers).toEqual([]);
      expect(result.rows).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
    });

    it('reports column count mismatch as error', () => {
      const csv = 'A,B,C\n1,2\n4,5,6';
      const result = parseCsv(csv);

      expect(result.rows).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(2);
    });

    it('handles Windows-style line endings', () => {
      const csv = 'Name,Email\r\nAlice,alice@test.com\r\nBob,bob@test.com';
      const result = parseCsv(csv);

      expect(result.rows).toHaveLength(2);
    });

    it('skips empty lines', () => {
      const csv = 'Name,Email\nAlice,alice@test.com\n\nBob,bob@test.com\n';
      const result = parseCsv(csv);

      expect(result.rows).toHaveLength(2);
    });
  });

  describe('generateCsv', () => {
    it('generates CSV with headers and data', () => {
      const csv = generateCsv({
        fields: [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
        ],
        data: [
          { name: 'Alice', email: 'alice@test.com' },
          { name: 'Bob', email: 'bob@test.com' },
        ],
      });

      expect(csv).toBe('Name,Email\nAlice,alice@test.com\nBob,bob@test.com');
    });

    it('escapes fields containing commas', () => {
      const csv = generateCsv({
        fields: [{ key: 'name', label: 'Name' }],
        data: [{ name: 'Smith, John' }],
      });

      expect(csv).toBe('Name\n"Smith, John"');
    });

    it('escapes fields containing quotes', () => {
      const csv = generateCsv({
        fields: [{ key: 'note', label: 'Note' }],
        data: [{ note: 'She said "hello"' }],
      });

      expect(csv).toBe('Note\n"She said ""hello"""');
    });

    it('handles null and undefined values', () => {
      const csv = generateCsv({
        fields: [
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B' },
        ],
        data: [{ a: null, b: undefined }],
      });

      expect(csv).toBe('A,B\n,');
    });

    it('respects includeHeaders=false', () => {
      const csv = generateCsv({
        fields: [{ key: 'name', label: 'Name' }],
        data: [{ name: 'Alice' }],
        includeHeaders: false,
      });

      expect(csv).toBe('Alice');
    });
  });

  describe('validateCsvRows', () => {
    it('returns no errors when all required fields present', () => {
      const rows = [
        { name: 'Alice', email: 'alice@test.com' },
        { name: 'Bob', email: 'bob@test.com' },
      ];
      const errors = validateCsvRows(rows, ['name', 'email']);
      expect(errors).toHaveLength(0);
    });

    it('returns errors for missing required fields', () => {
      const rows = [
        { name: 'Alice', email: '' },
        { name: '', email: 'bob@test.com' },
      ];
      const errors = validateCsvRows(rows, ['name', 'email']);
      expect(errors).toHaveLength(2);
      expect(errors[0].column).toBe('email');
      expect(errors[1].column).toBe('name');
    });
  });

  describe('autoMapHeaders', () => {
    const entityFields = [
      { key: 'full_name', label: 'Full Name' },
      { key: 'email', label: 'Email Address' },
      { key: 'role', label: 'Role' },
    ];

    it('maps exact key matches', () => {
      const mappings = autoMapHeaders(['email', 'role'], entityFields);
      expect(mappings[0].entityField).toBe('email');
      expect(mappings[1].entityField).toBe('role');
    });

    it('maps label matches', () => {
      const mappings = autoMapHeaders(['Full Name', 'Email Address'], entityFields);
      expect(mappings[0].entityField).toBe('full_name');
      expect(mappings[1].entityField).toBe('email');
    });

    it('leaves unmapped headers with empty entityField', () => {
      const mappings = autoMapHeaders(['unknown_column'], entityFields);
      expect(mappings[0].entityField).toBe('');
    });

    it('handles case-insensitive matching', () => {
      const mappings = autoMapHeaders(['EMAIL', 'ROLE'], entityFields);
      expect(mappings[0].entityField).toBe('email');
      expect(mappings[1].entityField).toBe('role');
    });
  });
});
