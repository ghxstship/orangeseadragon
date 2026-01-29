'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { maintenanceSchema } from '@/lib/schemas/maintenance';

export default function RepairsPage() {
  return <CrudList schema={maintenanceSchema} filter={{ maintenance_type: 'repair' }} />;
}
