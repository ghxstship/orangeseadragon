"use client";

import React, { useState } from 'react';
import { FieldRenderProps } from './index';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown } from 'lucide-react';

/**
 * Multiselect Field Component
 *
 * Renders a multiselect field with checkboxes.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MultiselectField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedValues = Array.isArray(value) ? value : [];

  const rawOptions = field.options || [];
  const options = typeof rawOptions === 'function' ? [] : rawOptions;

  const handleToggle = (optionValue: string) => {
    if (disabled) return;

    let newValue: string[];
    if (selectedValues.includes(optionValue)) {
      newValue = selectedValues.filter(v => v !== optionValue);
    } else {
      newValue = [...selectedValues, optionValue];
    }
    onChange(newValue);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return field.placeholder || 'Select options...';
    }
    if (selectedValues.length === 1) {
      const option = options.find(opt => typeof opt === 'string' ? opt === selectedValues[0] : opt.value === selectedValues[0]);
      return typeof option === 'string' ? option : option?.label || selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full justify-between h-auto py-2 px-3 font-normal ${error ? 'border-destructive' : ''} ${disabled ? 'bg-muted' : ''}`}
        >
          <span className={selectedValues.length === 0 ? 'text-muted-foreground' : 'text-foreground'}>
            {getDisplayText()}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-popover border border-input rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const isSelected = selectedValues.includes(optionValue);

              return (
                <div
                  key={index}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-pressed={isSelected}
                  onClick={() => handleToggle(optionValue)}
                  onKeyDown={(e) => {
                    if (disabled) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggle(optionValue);
                    }
                  }}
                  className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center"
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(optionValue)}
                    onClick={(e) => e.stopPropagation()}
                    className="mr-2"
                  />
                  <span className="text-sm">{optionLabel}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
