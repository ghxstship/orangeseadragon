"use client";

import * as React from "react";
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  parseCsv,
  autoMapHeaders,
  validateCsvRows,
  type CsvParseResult,
  type CsvFieldMapping,
  type CsvParseError,
} from "@/lib/utils/csv";

type ImportStep = "upload" | "mapping" | "preview" | "importing" | "complete";

interface ImportField {
  key: string;
  label: string;
  required?: boolean;
}

interface ImportModalProps {
  entityName: string;
  fields: ImportField[];
  onImport: (
    rows: Record<string, string>[],
    mappings: CsvFieldMapping[]
  ) => Promise<{ success: number; failed: number; errors?: string[] }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
  templateFields?: ImportField[];
  className?: string;
}

export function ImportModal({
  entityName,
  fields,
  onImport,
  open,
  onOpenChange,
  triggerLabel = "Import",
  templateFields,
  className,
}: ImportModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [step, setStep] = React.useState<ImportStep>("upload");
  const [parseResult, setParseResult] = React.useState<CsvParseResult | null>(
    null
  );
  const [mappings, setMappings] = React.useState<CsvFieldMapping[]>([]);
  const [validationErrors, setValidationErrors] = React.useState<
    CsvParseError[]
  >([]);
  const [importProgress, setImportProgress] = React.useState(0);
  const [importResult, setImportResult] = React.useState<{
    success: number;
    failed: number;
    errors?: string[];
  } | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  const reset = () => {
    setStep("upload");
    setParseResult(null);
    setMappings([]);
    setValidationErrors([]);
    setImportProgress(0);
    setImportResult(null);
    setDragOver(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    setIsOpen(nextOpen);
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setValidationErrors([
        { row: 0, message: "Only CSV files are supported." },
      ]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCsv(text);
      setParseResult(result);

      if (result.errors.length > 0 && result.rows.length === 0) {
        setValidationErrors(result.errors);
        return;
      }

      const autoMappings = autoMapHeaders(result.headers, fields);
      setMappings(autoMappings);
      setStep("mapping");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const updateMapping = (csvHeader: string, entityField: string) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.csvHeader === csvHeader ? { ...m, entityField } : m
      )
    );
  };

  const handleProceedToPreview = () => {
    if (!parseResult) return;

    const requiredFields = fields
      .filter((f) => f.required)
      .map((f) => f.key);

    const mappedRequired = requiredFields.filter((rf) =>
      mappings.some((m) => m.entityField === rf)
    );

    const unmappedRequired = requiredFields.filter(
      (rf) => !mappings.some((m) => m.entityField === rf)
    );

    if (unmappedRequired.length > 0) {
      const labels = unmappedRequired.map(
        (key) => fields.find((f) => f.key === key)?.label || key
      );
      setValidationErrors([
        {
          row: 0,
          message: `Required fields not mapped: ${labels.join(", ")}`,
        },
      ]);
      return;
    }

    // Validate mapped rows
    const mappedRows = parseResult.rows.map((row) => {
      const mapped: Record<string, string> = {};
      mappings.forEach((m) => {
        if (m.entityField) {
          mapped[m.entityField] = row[m.csvHeader] || "";
        }
      });
      return mapped;
    });

    const errors = validateCsvRows(mappedRows, mappedRequired);
    setValidationErrors(errors);
    setStep("preview");
  };

  const handleImport = async () => {
    if (!parseResult) return;

    setStep("importing");
    setImportProgress(0);

    const mappedRows = parseResult.rows.map((row) => {
      const mapped: Record<string, string> = {};
      mappings.forEach((m) => {
        if (m.entityField) {
          mapped[m.entityField] = row[m.csvHeader] || "";
        }
      });
      return mapped;
    });

    // Simulate progress
    const interval = setInterval(() => {
      setImportProgress((prev) => (prev >= 85 ? prev : prev + 5));
    }, 200);

    try {
      const result = await onImport(mappedRows, mappings);
      clearInterval(interval);
      setImportProgress(100);
      setImportResult(result);
      setStep("complete");
    } catch {
      clearInterval(interval);
      setImportResult({
        success: 0,
        failed: parseResult.rows.length,
        errors: ["Import failed. Please try again."],
      });
      setStep("complete");
    }
  };

  const handleDownloadTemplate = () => {
    const templateCols = (templateFields || fields).map((f) => f.label);
    const csv = templateCols.join(",") + "\n";
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${entityName.toLowerCase().replace(/\s+/g, "-")}-template.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const mappedCount = mappings.filter((m) => m.entityField).length;
  const previewRows = parseResult?.rows.slice(0, 5) || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Upload className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import {entityName}
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import {entityName.toLowerCase()} in bulk.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 py-2">
          {(["upload", "mapping", "preview", "complete"] as const).map(
            (s, i) => (
              <React.Fragment key={s}>
                {i > 0 && (
                  <div
                    className={cn(
                      "h-px flex-1",
                      step === s ||
                        (["mapping", "preview", "importing", "complete"].indexOf(step) >=
                          ["mapping", "preview", "importing", "complete"].indexOf(s))
                        ? "bg-primary"
                        : "bg-border"
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                    step === s || step === "importing"
                      ? "bg-primary text-primary-foreground"
                      : ["mapping", "preview", "importing", "complete"].indexOf(step) >
                        ["upload", "mapping", "preview", "complete"].indexOf(s)
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {i + 1}
                </div>
              </React.Fragment>
            )
          )}
        </div>

        {/* STEP: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">
                Drop your CSV file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .csv files up to 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            <Button
              variant="link"
              size="sm"
              className="gap-2"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-3 w-3" />
              Download CSV template
            </Button>

            {validationErrors.length > 0 && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  File Error
                </div>
                {validationErrors.map((err, i) => (
                  <p key={i} className="text-xs text-destructive/80">
                    {err.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP: Mapping */}
        {step === "mapping" && parseResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {parseResult.totalRows} rows found &middot; {mappedCount} of{" "}
                {parseResult.headers.length} columns mapped
              </p>
              <Badge variant={mappedCount === parseResult.headers.length ? "default" : "secondary"}>
                {mappedCount}/{parseResult.headers.length} mapped
              </Badge>
            </div>

            <div className="rounded-lg border divide-y max-h-[300px] overflow-y-auto">
              {mappings.map((mapping) => (
                <div
                  key={mapping.csvHeader}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {mapping.csvHeader}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      e.g. &ldquo;
                      {parseResult.rows[0]?.[mapping.csvHeader]?.slice(0, 40) ||
                        "—"}
                      &rdquo;
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                  <div className="w-full sm:w-48">
                    <Select
                      value={mapping.entityField || "__skip__"}
                      onValueChange={(v) =>
                        updateMapping(
                          mapping.csvHeader,
                          v === "__skip__" ? "" : v
                        )
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Skip this column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__skip__">
                          Skip this column
                        </SelectItem>
                        {fields.map((f) => (
                          <SelectItem key={f.key} value={f.key}>
                            {f.label}
                            {f.required && " *"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            {validationErrors.length > 0 && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Mapping Issues
                </div>
                {validationErrors.map((err, i) => (
                  <p key={i} className="text-xs text-destructive/80">
                    {err.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP: Preview */}
        {step === "preview" && parseResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Previewing first {previewRows.length} of{" "}
                {parseResult.totalRows} rows
              </p>
              {validationErrors.length > 0 && (
                <Badge variant="destructive">
                  {validationErrors.length} warnings
                </Badge>
              )}
            </div>

            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {mappings
                      .filter((m) => m.entityField)
                      .map((m) => (
                        <TableHead key={m.entityField} className="text-xs">
                          {fields.find((f) => f.key === m.entityField)?.label ||
                            m.entityField}
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, i) => (
                    <TableRow key={i}>
                      {mappings
                        .filter((m) => m.entityField)
                        .map((m) => (
                          <TableCell
                            key={m.entityField}
                            className="text-xs max-w-[200px] truncate"
                          >
                            {row[m.csvHeader] || "—"}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {validationErrors.length > 0 && (
              <div className="rounded-lg border border-semantic-warning/50 bg-semantic-warning/5 p-3 max-h-[120px] overflow-y-auto">
                <div className="flex items-center gap-2 text-sm font-medium text-semantic-warning mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  {validationErrors.length} validation warnings
                </div>
                {validationErrors.slice(0, 10).map((err, i) => (
                  <p key={i} className="text-xs text-semantic-warning/80">
                    Row {err.row}: {err.message}
                  </p>
                ))}
                {validationErrors.length > 10 && (
                  <p className="text-xs text-semantic-warning/60 mt-1">
                    ...and {validationErrors.length - 10} more
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP: Importing */}
        {step === "importing" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-sm font-medium">
              Importing {parseResult?.totalRows || 0} {entityName.toLowerCase()}...
            </p>
            <div className="w-full max-w-xs">
              <Progress value={importProgress} />
            </div>
            <p className="text-xs text-muted-foreground">
              {importProgress}% complete
            </p>
          </div>
        )}

        {/* STEP: Complete */}
        {step === "complete" && importResult && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div
              className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center",
                importResult.failed === 0
                  ? "bg-semantic-success/10"
                  : "bg-semantic-warning/10"
              )}
            >
              {importResult.failed === 0 ? (
                <CheckCircle2 className="h-8 w-8 text-semantic-success" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-semantic-warning" />
              )}
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold">Import Complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                {importResult.success} imported successfully
                {importResult.failed > 0 &&
                  ` · ${importResult.failed} failed`}
              </p>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="w-full rounded-lg border border-destructive/50 bg-destructive/5 p-3 max-h-[120px] overflow-y-auto">
                {importResult.errors.map((err, i) => (
                  <p key={i} className="text-xs text-destructive/80">
                    {err}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
          )}

          {step === "mapping" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={handleProceedToPreview}>
                Preview Import
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setValidationErrors([]);
                  setStep("mapping");
                }}
              >
                Back
              </Button>
              <Button onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" />
                Import {parseResult?.totalRows || 0} rows
              </Button>
            </>
          )}

          {step === "complete" && (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
