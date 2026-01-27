"use client";

import React, { useState, useEffect } from 'react';
import { FieldRenderProps } from './index';

/**
 * Relation Field Component
 *
 * Renders a relation field for selecting related entities.
 */
export function RelationField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);

  const relation = field.relation;
  if (!relation) return null;

  useEffect(() => {
    const loadOptions = async () => {
      if (relation.optionsEndpoint) {
        setLoading(true);
        try {
          // TODO: Implement API call to load options
          // const response = await fetch(relation.optionsEndpoint);
          // const data = await response.json();
          // setOptions(data);
        } catch (error) {
          console.error('Failed to load relation options:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Use static options if provided
        const staticOptions = Array.isArray(relation.options)
          ? relation.options.map((opt: any) => ({
              value: typeof opt === 'string' ? opt : opt.value,
              label: typeof opt === 'string' ? opt : opt.label
            }))
          : [];
        setOptions(staticOptions);
      }
    };

    loadOptions();
  }, [relation]);

  const handleChange = (selectedValue: string) => {
    onChange(selectedValue);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="space-y-1">
      <select
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled || loading}
        className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
          error ? 'border-destructive' : 'border-input'
        } ${disabled ? 'bg-muted' : ''}`}
      >
        <option value="">
          {field.placeholder || `Select ${relation.entity.slice(0, -1)}...`}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {loading && <p className="text-sm text-muted-foreground">Loading options...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
