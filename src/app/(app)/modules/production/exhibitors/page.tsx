'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { exhibitorSchema } from '@/lib/schemas/exhibitor';

export default function ExhibitorsPage() {
  return <CrudList schema={exhibitorSchema} />;
}
