import React from 'react';
import { FieldRenderProps } from './index';

/**
 * Color Field Component
 *
 * Renders a color picker field.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ColorField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-12 h-10 border rounded focus:outline-none focus:ring-2 focus:ring-ring ${
            error ? 'border-destructive' : 'border-input'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`flex-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
            error ? 'border-destructive' : 'border-input'
          } ${disabled ? 'bg-muted' : ''}`}
          placeholder="#000000"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
