'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { serviceTicketSchema } from '@/lib/schemas/serviceTicket';

export default function ProductsListPage() {
  return <CrudList schema={serviceTicketSchema} filter={{ ticket_type: 'product' }} />;
}
