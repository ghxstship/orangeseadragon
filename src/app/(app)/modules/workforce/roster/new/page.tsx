'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { peopleSchema } from '@/lib/schemas/people';

export default function NewPersonPage() {
  return <CrudForm schema={peopleSchema} mode="create" />;
}
