/**
 * Workflow Engine Types
 * Core type definitions for the workflow automation system
 */

export type WorkflowStatus = "draft" | "active" | "inactive" | "archived";
export type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface WorkflowTrigger {
  type: "manual" | "schedule" | "event" | "webhook" | "condition";
  config: Record<string, unknown>;
}

export interface ScheduleTriggerConfig {
  cron: string;
  timezone?: string;
}

export interface EventTriggerConfig {
  eventType: string;
  filters?: Record<string, unknown>;
}

export interface WebhookTriggerConfig {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
}

export interface ConditionTriggerConfig {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "startsWith" | "endsWith";
  value: unknown;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  config: StepConfig;
  conditions?: StepCondition[];
  onSuccess?: string[];
  onFailure?: string[];
  retryPolicy?: RetryPolicy;
  timeout?: number;
}

export type StepType =
  | "action"
  | "condition"
  | "loop"
  | "parallel"
  | "delay"
  | "notification"
  | "http"
  | "transform"
  | "approval"
  | "script";

export interface StepConfig {
  [key: string]: unknown;
}

export interface ActionStepConfig extends StepConfig {
  actionType: string;
  parameters: Record<string, unknown>;
}

export interface ConditionStepConfig extends StepConfig {
  expression: string;
  trueBranch: string[];
  falseBranch: string[];
}

export interface LoopStepConfig extends StepConfig {
  collection: string;
  itemVariable: string;
  steps: string[];
  maxIterations?: number;
}

export interface ParallelStepConfig extends StepConfig {
  branches: string[][];
  waitForAll?: boolean;
}

export interface DelayStepConfig extends StepConfig {
  duration: number;
  unit: "seconds" | "minutes" | "hours" | "days";
}

export interface NotificationStepConfig extends StepConfig {
  channel: "email" | "sms" | "push" | "slack" | "webhook";
  recipients: string[];
  template: string;
  data?: Record<string, unknown>;
}

export interface HttpStepConfig extends StepConfig {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface TransformStepConfig extends StepConfig {
  input: string;
  output: string;
  transformation: string;
}

export interface ApprovalStepConfig extends StepConfig {
  approvers: string[];
  requiredApprovals: number;
  timeout?: number;
  escalationPolicy?: EscalationPolicy;
}

export interface ScriptStepConfig extends StepConfig {
  language: "javascript" | "python";
  code: string;
  sandbox?: boolean;
}

export interface StepCondition {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "in" | "notIn";
  value: unknown;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffType: "fixed" | "exponential" | "linear";
  initialDelay: number;
  maxDelay?: number;
}

export interface EscalationPolicy {
  timeout: number;
  escalateTo: string[];
  notifyOnEscalation: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: number;
  status: WorkflowStatus;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  variables?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowVersion: number;
  status: ExecutionStatus;
  trigger: WorkflowTrigger;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  context: ExecutionContext;
  steps: StepExecution[];
  startedAt: Date;
  completedAt?: Date;
  error?: ExecutionError;
  organizationId: string;
  initiatedBy?: string;
}

export interface ExecutionContext {
  variables: Record<string, unknown>;
  secrets?: Record<string, string>;
  environment: Record<string, string>;
}

export interface StepExecution {
  stepId: string;
  status: StepStatus;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  startedAt?: Date;
  completedAt?: Date;
  attempts: number;
  error?: ExecutionError;
}

export interface ExecutionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  workflow: Omit<Workflow, "id" | "organizationId" | "createdBy" | "createdAt" | "updatedAt">;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "array" | "object";
  description?: string;
  required: boolean;
  default?: unknown;
  validation?: VariableValidation;
}

export interface VariableValidation {
  pattern?: string;
  min?: number;
  max?: number;
  enum?: unknown[];
}

export interface WorkflowEvent {
  id: string;
  type: string;
  workflowId?: string;
  executionId?: string;
  stepId?: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface WorkflowMetrics {
  workflowId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  lastExecutedAt?: Date;
}
