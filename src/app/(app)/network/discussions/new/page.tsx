'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { discussionSchema } from '@/lib/schemas/core/discussion';

export default function NewDiscussionPage() {
  return <CrudForm schema={discussionSchema} mode="create" />;
}
