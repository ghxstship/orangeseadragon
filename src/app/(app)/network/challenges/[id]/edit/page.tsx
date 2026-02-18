'use client';

import { use } from 'react';
import { CrudForm } from '@/lib/crud/components/CrudForm';
import { challengeSchema } from '@/lib/schemas/network/challenge';

export default function EditChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudForm schema={challengeSchema} mode="edit" id={id} />;
}
