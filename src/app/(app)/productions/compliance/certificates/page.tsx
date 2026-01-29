'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { permitSchema } from '@/lib/schemas/permit';

export default function CertificatesPage() {
  return <CrudList schema={permitSchema} filter={{ permit_type: 'certificate' }} />;
}
