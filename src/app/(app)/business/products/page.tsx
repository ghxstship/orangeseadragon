'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { serviceTicketSchema } from '@/lib/schemas/serviceTicket';

export default function ProductsPage() {
  return <CrudList schema={serviceTicketSchema} />;
}
