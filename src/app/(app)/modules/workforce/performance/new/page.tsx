'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { performanceReviewSchema } from '@/lib/schemas/performanceReview';

export default function NewPerformanceReviewPage() {
  return <CrudForm schema={performanceReviewSchema} mode="create" />;
}
