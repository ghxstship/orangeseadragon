'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { departmentSchema } from '@/lib/schemas/department';

export default function DepartmentsPage() {
  return <CrudList schema={departmentSchema} />;
}
