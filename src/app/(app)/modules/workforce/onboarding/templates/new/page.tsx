'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { onboardingTemplateSchema } from '@/lib/schemas/onboardingTemplate';

export default function NewOnboardingTemplatePage() {
  return <CrudForm schema={onboardingTemplateSchema} mode="create" />;
}
