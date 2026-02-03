'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { stageSchema } from '@/lib/schemas/stage';

export default function StagesPage() {
  return <CrudList schema={stageSchema} />;
}
