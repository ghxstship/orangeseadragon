'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { invoiceSchema } from '@/lib/schemas';

export default function InvoiceDetailPage() {
  const params = useParams();
  return <CrudDetail schema={invoiceSchema} id={params.id as string} />;
}
