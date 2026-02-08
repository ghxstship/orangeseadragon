"use client";

import React, { useState } from 'react';
import { FieldRenderProps } from './index';

/**
 * Tags Field Component
 *
 * Renders a tags input field.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TagsField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  const [inputValue, setInputValue] = useState('');
  const tags = Array.isArray(value) ? value : [];

  const handleAddTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      onChange([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-primary hover:text-primary/80"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`flex-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
              error ? 'border-destructive' : 'border-input'
            }`}
            placeholder={field.placeholder || 'Add a tag...'}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Add
          </button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
