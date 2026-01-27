'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { issuedCredentialSchema } from '@/lib/schemas/issuedCredential';

export default function CredentialsPage() {
  return <CrudList schema={issuedCredentialSchema} />;
}
