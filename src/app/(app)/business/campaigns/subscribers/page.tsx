'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { subscriberSchema } from '@/lib/schemas/crm/subscriber';

export default function SubscribersPage() {
  return <CrudList schema={subscriberSchema} />;
}
