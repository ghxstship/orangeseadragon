import React from 'react';
import { FieldRenderProps } from './index';

/**
 * Richtext Field Component
 *
 * Renders a rich text editor field.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RichtextField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  return (
    <div className="space-y-1">
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={6}
        className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm ${
          error ? 'border-destructive' : 'border-input'
        } ${disabled ? 'bg-muted' : ''}`}
        placeholder={field.placeholder || 'Enter rich text content...'}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
