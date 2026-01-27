'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { discussionSchema } from '@/lib/schemas/discussion';

export default function DiscussionDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={discussionSchema} id={params.id} />;
}
