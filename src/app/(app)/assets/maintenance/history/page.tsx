'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { serviceHistorySchema } from '@/lib/schemas/serviceHistory';

export default function ServiceHistoryPage() {
  return <CrudList schema={serviceHistorySchema} />;
}
