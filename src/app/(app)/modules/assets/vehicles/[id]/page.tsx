'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { vehicleSchema } from '@/lib/schemas/vehicle';

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={vehicleSchema} id={params.id} />;
}
