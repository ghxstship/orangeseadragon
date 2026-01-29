'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { certificationSchema } from '@/lib/schemas/certification';

export default function CertificationsPage() {
  return <CrudList schema={certificationSchema} />;
}
