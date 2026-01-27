'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { credentialSchema } from '@/lib/schemas/credential';

export default function NewCredentialPage() {
  return <CrudForm schema={credentialSchema} mode="create" />;
}
