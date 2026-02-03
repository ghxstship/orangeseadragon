'use client';

import { EntityListTemplate } from '@/components/templates/EntityListTemplate';

const tabs = [
  { id: 'all', label: 'All Vendors' },
  { id: 'active', label: 'Active' },
  { id: 'top-rated', label: 'Top Rated' },
];

export default function VendorsPage() {
  return (
    <EntityListTemplate
      title="Vendors"
      subtitle="Vendor coordination & performance"
      entityType="companies"
      createLabel="Add Vendor"
      tabs={tabs}
    />
  );
}
