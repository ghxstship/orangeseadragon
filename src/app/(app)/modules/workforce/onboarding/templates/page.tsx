'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { onboardingTemplateSchema } from '@/lib/schemas/onboardingTemplate';

export default function OnboardingTemplatesPage() {
  return <CrudList schema={onboardingTemplateSchema} />;
}
