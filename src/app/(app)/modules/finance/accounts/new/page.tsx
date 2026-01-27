'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { accountSchema } from '@/lib/schemas/account';

export default function NewAccountPage() {
  return <CrudForm schema={accountSchema} mode="create" />;
}
