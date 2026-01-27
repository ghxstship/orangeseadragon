'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { reservationSchema } from '@/lib/schemas/reservation';

export default function NewReservationPage() {
  return <CrudForm schema={reservationSchema} mode="create" />;
}
