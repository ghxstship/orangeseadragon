import React from 'react';
import { FieldRenderProps } from './index';
import { Input } from '@/components/ui/input';

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

  const selectedValue = (() => {
    if (value instanceof File) return value.name;
    if (typeof value === 'string') return value;
    if (
      value &&
      typeof value === 'object' &&
      'name' in value &&
      typeof value.name === 'string'
    ) {
      return value.name;
    }
    return '';
  })();

  return (
    <div className="space-y-1">
      <Input
        type="file"
        onChange={handleChange}
        disabled={disabled}
        className={error ? 'border-destructive' : ''}
        accept={field.type === 'image' ? 'image/*' : undefined}
      />
      {selectedValue && (
        <p className="text-sm text-muted-foreground">
          Selected: {selectedValue}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
