'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { productionSchema } from '@/lib/schemas/production';

export default function ProductionDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={productionSchema} id={params.id} />;
}
