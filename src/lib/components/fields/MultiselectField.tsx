"use client";

import React, { useState } from 'react';
import { FieldRenderProps } from './index';

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
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2 text-left border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
            error ? 'border-destructive' : 'border-input'
          } ${disabled ? 'bg-muted' : ''}`}
        >
          <span className={selectedValues.length === 0 ? 'text-muted-foreground' : 'text-foreground'}>
            {getDisplayText()}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-popover border border-input rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const isSelected = selectedValues.includes(optionValue);

              return (
                <div
                  key={index}
                  onClick={() => handleToggle(optionValue)}
                  className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by parent onClick
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
