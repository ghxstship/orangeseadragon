'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { dailySiteReportSchema } from '@/lib/schemas/dailySiteReport';

export default function DailySiteReportDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={dailySiteReportSchema} id={params.id} />;
}
