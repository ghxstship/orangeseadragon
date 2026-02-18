import React from 'react';
import { Input } from '@/components/ui/input';
import { FieldRenderProps } from './index';

/**
 * Number Field Component
 *
 * Renders a number input field based on schema configuration.
 */
export function NumberField({
  field,
  fieldKey,
  value,
  onChange,
  error,
  disabled,
  mode,
}: FieldRenderProps) {
  const hasNumericValue = value !== null && value !== undefined && value !== '';

  if (mode === 'table') {
    return <span>{hasNumericValue ? Number(value).toLocaleString() : ''}</span>;
  }

  if (mode === 'detail') {
    return <div className="text-sm text-muted-foreground">
      {hasNumericValue ? Number(value).toLocaleString() : 'Not specified'}
    </div>;
  }

  const inputValue = typeof value === 'number' || typeof value === 'string' ? value : '';

  // Form mode
  return (
    <Input
      id={fieldKey}
      type="number"
      value={inputValue}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      placeholder={field.placeholder}
      disabled={disabled}
      className={error ? 'border-destructive' : ''}
      min={field.min}
      max={field.max}
      step={field.type === 'currency' ? '0.01' : '1'}
    />
  );
}
