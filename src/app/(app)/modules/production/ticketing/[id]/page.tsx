'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { ticketTypeSchema } from '@/lib/schemas/ticketType';

export default function TicketTypeDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={ticketTypeSchema} id={params.id} />;
}
