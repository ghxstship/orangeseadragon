'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { payrollRateSchema } from '@/lib/schemas/finance/payrollRate';

export default function PayRatesPage() {
  return <CrudList schema={payrollRateSchema} />;
}
