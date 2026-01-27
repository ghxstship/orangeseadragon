'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { vendorSchema } from '@/lib/schemas/vendor';

export default function NewVendorPage() {
  return <CrudForm schema={vendorSchema} mode="create" />;
}
