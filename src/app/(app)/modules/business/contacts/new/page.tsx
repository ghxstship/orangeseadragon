'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { contactSchema } from '@/lib/schemas/contact';

export default function NewContactPage() {
  return <CrudForm schema={contactSchema} mode="create" />;
}
