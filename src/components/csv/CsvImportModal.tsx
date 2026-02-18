'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCsvImport } from '@/lib/csv/hooks/useCsvImport';
import { useCsvTemplate } from '@/lib/csv/hooks/useCsvTemplate';
import type { ColumnMapping } from '@/lib/csv/mapper';

interface CsvImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: string;
  displayName: string;
  onComplete?: () => void;
}

export function CsvImportModal({
  open,
  onOpenChange,
  entity,
  displayName,
  onComplete,
}: CsvImportModalProps) {
  const {
    step,
    file,
    validateResult,
    confirmResult,
    mappings,
    loading,
    error,
    uploadAndValidate,
    updateMapping,
    revalidate,
    confirmImport,
    reset,
    setStep,
  } = useCsvImport({ entity, displayName, onComplete });

  const { downloading, downloadTemplate } = useCsvTemplate({ entity, displayName });
  const [duplicateStrategy, setDuplicateStrategy] = React.useState<'skip' | 'update' | 'error'>('skip');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) uploadAndValidate(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      uploadAndValidate(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const steps = [
    { key: 'upload', label: 'Upload' },
    { key: 'mapping', label: 'Map Columns' },
    { key: 'preview', label: 'Preview' },
    { key: 'importing', label: 'Importing' },
    { key: 'complete', label: 'Complete' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import {displayName}</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import {displayName.toLowerCase()} in bulk.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 px-1">
          {steps.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className={cn(
                'flex items-center gap-1.5 text-xs font-medium',
                i <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
              )}>
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                  i < currentStepIndex ? 'bg-primary text-primary-foreground' :
                  i === currentStepIndex ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                )}>
                  {i < currentStepIndex ? '✓' : i + 1}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-px',
                  i < currentStepIndex ? 'bg-primary' : 'bg-border'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          {step === 'upload' && (
            <UploadStep
              loading={loading}
              downloading={downloading}
              error={error}
              onFileSelect={handleFileSelect}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDownloadTemplate={downloadTemplate}
              fileInputRef={fileInputRef}
            />
          )}

          {step === 'mapping' && validateResult && (
            <MappingStep
              mappings={mappings}
              importableFields={validateResult.config.importableFields}
              onUpdateMapping={updateMapping}
              fileName={file?.name ?? ''}
              totalRows={validateResult.parse.totalRows}
            />
          )}

          {step === 'preview' && validateResult && (
            <PreviewStep
              validation={validateResult.validation}
              duplicateStrategy={duplicateStrategy}
              onDuplicateStrategyChange={setDuplicateStrategy}
            />
          )}

          {step === 'importing' && (
            <ImportingStep />
          )}

          {step === 'complete' && confirmResult && (
            <CompleteStep result={confirmResult} />
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex-shrink-0">
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}

          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => { reset(); }}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={revalidate} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Preview <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('mapping')}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button
                onClick={() => confirmImport(duplicateStrategy)}
                disabled={loading || (validateResult?.validation.validRows ?? 0) === 0}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Import {validateResult?.validation.validRows ?? 0} rows
              </Button>
            </>
          )}

          {step === 'complete' && (
            <>
              {confirmResult && confirmResult.errorCount > 0 && (
                <Button variant="outline" onClick={() => { reset(); }}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Import Again
                </Button>
              )}
              <Button onClick={handleClose}>Done</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function UploadStep({
  loading,
  downloading,
  error,
  onFileSelect,
  onDrop,
  onDragOver,
  onDownloadTemplate,
  fileInputRef,
}: {
  loading: boolean;
  downloading: boolean;
  error: string | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDownloadTemplate: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="space-y-4 py-4">
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          'hover:border-primary/50 hover:bg-muted/50',
          loading && 'opacity-50 pointer-events-none'
        )}
        onClick={() => fileInputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        {loading ? (
          <Loader2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground animate-spin" />
        ) : (
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">
          {loading ? 'Processing file...' : 'Drop CSV file here or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Maximum 10MB, UTF-8 encoded
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onFileSelect}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-center">
        <Button variant="ghost" size="sm" onClick={onDownloadTemplate} disabled={downloading}>
          {downloading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          Download import template
        </Button>
      </div>
    </div>
  );
}

function MappingStep({
  mappings,
  importableFields,
  onUpdateMapping,
  fileName,
  totalRows,
}: {
  mappings: ColumnMapping[];
  importableFields: { dbField: string; csvHeader: string; type: string; required: boolean }[];
  onUpdateMapping: (csvHeader: string, dbField: string | null) => void;
  fileName: string;
  totalRows: number;
}) {
  const mappedCount = mappings.filter(m => m.dbField !== null).length;

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{fileName}</span>
          <Badge variant="secondary">{totalRows} rows</Badge>
        </div>
        <span className="text-muted-foreground">
          {mappedCount}/{mappings.length} mapped
        </span>
      </div>

      <ScrollArea className="h-[340px] pr-3">
        <div className="space-y-2">
          {mappings.map(mapping => (
            <div key={mapping.csvHeader} className="flex items-center gap-3 p-2 rounded-md border bg-card">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{mapping.csvHeader}</p>
                {mapping.confidence !== 'unmapped' && mapping.confidence !== 'manual' && (
                  <Badge variant="outline" className="text-[10px] mt-0.5">
                    {mapping.confidence}
                  </Badge>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="w-48">
                <Select
                  value={mapping.dbField ?? '__unmapped__'}
                  onValueChange={(v) => onUpdateMapping(mapping.csvHeader, v === '__unmapped__' ? null : v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__unmapped__">
                      <span className="text-muted-foreground">— Skip —</span>
                    </SelectItem>
                    {importableFields.map(f => (
                      <SelectItem key={f.dbField} value={f.dbField}>
                        <span className="flex items-center gap-1">
                          {f.csvHeader}
                          {f.required && <span className="text-destructive">*</span>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function PreviewStep({
  validation,
  duplicateStrategy,
  onDuplicateStrategyChange,
}: {
  validation: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
    duplicatesDetected: { rowIndex: number; conflictField: string; conflictValue: string }[];
    previewErrors: { rowIndex: number; errors: { field: string; message: string; value: string }[] }[];
    previewWarnings: { rowIndex: number; warnings: { field: string; message: string; value: string }[] }[];
  };
  duplicateStrategy: 'skip' | 'update' | 'error';
  onDuplicateStrategyChange: (s: 'skip' | 'update' | 'error') => void;
}) {
  return (
    <div className="space-y-4 py-2">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Valid</span>
          </div>
          <p className="text-2xl font-bold text-primary mt-1">{validation.validRows}</p>
        </div>
        <div className="p-3 rounded-md bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Errors</span>
          </div>
          <p className="text-2xl font-bold text-destructive mt-1">{validation.errorRows}</p>
        </div>
        <div className="p-3 rounded-md bg-warning/5 border border-warning/20">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-warning">Warnings</span>
          </div>
          <p className="text-2xl font-bold text-warning mt-1">{validation.warningRows}</p>
        </div>
      </div>

      {/* Duplicate Strategy */}
      {validation.duplicatesDetected.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-md bg-muted">
          <span className="text-sm font-medium">Duplicate handling:</span>
          <Select value={duplicateStrategy} onValueChange={onDuplicateStrategyChange}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skip">Skip duplicates</SelectItem>
              <SelectItem value="update">Update existing</SelectItem>
              <SelectItem value="error">Reject all</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Error Preview */}
      {validation.previewErrors.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-destructive">Errors (showing first {validation.previewErrors.length})</p>
          <ScrollArea className="h-[160px]">
            <div className="space-y-1">
              {validation.previewErrors.map(row => (
                <div key={row.rowIndex} className="text-xs p-2 rounded bg-destructive/5 border border-destructive/20">
                  <span className="font-medium">Row {row.rowIndex + 2}:</span>{' '}
                  {row.errors.map(e => `${e.field}: ${e.message}`).join('; ')}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

function ImportingStep() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
      <p className="text-sm font-medium">Importing data...</p>
      <p className="text-xs text-muted-foreground">This may take a moment for large files.</p>
      <Progress value={undefined} className="w-48" />
    </div>
  );
}

function CompleteStep({ result }: { result: {
  success: boolean;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: { rowIndex: number; field?: string; message: string; originalData?: Record<string, string> }[];
  duration: number;
}}) {
  const handleDownloadErrorReport = React.useCallback(() => {
    if (result.errors.length === 0) return;

    const headers = ['Row', 'Error', ...Object.keys(result.errors[0]?.originalData ?? {})];
    const lines = [headers.join(',')];

    for (const err of result.errors) {
      const row = [
        String(err.rowIndex + 2),
        `"${err.message.replace(/"/g, '""')}"`,
        ...Object.values(err.originalData ?? {}).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`),
      ];
      lines.push(row.join(','));
    }

    const csv = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `import_errors_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [result.errors]);

  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-col items-center text-center space-y-2">
        {result.success ? (
          <CheckCircle2 className="h-12 w-12 text-primary" />
        ) : (
          <AlertTriangle className="h-12 w-12 text-warning" />
        )}
        <h3 className="text-lg font-semibold">
          {result.success ? 'Import Complete' : 'Import Completed with Issues'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Completed in {(result.duration / 1000).toFixed(1)}s
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBlock label="Inserted" value={result.insertedCount} variant="primary" />
        <StatBlock label="Updated" value={result.updatedCount} variant="accent" />
        <StatBlock label="Skipped" value={result.skippedCount} variant="warning" />
        <StatBlock label="Errors" value={result.errorCount} variant="destructive" />
      </div>

      {result.errors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-destructive">Errors</p>
            <Button variant="outline" size="sm" onClick={handleDownloadErrorReport}>
              <Download className="h-3.5 w-3.5 mr-1" />
              Download error report
            </Button>
          </div>
          <ScrollArea className="h-[120px]">
            <div className="space-y-1">
              {result.errors.slice(0, 20).map((err, i) => (
                <div key={i} className="text-xs p-2 rounded bg-destructive/5 border border-destructive/20">
                  <span className="font-medium">Row {err.rowIndex + 2}:</span> {err.message}
                </div>
              ))}
              {result.errors.length > 20 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  ...and {result.errors.length - 20} more. Download the error report for full details.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value, variant }: { label: string; value: number; variant: 'primary' | 'accent' | 'warning' | 'destructive' }) {
  const variantClasses: Record<string, string> = {
    primary: 'text-primary',
    accent: 'text-accent-foreground',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  return (
    <div className="text-center p-2 rounded-md bg-muted">
      <p className={cn('text-xl font-bold', variantClasses[variant])}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
