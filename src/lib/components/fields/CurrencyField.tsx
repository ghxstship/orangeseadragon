import React from 'react';
import { DEFAULT_LOCALE } from '@/lib/config';
import { FieldRenderProps } from './index';
import { Input } from '@/components/ui/input';

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

  const formatValue = (val: unknown) => {
    if (val === null || val === undefined || val === '') return '';
    const numericValue = typeof val === 'number' ? val : Number(val);
    if (Number.isNaN(numericValue)) return '';
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: 'currency',
      currency: 'USD',
    }).format(numericValue);
  };

  return (
    <div className="space-y-1">
      <Input
        type="text"
        value={formatValue(value)}
        onChange={handleChange}
        disabled={disabled}
        className={error ? 'border-destructive' : ''}
        placeholder={field.placeholder || '$0.00'}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
