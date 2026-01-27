'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { compliancePolicySchema } from '@/lib/schemas/compliancePolicy';

export default function NewCompliancePolicyPage() {
  return <CrudForm schema={compliancePolicySchema} mode="create" />;
}
