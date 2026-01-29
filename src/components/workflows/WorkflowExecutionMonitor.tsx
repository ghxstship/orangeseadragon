"use client";

/**
 * Workflow Execution Monitor
 * Real-time monitoring of workflow executions
 */

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { WorkflowExecution, StepExecution, ExecutionStatus, StepStatus } from "@/lib/workflow-engine/types";

interface WorkflowExecutionMonitorProps {
  executions: WorkflowExecution[];
  onRefresh?: () => void;
  onCancel?: (executionId: string) => void;
  isLoading?: boolean;
}

const statusConfig: Record<ExecutionStatus, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, color: "text-muted-foreground", label: "Pending" },
  running: { icon: <RefreshCw className="h-4 w-4 animate-spin" />, color: "text-blue-500", label: "Running" },
  completed: { icon: <CheckCircle className="h-4 w-4" />, color: "text-green-500", label: "Completed" },
  failed: { icon: <XCircle className="h-4 w-4" />, color: "text-red-500", label: "Failed" },
  cancelled: { icon: <AlertCircle className="h-4 w-4" />, color: "text-yellow-500", label: "Cancelled" },
};

const stepStatusConfig: Record<StepStatus, { icon: React.ReactNode; color: string }> = {
  pending: { icon: <Clock className="h-3 w-3" />, color: "text-muted-foreground" },
  running: { icon: <RefreshCw className="h-3 w-3 animate-spin" />, color: "text-blue-500" },
  completed: { icon: <CheckCircle className="h-3 w-3" />, color: "text-green-500" },
  failed: { icon: <XCircle className="h-3 w-3" />, color: "text-red-500" },
  skipped: { icon: <AlertCircle className="h-3 w-3" />, color: "text-muted-foreground" },
};

function formatDuration(start: Date, end?: Date): string {
  const endTime = end || new Date();
  const ms = endTime.getTime() - new Date(start).getTime();
  
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString();
}

function ExecutionCard({ 
  execution, 
  onCancel 
}: { 
  execution: WorkflowExecution; 
  onCancel?: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(execution.status === "running");
  const status = statusConfig[execution.status];
  
  const completedSteps = execution.steps.filter((s) => s.status === "completed").length;
  const progress = (completedSteps / execution.steps.length) * 100;

  return (
    <Card className={execution.status === "running" ? "border-blue-500/50" : ""}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-4 cursor-pointer hover:bg-accent/50">
            <div className="flex items-center gap-3">
              <div className={status.color}>{status.icon}</div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium truncate">
                  Execution {execution.id.slice(0, 8)}
                </CardTitle>
                <CardDescription className="text-xs">
                  Started {formatTime(execution.startedAt)}
                  {execution.completedAt && ` • ${formatDuration(execution.startedAt, execution.completedAt)}`}
                </CardDescription>
              </div>
              <Badge variant={execution.status === "completed" ? "default" : "secondary"}>
                {status.label}
              </Badge>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {execution.status === "running" && (
              <Progress value={progress} className="h-1 mt-2" />
            )}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-4 pt-0 space-y-4">
            {/* Steps */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Steps</h4>
              <div className="space-y-1">
                {execution.steps.map((step, index) => (
                  <StepRow key={step.stepId} step={step} index={index} />
                ))}
              </div>
            </div>

            {/* Error */}
            {execution.error && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-destructive uppercase">Error</h4>
                <div className="p-2 bg-destructive/10 rounded text-xs font-mono text-destructive">
                  {execution.error.message}
                </div>
              </div>
            )}

            {/* Actions */}
            {execution.status === "running" && onCancel && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(execution.id)}
                >
                  Cancel Execution
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function StepRow({ step, index }: { step: StepExecution; index: number }) {
  const status = stepStatusConfig[step.status];
  
  return (
    <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-accent/50">
      <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
      <div className={status.color}>{status.icon}</div>
      <span className="text-sm flex-1 truncate">{step.stepId}</span>
      {step.startedAt && step.completedAt && (
        <span className="text-xs text-muted-foreground">
          {formatDuration(step.startedAt, step.completedAt)}
        </span>
      )}
      {step.attempts > 1 && (
        <Badge variant="outline" className="text-xs">
          {step.attempts} attempts
        </Badge>
      )}
    </div>
  );
}

export function WorkflowExecutionMonitor({
  executions,
  onRefresh,
  onCancel,
  isLoading,
}: WorkflowExecutionMonitorProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh || !onRefresh) return;
    
    const hasRunning = executions.some((e) => e.status === "running");
    if (!hasRunning) return;

    const interval = setInterval(onRefresh, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh, executions, onRefresh]);

  const runningCount = executions.filter((e) => e.status === "running").length;
  const completedCount = executions.filter((e) => e.status === "completed").length;
  const failedCount = executions.filter((e) => e.status === "failed").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Executions</h2>
          <p className="text-sm text-muted-foreground">
            {runningCount} running • {completedCount} completed • {failedCount} failed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "text-blue-500" : ""}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? "animate-spin" : ""}`} />
            Auto
          </Button>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Execution List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {executions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No executions yet</p>
              <p className="text-sm">Run a workflow to see executions here</p>
            </div>
          ) : (
            executions.map((execution) => (
              <ExecutionCard
                key={execution.id}
                execution={execution}
                onCancel={onCancel}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
