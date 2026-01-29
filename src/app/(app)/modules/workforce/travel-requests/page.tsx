'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { travelRequestSchema } from '@/lib/schemas/travelRequest';

export default function TravelRequestsPage() {
  return <CrudList schema={travelRequestSchema} />;
}
