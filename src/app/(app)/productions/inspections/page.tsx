'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { inspectionSchema } from '@/lib/schemas/assets/inspection';

export default function InspectionsPage() {
  return <CrudList schema={inspectionSchema} />;
}
