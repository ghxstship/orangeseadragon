'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { partnerSchema } from '@/lib/schemas/partner';

export default function PartnersPage() {
  return <CrudList schema={partnerSchema} />;
}
