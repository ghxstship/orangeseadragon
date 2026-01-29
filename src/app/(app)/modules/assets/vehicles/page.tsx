'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { vehicleSchema } from '@/lib/schemas/vehicle';

export default function VehiclesPage() {
  return <CrudList schema={vehicleSchema} />;
}
