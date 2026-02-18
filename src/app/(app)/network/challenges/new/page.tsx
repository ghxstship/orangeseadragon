'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { challengeSchema } from '@/lib/schemas/network/challenge';

export default function NewChallengePage() {
  return <CrudForm schema={challengeSchema} mode="create" />;
}
