'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { certificationSchema } from '@/lib/schemas/people/certification';

export default function CertificationsPage() {
  return <CrudList schema={certificationSchema} />;
}
