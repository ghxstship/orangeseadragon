"use client";

/**
 * Emergency Alert Escalation
 * Multi-channel dispatch for critical production incidents.
 * Supports tiered escalation, acknowledgment tracking, and all-hands broadcast.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { captureError } from '@/lib/observability';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle, Shield, Phone, Mail, MessageSquare, Radio,
  Send, Users, Clock, CheckCircle, Loader2, Siren,
} from "lucide-react";

type AlertSeverity = "info" | "warning" | "critical" | "emergency";
type AlertChannel = "push" | "sms" | "email" | "radio" | "pa_system";

interface EscalationTier {
  level: number;
  label: string;
  roles: string[];
  channels: AlertChannel[];
  autoEscalateMinutes: number;
}

interface AlertRecipient {
  id: string;
  name: string;
  role: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  channel: AlertChannel;
}

interface ActiveAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  created_at: string;
  current_tier: number;
  recipients: AlertRecipient[];
  is_resolved: boolean;
  resolved_at?: string;
}

interface EmergencyAlertProps {
  eventId: string;
  className?: string;
}

const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; color: string; bgColor: string; borderColor: string }> = {
  info: { label: "Info", color: "text-semantic-info", bgColor: "bg-semantic-info/10", borderColor: "border-semantic-info/30" },
  warning: { label: "Warning", color: "text-semantic-warning", bgColor: "bg-semantic-warning/10", borderColor: "border-semantic-warning/30" },
  critical: { label: "Critical", color: "text-semantic-orange", bgColor: "bg-semantic-orange/10", borderColor: "border-semantic-orange/30" },
  emergency: { label: "Emergency", color: "text-destructive", bgColor: "bg-destructive/10", borderColor: "border-destructive/30" },
};

const CHANNEL_ICONS: Record<AlertChannel, React.ElementType> = {
  push: MessageSquare,
  sms: Phone,
  email: Mail,
  radio: Radio,
  pa_system: Siren,
};

const DEFAULT_TIERS: EscalationTier[] = [
  { level: 1, label: "On-Site Team", roles: ["stage_manager", "production_coordinator"], channels: ["push", "radio"], autoEscalateMinutes: 5 },
  { level: 2, label: "Production Management", roles: ["production_manager", "safety_officer"], channels: ["push", "sms", "email"], autoEscalateMinutes: 10 },
  { level: 3, label: "Executive & Emergency", roles: ["executive_producer", "venue_manager", "emergency_services"], channels: ["sms", "email", "pa_system"], autoEscalateMinutes: 0 },
];

function AlertForm({ onSubmit, isSubmitting }: { onSubmit: (data: { severity: AlertSeverity; title: string; message: string; channels: AlertChannel[]; broadcastAll: boolean }) => void; isSubmitting: boolean }) {
  const [severity, setSeverity] = React.useState<AlertSeverity>("warning");
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [channels, setChannels] = React.useState<AlertChannel[]>(["push", "sms"]);
  const [broadcastAll, setBroadcastAll] = React.useState(false);

  const toggleChannel = (ch: AlertChannel) => {
    setChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    onSubmit({ severity, title, message, channels, broadcastAll });
  };

  const config = SEVERITY_CONFIG[severity];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-[10px]">Severity</Label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(SEVERITY_CONFIG) as [AlertSeverity, typeof config][]).map(([key, cfg]) => (
            <Button
              key={key}
              type="button"
              variant={severity === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSeverity(key)}
              className={cn("text-[10px] h-8", severity === key && key === "emergency" && "bg-destructive hover:bg-destructive/90")}
            >
              {cfg.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px]">Alert Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Stage collapse risk — high winds"
          className="h-8 text-xs"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px]">Message</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the situation and required actions..."
          rows={3}
          className="text-xs resize-none"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px]">Dispatch Channels</Label>
        <div className="flex flex-wrap gap-2">
          {(["push", "sms", "email", "radio", "pa_system"] as AlertChannel[]).map((ch) => {
            const Icon = CHANNEL_ICONS[ch];
            return (
              <Button
                key={ch}
                type="button"
                variant={channels.includes(ch) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleChannel(ch)}
                className="text-[10px] h-7 gap-1.5"
              >
                <Icon className="h-3 w-3" />
                {ch.replace("_", " ")}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] font-medium">Broadcast to all crew</span>
        </div>
        <Switch checked={broadcastAll} onCheckedChange={setBroadcastAll} />
      </div>

      {severity === "emergency" && (
        <div className={cn("flex items-start gap-2 p-2.5 rounded-lg", config.bgColor, "border", config.borderColor)}>
          <AlertTriangle className={cn("h-4 w-4 flex-shrink-0 mt-0.5", config.color)} />
          <div>
            <p className={cn("text-xs font-semibold", config.color)}>Emergency Protocol</p>
            <p className="text-[10px] text-muted-foreground">
              This will trigger the full 3-tier escalation chain and notify emergency services contacts.
            </p>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !title.trim() || !message.trim() || channels.length === 0}
        className={cn("w-full gap-2", severity === "emergency" && "bg-destructive hover:bg-destructive/90")}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {severity === "emergency" ? "DISPATCH EMERGENCY ALERT" : "Send Alert"}
      </Button>
    </form>
  );
}

function ActiveAlertCard({ alert }: { alert: ActiveAlert }) {
  const config = SEVERITY_CONFIG[alert.severity];
  const ackCount = alert.recipients.filter((r) => r.acknowledged).length;
  const totalCount = alert.recipients.length;

  return (
    <div className={cn("p-3 rounded-lg border", config.bgColor, config.borderColor)}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge className={cn("text-[9px]", config.bgColor, config.color, "border", config.borderColor)}>
            {config.label}
          </Badge>
          <span className="text-xs font-semibold">{alert.title}</span>
        </div>
        {alert.is_resolved ? (
          <Badge variant="outline" className="text-[9px] gap-1 text-semantic-success border-semantic-success/30">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[9px] gap-1">
            <Clock className="h-3 w-3" />
            Tier {alert.current_tier}
          </Badge>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground mb-2">{alert.message}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-muted-foreground">
            {ackCount}/{totalCount} acknowledged
          </span>
          <div className="flex -space-x-1">
            {alert.recipients.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className={cn(
                  "w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-[7px] font-bold",
                  r.acknowledged ? "bg-semantic-success text-white" : "bg-muted text-muted-foreground"
                )}
                title={`${r.name} (${r.role}) — ${r.acknowledged ? "Acknowledged" : "Pending"}`}
              >
                {r.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>
        <span className="text-[9px] text-muted-foreground">
          {new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

export function EmergencyAlert({ eventId, className }: EmergencyAlertProps) {
  const [activeAlerts, setActiveAlerts] = React.useState<ActiveAlert[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showForm, setShowForm] = React.useState(true);

  // Fetch active alerts
  React.useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/alerts?status=active`);
        if (res.ok) {
          const result = await res.json();
          if (result.data) setActiveAlerts(result.data);
        }
      } catch (err) {
        captureError(err, 'emergencyAlert.fetchAlerts');
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [eventId]);

  const handleSubmit = async (data: { severity: AlertSeverity; title: string; message: string; channels: AlertChannel[]; broadcastAll: boolean }) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          escalation_tiers: DEFAULT_TIERS,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          setActiveAlerts((prev) => [result.data, ...prev]);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-destructive/10">
              <Shield className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-sm">Emergency Alerts</CardTitle>
              <p className="text-[10px] text-muted-foreground">Multi-channel escalation dispatch</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeAlerts.filter((a) => !a.is_resolved).length > 0 && (
              <Badge variant="destructive" className="text-[9px] gap-1 animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                {activeAlerts.filter((a) => !a.is_resolved).length} Active
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="text-[10px] h-7"
            >
              {showForm ? "Hide Form" : "New Alert"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Escalation tiers reference */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {DEFAULT_TIERS.map((tier, i) => (
            <React.Fragment key={tier.level}>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/50 flex-shrink-0">
                <span className="text-[9px] font-bold text-primary">T{tier.level}</span>
                <span className="text-[9px] text-muted-foreground">{tier.label}</span>
                {tier.autoEscalateMinutes > 0 && (
                  <span className="text-[8px] text-muted-foreground/60">{tier.autoEscalateMinutes}m</span>
                )}
              </div>
              {i < DEFAULT_TIERS.length - 1 && (
                <span className="text-muted-foreground/30 text-[10px]">→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {showForm && (
          <>
            <Separator />
            <AlertForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </>
        )}

        {/* Active alerts */}
        {activeAlerts.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                Active Alerts
              </p>
              <div className="space-y-2">
                {activeAlerts.map((alert) => (
                  <ActiveAlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
