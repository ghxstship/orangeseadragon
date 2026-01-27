'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { subscriberSchema } from '@/lib/schemas/subscriber';

export default function NewSubscriberPage() {
  return <CrudForm schema={subscriberSchema} mode="create" />;
}
