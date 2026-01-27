'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { issuedCredentialSchema } from '@/lib/schemas/issuedCredential';

export default function CredentialDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={issuedCredentialSchema} id={params.id} />;
}
