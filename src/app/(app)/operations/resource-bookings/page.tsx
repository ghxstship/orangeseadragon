'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/common/page-shell';
import { ResourceBookingPanel } from '@/components/business/resource-booking-panel';

export default function ResourceBookingsPage() {
  const [people, setPeople] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/people?limit=100')
      .then((res) => res.json())
      .then((json) => {
        const items = json.data || [];
        setPeople(items.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          name: String(p.full_name || p.name || 'Unknown'),
        })));
      })
      .catch(() => {});

    fetch('/api/projects?limit=100')
      .then((res) => res.json())
      .then((json) => {
        const items = json.data || [];
        setProjects(items.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          name: String(p.name || p.title || 'Untitled'),
        })));
      })
      .catch(() => {});
  }, []);

  return (
    <PageShell
      title="Resource Bookings"
      description="Schedule team members to projects with confirmed, tentative, or placeholder status"
    >
      <ResourceBookingPanel
        people={people}
        projects={projects}
      />
    </PageShell>
  );
}
