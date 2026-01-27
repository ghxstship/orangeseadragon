'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { roadmapSchema } from '@/lib/schemas/roadmap';

export default function NewRoadmapPage() {
  return <CrudForm schema={roadmapSchema} mode="create" />;
}
