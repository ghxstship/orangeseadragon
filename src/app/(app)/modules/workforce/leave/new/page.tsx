'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { leaveRequestSchema } from '@/lib/schemas/leaveRequest';

export default function NewLeaveRequestPage() {
  return <CrudForm schema={leaveRequestSchema} mode="create" />;
}
