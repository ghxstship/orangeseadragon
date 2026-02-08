'use client';

import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';

const operationsDashboardSections: DashboardSection[] = [
  {
    id: 'metrics',
    widgets: [
      { id: 'active-shows', title: 'Active Shows', type: 'metric', size: 'small', value: 3 },
      { id: 'incidents', title: 'Open Incidents', type: 'metric', size: 'small', value: 2, change: -50, changeLabel: 'from yesterday' },
      { id: 'work-orders', title: 'Work Orders', type: 'metric', size: 'small', value: 8 },
      { id: 'venues', title: 'Active Venues', type: 'metric', size: 'small', value: 5 },
    ],
  },
  {
    id: 'navigation',
    title: 'Operations Modules',
    widgets: [
      {
        id: 'runsheets-nav',
        title: 'Runsheets',
        description: 'Live show flows & cue management',
        type: 'custom',
        size: 'medium',
        content: (
          <div className="flex flex-col h-full justify-between p-4 bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/10 shadow-lg hover:border-emerald-500/30 transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">3 Active</span>
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Runsheets</h3>
              <p className="text-sm text-neutral-400 mt-1">Manage live cues and timing</p>
            </div>
          </div>
        )
      },
      {
        id: 'incidents-nav',
        title: 'Incidents',
        description: 'Issue tracking & resolution',
        type: 'custom',
        size: 'medium',
        content: (
          <div className="flex flex-col h-full justify-between p-4 bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/10 shadow-lg hover:border-rose-500/30 transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/20">2 Open</span>
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-rose-400 transition-colors">Incidents</h3>
              <p className="text-sm text-neutral-400 mt-1">Track and resolve issues</p>
            </div>
          </div>
        )
      },
      {
        id: 'shows-nav',
        title: 'Shows',
        description: 'Event production management',
        type: 'custom',
        size: 'medium',
        content: (
          <div className="flex flex-col h-full justify-between p-4 bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/10 shadow-lg hover:border-blue-500/30 transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20">Live Now</span>
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">Shows</h3>
              <p className="text-sm text-neutral-400 mt-1">Manage productions & stages</p>
            </div>
          </div>
        )
      },
    ],
  },
];

export default function OperationsPage() {
  return (
    <DashboardTemplate
      title="Operations"
      subtitle="Run of show management"
      sections={operationsDashboardSections}
    />
  );
}
