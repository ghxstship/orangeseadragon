'use client';

import { EntityListTemplate } from '@/components/templates/EntityListTemplate';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'technical', label: 'Technical' },
  { id: 'logistics', label: 'Logistics' },
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'staffing', label: 'Staffing' },
  { id: 'safety', label: 'Safety' },
  { id: 'marketing', label: 'Marketing' },
];

export default function AdvanceItemsPage() {
  return (
    <EntityListTemplate
      title="Advance Items"
      subtitle="All advance items by category"
      entityType="advance_items"
      createLabel="New Item"
      tabs={tabs}
    />
  );
}
