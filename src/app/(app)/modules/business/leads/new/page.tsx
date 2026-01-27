'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { leadSchema } from '@/lib/schemas/lead';

export default function NewLeadPage() {
  return <CrudForm schema={leadSchema} mode="create" />;
}
