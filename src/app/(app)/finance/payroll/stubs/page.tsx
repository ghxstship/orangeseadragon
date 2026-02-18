'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { payStubSchema } from '@/lib/schemas/finance/payStub';

export default function PayStubsPage() {
  return <CrudList schema={payStubSchema} />;
}
