"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FieldRenderProps } from './index';
import { createClient } from '@/lib/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ENTITY_TABLE_MAP: Record<string, string> = {
  project: 'projects',
  task: 'tasks',
  person: 'organization_members',
  user: 'users',
  company: 'companies',
  contact: 'contacts',
  deal: 'deals',
  invoice: 'invoices',
  budget: 'budgets',
  event: 'events',
  asset: 'assets',
  venue: 'venues',
  department: 'departments',
  position: 'positions',
  role: 'roles',
  document: 'documents',
  expense: 'expenses',
  proposal: 'proposals',
  contract: 'contracts',
  vendor: 'vendors',
  lead: 'leads',
  runsheet: 'runsheets',
  shift: 'shifts',
  crew_call: 'crew_calls',
  labor_rule_set: 'labor_rule_sets',
};

const DISPLAY_FIELD_MAP: Record<string, string> = {
  users: 'full_name',
  organization_members: 'id',
  roles: 'name',
  departments: 'name',
  positions: 'name',
};

export function RelationField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm] = useState('');

  const relation = field.relation;

  const loadOptions = useCallback(async () => {
    if (!relation) return;

    if (relation.optionsEndpoint) {
      setLoading(true);
      try {
        const response = await fetch(relation.optionsEndpoint);
        if (response.ok) {
          const result = await response.json();
          const items = result.data ?? result;
          setOptions(
            Array.isArray(items)
              ? items.map((item: Record<string, string>) => ({
                  value: item.id ?? item.value,
                  label: typeof relation.display === 'function'
                    ? relation.display(item)
                    : (typeof relation.display === 'string' ? item[relation.display] : item['name']) ?? item.label ?? item.id,
                }))
              : []
          );
        }
      } catch (err) {
        console.error('Failed to load relation options:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (Array.isArray(relation.options) && relation.options.length > 0) {
      setOptions(
        relation.options.map((opt: Record<string, string>) => ({
          value: typeof opt === 'string' ? opt : opt.value,
          label: typeof opt === 'string' ? opt : opt.label,
        }))
      );
      return;
    }

    const table = ENTITY_TABLE_MAP[relation.entity] ?? `${relation.entity}s`;
    const displayField = String(relation.display ?? DISPLAY_FIELD_MAP[table] ?? 'name');

    setLoading(true);
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabase as any)
        .from(table)
        .select(`id, ${displayField}`)
        .order(displayField, { ascending: true })
        .limit(200);

      if (fetchError) {
        console.error(`[RelationField] Failed to fetch from ${table}:`, fetchError);
        setOptions([]);
        return;
      }

      setOptions(
        (data ?? []).map((row: Record<string, unknown>) => ({
          value: String(row.id ?? ''),
          label: String(row[displayField] ?? row.id ?? ''),
        }))
      );
    } catch (err) {
      console.error('Failed to load relation options:', err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relation]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  if (!relation) return null;

  void fieldKey;
  void searchTerm;

  return (
    <div className="space-y-1">
      <Select
        value={value || ''}
        onValueChange={(val) => onChange(val)}
        disabled={disabled || loading}
      >
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder={field.placeholder || `Select ${relation.entity}...`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loading && <p className="text-sm text-muted-foreground">Loading options...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
