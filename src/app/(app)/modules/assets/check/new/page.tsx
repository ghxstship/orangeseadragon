'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { checkInOutSchema } from '@/lib/schemas/checkInOut';

export default function NewCheckInOutPage() {
  return <CrudForm schema={checkInOutSchema} mode="create" />;
}
