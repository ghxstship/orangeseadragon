'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { floorPlanSchema } from '@/lib/schemas/floorPlan';

export default function NewFloorPlanPage() {
  return <CrudForm schema={floorPlanSchema} mode="create" />;
}
