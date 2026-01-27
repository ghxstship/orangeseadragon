'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { contractSchema } from '@/lib/schemas/contract';

export default function NewContractPage() {
  return <CrudForm schema={contractSchema} mode="create" />;
}
