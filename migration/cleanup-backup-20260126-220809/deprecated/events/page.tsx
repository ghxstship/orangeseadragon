"use client";

import { CrudList } from '@/lib/crud/components/CrudList';
import { eventSchema } from '@/schemas/event.schema';

/**
 * Events List Page
 *
 * Uses the generic CrudList component with event schema.
 * No entity-specific logic required.
 */
export default function EventsPage() {
  return <CrudList schema={eventSchema} />;
}
