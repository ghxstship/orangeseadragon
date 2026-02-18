'use client';

import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useCsvExport } from '@/lib/csv/hooks/useCsvExport';

interface CsvExportButtonProps {
  entity: string;
  displayName: string;
  where?: Record<string, unknown>;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

export function CsvExportButton({
  entity,
  displayName,
  where,
  variant = 'outline',
  size = 'sm',
}: CsvExportButtonProps) {
  const { exporting, exportCsv } = useCsvExport({ entity, displayName, where });

  return (
    <Button variant={variant} size={size} onClick={exportCsv} disabled={exporting}>
      {exporting ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Download className="h-4 w-4 sm:mr-1" />
      )}
      <span className="hidden sm:inline">Export</span>
    </Button>
  );
}
