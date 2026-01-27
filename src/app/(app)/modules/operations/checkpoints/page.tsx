'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { checkpointSchema } from '@/lib/schemas/checkpoint';

export default function CheckpointsPage() {
  return <CrudList schema={checkpointSchema} />;
}
