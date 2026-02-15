import React from 'react';
import { FieldRenderProps } from './index';
import { Textarea } from '@/components/ui/textarea';

/**
 * Richtext Field Component
 *
 * Renders a rich text editor field.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RichtextField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  return (
    <div className="space-y-1">
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={6}
        className={`font-mono text-sm ${error ? 'border-destructive' : ''}`}
        placeholder={field.placeholder || 'Enter rich text content...'}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
