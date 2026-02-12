"use client";

import * as React from "react";
import { Pencil, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkEditField {
  key: string;
  label: string;
  type: "text" | "select" | "number" | "date";
  options?: { value: string; label: string }[];
}

interface BulkEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  fields: BulkEditField[];
  entityName: string;
  onApply: (
    ids: string[],
    changes: Record<string, unknown>
  ) => Promise<{ success: number; failed: number }>;
  className?: string;
}

export function BulkEditModal({
  open,
  onOpenChange,
  selectedIds,
  fields,
  entityName,
  onApply,
  className,
}: BulkEditModalProps) {
  const [selectedField, setSelectedField] = React.useState<string>("");
  const [value, setValue] = React.useState<string>("");
  const [isApplying, setIsApplying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<{
    success: number;
    failed: number;
  } | null>(null);

  const activeField = fields.find((f) => f.key === selectedField);

  const reset = () => {
    setSelectedField("");
    setValue("");
    setIsApplying(false);
    setProgress(0);
    setResult(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleApply = async () => {
    if (!selectedField || !value) return;

    setIsApplying(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 85 ? prev : prev + 8));
    }, 150);

    try {
      const res = await onApply(selectedIds, { [selectedField]: value });
      clearInterval(interval);
      setProgress(100);
      setResult(res);
    } catch {
      clearInterval(interval);
      setResult({ success: 0, failed: selectedIds.length });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn("max-w-md", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Bulk Edit {entityName}
          </DialogTitle>
          <DialogDescription>
            Apply a change to{" "}
            <Badge variant="secondary" className="mx-1">
              {selectedIds.length}
            </Badge>{" "}
            selected {entityName.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Field to update</Label>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a field..." />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f.key} value={f.key}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeField && (
              <div className="space-y-2">
                <Label>New value</Label>
                {activeField.type === "select" && activeField.options ? (
                  <Select value={value} onValueChange={setValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select value..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeField.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={activeField.type === "number" ? "number" : activeField.type === "date" ? "date" : "text"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={`Enter new ${activeField.label.toLowerCase()}...`}
                  />
                )}
              </div>
            )}

            {isApplying && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-center text-muted-foreground">
                  Updating {selectedIds.length} records... {progress}%
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium">
              {result.success} of {selectedIds.length} updated
            </p>
            {result.failed > 0 && (
              <p className="text-xs text-destructive">
                {result.failed} failed to update
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {!result ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isApplying}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={!selectedField || !value || isApplying}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {isApplying
                  ? "Applying..."
                  : `Update ${selectedIds.length} records`}
              </Button>
            </>
          ) : (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
