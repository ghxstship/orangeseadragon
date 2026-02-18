'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { companySchema } from '@/lib/schemas/crm/company';

export default function CompaniesPage() {
  return <CrudList schema={companySchema} />;
}
