'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { budgetSchema } from '@/lib/schemas';

export default function BudgetDetailPage() {
  const params = useParams();
  return <CrudDetail schema={budgetSchema} id={params.id as string} />;
}
