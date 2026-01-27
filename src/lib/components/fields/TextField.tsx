import React from 'react';
import { Input } from '@/components/ui/input';
import { FieldRenderProps } from '@/lib/schema/types';

/**
 * Text Field Component
 *
 * Renders a text input field based on schema configuration.
 */
export function TextField({
  field,
  fieldKey,
  value,
  onChange,
  error,
  disabled,
  mode,
}: FieldRenderProps) {
  if (mode === 'table') {
    return <span>{value || ''}</span>;
  }

  if (mode === 'detail') {
    return <div className="text-sm text-muted-foreground">{value || 'Not specified'}</div>;
  }

  // Form mode
  return (
    <Input
      id={fieldKey}
      type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      disabled={disabled}
      className={error ? 'border-destructive' : ''}
      autoComplete={field.type === 'email' ? 'email' : 'off'}
    />
  );
}
