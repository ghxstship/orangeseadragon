'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const supportDashboardSections: DashboardSection[] = [
  {
    id: 'contact',
    title: 'Contact Options',
    widgets: [
      { id: 'chat', title: 'Live Chat', description: 'Available 24/7', type: 'custom', size: 'small' },
      { id: 'email', title: 'Email Support', description: 'support@atlvs.com', type: 'custom', size: 'small' },
      { id: 'phone', title: 'Phone Support', description: 'Pro plan only', type: 'custom', size: 'small' },
    ],
  },
  {
    id: 'ticket-form',
    title: 'Submit a Support Ticket',
    widgets: [
      { id: 'new-ticket', title: 'New Ticket', description: 'Describe your issue and we\'ll get back to you within 24 hours', type: 'custom', size: 'full' },
    ],
  },
  {
    id: 'tickets',
    title: 'Your Support Tickets',
    widgets: [
      { id: 'ticket-list', title: 'Support Tickets', description: 'Track the status of your support requests', type: 'list', size: 'full' },
    ],
  },
];

export default function SupportPage() {
  return (
    <DashboardTemplate
      title="Support"
      subtitle="Get help and contact our support team"
      sections={supportDashboardSections}
    />
  );
}
