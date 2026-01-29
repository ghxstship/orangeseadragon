'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { companySchema } from '@/lib/schemas/company';

export default function CompaniesPage() {
  return <CrudList schema={companySchema} />;
}
