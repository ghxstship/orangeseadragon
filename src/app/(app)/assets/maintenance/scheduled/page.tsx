'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { maintenanceSchema } from '@/lib/schemas/assets/maintenance';

export default function ScheduledPage() {
  return <CrudList schema={maintenanceSchema} filter={{ maintenance_type: 'scheduled' }} />;
}
