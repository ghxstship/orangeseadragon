'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { landingPageSchema } from '@/lib/schemas/landingPage';

export default function LandingPagesPage() {
  return <CrudList schema={landingPageSchema} />;
}
