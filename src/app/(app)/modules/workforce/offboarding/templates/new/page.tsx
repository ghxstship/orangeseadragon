'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { offboardingTemplateSchema } from '@/lib/schemas/offboardingTemplate';

export default function NewOffboardingTemplatePage() {
  return (
    <CrudForm
      schema={offboardingTemplateSchema}
      mode="create"
    />
  );
}
