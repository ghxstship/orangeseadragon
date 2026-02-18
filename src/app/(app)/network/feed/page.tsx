'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { activityFeedSchema } from '@/lib/schemas/core/activityFeed';

export default function NetworkFeedPage() {
  return <CrudList schema={activityFeedSchema} />;
}
