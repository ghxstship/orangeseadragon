'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { landingPageSchema } from '@/lib/schemas/landingPage';

export default function LandingPageDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={landingPageSchema} id={params.id} />;
}
