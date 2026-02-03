'use client';

import { MasterCalendar } from '@/components/views/MasterCalendar';

/**
 * MASTER CALENDAR PAGE
 * 
 * Aggregated view of all date-based items across the platform:
 * - Events (shows, festivals, conferences)
 * - Productions (milestones: load-in, event, strike)
 * - Tasks (due dates)
 * - Contracts (start/end dates)
 * - Activations (setup, event, teardown)
 * - User calendar events
 * 
 * This is a READ-ONLY projection. All items link back to their
 * canonical detail pages for editing.
 */
export default function CalendarPage() {
  return (
    <div className="container py-6">
      <MasterCalendar />
    </div>
  );
}
