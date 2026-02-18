'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { CsvImportModal } from './CsvImportModal';

interface CsvImportButtonProps {
  entity: string;
  displayName: string;
  onComplete?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

export function CsvImportButton({
  entity,
  displayName,
  onComplete,
  variant = 'outline',
  size = 'sm',
}: CsvImportButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Import</span>
      </Button>
      <CsvImportModal
        open={open}
        onOpenChange={setOpen}
        entity={entity}
        displayName={displayName}
        onComplete={onComplete}
      />
    </>
  );
}
