'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { permitSchema } from '@/lib/schemas/permit';

export default function PermitsPage() {
  return <CrudList schema={permitSchema} filter={{ permit_type: 'permit' }} />;
}
