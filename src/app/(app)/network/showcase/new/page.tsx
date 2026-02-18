'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { showcaseSchema } from '@/lib/schemas/crm/showcase';

export default function NewShowcasePage() {
  return <CrudForm schema={showcaseSchema} mode="create" />;
}
