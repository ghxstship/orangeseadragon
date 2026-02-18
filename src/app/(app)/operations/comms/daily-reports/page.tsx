'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { dailyReportSchema } from '@/lib/schemas/production/dailyReport';

export default function DailyReportsPage() {
  return <CrudList schema={dailyReportSchema} />;
}
