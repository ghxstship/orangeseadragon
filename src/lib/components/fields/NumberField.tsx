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
  if (mode === 'table') {
    return <span>{value ? Number(value).toLocaleString() : ''}</span>;
  }

  if (mode === 'detail') {
    return <div className="text-sm text-muted-foreground">
      {value ? Number(value).toLocaleString() : 'Not specified'}
    </div>;
  }

  // Form mode
  return (
    <Input
      id={fieldKey}
      type="number"
      value={value || ''}
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
