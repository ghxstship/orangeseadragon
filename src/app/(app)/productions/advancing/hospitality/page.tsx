'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { hospitalityRequestSchema } from '@/lib/schemas/hospitalityRequest';

export default function HospitalityPage() {
  return <CrudList schema={hospitalityRequestSchema} />;
}
