'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { ticketTypeSchema } from '@/lib/schemas/ticketType';

export default function TicketingPage() {
  return <CrudList schema={ticketTypeSchema} />;
}
