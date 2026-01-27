'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { issuedCredentialSchema } from '@/lib/schemas/issuedCredential';

export default function NewCredentialPage() {
  return <CrudForm schema={issuedCredentialSchema} mode="create" />;
}
