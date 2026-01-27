'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { exhibitorSchema } from '@/lib/schemas/exhibitor';

export default function NewExhibitorPage() {
  return <CrudForm schema={exhibitorSchema} mode="create" />;
}
