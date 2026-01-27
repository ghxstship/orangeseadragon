'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { maintenanceSchema } from '@/lib/schemas/maintenance';

export default function NewMaintenancePage() {
  return <CrudForm schema={maintenanceSchema} mode="create" />;
}
