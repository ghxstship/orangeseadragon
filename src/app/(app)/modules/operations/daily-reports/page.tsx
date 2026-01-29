'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { dailySiteReportSchema } from '@/lib/schemas/dailySiteReport';

export default function DailySiteReportsPage() {
  return <CrudList schema={dailySiteReportSchema} />;
}
