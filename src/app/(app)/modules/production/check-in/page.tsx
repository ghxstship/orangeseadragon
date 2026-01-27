'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const checkInDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'total-registered', title: 'Total Registered', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'registrations' },
      { id: 'checked-in', title: 'Checked In', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'attendees' },
      { id: 'pending', title: 'Pending', type: 'metric', size: 'small', value: 0, change: 0, changeLabel: 'awaiting check-in' },
      { id: 'check-in-rate', title: 'Check-in Rate', type: 'metric', size: 'small', value: '0%', change: 0, changeLabel: 'of registered' },
    ],
  },
  {
    id: 'actions',
    title: 'Quick Actions',
    widgets: [
      { id: 'scan', title: 'Scan QR Code', description: 'Scan attendee QR code for check-in', type: 'custom', size: 'medium' },
      { id: 'search', title: 'Search Attendee', description: 'Look up attendee by name or confirmation number', type: 'custom', size: 'medium' },
    ],
  },
  {
    id: 'recent',
    title: 'Recent Check-ins',
    widgets: [
      { id: 'recent-checkins', title: 'Recent Check-ins', description: 'Last 10 check-ins', type: 'list', size: 'full' },
    ],
  },
];

export default function CheckInPage() {
  return (
    <DashboardTemplate
      title="Event Check-in"
      subtitle="Manage attendee check-in and access control"
      sections={checkInDashboardSections}
    />
  );
}
