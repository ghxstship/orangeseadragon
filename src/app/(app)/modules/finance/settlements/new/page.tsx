'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { settlementSchema } from '@/lib/schemas/settlement';

export default function NewSettlementPage() {
  return <CrudForm schema={settlementSchema} mode="create" />;
}
