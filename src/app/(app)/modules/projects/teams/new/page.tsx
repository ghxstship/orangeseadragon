'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { teamSchema } from '@/lib/schemas/team';

export default function NewTeamPage() {
  return <CrudForm schema={teamSchema} mode="create" />;
}
