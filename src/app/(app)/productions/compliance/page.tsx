'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { permitSchema } from '@/lib/schemas/permit';

export default function CompliancePage() {
  return <CrudList schema={permitSchema} />;
}
