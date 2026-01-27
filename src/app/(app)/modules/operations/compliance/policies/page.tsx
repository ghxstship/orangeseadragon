'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { compliancePolicySchema } from '@/lib/schemas/compliancePolicy';

export default function CompliancePoliciesPage() {
  return <CrudList schema={compliancePolicySchema} />;
}
