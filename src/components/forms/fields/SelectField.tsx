import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldRenderProps } from '@/lib/schema-engine/types';

/**
 * Select Field Component
 *
 * Renders a dropdown select field based on schema configuration.
 */
export function SelectField({
  field,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fieldKey,
  value,
  onChange,
  error,
  disabled,
  mode,
}: FieldRenderProps) {
  // Get options - handle both static and dynamic options
  const getOptions = (): Array<{ value: string; label: string }> => {
    if (field.options) {
      if (Array.isArray(field.options)) {
        return field.options.map(opt =>
          typeof opt === 'string' ? { value: opt, label: opt } : opt
        );
      }
    }
    return [];
  };

  const options = getOptions();

  if (mode === 'table') {
    const selectedOption = options.find(opt => opt.value === value);
    return <span>{selectedOption?.label || value || ''}</span>;
  }

  if (mode === 'detail') {
    const selectedOption = options.find(opt => opt.value === value);
    return <div className="text-sm text-muted-foreground">{selectedOption?.label || 'Not selected'}</div>;
  }

  // Form mode
  return (
    <Select
      value={value || ''}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={error ? 'border-destructive' : ''}>
        <SelectValue placeholder={field.placeholder || 'Select an option'} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
