"use client";

import * as React from "react";
import { Download, FileSpreadsheet, FileText, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

type ExportFormat = "csv" | "xlsx" | "pdf" | "json";

interface ExportField {
  id: string;
  label: string;
  selected: boolean;
}

interface ExportModalProps {
  title?: string;
  description?: string;
  formats?: ExportFormat[];
  fields?: ExportField[];
  onExport?: (format: ExportFormat, selectedFields: string[]) => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
  totalRecords?: number;
}

const formatIcons: Record<ExportFormat, React.ElementType> = {
  csv: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  pdf: FileText,
  json: FileJson,
};

const formatLabels: Record<ExportFormat, string> = {
  csv: "CSV (.csv)",
  xlsx: "Excel (.xlsx)",
  pdf: "PDF (.pdf)",
  json: "JSON (.json)",
};

const formatDescriptions: Record<ExportFormat, string> = {
  csv: "Comma-separated values, compatible with most spreadsheet apps",
  xlsx: "Microsoft Excel format with formatting support",
  pdf: "Portable document format for printing and sharing",
  json: "JavaScript Object Notation for developers",
};

export function ExportModal({
  title = "Export Data",
  description,
  formats = ["csv", "xlsx", "pdf", "json"],
  fields = [],
  onExport,
  open,
  onOpenChange,
  triggerLabel = "Export",
  totalRecords,
}: ExportModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>(formats[0]!);
  const [selectedFields, setSelectedFields] = React.useState<Set<string>>(
    new Set(fields.filter((f) => f.selected).map((f) => f.id))
  );
  const [isExporting, setIsExporting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  };

  const selectAllFields = () => {
    setSelectedFields(new Set(fields.map((f) => f.id)));
  };

  const deselectAllFields = () => {
    setSelectedFields(new Set());
  };

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await onExport?.(selectedFormat, Array.from(selectedFields));
      setProgress(100);
      setTimeout(() => {
        setIsOpen(false);
        setProgress(0);
      }, 500);
    } finally {
      clearInterval(interval);
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
          {totalRecords !== undefined && (
            <p className="text-sm text-muted-foreground">
              {totalRecords.toLocaleString()} records will be exported
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Export format</Label>
            <RadioGroup
              value={selectedFormat}
              onValueChange={(v) => setSelectedFormat(v as ExportFormat)}
              className="grid grid-cols-2 gap-2"
            >
              {formats.map((format) => {
                const Icon = formatIcons[format];
                return (
                  <Label
                    key={format}
                    htmlFor={format}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                      selectedFormat === format
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    )}
                  >
                    <RadioGroupItem value={format} id={format} />
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{formatLabels[format]}</span>
                  </Label>
                );
              })}
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              {formatDescriptions[selectedFormat]}
            </p>
          </div>

          {fields.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Fields to export</Label>
                <div className="flex gap-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={selectAllFields}
                  >
                    Select all
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={deselectAllFields}
                  >
                    Deselect all
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-1">
                {fields.map((field) => (
                  <Label
                    key={field.id}
                    htmlFor={`field-${field.id}`}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      id={`field-${field.id}`}
                      checked={selectedFields.has(field.id)}
                      onCheckedChange={() => toggleField(field.id)}
                    />
                    {field.label}
                  </Label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedFields.size} of {fields.length} fields selected
              </p>
            </div>
          )}

          {isExporting && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-center text-muted-foreground">
                Exporting... {progress}%
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || (fields.length > 0 && selectedFields.size === 0)}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
