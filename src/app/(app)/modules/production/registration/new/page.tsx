'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { registrationSchema } from '@/lib/schemas/registration';

export default function NewRegistrationPage() {
  return <CrudForm schema={registrationSchema} mode="create" />;
}
