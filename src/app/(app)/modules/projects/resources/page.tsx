'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { projectResourceSchema } from '@/lib/schemas/projectResource';

export default function ProjectResourcesPage() {
  return <CrudList schema={projectResourceSchema} />;
}
