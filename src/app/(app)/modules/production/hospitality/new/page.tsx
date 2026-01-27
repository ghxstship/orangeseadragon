'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { hospitalityRequestSchema } from '@/lib/schemas/hospitalityRequest';

export default function NewHospitalityRequestPage() {
  return <CrudForm schema={hospitalityRequestSchema} mode="create" />;
}
