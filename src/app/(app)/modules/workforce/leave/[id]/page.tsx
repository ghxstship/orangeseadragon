'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { leaveRequestSchema } from '@/lib/schemas/leaveRequest';

export default function LeaveRequestDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={leaveRequestSchema} id={params.id} />;
}
