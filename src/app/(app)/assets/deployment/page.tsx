'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { checkInOutSchema } from '@/lib/schemas/checkInOut';

export default function DeploymentPage() {
  return <CrudList schema={checkInOutSchema} filter={{ action_type: 'deploy' }} />;
}
