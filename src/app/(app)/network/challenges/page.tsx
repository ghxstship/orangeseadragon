'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { challengeSchema } from '@/lib/schemas/challenge';

export default function ChallengesPage() {
  return <CrudList schema={challengeSchema} />;
}
