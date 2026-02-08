'use client';

import { useState, useEffect } from 'react';
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
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-500',
};


const mockIncidents: Incident[] = [
  {
    id: '1',
    incident_number: 'INC-2026-0142',
    title: 'Medical Emergency - Section B',
    type: 'medical',
    severity: 'critical',
    status: 'dispatched',
    location: 'Section B, Row 12',
    location_coordinates: { lat: 40.7128, lng: -74.006 },
    reported_at: new Date(Date.now() - 180000).toISOString(),
    assigned_to: 'Medical Team Alpha',
    description: 'Patron collapsed, possible cardiac event',
  },
  {
    id: '2',
    incident_number: 'INC-2026-0143',
    title: 'Crowd Surge - Main Gate',
    type: 'crowd',
    severity: 'high',
    status: 'on-scene',
    location: 'Main Entrance Gate 1',
    location_coordinates: { lat: 40.7138, lng: -74.007 },
    reported_at: new Date(Date.now() - 300000).toISOString(),
    assigned_to: 'Security Team Bravo',
    description: 'Large crowd buildup at main gate, flow control needed',
  },
  {
    id: '3',
    incident_number: 'INC-2026-0144',
    title: 'Lost Child Report',
    type: 'security',
    severity: 'medium',
    status: 'in-progress',
    location: 'Family Area',
    reported_at: new Date(Date.now() - 600000).toISOString(),
    assigned_to: 'Guest Services',
    description: '8-year-old separated from parents',
  },
  {
    id: '4',
    incident_number: 'INC-2026-0145',
    title: 'Spill Hazard - Concourse',
    type: 'safety',
    severity: 'low',
    status: 'open',
    location: 'West Concourse near Stand 4',
    reported_at: new Date(Date.now() - 60000).toISOString(),
    description: 'Large beverage spill creating slip hazard',
  },
];

const mockStats: ControlRoomStats = {
  active_incidents: 4,
  critical_count: 1,
  avg_response_time: 142,
  teams_deployed: 3,
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

export function IncidentControlRoom() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [stats] = useState<ControlRoomStats>(mockStats);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIncidents((prev) => [...prev]);
    }, 5000);
    return () => clearInterval(interval);
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

  const activeIncidents = incidents.filter((i) => 
    ['open', 'dispatched', 'on-scene', 'in-progress'].includes(i.status)
  );

  const filteredIncidents = filterSeverity
    ? activeIncidents.filter((i) => i.severity === filterSeverity)
    : activeIncidents;

  const criticalIncidents = activeIncidents.filter((i) => i.severity === 'critical');

  return (
    <div className={cn(
      "flex flex-col h-full bg-neutral-950 text-white",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-black/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400" />
            <h1 className="text-xl font-bold">Control Room</h1>
          </div>
          <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            LIVE
          </Badge>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-3xl font-mono font-bold text-emerald-400">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
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
              <p className="text-xs text-neutral-400 uppercase tracking-wider">Active Incidents</p>
              <p className="text-3xl font-bold text-white">{stats.active_incidents}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-400" />
          </div>
        </Card>
        
        <Card className={cn(
          "border p-4",
          stats.critical_count > 0 
            ? "bg-red-500/10 border-red-500/30 animate-pulse" 
            : "bg-muted border-border"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider">Critical</p>
              <p className={cn(
                "text-3xl font-bold",
                stats.critical_count > 0 ? "text-red-400" : "text-white"
              )}>
                {stats.critical_count}
              </p>
            </div>
            <AlertTriangle className={cn(
              "h-8 w-8",
              stats.critical_count > 0 ? "text-red-400" : "text-neutral-600"
            )} />
          </div>
        </Card>
        
        <Card className="bg-muted border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider">Avg Response</p>
              <p className="text-3xl font-bold text-white">{formatDuration(stats.avg_response_time)}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </Card>
        
        <Card className="bg-muted border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider">Teams Deployed</p>
              <p className="text-3xl font-bold text-white">{stats.teams_deployed}</p>
            </div>
            <Users className="h-8 w-8 text-emerald-400" />
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
                    incident.severity === 'critical' && "bg-red-500/5 border-l-4 border-l-red-500"
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
                        <span className="text-xs text-neutral-500 font-mono">
                          {incident.incident_number}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {incident.status}
                        </Badge>
                      </div>
                      
                      <h3 className="font-medium text-white truncate">{incident.title}</h3>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
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
                        <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                          <User className="h-3 w-3" />
                          {incident.assigned_to}
                        </div>
                      )}
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-neutral-600" />
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
                  <p className="text-xs text-neutral-500 font-mono mb-1">
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
                  <p className="text-xs text-neutral-400 mb-1">Location</p>
                  <p className="font-medium">{selectedIncident.location}</p>
                </Card>
                <Card className="bg-muted border-border p-4">
                  <p className="text-xs text-neutral-400 mb-1">Reported</p>
                  <p className="font-medium">{formatTimeAgo(selectedIncident.reported_at)}</p>
                </Card>
                <Card className="bg-muted border-border p-4">
                  <p className="text-xs text-neutral-400 mb-1">Type</p>
                  <p className="font-medium capitalize">{selectedIncident.type}</p>
                </Card>
                <Card className="bg-muted border-border p-4">
                  <p className="text-xs text-neutral-400 mb-1">Status</p>
                  <p className="font-medium capitalize">{selectedIncident.status}</p>
                </Card>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-400 mb-2">Description</h3>
                <p className="text-white">{selectedIncident.description}</p>
              </div>

              {selectedIncident.assigned_to && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-400 mb-2">Assigned To</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="font-medium">{selectedIncident.assigned_to}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {selectedIncident.status === 'open' && (
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
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
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Mark Resolved
                    </Button>
                  </>
                )}
                <Button variant="outline" className="border-amber-500/50 text-amber-400">
                  Escalate
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500">
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
          className="absolute bottom-0 left-0 right-0 bg-red-600 text-white px-6 py-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              <span className="font-bold">CRITICAL INCIDENT:</span>
              <span>{criticalIncidents[0].title}</span>
              <span className="text-red-200">- {criticalIncidents[0].location}</span>
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
