'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { challengeSchema } from '@/lib/schemas/challenge';

export default function EditChallengePage({ params }: { params: { id: string } }) {
  return <CrudForm schema={challengeSchema} mode="edit" id={params.id} />;
}
