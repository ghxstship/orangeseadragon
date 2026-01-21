"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface TagInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Add tag...",
  maxTags = 10,
  disabled = false,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addTag = React.useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim().toLowerCase();
      if (
        trimmedTag &&
        !value.includes(trimmedTag) &&
        value.length < maxTags
      ) {
        const newTags = [...value, trimmedTag];
        onChange?.(newTags);
      }
      setInputValue("");
    },
    [value, maxTags, onChange]
  );

  const removeTag = React.useCallback(
    (tagToRemove: string) => {
      const newTags = value.filter((tag) => tag !== tagToRemove);
      onChange?.(newTags);
    },
    [value, onChange]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        removeTag(value[value.length - 1]);
      }
    },
    [inputValue, value, addTag, removeTag]
  );

  const handleBlur = React.useCallback(() => {
    if (inputValue) {
      addTag(inputValue);
    }
  }, [inputValue, addTag]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="ml-1 rounded-full outline-none hover:bg-muted-foreground/20 focus:ring-2 focus:ring-ring"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      {value.length < maxTags && (
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 min-w-[120px]"
        />
      )}
    </div>
  );
}
