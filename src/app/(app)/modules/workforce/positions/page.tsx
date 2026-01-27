'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { positionSchema } from '@/lib/schemas/position';

export default function PositionsPage() {
  return <CrudList schema={positionSchema} />;
}
