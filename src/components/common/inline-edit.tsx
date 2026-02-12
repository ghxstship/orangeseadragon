"use client";

import * as React from "react";
import { Check, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void | Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  displayClassName?: string;
  showEditIcon?: boolean;
  autoFocus?: boolean;
}

export function InlineEdit({
  value,
  onSave,
  onCancel,
  placeholder = "Click to edit",
  multiline = false,
  disabled = false,
  className,
  inputClassName,
  displayClassName,
  showEditIcon = true,
  autoFocus = true,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const [isSaving, setIsSaving] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  React.useEffect(() => {
    if (isEditing && autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, autoFocus]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
    if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input;

    return (
      <div className={cn("flex items-start gap-1", className)}>
        <InputComponent
          ref={inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!isSaving) {
              handleSave();
            }
          }}
          disabled={isSaving}
          placeholder={placeholder}
          className={cn(
            "min-w-[100px]",
            multiline && "min-h-[80px] resize-none",
            inputClassName
          )}
        />
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Check className="h-4 w-4 text-emerald-600" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group inline-flex items-center gap-1 cursor-pointer rounded px-1 -mx-1",
        "hover:bg-muted transition-colors",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={() => !disabled && setIsEditing(true)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
      tabIndex={disabled ? -1 : 0}
      role="button"
    >
      <span
        className={cn(
          "min-w-[20px]",
          !value && "text-muted-foreground italic",
          displayClassName
        )}
      >
        {value || placeholder}
      </span>
      {showEditIcon && !disabled && (
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}

interface InlineEditNumberProps extends Omit<InlineEditProps, "value" | "onSave" | "multiline"> {
  value: number;
  onSave: (value: number) => void | Promise<void>;
  min?: number;
  max?: number;
}

export function InlineEditNumber({
  value,
  onSave,
  min,
  max,
  ...props
}: InlineEditNumberProps) {
  const handleSave = async (stringValue: string) => {
    const numValue = parseFloat(stringValue);
    if (!isNaN(numValue)) {
      let finalValue = numValue;
      if (min !== undefined) finalValue = Math.max(min, finalValue);
      if (max !== undefined) finalValue = Math.min(max, finalValue);
      await onSave(finalValue);
    }
  };

  return (
    <InlineEdit
      value={value.toString()}
      onSave={handleSave}
      {...props}
    />
  );
}
