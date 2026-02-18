'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { reservationSchema } from '@/lib/schemas/assets/reservation';

export default function ReservationsPage() {
  return <CrudList schema={reservationSchema} />;
}
