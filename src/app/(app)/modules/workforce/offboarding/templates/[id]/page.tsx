'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { offboardingTemplateSchema } from '@/lib/schemas/offboardingTemplate';

export default function OffboardingTemplateDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={offboardingTemplateSchema} id={params.id} />;
}
