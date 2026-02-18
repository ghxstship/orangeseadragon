'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { showcaseSchema } from '@/lib/schemas/crm/showcase';

export default function ShowcasePage() {
  return <CrudList schema={showcaseSchema} />;
}
