'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { discussionSchema } from '@/lib/schemas/core/discussion';

export default function DiscussionsPage() {
  return <CrudList schema={discussionSchema} />;
}
