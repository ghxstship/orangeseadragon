'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { performanceReviewSchema } from '@/lib/schemas/performanceReview';

export default function PerformanceReviewDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={performanceReviewSchema} id={params.id} />;
}
