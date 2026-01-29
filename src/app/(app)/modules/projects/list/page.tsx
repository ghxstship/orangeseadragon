'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { projectSchema } from '@/lib/schemas/project';

export default function ProjectsListPage() {
  return <CrudList schema={projectSchema} />;
}
