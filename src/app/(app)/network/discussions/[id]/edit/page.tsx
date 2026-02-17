'use client';

import { use } from 'react';
import { CrudForm } from '@/lib/crud/components/CrudForm';
import { discussionSchema } from '@/lib/schemas/discussion';

export default function EditDiscussionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudForm schema={discussionSchema} mode="edit" id={id} />;
}
