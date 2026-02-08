import React from 'react';
import { FieldRenderProps } from './index';

/**
 * Currency Field Component
 *
 * Renders a currency input field with proper formatting.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CurrencyField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.-]/g, '');
    const numValue = parseFloat(rawValue);
    onChange(isNaN(numValue) ? 0 : numValue);
  };

  const formatValue = (val: number) => {
    if (val === null || val === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  return (
    <div className="space-y-1">
      <input
        type="text"
        value={formatValue(value)}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
          error ? 'border-destructive' : 'border-input'
        } ${disabled ? 'bg-muted' : ''}`}
        placeholder={field.placeholder || '$0.00'}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
