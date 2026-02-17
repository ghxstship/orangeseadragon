"use client";

/**
 * Visual Workflow Builder Page
 * Full-screen drag-and-drop workflow automation designer.
 */

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWorkflowBuilderStore } from "@/stores/workflow-builder-store";
import { captureError } from '@/lib/observability';
import { WorkflowCanvas } from "@/components/workflows/visual-builder/WorkflowCanvas";
import { NodePalette } from "@/components/workflows/visual-builder/NodePalette";
import { NodePropertyPanel } from "@/components/workflows/visual-builder/NodePropertyPanel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Save, Play, AlertTriangle, Loader2,
  Zap, Calendar, Radio, Webhook,
} from "lucide-react";
import { useCopilotContext } from "@/hooks/use-copilot-context";

const TRIGGER_TYPES = [
  { value: "manual", label: "Manual", icon: Zap },
  { value: "schedule", label: "Schedule", icon: Calendar },
  { value: "event", label: "Event", icon: Radio },
  { value: "webhook", label: "Webhook", icon: Webhook },
];

const COMMON_EVENTS = [
  "task.created", "task.completed", "task.overdue",
  "deal.created", "deal.stage_changed", "deal.won",
  "invoice.created", "invoice.sent", "invoice.paid", "invoice.overdue",
  "expense.submitted", "expense.approved",
  "event.status_changed", "show_call.published",
  "shift.created", "asset.checkout_requested",
  "runsheet.delay_reported",
];

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get("id");

  useCopilotContext({ module: "operations", entityType: "workflow" });

  const {
    name, trigger, isDirty, isSaving, validationErrors,
    setName, setTrigger, validate, toSerializedWorkflow,
    setIsSaving, loadFromSerialized, reset,
  } = useWorkflowBuilderStore();

  // Load existing workflow if ID provided
  React.useEffect(() => {
    if (workflowId) {
      fetch(`/api/workflows/${workflowId}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.data) {
            loadFromSerialized(res.data);
          }
        })
        .catch((err: unknown) => captureError(err, 'workflowBuilder.load'));
    } else {
      reset();
    }
  }, [workflowId, loadFromSerialized, reset]);

  const handleSave = React.useCallback(async () => {
    const errors = validate();
    if (errors.some((e) => e.severity === "error")) return;

    setIsSaving(true);
    try {
      const payload = toSerializedWorkflow();
      const method = payload.id ? "PUT" : "POST";
      const url = payload.id ? `/api/workflows/${payload.id}` : "/api/workflows";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.data?.id) {
          loadFromSerialized({ ...payload, id: result.data.id });
        }
      }
    } finally {
      setIsSaving(false);
    }
  }, [validate, toSerializedWorkflow, setIsSaving, loadFromSerialized]);

  const handleTest = React.useCallback(async () => {
    const errors = validate();
    if (errors.some((e) => e.severity === "error")) return;

    const payload = toSerializedWorkflow();
    try {
      await fetch("/api/workflows/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Test execution error handled by API
    }
  }, [validate, toSerializedWorkflow]);

  const hasErrors = validationErrors.some((e) => e.severity === "error");
  const hasWarnings = validationErrors.some((e) => e.severity === "warning");

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push("/operations/events")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Untitled Workflow"
              className="h-8 text-sm font-semibold border-none bg-transparent p-0 focus-visible:ring-0 w-48"
            />
            {isDirty && (
              <Badge variant="outline" className="text-[9px] h-4">
                Unsaved
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Trigger selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase">Trigger:</span>
            <Select
              value={trigger.type}
              onValueChange={(v) => setTrigger({ type: v as "manual" | "schedule" | "event" | "webhook", config: {} })}
            >
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      <t.icon className="h-3.5 w-3.5" />
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {trigger.type === "schedule" && (
              <Input
                value={String((trigger.config as Record<string, unknown>).cron || "")}
                onChange={(e) => setTrigger({ ...trigger, config: { ...trigger.config, cron: e.target.value } })}
                placeholder="0 9 * * *"
                className="h-8 w-28 text-xs font-mono"
              />
            )}

            {trigger.type === "event" && (
              <Select
                value={String((trigger.config as Record<string, unknown>).eventType || "")}
                onValueChange={(v) => setTrigger({ ...trigger, config: { ...trigger.config, eventType: v } })}
              >
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_EVENTS.map((ev) => (
                    <SelectItem key={ev} value={ev} className="text-xs">
                      {ev}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {trigger.type === "webhook" && (
              <Input
                value={String((trigger.config as Record<string, unknown>).path || "")}
                onChange={(e) => setTrigger({ ...trigger, config: { ...trigger.config, path: e.target.value } })}
                placeholder="/api/webhooks/..."
                className="h-8 w-40 text-xs font-mono"
              />
            )}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Validation status */}
          {(hasErrors || hasWarnings) && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className={`h-3.5 w-3.5 ${hasErrors ? "text-destructive" : "text-semantic-warning"}`} />
              <span className="text-[10px] text-muted-foreground">
                {validationErrors.length} issue{validationErrors.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={hasErrors}
            className="gap-1.5"
          >
            <Play className="h-3.5 w-3.5" />
            Test
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || hasErrors || !name.trim()}
            className="gap-1.5"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        <WorkflowCanvas />
        <NodePropertyPanel />
      </div>
    </div>
  );
}
