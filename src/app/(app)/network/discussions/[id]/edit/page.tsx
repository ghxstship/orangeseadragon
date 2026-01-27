'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { discussionSchema } from '@/lib/schemas/discussion';

export default function EditDiscussionPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={discussionSchema} mode="edit" id={params.id} />;
}
