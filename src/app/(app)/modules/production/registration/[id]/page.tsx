'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { registrationSchema } from '@/lib/schemas/registration';

export default function RegistrationDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={registrationSchema} id={params.id} />;
}
