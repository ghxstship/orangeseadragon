'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { leaveRequestSchema } from '@/lib/schemas/leaveRequest';

export default function LeaveRequestsPage() {
  return <CrudList schema={leaveRequestSchema} />;
}
