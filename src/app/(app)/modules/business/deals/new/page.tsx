'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { dealSchema } from '@/lib/schemas/deal';

export default function NewDealPage() {
  return <CrudForm schema={dealSchema} mode="create" />;
}
