import React from 'react';
import { FieldRenderProps } from './index';

/**
 * Image Field Component
 *
 * Renders an image upload field with preview.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ImageField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className="space-y-1">
      {value && (
        <div className="mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob URL preview not compatible with next/image */}
          <img
            src={typeof value === 'string' ? value : URL.createObjectURL(value)}
            alt="Preview"
            className="max-w-full h-32 object-cover rounded-md border"
          />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring ${error ? 'border-destructive' : 'border-input'
          } ${disabled ? 'bg-muted' : ''}`}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
