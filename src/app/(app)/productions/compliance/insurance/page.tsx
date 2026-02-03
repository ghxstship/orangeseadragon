'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { certificateOfInsuranceSchema } from '@/lib/schemas/certificateOfInsurance';

export default function InsurancePage() {
  return <CrudList schema={certificateOfInsuranceSchema} />;
}
