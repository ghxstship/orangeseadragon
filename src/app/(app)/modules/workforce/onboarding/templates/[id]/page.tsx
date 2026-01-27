'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { onboardingTemplateSchema } from '@/lib/schemas/onboardingTemplate';

export default function OnboardingTemplateDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={onboardingTemplateSchema} id={params.id} />;
}
