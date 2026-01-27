'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { networkingSessionSchema } from '@/lib/schemas/networkingSession';

export default function NewNetworkingSessionPage() {
  return <CrudForm schema={networkingSessionSchema} mode="create" />;
}
