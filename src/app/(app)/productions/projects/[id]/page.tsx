'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { projectSchema } from '@/lib/schemas/project';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={projectSchema} id={params.id} />;
}
