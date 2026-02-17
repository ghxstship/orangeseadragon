"use client";

/**
 * Node Property Panel
 * Right-side panel for editing selected node configuration.
 */

import * as React from "react";
import { useWorkflowBuilderStore } from "@/stores/workflow-builder-store";
import { NODE_REGISTRY } from "@/lib/workflow-engine/visual-builder-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Settings, X, AlertTriangle } from "lucide-react";

export function NodePropertyPanel() {
  const { nodes, selectedNodeId, updateNode, selectNode, validationErrors } = useWorkflowBuilderStore();

  const selectedNode = React.useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  const nodeErrors = React.useMemo(
    () => validationErrors.filter((e) => e.nodeId === selectedNodeId),
    [validationErrors, selectedNodeId]
  );

  if (!selectedNode) {
    return (
      <div className="w-72 border-l border-border bg-card/50 flex flex-col items-center justify-center p-6">
        <Settings className="h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-xs text-muted-foreground text-center">
          Select a node to edit its properties
        </p>
      </div>
    );
  }

  const reg = NODE_REGISTRY[selectedNode.type];

  const handleConfigChange = (key: string, value: unknown) => {
    updateNode(selectedNode.id, {
      config: { ...selectedNode.config, [key]: value },
    });
  };

  return (
    <div className="w-72 border-l border-border bg-card/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${reg?.color || "bg-blue-500"}`} />
          <p className="text-xs font-semibold">{selectedNode.type.toUpperCase()}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => selectNode(null)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Validation errors */}
          {nodeErrors.length > 0 && (
            <div className="space-y-1.5">
              {nodeErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-destructive">{err.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Basic info */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
              Basic
            </p>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Label</Label>
              <Input
                value={selectedNode.label}
                onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Description</Label>
              <Textarea
                value={selectedNode.description || ""}
                onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <Separator />

          {/* Type-specific config */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
              Configuration
            </p>

            {/* Action config */}
            {selectedNode.type === "action" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Action Type</Label>
                  <Select
                    value={String(selectedNode.config.actionType || "")}
                    onValueChange={(v) => handleConfigChange("actionType", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="query">Query Data</SelectItem>
                      <SelectItem value="createEntity">Create Record</SelectItem>
                      <SelectItem value="updateEntity">Update Record</SelectItem>
                      <SelectItem value="deleteEntity">Delete Record</SelectItem>
                      <SelectItem value="generateDocument">Generate Document</SelectItem>
                      <SelectItem value="calculateBudgetUtilization">Calculate Budget</SelectItem>
                      <SelectItem value="calculateDelayImpact">Calculate Delay Impact</SelectItem>
                      <SelectItem value="webhook">Call Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Entity</Label>
                  <Input
                    value={String((selectedNode.config.parameters as Record<string, unknown>)?.entity || "")}
                    onChange={(e) =>
                      handleConfigChange("parameters", {
                        ...((selectedNode.config.parameters as Record<string, unknown>) || {}),
                        entity: e.target.value,
                      })
                    }
                    placeholder="e.g., tasks, events, invoices"
                    className="h-8 text-xs"
                  />
                </div>
              </>
            )}

            {/* Condition config */}
            {selectedNode.type === "condition" && (
              <div className="space-y-1.5">
                <Label className="text-[10px]">Expression</Label>
                <Textarea
                  value={String(selectedNode.config.expression || "")}
                  onChange={(e) => handleConfigChange("expression", e.target.value)}
                  placeholder='e.g., ctx.amount > 1000'
                  rows={3}
                  className="text-xs font-mono resize-none"
                />
              </div>
            )}

            {/* Delay config */}
            {selectedNode.type === "delay" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Duration</Label>
                  <Input
                    type="number"
                    value={Number(selectedNode.config.duration) || 1}
                    onChange={(e) => handleConfigChange("duration", Number(e.target.value))}
                    className="h-8 text-xs"
                    min={1}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Unit</Label>
                  <Select
                    value={String(selectedNode.config.unit || "hours")}
                    onValueChange={(v) => handleConfigChange("unit", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seconds">Seconds</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Notification config */}
            {selectedNode.type === "notification" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Channel</Label>
                  <Select
                    value={String(selectedNode.config.channel || "email")}
                    onValueChange={(v) => handleConfigChange("channel", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Template</Label>
                  <Input
                    value={String(selectedNode.config.template || "")}
                    onChange={(e) => handleConfigChange("template", e.target.value)}
                    placeholder="Template name"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Recipients (comma-separated)</Label>
                  <Input
                    value={Array.isArray(selectedNode.config.recipients) ? (selectedNode.config.recipients as string[]).join(", ") : ""}
                    onChange={(e) => handleConfigChange("recipients", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    placeholder="{{assignee.email}}"
                    className="h-8 text-xs"
                  />
                </div>
              </>
            )}

            {/* HTTP config */}
            {selectedNode.type === "http" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">URL</Label>
                  <Input
                    value={String(selectedNode.config.url || "")}
                    onChange={(e) => handleConfigChange("url", e.target.value)}
                    placeholder="https://api.example.com/webhook"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Method</Label>
                  <Select
                    value={String(selectedNode.config.method || "POST")}
                    onValueChange={(v) => handleConfigChange("method", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Approval config */}
            {selectedNode.type === "approval" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Approvers (comma-separated)</Label>
                  <Input
                    value={Array.isArray(selectedNode.config.approvers) ? (selectedNode.config.approvers as string[]).join(", ") : ""}
                    onChange={(e) => handleConfigChange("approvers", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    placeholder="{{manager.id}}"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Required Approvals</Label>
                  <Input
                    type="number"
                    value={Number(selectedNode.config.requiredApprovals) || 1}
                    onChange={(e) => handleConfigChange("requiredApprovals", Number(e.target.value))}
                    className="h-8 text-xs"
                    min={1}
                  />
                </div>
              </>
            )}

            {/* Loop config */}
            {selectedNode.type === "loop" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Collection Variable</Label>
                  <Input
                    value={String(selectedNode.config.collection || "")}
                    onChange={(e) => handleConfigChange("collection", e.target.value)}
                    placeholder="{{steps.query.output}}"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Item Variable Name</Label>
                  <Input
                    value={String(selectedNode.config.itemVariable || "item")}
                    onChange={(e) => handleConfigChange("itemVariable", e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </>
            )}

            {/* Script config */}
            {selectedNode.type === "script" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Language</Label>
                  <Select
                    value={String(selectedNode.config.language || "javascript")}
                    onValueChange={(v) => handleConfigChange("language", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Code</Label>
                  <Textarea
                    value={String(selectedNode.config.code || "")}
                    onChange={(e) => handleConfigChange("code", e.target.value)}
                    rows={6}
                    className="text-xs font-mono resize-none"
                    placeholder="// Your code here"
                  />
                </div>
              </>
            )}

            {/* Transform config */}
            {selectedNode.type === "transform" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Input Variable</Label>
                  <Input
                    value={String(selectedNode.config.input || "")}
                    onChange={(e) => handleConfigChange("input", e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Output Variable</Label>
                  <Input
                    value={String(selectedNode.config.output || "")}
                    onChange={(e) => handleConfigChange("output", e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Transformation</Label>
                  <Input
                    value={String(selectedNode.config.transformation || "")}
                    onChange={(e) => handleConfigChange("transformation", e.target.value)}
                    placeholder="e.g., groupBy(projectId)"
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Retry & Timeout */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
              Error Handling
            </p>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Timeout (ms)</Label>
              <Input
                type="number"
                value={selectedNode.timeout || 30000}
                onChange={(e) => updateNode(selectedNode.id, { timeout: Number(e.target.value) })}
                className="h-8 text-xs"
                min={1000}
                step={1000}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px]">Enable Retry</Label>
              <Switch
                checked={!!selectedNode.retryPolicy}
                onCheckedChange={(checked) =>
                  updateNode(selectedNode.id, {
                    retryPolicy: checked
                      ? { maxAttempts: 3, backoffType: "exponential", initialDelay: 1000 }
                      : undefined,
                  })
                }
              />
            </div>
            {selectedNode.retryPolicy && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Max Attempts</Label>
                  <Input
                    type="number"
                    value={selectedNode.retryPolicy.maxAttempts}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        retryPolicy: { ...selectedNode.retryPolicy!, maxAttempts: Number(e.target.value) },
                      })
                    }
                    className="h-8 text-xs"
                    min={1}
                    max={10}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Backoff</Label>
                  <Select
                    value={selectedNode.retryPolicy.backoffType}
                    onValueChange={(v) =>
                      updateNode(selectedNode.id, {
                        retryPolicy: { ...selectedNode.retryPolicy!, backoffType: v as "fixed" | "exponential" | "linear" },
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="exponential">Exponential</SelectItem>
                      <SelectItem value="linear">Linear</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {/* Node ID (read-only) */}
          <Separator />
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground">Node ID</Label>
            <Badge variant="outline" className="text-[9px] font-mono">
              {selectedNode.id}
            </Badge>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
