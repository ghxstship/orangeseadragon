"use client";

import React, { useState } from 'react';
import { FieldRenderProps } from './index';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
          <Badge
            key={index}
            variant="secondary"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs normal-case tracking-normal"
          >
            {tag}
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveTag(tag)}
                className="h-4 w-4 p-0 text-primary hover:text-primary/80"
              >
                ×
              </Button>
            )}
          </Badge>
        ))}
      </div>
      {!disabled && (
        <div className="flex space-x-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`flex-1 ${error ? 'border-destructive' : ''}`}
            placeholder={field.placeholder || 'Add a tag...'}
          />
          <Button
            type="button"
            onClick={handleAddTag}
          >
            Add
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
