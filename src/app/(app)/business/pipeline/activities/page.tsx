'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { activitySchema } from '@/lib/schemas/core/activity';

export default function ActivitiesPage() {
  return <CrudList schema={activitySchema} />;
}
