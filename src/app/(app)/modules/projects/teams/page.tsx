'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { teamSchema } from '@/lib/schemas/team';

export default function TeamsPage() {
  return <CrudList schema={teamSchema} />;
}
