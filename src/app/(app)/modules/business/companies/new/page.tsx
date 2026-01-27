'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { companySchema } from '@/lib/schemas/company';

export default function NewCompanyPage() {
  return <CrudForm schema={companySchema} mode="create" />;
}
