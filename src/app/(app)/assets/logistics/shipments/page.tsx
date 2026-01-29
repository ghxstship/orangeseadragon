'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { shipmentSchema } from '@/lib/schemas/shipment';

export default function ShipmentsPage() {
  return <CrudList schema={shipmentSchema} />;
}
