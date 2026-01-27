'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const resourcesDashboardSections: DashboardSection[] = [
  {
    id: 'quick-links',
    title: 'Quick Links',
    widgets: [
      { id: 'docs', title: 'Documentation', description: 'Full platform docs', type: 'custom', size: 'small' },
      { id: 'videos', title: 'Video Tutorials', description: 'Learn by watching', type: 'custom', size: 'small' },
      { id: 'help', title: 'Help Center', description: 'FAQs and support', type: 'custom', size: 'small' },
    ],
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    widgets: [
      { id: 'getting-started-list', title: 'Getting Started', description: 'Guides for new users', type: 'list', size: 'full' },
    ],
  },
  {
    id: 'faqs',
    title: 'Frequently Asked Questions',
    widgets: [
      { id: 'faqs-list', title: 'FAQs', description: 'Quick answers to common questions', type: 'list', size: 'full' },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <DashboardTemplate
      title="Resources"
      subtitle="Documentation, guides, and help articles"
      sections={resourcesDashboardSections}
    />
  );
}
