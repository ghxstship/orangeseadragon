'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { partnerSchema } from '@/lib/schemas/partner';

export default function NewPartnerPage() {
  return <CrudForm schema={partnerSchema} mode="create" />;
}
