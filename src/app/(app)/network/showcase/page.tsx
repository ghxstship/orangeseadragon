'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { showcaseSchema } from '@/lib/schemas/showcase';

export default function ShowcasePage() {
  return <CrudList schema={showcaseSchema} />;
}
