'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { radioChannelSchema } from '@/lib/schemas/radioChannel';

export default function NewRadioChannelPage() {
  return <CrudForm schema={radioChannelSchema} mode="create" />;
}
