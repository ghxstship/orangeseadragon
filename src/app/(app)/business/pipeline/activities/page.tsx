'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { activitySchema } from '@/lib/schemas/activity';

export default function ActivitiesPage() {
  return <CrudList schema={activitySchema} />;
}
