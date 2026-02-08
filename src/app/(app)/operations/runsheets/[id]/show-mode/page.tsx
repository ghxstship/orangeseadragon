'use client';

import { useParams } from 'next/navigation';
import { RunsheetShowMode } from '@/components/operations/RunsheetShowMode';

const mockCues = [
  {
    id: '1',
    sequence: 1,
    name: 'House Open - Background Music',
    description: 'Start ambient music as doors open',
    cue_type: 'audio',
    duration_seconds: 1800,
    scheduled_time: '18:30:00',
    status: 'complete' as const,
    notes: 'Volume at 40%',
  },
  {
    id: '2',
    sequence: 2,
    name: 'Welcome Video',
    description: 'Play sponsor welcome video on main screens',
    cue_type: 'video',
    duration_seconds: 180,
    scheduled_time: '19:00:00',
    status: 'pending' as const,
  },
  {
    id: '3',
    sequence: 3,
    name: 'MC Introduction',
    description: 'MC takes stage for opening remarks',
    cue_type: 'speech',
    duration_seconds: 300,
    scheduled_time: '19:03:00',
    status: 'pending' as const,
    assigned_to: 'Sarah Johnson',
    notes: 'Cue spotlight on stage left entrance',
  },
  {
    id: '4',
    sequence: 4,
    name: 'CEO Keynote',
    description: 'Main keynote presentation',
    cue_type: 'presentation',
    duration_seconds: 2700,
    scheduled_time: '19:08:00',
    status: 'pending' as const,
    assigned_to: 'John Smith',
    script_text: 'Good evening everyone, and welcome to our annual conference...',
  },
  {
    id: '5',
    sequence: 5,
    name: 'Transition - Stage Reset',
    description: 'Dim lights, change stage setup for panel',
    cue_type: 'transition',
    duration_seconds: 120,
    scheduled_time: '19:53:00',
    status: 'pending' as const,
  },
  {
    id: '6',
    sequence: 6,
    name: 'Panel Discussion',
    description: 'Industry leaders panel on stage',
    cue_type: 'action',
    duration_seconds: 2400,
    scheduled_time: '19:55:00',
    status: 'pending' as const,
  },
  {
    id: '7',
    sequence: 7,
    name: 'Networking Break',
    description: 'Break music and refreshments',
    cue_type: 'break',
    duration_seconds: 1200,
    scheduled_time: '20:35:00',
    status: 'pending' as const,
  },
];

export default function ShowModePage() {
  const params = useParams();
  const runsheetId = params.id as string;

  const handleCueGo = (cueId: string) => {
    console.log('GO cue:', cueId);
  };

  const handleCueSkip = (cueId: string) => {
    console.log('SKIP cue:', cueId);
  };

  const handleCueStandby = (cueId: string) => {
    console.log('STANDBY cue:', cueId);
  };

  return (
    <div className="h-screen">
      <RunsheetShowMode
        runsheetId={runsheetId}
        runsheetName="Tech Summit 2026 - Opening Ceremony"
        startTime="19:00"
        cues={mockCues}
        onCueGo={handleCueGo}
        onCueSkip={handleCueSkip}
        onCueStandby={handleCueStandby}
      />
    </div>
  );
}
