'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { discussionSchema } from '@/lib/schemas/discussion';

export default function NewDiscussionPage() {
  return <CrudForm schema={discussionSchema} mode="create" />;
}
