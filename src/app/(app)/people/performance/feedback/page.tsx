'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { feedbackSchema } from '@/lib/schemas/feedback';

export default function FeedbackPage() {
  return <CrudList schema={feedbackSchema} />;
}
