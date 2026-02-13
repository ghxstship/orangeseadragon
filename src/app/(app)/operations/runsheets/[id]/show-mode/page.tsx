'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { RunsheetShowMode } from '@/components/operations/RunsheetShowMode';
import { createClient } from '@/lib/supabase/client';

export default function ShowModePage() {
  const params = useParams();
  const runsheetId = params.id as string;

  const [runsheetName, setRunsheetName] = React.useState('');
  const [startTime, setStartTime] = React.useState('');
  const [cues, setCues] = React.useState<Array<{
    id: string;
    sequence: number;
    name: string;
    description?: string;
    cue_type: string;
    duration_seconds: number;
    scheduled_time: string;
    status: 'pending' | 'complete' | 'skipped';
    notes?: string;
    assigned_to?: string;
    script_text?: string;
  }>>([]);

  React.useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      // Fetch runsheet details
      const { data: runsheet } = await supabase
        .from('runsheets')
        .select('name, date')
        .eq('id', runsheetId)
        .single();

      if (runsheet) {
        setRunsheetName(runsheet.name);
      }

      // Fetch runsheet items as cues
      const { data: items } = await supabase
        .from('runsheet_items')
        .select('id, title, description, item_type, duration_minutes, scheduled_start, status, notes, position, technical_notes')
        .eq('runsheet_id', runsheetId)
        .order('position', { ascending: true });

      if (items) {
        const mapped = items.map((item) => {
          const time = item.scheduled_start
            ? new Date(item.scheduled_start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
            : '';
          if (!startTime && time) setStartTime(time);
          return {
            id: item.id,
            sequence: item.position,
            name: item.title,
            description: item.description ?? undefined,
            cue_type: item.item_type ?? 'action',
            duration_seconds: (item.duration_minutes ?? 0) * 60,
            scheduled_time: time,
            status: (item.status === 'completed' ? 'complete' : item.status === 'skipped' ? 'skipped' : 'pending') as 'pending' | 'complete' | 'skipped',
            notes: item.notes ?? item.technical_notes ?? undefined,
          };
        });
        setCues(mapped);
        if (mapped.length > 0 && !startTime) {
          setStartTime(mapped[0].scheduled_time);
        }
      }
    };

    fetchData();
  }, [runsheetId, startTime]);

  const handleCueGo = async (cueId: string) => {
    const supabase = createClient();
    await supabase
      .from('runsheet_items')
      .update({ status: 'in_progress', actual_start: new Date().toISOString() })
      .eq('id', cueId);
    setCues(prev => prev.map(c => c.id === cueId ? { ...c, status: 'complete' as const } : c));
  };

  const handleCueSkip = async (cueId: string) => {
    const supabase = createClient();
    await supabase
      .from('runsheet_items')
      .update({ status: 'skipped' })
      .eq('id', cueId);
    setCues(prev => prev.map(c => c.id === cueId ? { ...c, status: 'skipped' as const } : c));
  };

  const handleCueStandby = (cueId: string) => {
    // Standby is a UI-only state, no DB update needed
    void cueId;
  };

  return (
    <div className="h-screen">
      <RunsheetShowMode
        runsheetId={runsheetId}
        runsheetName={runsheetName}
        startTime={startTime}
        cues={cues}
        onCueGo={handleCueGo}
        onCueSkip={handleCueSkip}
        onCueStandby={handleCueStandby}
      />
    </div>
  );
}
