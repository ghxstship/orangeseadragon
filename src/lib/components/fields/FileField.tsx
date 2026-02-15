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

  return (
    <div className="space-y-1">
      <Input
        type="file"
        onChange={handleChange}
        disabled={disabled}
        className={error ? 'border-destructive' : ''}
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
