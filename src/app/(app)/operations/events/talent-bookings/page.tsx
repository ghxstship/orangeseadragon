'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { talentBookingSchema } from '@/lib/schemas/people/talentBooking';

export default function TalentBookingsPage() {
  return <CrudList schema={talentBookingSchema} />;
}
