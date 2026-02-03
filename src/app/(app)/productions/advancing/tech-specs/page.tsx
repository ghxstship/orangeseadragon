'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { techSpecSchema } from '@/lib/schemas/techSpec';

export default function TechSpecsPage() {
  return <CrudList schema={techSpecSchema} />;
}
