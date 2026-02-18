'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { onboardingTemplateSchema } from '@/lib/schemas/people/onboardingTemplate';

export default function OnboardingPage() {
  return <CrudList schema={onboardingTemplateSchema} />;
}
