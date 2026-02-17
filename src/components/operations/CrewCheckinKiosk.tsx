'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  QrCode,
  UserCheck,
  UserX,
  MapPin,
  CheckCircle2,
  XCircle,
  Coffee,
  LogOut,
  Camera,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  photo_url?: string;
  scheduled_start?: string;
  scheduled_end?: string;
}

interface CheckinRecord {
  id: string;
  crew_member: CrewMember;
  status: 'checked_in' | 'on_break' | 'checked_out';
  check_in_time: string;
  check_out_time?: string;
  geofence_valid: boolean;
}

interface KioskConfig {
  event_id: string;
  event_name: string;
  venue_name: string;
  geofence_enabled: boolean;
  geofence_radius_meters: number;
  geofence_center: { lat: number; lng: number };
  photo_required: boolean;
  allow_manual_entry: boolean;
}

const defaultConfig: KioskConfig = {
  event_id: '',
  event_name: 'Loading...',
  venue_name: '',
  geofence_enabled: false,
  geofence_radius_meters: 500,
  geofence_center: { lat: 0, lng: 0 },
  photo_required: false,
  allow_manual_entry: true,
};

type KioskMode = 'idle' | 'scanning' | 'success' | 'error' | 'action';

interface ScanResult {
  crew_member: CrewMember;
  current_status?: 'checked_in' | 'on_break' | 'checked_out' | null;
  is_scheduled: boolean;
  is_late: boolean;
  minutes_late?: number;
}

export function CrewCheckinKiosk() {
  const [mode, setMode] = useState<KioskMode>('idle');
  const [config, setConfig] = useState<KioskConfig>(defaultConfig);
  const [recentCheckins, setRecentCheckins] = useState<CheckinRecord[]>([]);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationValid, setLocationValid] = useState<boolean | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real crew assignments from Supabase
  useEffect(() => {
    const supabase = createClient();
    const fetchData = async () => {
      // Get the most recent event to use as kiosk context
      const { data: events } = await supabase
        .from('events')
        .select('id, name, venue_id')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .limit(1);

      if (events && events.length > 0) {
        const evt = events[0];
        if (evt) setConfig(prev => ({ ...prev, event_id: evt.id, event_name: evt.name }));
      }

      // Fetch recent crew assignments with check-in data
      const { data: assignments } = await supabase
        .from('crew_assignments')
        .select('id, user_id, checked_in_at, checked_out_at, status')
        .not('checked_in_at', 'is', null)
        .order('checked_in_at', { ascending: false })
        .limit(10);

      if (assignments && assignments.length > 0) {
        const userIds = assignments.map(a => a.user_id);
        const { data: users } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', userIds);
        const userMap = new Map((users ?? []).map(u => [u.id, u.full_name ?? 'Unknown']));

        const mapped: CheckinRecord[] = assignments.map(a => ({
          id: a.id,
          crew_member: {
            id: a.user_id,
            name: userMap.get(a.user_id) ?? 'Unknown',
            role: '',
            department: '',
          },
          status: a.checked_out_at ? 'checked_out' : 'checked_in',
          check_in_time: a.checked_in_at!,
          check_out_time: a.checked_out_at ?? undefined,
          geofence_valid: true,
        }));
        setRecentCheckins(mapped);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (config.geofence_enabled && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            config.geofence_center.lat,
            config.geofence_center.lng
          );
          setLocationValid(distance <= config.geofence_radius_meters);
        },
        () => setLocationValid(null)
      );
    }
  }, [config]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const simulateScan = useCallback(() => {
    setMode('scanning');
    
    scanTimeoutRef.current = setTimeout(() => {
      const mockResult: ScanResult = {
        crew_member: {
          id: 'cm-new',
          name: 'Jordan Williams',
          role: 'Lighting Technician',
          department: 'Lighting',
          scheduled_start: new Date(Date.now() - 600000).toISOString(),
          scheduled_end: new Date(Date.now() + 28800000).toISOString(),
        },
        current_status: null,
        is_scheduled: true,
        is_late: true,
        minutes_late: 10,
      };
      
      setScanResult(mockResult);
      setMode('action');
    }, 1500);
  }, []);

  const handleCheckIn = useCallback(() => {
    if (!scanResult) return;
    
    const newCheckin: CheckinRecord = {
      id: `checkin-${Date.now()}`,
      crew_member: scanResult.crew_member,
      status: 'checked_in',
      check_in_time: new Date().toISOString(),
      geofence_valid: locationValid ?? true,
    };
    
    setRecentCheckins((prev) => [newCheckin, ...prev.slice(0, 9)]);
    setMode('success');
    
    setTimeout(() => {
      setMode('idle');
      setScanResult(null);
    }, 3000);
  }, [scanResult, locationValid]);

  const handleCheckOut = useCallback(() => {
    if (!scanResult) return;
    
    setRecentCheckins((prev) => 
      prev.map((c) => 
        c.crew_member.id === scanResult.crew_member.id
          ? { ...c, status: 'checked_out', check_out_time: new Date().toISOString() }
          : c
      )
    );
    setMode('success');
    
    setTimeout(() => {
      setMode('idle');
      setScanResult(null);
    }, 3000);
  }, [scanResult]);

  const handleBreak = useCallback(() => {
    if (!scanResult) return;
    
    setRecentCheckins((prev) => 
      prev.map((c) => 
        c.crew_member.id === scanResult.crew_member.id
          ? { ...c, status: 'on_break' }
          : c
      )
    );
    setMode('success');
    
    setTimeout(() => {
      setMode('idle');
      setScanResult(null);
    }, 3000);
  }, [scanResult]);

  const handleCancel = useCallback(() => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    setMode('idle');
    setScanResult(null);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-background text-foreground",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-black/50">
        <div>
          <h1 className="text-xl font-bold">{config.event_name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {config.venue_name}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-mono font-bold text-semantic-success">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          {config.geofence_enabled && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
              locationValid === true ? "bg-semantic-success/20 text-semantic-success" :
              locationValid === false ? "bg-destructive/20 text-destructive/80" :
              "bg-muted text-muted-foreground"
            )}>
              <MapPin className="h-4 w-4" />
              {locationValid === true ? 'In Zone' : locationValid === false ? 'Outside Zone' : 'Checking...'}
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-accent"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Scan Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <AnimatePresence mode="wait">
            {mode === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <div 
                  onClick={simulateScan}
                  className="w-80 h-80 mx-auto mb-8 rounded-3xl border-4 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-semantic-success/50 transition-colors group"
                >
                  <div className="text-center">
                    <QrCode className="h-24 w-24 mx-auto mb-4 text-muted-foreground group-hover:text-semantic-success transition-colors" />
                    <p className="text-xl text-muted-foreground group-hover:text-foreground transition-colors">
                      Scan QR Code
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      or tap to simulate
                    </p>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-lg">
                  Hold your crew badge QR code up to the camera
                </p>
              </motion.div>
            )}

            {mode === 'scanning' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-80 h-80 mx-auto mb-8 rounded-3xl border-4 border-semantic-success flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-semantic-success/20 to-transparent"
                    animate={{ y: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <Camera className="h-24 w-24 text-semantic-success" />
                </div>
                
                <p className="text-semantic-success text-xl animate-pulse">
                  Scanning...
                </p>
                
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="mt-4 text-muted-foreground"
                >
                  Cancel
                </Button>
              </motion.div>
            )}

            {mode === 'action' && scanResult && (
              <motion.div
                key="action"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-md"
              >
                <Card className="bg-muted border-border p-8">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-semantic-success/20 flex items-center justify-center">
                      <UserCheck className="h-10 w-10 text-semantic-success" />
                    </div>
                    <h2 className="text-2xl font-bold">{scanResult.crew_member.name}</h2>
                    <p className="text-muted-foreground">{scanResult.crew_member.role}</p>
                    <Badge variant="outline" className="mt-2">
                      {scanResult.crew_member.department}
                    </Badge>
                    
                    {scanResult.is_late && (
                      <div className="mt-3 text-semantic-warning text-sm">
                        ⚠️ {scanResult.minutes_late} minutes late
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {!scanResult.current_status && (
                      <Button
                        onClick={handleCheckIn}
                        className="w-full h-14 text-lg bg-semantic-success hover:bg-semantic-success/90"
                      >
                        <UserCheck className="h-6 w-6 mr-2" />
                        Check In
                      </Button>
                    )}
                    
                    {scanResult.current_status === 'checked_in' && (
                      <>
                        <Button
                          onClick={handleBreak}
                          variant="outline"
                          className="w-full h-14 text-lg border-semantic-warning/50 text-semantic-warning hover:bg-semantic-warning/10"
                        >
                          <Coffee className="h-6 w-6 mr-2" />
                          Start Break
                        </Button>
                        <Button
                          onClick={handleCheckOut}
                          variant="outline"
                          className="w-full h-14 text-lg border-border"
                        >
                          <LogOut className="h-6 w-6 mr-2" />
                          Check Out
                        </Button>
                      </>
                    )}
                    
                    {scanResult.current_status === 'on_break' && (
                      <Button
                        onClick={handleCheckIn}
                        className="w-full h-14 text-lg bg-semantic-info hover:bg-semantic-info/90"
                      >
                        <RefreshCw className="h-6 w-6 mr-2" />
                        End Break
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      onClick={handleCancel}
                      className="w-full text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {mode === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="w-32 h-32 mx-auto mb-6 rounded-full bg-semantic-success flex items-center justify-center"
                >
                  <CheckCircle2 className="h-16 w-16 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-semantic-success">Success!</h2>
                <p className="text-muted-foreground mt-2">
                  {scanResult?.crew_member.name} has been checked in
                </p>
              </motion.div>
            )}

            {mode === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-destructive flex items-center justify-center">
                  <XCircle className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-destructive/80">Error</h2>
                <p className="text-muted-foreground mt-2">
                  Could not process check-in
                </p>
                <Button
                  onClick={() => setMode('idle')}
                  className="mt-6"
                >
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Check-ins Sidebar */}
        <div className="w-80 border-l border-border flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-semibold">Recent Activity</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {recentCheckins.map((checkin) => (
              <div
                key={checkin.id}
                className="px-4 py-3 border-b border-border hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    checkin.status === 'checked_in' ? "bg-semantic-success/20" :
                    checkin.status === 'on_break' ? "bg-semantic-warning/20" :
                    "bg-muted"
                  )}>
                    {checkin.status === 'checked_in' ? (
                      <UserCheck className="h-5 w-5 text-semantic-success" />
                    ) : checkin.status === 'on_break' ? (
                      <Coffee className="h-5 w-5 text-semantic-warning" />
                    ) : (
                      <UserX className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{checkin.crew_member.name}</p>
                    <p className="text-xs text-muted-foreground">{checkin.crew_member.role}</p>
                  </div>
                  
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        checkin.status === 'checked_in' ? "text-semantic-success border-semantic-success/30" :
                        checkin.status === 'on_break' ? "text-semantic-warning border-semantic-warning/30" :
                        "text-muted-foreground"
                      )}
                    >
                      {checkin.status === 'checked_in' ? 'IN' : 
                       checkin.status === 'on_break' ? 'BREAK' : 'OUT'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(checkin.check_in_time)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Footer */}
          <div className="px-4 py-3 border-t border-border bg-muted">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center min-w-0">
              <div>
                <p className="text-2xl font-bold text-semantic-success">
                  {recentCheckins.filter((c) => c.status === 'checked_in').length}
                </p>
                <p className="text-xs text-muted-foreground">On Site</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-semantic-warning">
                  {recentCheckins.filter((c) => c.status === 'on_break').length}
                </p>
                <p className="text-xs text-muted-foreground">On Break</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">
                  {recentCheckins.filter((c) => c.status === 'checked_out').length}
                </p>
                <p className="text-xs text-muted-foreground">Checked Out</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrewCheckinKiosk;
