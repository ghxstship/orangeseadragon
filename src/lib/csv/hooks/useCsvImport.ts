'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { ColumnMapping } from '../mapper';

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

export interface ValidateResponse {
  parse: {
    headers: string[];
    totalRows: number;
    parseErrors: { row: number; column?: string; message: string }[];
    encoding: string;
    delimiter: string;
  };
  mappings: ColumnMapping[];
  validation: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
    duplicatesDetected: { rowIndex: number; conflictField: string; conflictValue: string }[];
    previewErrors: { rowIndex: number; errors: { field: string; message: string; value: string }[] }[];
    previewWarnings: { rowIndex: number; warnings: { field: string; message: string; value: string }[] }[];
  };
  config: {
    model: string;
    displayName: string;
    importableFields: {
      dbField: string;
      csvHeader: string;
      type: string;
      required: boolean;
      enumValues?: string[];
      foreignKey?: { model: string };
    }[];
  };
}

export interface ConfirmResponse {
  success: boolean;
  totalRows: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: { rowIndex: number; field?: string; message: string; originalData: Record<string, string> }[];
  duration: number;
}

interface UseCsvImportOptions {
  entity: string;
  displayName: string;
  onComplete?: () => void;
}

interface UseCsvImportReturn {
  step: ImportStep;
  file: File | null;
  validateResult: ValidateResponse | null;
  confirmResult: ConfirmResponse | null;
  mappings: ColumnMapping[];
  loading: boolean;
  error: string | null;
  uploadAndValidate: (file: File) => Promise<void>;
  updateMapping: (csvHeader: string, dbField: string | null) => void;
  revalidate: () => Promise<void>;
  confirmImport: (duplicateStrategy: 'skip' | 'update' | 'error') => Promise<void>;
  reset: () => void;
  setStep: (step: ImportStep) => void;
}

export function useCsvImport({ entity, displayName, onComplete }: UseCsvImportOptions): UseCsvImportReturn {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [validateResult, setValidateResult] = useState<ValidateResponse | null>(null);
  const [confirmResult, setConfirmResult] = useState<ConfirmResponse | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadAndValidate = useCallback(async (selectedFile: File) => {
    setLoading(true);
    setError(null);
    setFile(selectedFile);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`/api/csv/${entity}/validate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message ?? `Validation failed (${response.status})`);
      }

      const result = await response.json();
      const data = result.data as ValidateResponse;
      setValidateResult(data);
      setMappings(data.mappings);
      setStep('mapping');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      toast({ title: 'Upload failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [entity, toast]);

  const updateMapping = useCallback((csvHeader: string, dbField: string | null) => {
    setMappings(prev =>
      prev.map(m =>
        m.csvHeader === csvHeader
          ? { ...m, dbField, confidence: dbField ? 'manual' as const : 'unmapped' as const }
          : m
      )
    );
  }, []);

  const revalidate = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/csv/${entity}/validate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message ?? 'Re-validation failed');
      }

      const result = await response.json();
      const data = result.data as ValidateResponse;
      setValidateResult(data);
      setStep('preview');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Re-validation failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [entity, file]);

  const confirmImport = useCallback(async (duplicateStrategy: 'skip' | 'update' | 'error') => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setStep('importing');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mappings', JSON.stringify(mappings));
      formData.append('duplicateStrategy', duplicateStrategy);

      const response = await fetch(`/api/csv/${entity}/confirm`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message ?? 'Import failed');
      }

      const result = await response.json();
      const data = result.data as ConfirmResponse;
      setConfirmResult(data);
      setStep('complete');

      if (data.success) {
        toast({
          title: 'Import complete',
          description: `${data.insertedCount} ${displayName.toLowerCase()} imported successfully.`,
        });
      } else {
        toast({
          title: 'Import completed with errors',
          description: `${data.insertedCount} imported, ${data.errorCount} errors.`,
          variant: 'destructive',
        });
      }

      onComplete?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      setError(msg);
      setStep('preview');
      toast({ title: 'Import failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [entity, displayName, file, mappings, onComplete, toast]);

  const reset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setValidateResult(null);
    setConfirmResult(null);
    setMappings([]);
    setLoading(false);
    setError(null);
  }, []);

  return {
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
  };
}
