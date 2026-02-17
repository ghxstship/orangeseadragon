'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { captureError } from '@/lib/observability';

interface Cue {
  id: string;
  sequence: number;
  name: string;
  description?: string;
  cue_type: string;
  duration_seconds: number;
  scheduled_time: string;
  status: 'pending' | 'standby' | 'go' | 'complete' | 'skipped';
  assigned_to_id?: string;
  notes?: string;
  script_text?: string;
}

interface RunsheetState {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'live' | 'locked' | 'completed';
  start_time: string;
  current_cue_id: string | null;
  show_mode_active: boolean;
  version: number;
  cues: Cue[];
}

interface ActiveEditor {
  userId: string;
  userName: string;
  cursor?: { cueId: string; field: string };
  timestamp: number;
}

interface SyncMessage {
  type: 'state_update' | 'cue_update' | 'presence' | 'cue_go' | 'cue_skip' | 'show_mode';
  payload: unknown;
  version: number;
  timestamp: number;
  userId: string;
}

interface UseRunsheetSyncOptions {
  runsheetId: string;
  userId: string;
  userName: string;
  onStateChange?: (state: RunsheetState) => void;
  onPresenceChange?: (editors: ActiveEditor[]) => void;
  onConflict?: (localVersion: number, serverVersion: number) => void;
}

interface UseRunsheetSyncReturn {
  state: RunsheetState | null;
  activeEditors: ActiveEditor[];
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
  updateCue: (cueId: string, updates: Partial<Cue>) => void;
  goCue: (cueId: string) => void;
  skipCue: (cueId: string) => void;
  setShowMode: (active: boolean) => void;
  reorderCues: (cueIds: string[]) => void;
  addCue: (cue: Omit<Cue, 'id'>) => void;
  deleteCue: (cueId: string) => void;
  reconnect: () => void;
}

export function useRunsheetSync({
  runsheetId,
  userId,
  userName,
  onStateChange,
  onPresenceChange,
  onConflict,
}: UseRunsheetSyncOptions): UseRunsheetSyncReturn {
  const [state, setState] = useState<RunsheetState | null>(null);
  const [activeEditors, setActiveEditors] = useState<ActiveEditor[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<SyncMessage[]>([]);
  const localVersionRef = useRef<number>(0);
  const handleMessageRef = useRef<(message: SyncMessage) => void>(() => {});

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/runsheets/${runsheetId}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        
        // Send join message
        ws.send(JSON.stringify({
          type: 'join',
          payload: { userId, userName },
          timestamp: Date.now(),
        }));

        // Flush pending updates
        pendingUpdatesRef.current.forEach((msg) => {
          ws.send(JSON.stringify(msg));
        });
        pendingUpdatesRef.current = [];
      };

      ws.onmessage = (event) => {
        try {
          const message: SyncMessage = JSON.parse(event.data);
          handleMessageRef.current(message);
        } catch (e) {
          captureError(e, 'runsheetSync.parseMessage');
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        
        // Attempt reconnect after delay
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (e) => {
        captureError(e, 'runsheetSync.wsError');
        setError('Connection error. Retrying...');
      };
    } catch (e) {
      captureError(e, 'runsheetSync.wsCreate');
      setError('Failed to connect');
    }
  }, [runsheetId, userId, userName]);

  const handleMessage = useCallback((message: SyncMessage) => {
    switch (message.type) {
      case 'state_update':
        const newState = message.payload as RunsheetState;
        
        // Check for version conflict
        if (localVersionRef.current > 0 && message.version < localVersionRef.current) {
          onConflict?.(localVersionRef.current, message.version);
          return;
        }
        
        localVersionRef.current = message.version;
        setState(newState);
        setLastSyncedAt(new Date(message.timestamp));
        onStateChange?.(newState);
        break;

      case 'cue_update':
        setState((prev) => {
          if (!prev) return prev;
          const { cueId, updates } = message.payload as { cueId: string; updates: Partial<Cue> };
          return {
            ...prev,
            version: message.version,
            cues: prev.cues.map((cue) =>
              cue.id === cueId ? { ...cue, ...updates } : cue
            ),
          };
        });
        localVersionRef.current = message.version;
        setLastSyncedAt(new Date(message.timestamp));
        break;

      case 'presence':
        const editors = message.payload as ActiveEditor[];
        setActiveEditors(editors.filter((e) => e.userId !== userId));
        onPresenceChange?.(editors);
        break;

      case 'cue_go':
        setState((prev) => {
          if (!prev) return prev;
          const { cueId } = message.payload as { cueId: string };
          return {
            ...prev,
            current_cue_id: cueId,
            show_mode_active: true,
            cues: prev.cues.map((cue) => ({
              ...cue,
              status: cue.id === cueId ? 'go' : 
                      cue.status === 'go' ? 'complete' : cue.status,
            })),
          };
        });
        break;

      case 'cue_skip':
        setState((prev) => {
          if (!prev) return prev;
          const { cueId } = message.payload as { cueId: string };
          return {
            ...prev,
            cues: prev.cues.map((cue) =>
              cue.id === cueId ? { ...cue, status: 'skipped' } : cue
            ),
          };
        });
        break;

      case 'show_mode':
        setState((prev) => {
          if (!prev) return prev;
          const { active } = message.payload as { active: boolean };
          return { ...prev, show_mode_active: active };
        });
        break;
    }
  }, [userId, onStateChange, onPresenceChange, onConflict]);

  handleMessageRef.current = handleMessage;

  const sendMessage = useCallback((message: Omit<SyncMessage, 'timestamp' | 'userId'>) => {
    const fullMessage: SyncMessage = {
      ...message,
      timestamp: Date.now(),
      userId,
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(fullMessage));
    } else {
      // Queue for later
      pendingUpdatesRef.current.push(fullMessage);
    }
  }, [userId]);

  const updateCue = useCallback((cueId: string, updates: Partial<Cue>) => {
    setIsSyncing(true);
    
    // Optimistic update
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        version: prev.version + 1,
        cues: prev.cues.map((cue) =>
          cue.id === cueId ? { ...cue, ...updates } : cue
        ),
      };
    });

    sendMessage({
      type: 'cue_update',
      payload: { cueId, updates },
      version: localVersionRef.current + 1,
    });

    setIsSyncing(false);
  }, [sendMessage]);

  const goCue = useCallback((cueId: string) => {
    sendMessage({
      type: 'cue_go',
      payload: { cueId },
      version: localVersionRef.current,
    });
  }, [sendMessage]);

  const skipCue = useCallback((cueId: string) => {
    sendMessage({
      type: 'cue_skip',
      payload: { cueId },
      version: localVersionRef.current,
    });
  }, [sendMessage]);

  const setShowMode = useCallback((active: boolean) => {
    sendMessage({
      type: 'show_mode',
      payload: { active },
      version: localVersionRef.current,
    });
  }, [sendMessage]);

  const reorderCues = useCallback((cueIds: string[]) => {
    setState((prev) => {
      if (!prev) return prev;
      const cueMap = new Map(prev.cues.map((c) => [c.id, c]));
      const reorderedCues = cueIds
        .map((id, index) => {
          const cue = cueMap.get(id);
          return cue ? { ...cue, sequence: index + 1 } : null;
        })
        .filter((c): c is Cue => c !== null);
      
      return { ...prev, cues: reorderedCues };
    });

    sendMessage({
      type: 'state_update',
      payload: { cueOrder: cueIds },
      version: localVersionRef.current + 1,
    });
  }, [sendMessage]);

  const addCue = useCallback((cue: Omit<Cue, 'id'>) => {
    const newCue: Cue = {
      ...cue,
      id: `cue-${Date.now()}`,
    };

    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cues: [...prev.cues, newCue],
      };
    });

    sendMessage({
      type: 'state_update',
      payload: { addCue: newCue },
      version: localVersionRef.current + 1,
    });
  }, [sendMessage]);

  const deleteCue = useCallback((cueId: string) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cues: prev.cues.filter((c) => c.id !== cueId),
      };
    });

    sendMessage({
      type: 'state_update',
      payload: { deleteCue: cueId },
      version: localVersionRef.current + 1,
    });
  }, [sendMessage]);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    connect();
  }, [connect]);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // Send presence heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'presence',
          payload: { userId, userName, timestamp: Date.now() },
        }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, userName]);

  return {
    state,
    activeEditors,
    isConnected,
    isSyncing,
    lastSyncedAt,
    error,
    updateCue,
    goCue,
    skipCue,
    setShowMode,
    reorderCues,
    addCue,
    deleteCue,
    reconnect,
  };
}

export default useRunsheetSync;
