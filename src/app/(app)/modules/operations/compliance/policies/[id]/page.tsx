'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { compliancePolicySchema } from '@/lib/schemas/compliancePolicy';

export default function CompliancePolicyDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={compliancePolicySchema} id={params.id} />;
}
