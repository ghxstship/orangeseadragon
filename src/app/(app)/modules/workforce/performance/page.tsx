'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { performanceReviewSchema } from '@/lib/schemas/performanceReview';

export default function PerformanceReviewsPage() {
  return <CrudList schema={performanceReviewSchema} />;
}
