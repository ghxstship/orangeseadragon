'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { servicePackageSchema } from '@/lib/schemas/operations/servicePackage';

export default function PackagesPage() {
  return <CrudList schema={servicePackageSchema} />;
}
