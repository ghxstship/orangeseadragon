'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface UseCsvExportOptions {
  entity: string;
  displayName: string;
  where?: Record<string, unknown>;
}

interface UseCsvExportReturn {
  exporting: boolean;
  exportCsv: () => Promise<void>;
}

export function useCsvExport({ entity, displayName, where }: UseCsvExportOptions): UseCsvExportReturn {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportCsv = useCallback(async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (where) params.set('where', JSON.stringify(where));

      const response = await fetch(`/api/csv/${entity}/export?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message ?? `Export failed (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${displayName.toLowerCase().replace(/\s+/g, '-')}_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: 'Export complete', description: `${displayName} exported successfully.` });
    } catch (err) {
      toast({
        title: 'Export failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  }, [entity, displayName, where, toast]);

  return { exporting, exportCsv };
}
