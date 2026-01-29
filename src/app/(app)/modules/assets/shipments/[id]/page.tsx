'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { shipmentSchema } from '@/lib/schemas/shipment';

export default function ShipmentDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={shipmentSchema} id={params.id} />;
}
