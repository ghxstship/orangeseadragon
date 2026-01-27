'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { serviceTicketSchema } from '@/lib/schemas/serviceTicket';

export default function ServiceTicketDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={serviceTicketSchema} id={params.id} />;
}
