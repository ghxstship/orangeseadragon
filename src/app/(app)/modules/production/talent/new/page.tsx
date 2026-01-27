'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { talentSchema } from '@/lib/schemas/talent';

export default function NewTalentPage() {
  return <CrudForm schema={talentSchema} mode="create" />;
}
