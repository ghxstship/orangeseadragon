'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { contactSchema } from '@/lib/schemas';

export default function ContactDetailPage() {
  const params = useParams();
  return <CrudDetail schema={contactSchema} id={params.id as string} />;
}
