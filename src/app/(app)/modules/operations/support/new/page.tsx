'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { supportTicketSchema } from '@/lib/schemas/supportTicket';

export default function NewSupportTicketPage() {
  return <CrudForm schema={supportTicketSchema} mode="create" />;
}
