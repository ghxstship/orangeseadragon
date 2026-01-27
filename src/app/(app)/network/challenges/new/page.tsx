'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { challengeSchema } from '@/lib/schemas/challenge';

export default function NewChallengePage() {
  return <CrudForm schema={challengeSchema} mode="create" />;
}
