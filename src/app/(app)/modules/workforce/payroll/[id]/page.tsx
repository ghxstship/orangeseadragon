'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { payrollRunSchema } from '@/lib/schemas/payrollRun';

export default function PayrollDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={payrollRunSchema} id={params.id} />;
}
