'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { serviceTicketSchema } from '@/lib/schemas/serviceTicket';

export default function NewServiceTicketPage() {
  return <CrudForm schema={serviceTicketSchema} mode="create" />;
}
