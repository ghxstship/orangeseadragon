'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { roadmapSchema } from '@/lib/schemas/roadmap';

export default function RoadmapsPage() {
  return <CrudList schema={roadmapSchema} />;
}
