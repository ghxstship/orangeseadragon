import React from 'react';
import { FieldRenderProps } from './index';

/**
 * Datetime Field Component
 *
 * Renders a datetime input field.
 */
export function DatetimeField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  const formatDateTime = (date: Date | string | null) => {
    if (!date) return '';
    const d = new Date(date);
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
      <input
        type="datetime-local"
        value={formatDateTime(value)}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
          error ? 'border-destructive' : 'border-input'
        } ${disabled ? 'bg-muted' : ''}`}
        placeholder={field.placeholder}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
