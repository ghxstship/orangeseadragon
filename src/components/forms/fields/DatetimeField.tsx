import React from 'react';
import { FieldRenderProps } from './index';
import { Input } from '@/components/ui/input';

/**
 * Datetime Field Component
 *
 * Renders a datetime input field.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DatetimeField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  const formatDateTime = (date: unknown) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(String(date));
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      onChange(new Date(value).toISOString());
    } else {
      onChange(null);
    }
  };

  return (
    <div className="space-y-1">
      <Input
        type="datetime-local"
        value={formatDateTime(value)}
        onChange={handleChange}
        disabled={disabled}
        className={error ? 'border-destructive' : ''}
        placeholder={field.placeholder}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
