import React from 'react';
import { FieldRenderProps } from './index';
import { ColorPicker } from '@/components/ui/color-picker';
import { COLOR_PICKER_DEFAULT_HEX } from '@/lib/theming/color-presets';

/**
 * Color Field Component
 *
 * Renders a color picker field.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ColorField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  const normalizedValue = typeof value === 'string' && value.length > 0 ? value : COLOR_PICKER_DEFAULT_HEX;

  return (
    <div className="space-y-1">
      <ColorPicker
        value={normalizedValue}
        onChange={onChange}
        disabled={disabled}
        className={`w-full ${error ? 'border-destructive' : ''}`}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
