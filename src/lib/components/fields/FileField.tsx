import React from 'react';
import { FieldRenderProps } from './index';

/**
 * File Field Component
 *
 * Renders a file upload field.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FileField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className="space-y-1">
      <input
        type="file"
        onChange={handleChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
          error ? 'border-destructive' : 'border-input'
        } ${disabled ? 'bg-muted' : ''}`}
        accept={field.type === 'image' ? 'image/*' : undefined}
      />
      {value && (
        <p className="text-sm text-muted-foreground">
          Selected: {value.name || value}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
