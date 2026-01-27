'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { networkingSessionSchema } from '@/lib/schemas/networkingSession';

export default function NetworkingPage() {
  return <CrudList schema={networkingSessionSchema} />;
}
