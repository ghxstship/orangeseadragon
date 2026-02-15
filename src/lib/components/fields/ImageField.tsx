import React from 'react';
import { FieldRenderProps } from './index';
import { Input } from '@/components/ui/input';

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

  const previewSrc = React.useMemo(() => {
    if (typeof value === 'string') return value;
    if (value instanceof Blob) return URL.createObjectURL(value);
    return null;
  }, [value]);

  React.useEffect(() => {
    if (!previewSrc || typeof value === 'string') return;
    return () => URL.revokeObjectURL(previewSrc);
  }, [previewSrc, value]);

  return (
    <div className="space-y-1">
      {previewSrc && (
        <div className="mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob URL preview not compatible with next/image */}
          <img
            src={previewSrc}
            alt="Preview"
            className="max-w-full h-32 object-cover rounded-md border"
          />
        </div>
      )}
      <Input
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
