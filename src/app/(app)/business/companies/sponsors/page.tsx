'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { partnerSchema } from '@/lib/schemas/partner';

export default function SponsorsPage() {
  return <CrudList schema={partnerSchema} />;
}
