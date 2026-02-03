'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { certificateOfInsuranceSchema } from '@/lib/schemas/certificateOfInsurance';

export default function CertificatesPage() {
  return <CrudList schema={certificateOfInsuranceSchema} />;
}
