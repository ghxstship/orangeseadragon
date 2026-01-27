import React from 'react';
import { FieldRenderProps } from './index';

/**
 * Location Field Component
 *
 * Renders a location/address input field.
 */
export function LocationField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  return (
    <div className="space-y-1">
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
          error ? 'border-destructive' : 'border-input'
        } ${disabled ? 'bg-muted' : ''}`}
        placeholder={field.placeholder || 'Enter address...'}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
