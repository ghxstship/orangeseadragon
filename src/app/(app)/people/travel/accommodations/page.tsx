'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { travelRequestSchema } from '@/lib/schemas/operations/travelRequest';

export default function AccommodationsPage() {
  return <CrudList schema={travelRequestSchema} filter={{ request_type: 'accommodation' }} />;
}
