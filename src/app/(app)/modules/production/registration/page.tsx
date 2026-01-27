'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { registrationSchema } from '@/lib/schemas/registration';

export default function RegistrationPage() {
  return <CrudList schema={registrationSchema} />;
}
