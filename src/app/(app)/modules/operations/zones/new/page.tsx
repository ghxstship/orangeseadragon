'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { zoneSchema } from '@/lib/schemas/zone';

export default function NewZonePage() {
  return <CrudForm schema={zoneSchema} mode="create" />;
}
