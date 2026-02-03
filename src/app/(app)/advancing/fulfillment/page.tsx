'use client';

import { EntityListTemplate } from '@/components/templates/EntityListTemplate';

const tabs = [
  { id: 'all', label: 'All Stages' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'complete', label: 'Complete' },
];

export default function FulfillmentPage() {
  return (
    <EntityListTemplate
      title="Fulfillment"
      subtitle="Delivery & installation tracking"
      entityType="advance_item_fulfillment"
      createLabel="Add Stage"
      tabs={tabs}
    />
  );
}
