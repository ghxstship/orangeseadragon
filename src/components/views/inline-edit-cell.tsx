"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   INLINE EDIT CELL
   Click-to-edit table cell for DataView. Supports text, number,
   and select field types. Optimistic update with rollback on error.
   
   Features:
   - Single-click to enter edit mode
   - Enter to save, Escape to cancel
   - Blur auto-saves
   - Optimistic UI with error rollback
   - Minimal footprint — no extra buttons in view mode
   ───────────────────────────────────────────────────────────── */

export type InlineCellType = "text" | "number" | "select";

interface SelectOption {
  value: string;
  label: string;
}

export interface InlineEditCellProps {
  value: unknown;
  fieldKey: string;
  rowId: string;
  cellType?: InlineCellType;
  options?: SelectOption[];
  onSave?: (rowId: string, fieldKey: string, value: unknown) => Promise<void> | void;
  disabled?: boolean;
  className?: string;
  displayNode?: React.ReactNode;
}

export function InlineEditCell({
  value,
  fieldKey,
  rowId,
  cellType = "text",
  options,
  onSave,
  disabled = false,
  className,
  displayNode,
}: InlineEditCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(String(value ?? ""));
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | HTMLSelectElement>(null);
  const originalValue = String(value ?? "");

  React.useEffect(() => {
    setEditValue(String(value ?? ""));
  }, [value]);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleSave = React.useCallback(async (nextValue?: string) => {
    if (!onSave) {
      setIsEditing(false);
      return;
    }

    const resolvedValue = nextValue ?? editValue;

    if (resolvedValue === originalValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(false);

    try {
      const finalValue = cellType === "number" ? Number(resolvedValue) : resolvedValue;
      await onSave(rowId, fieldKey, finalValue);
      setIsEditing(false);
    } catch {
      setError(true);
      setEditValue(originalValue);
      setTimeout(() => setError(false), 2000);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, editValue, originalValue, rowId, fieldKey, cellType]);

  const handleCancel = React.useCallback(() => {
    setEditValue(originalValue);
    setIsEditing(false);
    setError(false);
  }, [originalValue]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleSave();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleCancel();
      }
      if (e.key === "Tab") {
        handleSave();
      }
    },
    [handleSave, handleCancel]
  );

  if (!onSave || disabled) {
    return (
      <div className={className}>
        {displayNode ?? <span className="text-sm">{String(value ?? "")}</span>}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div
        className={cn("flex items-center gap-1 -mx-1", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {cellType === "select" && options ? (
          <Select
            value={editValue}
            onValueChange={(nextValue) => {
              setEditValue(nextValue);
              void handleSave(nextValue);
            }}
            onOpenChange={(open) => {
              if (!open && !isSaving && editValue === originalValue) {
                setIsEditing(false);
              }
            }}
          >
            <SelectTrigger className="h-7 text-sm px-2 min-w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={cellType === "number" ? "number" : "text"}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => {
              if (!isSaving) handleSave();
            }}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            className="h-7 text-sm px-2 min-w-[60px]"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group/cell relative cursor-text rounded px-1 -mx-1 min-h-[28px] flex items-center",
        "hover:bg-muted/60 transition-colors",
        error && "ring-1 ring-destructive/50 bg-destructive/5",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Edit ${fieldKey}`}
    >
      {displayNode ?? <span className="text-sm">{String(value ?? "")}</span>}
      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-60 transition-opacity ml-1 flex-shrink-0" />
    </div>
  );
}
