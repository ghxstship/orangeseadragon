'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { offboardingTemplateSchema } from '@/lib/schemas/offboardingTemplate';

export default function OffboardingTemplatesPage() {
  return (
    <CrudList
      schema={offboardingTemplateSchema}
    />
  );
}
