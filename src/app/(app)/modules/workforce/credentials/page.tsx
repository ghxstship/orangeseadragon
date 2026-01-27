'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { credentialSchema } from '@/lib/schemas/credential';

export default function CredentialsPage() {
  return <CrudList schema={credentialSchema} />;
}
