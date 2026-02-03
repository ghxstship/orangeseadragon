'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { insuranceSchema } from '@/lib/schemas/insurance';

export default function InsurancePage() {
  return <CrudList schema={insuranceSchema} />;
}
