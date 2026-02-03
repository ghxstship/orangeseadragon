'use client';

import { EntityListTemplate } from '@/components/templates/EntityListTemplate';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export default function AdvancesPage() {
  return (
    <EntityListTemplate
      title="Production Advances"
      subtitle="Advance coordination by event"
      entityType="production_advances"
      createLabel="New Advance"
      tabs={tabs}
    />
  );
}
