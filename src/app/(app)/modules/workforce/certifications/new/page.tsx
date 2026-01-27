'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { certificationSchema } from '@/lib/schemas/certification';

export default function NewCertificationPage() {
  return <CrudForm schema={certificationSchema} mode="create" />;
}
