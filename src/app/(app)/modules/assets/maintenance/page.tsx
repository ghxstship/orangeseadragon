'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { maintenanceSchema } from '@/lib/schemas/maintenance';

export default function MaintenancePage() {
  return <CrudList schema={maintenanceSchema} />;
}
