'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { supportTicketSchema } from '@/lib/schemas/supportTicket';

export default function SupportTicketsPage() {
  return <CrudList schema={supportTicketSchema} />;
}
