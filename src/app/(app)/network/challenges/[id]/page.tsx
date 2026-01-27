'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { challengeSchema } from '@/lib/schemas/challenge';

export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={challengeSchema} id={params.id} />;
}
