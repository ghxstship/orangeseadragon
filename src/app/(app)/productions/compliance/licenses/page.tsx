'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { credentialSchema } from '@/lib/schemas/people/credential';

export default function LicensesPage() {
  return <CrudList schema={credentialSchema} filter={{ credential_type: 'license' }} />;
}
