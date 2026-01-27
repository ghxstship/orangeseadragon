'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { supportTicketSchema } from '@/lib/schemas/supportTicket';

export default function SupportTicketDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={supportTicketSchema} id={params.id} />;
}
