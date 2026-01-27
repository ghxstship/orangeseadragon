'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { ticketTypeSchema } from '@/lib/schemas/ticketType';

export default function NewTicketTypePage() {
  return <CrudForm schema={ticketTypeSchema} mode="create" />;
}
