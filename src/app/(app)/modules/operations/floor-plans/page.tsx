'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { floorPlanSchema } from '@/lib/schemas/floorPlan';

export default function FloorPlansPage() {
  return <CrudList schema={floorPlanSchema} />;
}
