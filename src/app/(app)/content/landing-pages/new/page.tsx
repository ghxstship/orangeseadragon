'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { landingPageSchema } from '@/lib/schemas/landingPage';

export default function NewLandingPagePage() {
  return <CrudForm schema={landingPageSchema} mode="create" />;
}
