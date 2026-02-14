'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Phone,
  Radio,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ChevronRight,
  Activity,
  Users,
} from 'lucide-react';

interface Incident {
  id: string;
  incident_number: string;
  title: string;
  type: 'medical' | 'security' | 'safety' | 'fire' | 'weather' | 'crowd' | 'technical' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'dispatched' | 'on-scene' | 'in-progress' | 'resolved' | 'closed';
  location: string;
  location_coordinates?: { lat: number; lng: number };
  reported_at: string;
  assigned_to?: string;
  description: string;
}

interface ControlRoomStats {
  active_incidents: number;
  critical_count: number;
  avg_response_time: number;
  teams_deployed: number;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-destructive',
  high: 'bg-semantic-orange',
  medium: 'bg-semantic-warning',
  low: 'bg-muted-foreground',
};



function formatTimeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ago`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function mapSeverity(s: string | null): Incident['severity'] {
  if (s === 'critical') return 'critical';
  if (s === 'high') return 'high';
  if (s === 'medium') return 'medium';
  return 'low';
}

function mapIncidentType(t: string | null): Incident['type'] {
  const valid: Incident['type'][] = ['medical', 'security', 'safety', 'fire', 'weather', 'crowd', 'technical', 'other'];
  if (t && valid.includes(t as Incident['type'])) return t as Incident['type'];
  return 'other';
}

function mapStatus(s: string | null): Incident['status'] {
  const valid: Incident['status'][] = ['open', 'dispatched', 'on-scene', 'in-progress', 'resolved', 'closed'];
  if (s && valid.includes(s as Incident['status'])) return s as Incident['status'];
  return 'open';
}

export function IncidentControlRoom() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch real incidents from Supabase
  useEffect(() => {
    const supabase = createClient();
    const fetchIncidents = async () => {
      const { data } = await supabase
        .from('compliance_incidents')
        .select('id, title, incident_number, incident_type, severity, status, occurred_at, reported_by, description, affected_systems')
        .in('status', ['open', 'investigating', 'in_progress', 'dispatched', 'on_scene'])
        .order('occurred_at', { ascending: false })
        .limit(50);

      const mapped: Incident[] = (data ?? []).map((d) => ({
        id: d.id,
        incident_number: d.incident_number ?? d.id.slice(0, 12),
        title: d.title,
        type: mapIncidentType(d.incident_type),
        severity: mapSeverity(d.severity),
        status: mapStatus(d.status),
        location: d.affected_systems?.[0] ?? '',
        reported_at: d.occurred_at ?? new Date().toISOString(),
        assigned_to: d.reported_by ?? undefined,
        description: d.description ?? '',
      }));
      setIncidents(mapped);
    };
    fetchIncidents();
    // Poll every 10 seconds for live updates
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats: ControlRoomStats = useMemo(() => {
    const active = incidents.filter(i => ['open', 'dispatched', 'on-scene', 'in-progress'].includes(i.status));
    return {
      active_incidents: active.length,
      critical_count: active.filter(i => i.severity === 'critical').length,
      avg_response_time: 0,
      teams_deployed: new Set(active.map(i => i.assigned_to).filter(Boolean)).size,
    };
  }, [incidents]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const activeIncidents = incidents.filter((i) => 
    ['open', 'dispatched', 'on-scene', 'in-progress'].includes(i.status)
  );

  const filteredIncidents = filterSeverity
    ? activeIncidents.filter((i) => i.severity === filterSeverity)
    : activeIncidents;

  const criticalIncidents = activeIncidents.filter((i) => i.severity === 'critical');

  return (
    <div className={cn(
      "flex flex-col h-full bg-background text-foreground",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-black/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-semantic-success" />
            <h1 className="text-xl font-bold">Control Room</h1>
          </div>
          <Badge variant="outline" className="bg-semantic-success/20 text-semantic-success border-semantic-success/30">
            LIVE
          </Badge>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-3xl font-mono font-bold text-semantic-success">
            {currentTime.toLocaleTimeString(undefined, { hour12: false })}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-white hover:bg-accent"
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
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
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-border">
        <Card className="bg-muted border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Incidents</p>
              <p className="text-3xl font-bold text-white">{stats.active_incidents}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-semantic-warning" />
          </div>
        </Card>
        
        <Card className={cn(
          "border p-4",
          stats.critical_count > 0 
            ? "bg-destructive/10 border-destructive/30 animate-pulse" 
            : "bg-muted border-border"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Critical</p>
              <p className={cn(
                "text-3xl font-bold",
                stats.critical_count > 0 ? "text-destructive/80" : "text-white"
              )}>
                {stats.critical_count}
              </p>
            </div>
            <AlertTriangle className={cn(
              "h-8 w-8",
              stats.critical_count > 0 ? "text-destructive/80" : "text-muted-foreground"
            )} />
          </div>
        </Card>
        
        <Card className="bg-muted border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Response</p>
              <p className="text-3xl font-bold text-white">{formatDuration(stats.avg_response_time)}</p>
            </div>
            <Clock className="h-8 w-8 text-semantic-info" />
          </div>
        </Card>
        
        <Card className="bg-muted border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Teams Deployed</p>
              <p className="text-3xl font-bold text-white">{stats.teams_deployed}</p>
            </div>
            <Users className="h-8 w-8 text-semantic-success" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Incident List */}
        <div className="w-1/2 border-r border-border flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="font-semibold">Active Incidents</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterSeverity(null)}
                className={cn(!filterSeverity && "bg-accent")}
              >
                All
              </Button>
              {['critical', 'high', 'medium', 'low'].map((sev) => (
                <Button
                  key={sev}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterSeverity(sev)}
                  className={cn(filterSeverity === sev && "bg-accent")}
                >
                  <div className={cn("w-2 h-2 rounded-full mr-1", SEVERITY_COLORS[sev])} />
                  {sev.charAt(0).toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filteredIncidents.map((incident) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => setSelectedIncident(incident)}
                  className={cn(
                    "p-4 border-b border-border cursor-pointer transition-all",
                    selectedIncident?.id === incident.id 
                      ? "bg-accent" 
                      : "hover:bg-muted",
                    incident.severity === 'critical' && "bg-destructive/5 border-l-4 border-l-destructive"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full mt-1.5 flex-shrink-0",
                      SEVERITY_COLORS[incident.severity],
                      incident.severity === 'critical' && "animate-pulse"
                    )} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          {incident.incident_number}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {incident.status}
                        </Badge>
                      </div>
                      
                      <h3 className="font-medium text-white truncate">{incident.title}</h3>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {incident.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(incident.reported_at)}
                        </div>
                      </div>
                      
                      {incident.assigned_to && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-semantic-success">
                          <User className="h-3 w-3" />
                          {incident.assigned_to}
                        </div>
                      )}
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground/70" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Map / Detail Panel */}
        <div className="w-1/2 flex flex-col">
          {selectedIncident ? (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-1">
                    {selectedIncident.incident_number}
                  </p>
                  <h2 className="text-2xl font-bold">{selectedIncident.title}</h2>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  SEVERITY_COLORS[selectedIncident.severity],
                  "text-white"
                )}>
                  {selectedIncident.severity.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="bg-muted border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="font-medium">{selectedIncident.location}</p>
                </Card>
                <Card className="bg-muted border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Reported</p>
                  <p className="font-medium">{formatTimeAgo(selectedIncident.reported_at)}</p>
                </Card>
                <Card className="bg-muted border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="font-medium capitalize">{selectedIncident.type}</p>
                </Card>
                <Card className="bg-muted border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="font-medium capitalize">{selectedIncident.status}</p>
                </Card>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-white">{selectedIncident.description}</p>
              </div>

              {selectedIncident.assigned_to && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Assigned To</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-semantic-success/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-semantic-success" />
                    </div>
                    <span className="font-medium">{selectedIncident.assigned_to}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {selectedIncident.status === 'open' && (
                  <Button className="flex-1 bg-semantic-success hover:bg-semantic-success/90">
                    <Radio className="h-4 w-4 mr-2" />
                    Dispatch Team
                  </Button>
                )}
                {['dispatched', 'on-scene', 'in-progress'].includes(selectedIncident.status) && (
                  <>
                    <Button variant="outline" className="flex-1 border-border">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Team
                    </Button>
                    <Button className="flex-1 bg-semantic-info hover:bg-semantic-info/90">
                      Mark Resolved
                    </Button>
                  </>
                )}
                <Button variant="outline" className="border-semantic-warning/50 text-semantic-warning">
                  Escalate
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an incident to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Critical Alert Banner */}
      {criticalIncidents.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="absolute bottom-0 left-0 right-0 bg-destructive text-white px-6 py-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              <span className="font-bold">CRITICAL INCIDENT:</span>
              <span>{criticalIncidents[0].title}</span>
              <span className="text-destructive/60">- {criticalIncidents[0].location}</span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSelectedIncident(criticalIncidents[0])}
            >
              View Details
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default IncidentControlRoom;
