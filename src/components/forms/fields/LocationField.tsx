import React from 'react';
import { FieldRenderProps } from './index';
import { Input } from '@/components/ui/input';

/**
 * Location Field Component
 *
 * Renders a location/address input field.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function LocationField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  const inputValue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';

  return (
    <div className="space-y-1">
      <Input
        id={fieldKey}
        type="text"
        value={inputValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={error ? 'border-destructive' : ''}
        placeholder={field.placeholder || 'Enter address...'}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
