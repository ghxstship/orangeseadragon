'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { runsheetSchema } from '@/lib/schemas/production/runsheet';

export default function RunsheetsPage() {
  return <CrudList schema={runsheetSchema} />;
}
