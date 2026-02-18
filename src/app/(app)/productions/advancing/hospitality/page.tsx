'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { hospitalityRequestSchema } from '@/lib/schemas/operations/hospitalityRequest';

export default function HospitalityPage() {
  return <CrudList schema={hospitalityRequestSchema} />;
}
