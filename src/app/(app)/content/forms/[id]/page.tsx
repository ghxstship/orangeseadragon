'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { formTemplateSchema } from '@/lib/schemas/formTemplate';

export default function FormDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={formTemplateSchema} id={params.id} />;
}
