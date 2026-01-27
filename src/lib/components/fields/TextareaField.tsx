import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FieldRenderProps } from '@/lib/schema/types';

/**
 * Textarea Field Component
 *
 * Renders a textarea input field based on schema configuration.
 */
export function TextareaField({
  field,
  fieldKey,
  value,
  onChange,
  error,
  disabled,
  mode,
}: FieldRenderProps) {
  if (mode === 'table') {
    const truncated = value && typeof value === 'string' && value.length > 50
      ? `${value.substring(0, 50)}...`
      : value;
    return <span>{truncated || ''}</span>;
  }

  if (mode === 'detail') {
    return <div className="text-sm text-muted-foreground whitespace-pre-wrap">
      {value || 'Not specified'}
    </div>;
  }

  // Form mode
  return (
    <Textarea
      id={fieldKey}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      disabled={disabled}
      className={error ? 'border-destructive' : ''}
      rows={field.type === 'json' ? 8 : 4}
      maxLength={field.maxLength}
    />
  );
}
