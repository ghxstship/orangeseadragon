'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { departmentSchema } from '@/lib/schemas/department';

export default function NewDepartmentPage() {
  return <CrudForm schema={departmentSchema} mode="create" />;
}
