'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { maintenanceSchema } from '@/lib/schemas/assets/maintenance';

export default function ServicePage() {
  return <CrudList schema={maintenanceSchema} />;
}
