'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { projectResourceSchema } from '@/lib/schemas/projectResource';

export default function ProjectResourceDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={projectResourceSchema} id={params.id} />;
}
