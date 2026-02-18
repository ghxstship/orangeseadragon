'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface UseCsvTemplateOptions {
  entity: string;
  displayName: string;
}

interface UseCsvTemplateReturn {
  downloading: boolean;
  downloadTemplate: () => Promise<void>;
}

export function useCsvTemplate({ entity, displayName }: UseCsvTemplateOptions): UseCsvTemplateReturn {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = useCallback(async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/csv/${entity}/template`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message ?? `Template download failed (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${displayName.toLowerCase().replace(/\s+/g, '_')}_import_template.csv`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: 'Template downloaded', description: `${displayName} import template ready.` });
    } catch (err) {
      toast({
        title: 'Download failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  }, [entity, displayName, toast]);

  return { downloading, downloadTemplate };
}
