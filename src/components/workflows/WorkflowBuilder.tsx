"use client";

/**
 * Workflow Builder
 * Visual workflow configuration and editing component
 */

import { useState, useCallback } from "react";
import { Plus, Trash2, GripVertical, Play, Save, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import type { WorkflowStep, WorkflowTrigger, TemplateVariable } from "@/lib/workflow-engine/types";

interface WorkflowBuilderProps {
  initialName?: string;
  initialDescription?: string;
  initialTrigger?: WorkflowTrigger;
  initialSteps?: WorkflowStep[];
  initialVariables?: TemplateVariable[];
  onSave: (workflow: WorkflowConfig) => void;
  onTest?: (workflow: WorkflowConfig) => void;
}

export interface WorkflowConfig {
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  variables: Record<string, unknown>;
}

const triggerTypes = [
  { value: "manual", label: "Manual", description: "Triggered manually by a user" },
  { value: "schedule", label: "Schedule", description: "Runs on a schedule (cron)" },
  { value: "event", label: "Event", description: "Triggered by system events" },
  { value: "webhook", label: "Webhook", description: "Triggered by external webhooks" },
];

const stepTypes = [
  { value: "action", label: "Action", description: "Execute a business action" },
  { value: "condition", label: "Condition", description: "Branch based on conditions" },
  { value: "notification", label: "Notification", description: "Send notifications" },
  { value: "delay", label: "Delay", description: "Wait for a duration" },
  { value: "loop", label: "Loop", description: "Iterate over a collection" },
  { value: "approval", label: "Approval", description: "Request approval" },
  { value: "http", label: "HTTP Request", description: "Make HTTP requests" },
];

const commonEventTypes = [
  "lead.created",
  "lead.updated",
  "lead.score_changed",
  "deal.created",
  "deal.stage_changed",
  "deal.won",
  "deal.lost",
  "ticket.created",
  "ticket.assigned",
  "ticket.resolved",
  "ticket.escalated",
  "task.created",
  "task.completed",
  "task.overdue",
  "invoice.created",
  "invoice.sent",
  "invoice.paid",
  "invoice.overdue",
  "user.created",
  "user.updated",
  "expense.submitted",
  "expense.approved",
  "expense.rejected",
];

export function WorkflowBuilder({
  initialName = "",
  initialDescription = "",
  initialTrigger,
  initialSteps = [],
  initialVariables = [],
  onSave,
  onTest,
}: WorkflowBuilderProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [trigger, setTrigger] = useState<WorkflowTrigger>(
    initialTrigger || { type: "manual", config: {} }
  );
  const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps);
  const [variables, setVariables] = useState<Record<string, unknown>>(() => {
    const vars: Record<string, unknown> = {};
    for (const v of initialVariables) {
      vars[v.name] = v.default;
    }
    return vars;
  });
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStepExpanded = useCallback((stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }, []);

  const addStep = useCallback(() => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      name: `Step ${steps.length + 1}`,
      type: "action",
      config: { actionType: "", parameters: {} },
    };
    setSteps((prev) => [...prev, newStep]);
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      next.add(newStep.id);
      return next;
    });
  }, [steps.length]);

  const removeStep = useCallback((stepId: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
  }, []);

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, ...updates } : s))
    );
  }, []);

  const moveStep = useCallback((stepId: string, direction: "up" | "down") => {
    setSteps((prev) => {
      const index = prev.findIndex((s) => s.id === stepId);
      if (index === -1) return prev;
      if (direction === "up" && index === 0) return prev;
      if (direction === "down" && index === prev.length - 1) return prev;

      const newSteps = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex]!, newSteps[index]!];
      return newSteps;
    });
  }, []);

  const handleSave = useCallback(() => {
    onSave({ name, description, trigger, steps, variables });
  }, [name, description, trigger, steps, variables, onSave]);

  const handleTest = useCallback(() => {
    onTest?.({ name, description, trigger, steps, variables });
  }, [name, description, trigger, steps, variables, onTest]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="space-y-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Workflow Name"
            className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="text-sm text-muted-foreground border-none p-0 h-auto focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center gap-2">
          {onTest && (
            <Button variant="outline" size="sm" onClick={handleTest}>
              <Play className="h-4 w-4 mr-1" />
              Test
            </Button>
          )}
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Trigger Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Trigger
            </CardTitle>
            <CardDescription>Configure when this workflow runs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select
                value={trigger.type}
                onValueChange={(value) =>
                  setTrigger({ type: value as WorkflowTrigger["type"], config: {} })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <div className="font-medium">{t.label}</div>
                        <div className="text-xs text-muted-foreground">{t.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {trigger.type === "schedule" && (
              <div className="space-y-2">
                <Label>Cron Expression</Label>
                <Input
                  value={(trigger.config as { cron?: string }).cron || ""}
                  onChange={(e) =>
                    setTrigger({ ...trigger, config: { ...trigger.config, cron: e.target.value } })
                  }
                  placeholder="0 9 * * *"
                />
                <p className="text-xs text-muted-foreground">
                  Example: &quot;0 9 * * *&quot; runs daily at 9 AM
                </p>
              </div>
            )}

            {trigger.type === "event" && (
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select
                  value={(trigger.config as { eventType?: string }).eventType || ""}
                  onValueChange={(value) =>
                    setTrigger({ ...trigger, config: { ...trigger.config, eventType: value } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonEventTypes.map((event) => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {trigger.type === "webhook" && (
              <>
                <div className="space-y-2">
                  <Label>Webhook Path</Label>
                  <Input
                    value={(trigger.config as { path?: string }).path || ""}
                    onChange={(e) =>
                      setTrigger({ ...trigger, config: { ...trigger.config, path: e.target.value } })
                    }
                    placeholder="/api/webhooks/my-workflow"
                  />
                </div>
                <div className="space-y-2">
                  <Label>HTTP Method</Label>
                  <Select
                    value={(trigger.config as { method?: string }).method || "POST"}
                    onValueChange={(value) =>
                      setTrigger({ ...trigger, config: { ...trigger.config, method: value } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Steps</h3>
            <Button variant="outline" size="sm" onClick={addStep}>
              <Plus className="h-4 w-4 mr-1" />
              Add Step
            </Button>
          </div>

          {steps.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No steps configured</p>
                <p className="text-sm">Click &quot;Add Step&quot; to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {steps.map((step, index) => (
                <Collapsible
                  key={step.id}
                  open={expandedSteps.has(step.id)}
                  onOpenChange={() => toggleStepExpanded(step.id)}
                >
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="p-3 cursor-pointer hover:bg-accent/50">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">
                            {index + 1}
                          </Badge>
                          <span className="font-medium flex-1">{step.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {step.type}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStep(step.id, "up");
                              }}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStep(step.id, "down");
                              }}
                              disabled={index === steps.length - 1}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeStep(step.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Separator />
                      <CardContent className="p-3 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Step Name</Label>
                            <Input
                              value={step.name}
                              onChange={(e) => updateStep(step.id, { name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Step Type</Label>
                            <Select
                              value={step.type}
                              onValueChange={(value) =>
                                updateStep(step.id, {
                                  type: value as WorkflowStep["type"],
                                  config: {},
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {stepTypes.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {step.type === "action" && (
                          <div className="space-y-2">
                            <Label>Action Type</Label>
                            <Input
                              value={(step.config as { actionType?: string }).actionType || ""}
                              onChange={(e) =>
                                updateStep(step.id, {
                                  config: { ...step.config, actionType: e.target.value },
                                })
                              }
                              placeholder="e.g., sendEmail, createEntity, updateEntity"
                            />
                          </div>
                        )}

                        {step.type === "notification" && (
                          <>
                            <div className="space-y-2">
                              <Label>Channel</Label>
                              <Select
                                value={(step.config as { channel?: string }).channel || "email"}
                                onValueChange={(value) =>
                                  updateStep(step.id, {
                                    config: { ...step.config, channel: value },
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="push">Push Notification</SelectItem>
                                  <SelectItem value="sms">SMS</SelectItem>
                                  <SelectItem value="slack">Slack</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Template</Label>
                              <Input
                                value={(step.config as { template?: string }).template || ""}
                                onChange={(e) =>
                                  updateStep(step.id, {
                                    config: { ...step.config, template: e.target.value },
                                  })
                                }
                                placeholder="Template ID"
                              />
                            </div>
                          </>
                        )}

                        {step.type === "delay" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Duration</Label>
                              <Input
                                type="number"
                                value={(step.config as { duration?: number }).duration || 1}
                                onChange={(e) =>
                                  updateStep(step.id, {
                                    config: { ...step.config, duration: parseInt(e.target.value) },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Unit</Label>
                              <Select
                                value={(step.config as { unit?: string }).unit || "hours"}
                                onValueChange={(value) =>
                                  updateStep(step.id, {
                                    config: { ...step.config, unit: value },
                                  })
                                }
                              >
                                <SelectTrigger>
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

                        {step.type === "condition" && (
                          <div className="space-y-2">
                            <Label>Expression</Label>
                            <Textarea
                              value={(step.config as { expression?: string }).expression || ""}
                              onChange={(e) =>
                                updateStep(step.id, {
                                  config: { ...step.config, expression: e.target.value },
                                })
                              }
                              placeholder="e.g., {{trigger.data.amount}} > 1000"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Switch
                            id={`retry-${step.id}`}
                            checked={!!step.retryPolicy}
                            onCheckedChange={(checked) =>
                              updateStep(step.id, {
                                retryPolicy: checked
                                  ? { maxAttempts: 3, backoffType: "exponential", initialDelay: 1000 }
                                  : undefined,
                              })
                            }
                          />
                          <Label htmlFor={`retry-${step.id}`}>Enable retry on failure</Label>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </div>

        {/* Variables */}
        {initialVariables.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Variables</CardTitle>
              <CardDescription>Configure workflow variables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {initialVariables.map((variable) => (
                <div key={variable.name} className="space-y-2">
                  <Label>
                    {variable.name}
                    {variable.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {variable.description && (
                    <p className="text-xs text-muted-foreground">{variable.description}</p>
                  )}
                  <Input
                    value={String(variables[variable.name] ?? variable.default ?? "")}
                    onChange={(e) =>
                      setVariables((prev) => ({ ...prev, [variable.name]: e.target.value }))
                    }
                    type={variable.type === "number" ? "number" : "text"}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
